// pages/paymentAddress/paymentAddress.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
const common = require('./../../utils/common.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    path: true, // 页面来源
    addressList: [], // 地址列表---
    address_rid: '', // 选择的rid
    order: '',
    validateCustom: false // 未验证海关信息前，不能确认
  },

  // 选择的地址
  radioChange(e) {
    app.globalData.orderParams.address_rid = e.detail.value
    this.setData({
      address_rid: e.detail.value
    })

    this.validateUserCustom()
  },

  // 验证海关用户信息
  validateUserCustom(cb) {
    let currentAddress = {}
    this.data.addressList.map(item => {
      if (item.rid == this.data.address_rid) {
        currentAddress = item
      }
    })
    let deliveryCountries = app.globalData.deliveryCountries
    if (deliveryCountries.length > 0 && deliveryCountries.indexOf(currentAddress.country_id) == -1) {
      // 此地址为跨境，需验证身份信息
      this.getUserIdCard(currentAddress, cb)
    } else {
      this.setData({
        validateCustom: true
      })
      
      // 回调函数
      return typeof cb == 'function' && cb(true)
    }
  },

  // 获取海关所需身份证信息
  getUserIdCard(currentAddress, cb) {
    utils.logger(currentAddress.full_name + ',' + currentAddress.mobile)
    http.fxGet(api.address_user_custom, { user_name: currentAddress.full_name, mobile: currentAddress.mobile }, (result) => {
      utils.logger(result, '海关身份证')
      if (result.success) {
        if (Object.keys(result.data).length == 0) {
          // 没有身份证信息
          wx.showModal({
            title: '提示',
            content: '此订单为跨境订单，需上传清关所需身份证信息',
            cancelColor: '#333333',
            confirmColor: '#5FE4B1',
            success: function (res) {
              if (res.confirm) {
                // 跳转补全信息
                wx.navigateTo({
                  url: '../address/address?rid=' + currentAddress.rid + '&need_custom=1&from_ref=checkout',
                })
              }
            }
          })
          return
        }
        this.setData({
          validateCustom: true
        })

        // 回调函数
        return typeof cb == 'function' && cb(true)
      } else {
        utils.fxShowToast(result.status.message)
      }

      // 回调函数
      return typeof cb == 'function' && cb(false)
    })
  },

  // 继续提交订单
  submitOrderTap() {
    this.validateUserCustom((success)=>{
      if (success) {
        wx.redirectTo({
          url: '../checkout/checkout'
        })
      }
    })
  },

  // 在没有选择的时候去设置订单参数
  pickAddress() {
    // 默认地址
    this.data.addressList.forEach((v, i) => {
      if (v.is_default) {
        // 设置默认地址
        app.globalData.orderParams.address_rid = v.rid
        this.setData({
          address_rid: v.rid
        })
      }
    })
  },

  // 获取地址列表
  getAddressList() {
    http.fxGet(api.addresses, {}, (result) => {
      utils.logger(result, '地址列表')
      if (result.success) {
        this.setData({
          addressList: result.data
        })

        this.pickAddress()
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  
  // 删除地址
  deleteAddress() {
    http.fxDelete(api.address_delete.replace(/:rid/g, this.data.address_rid), {}, (result) => {
      if (result.success) {
        this.getAddressList()
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 选择地址
  addAddressTap() {
    wx.navigateTo({
      url: '../address/address?from_ref=checkout'
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    utils.logger(options)
    let from_ref = options.from_ref // 来源

    if (from_ref != 'cart') { // 不是来自购物车
      this.setData({
        path: false
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this
    setTimeout(() => {
      that.setData({
        isLoading: false
      })
    }, 350)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getAddressList() // 获取地址列表
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return common.shareLexi(app.globalData.storeInfo.name, app.globalData.shareBrandUrl)
  }
  
})