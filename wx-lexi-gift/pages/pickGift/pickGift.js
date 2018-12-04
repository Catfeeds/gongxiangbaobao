// 领取礼物
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    rid: '',
    
    isSending: false,
    btnText: '领取礼物',
    userBtnText: '支付1元领取礼物',

    currentActivity: {},
    isSmallB: false, // 是否为生活馆主

    hasAddress: false,
    currentAddress: {},
    form: {
      rid: '',
      openid: '',
      address_rid: '',
    }
  },

  /**
   * 选择地址
   */
  handleChooseAddress () {
    let _url = '../addressList/addressList?activity_rid=' + this.data.rid
    if (this.data.form.address_rid) {
      _url += '&rid=' + this.data.form.address_rid

      // 更新全局变量
      app.globalData.addressRef = 'checkout'
      app.globalData.addressRid = this.data.form.address_rid
    }

    wx.navigateTo({
      url: _url
    })
  },

  /**
   * 领取礼物
   */
  handleSubmitGot () {
    if (!this.data.form.address_rid) {
      utils.fxShowToast('请选定收货地址')
      return
    }

    if (this.data.isSending) {
      return
    }

    this.setData({
      isSending: true,
      btnText: '正在提交...',
      userBtnText: '正在提交...'
    })
    http.fxPost(api.gift_activity_grant, this.data.form, (res) => {
      utils.logger(res, '领取礼物')
      this.setData({
        isSending: false,
        btnText: '领取礼物',
        userBtnText: '支付1元领取礼物'
      })
      
      utils.logger(res.data, '领取')

      if (res.success) {
        let _rid = this.data.rid

        if (this.data.isSmallB) {
          // 领取成功，跳转成功页面
          wx.redirectTo({
            url: '../pickSuccess/pickSuccess?rid=' + _rid,
          })
        } else {
          app.wxpayOrder(_rid, res.data.pay_params, (result) => {
            if (result) {
              // 领取成功，跳转成功页面
              wx.redirectTo({
                url: '../pickSuccess/pickSuccess?rid=' + _rid,
              })
            }
          })
        }
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 获取默认地址
   */
  getCurrentAddress () {
    let _url = api.address_default
    if (this.data.form.address_rid) {
      _url = api.address_info.replace(/:rid/, this.data.form.address_rid)  
    }

    http.fxGet(_url, {}, (res) => {
      utils.logger(res.data, '获取默认地址')
      if (res.success) {
        this.setData({
          hasAddress: true,
          'form.address_rid': res.data.rid,
          currentAddress: res.data
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
    
  },

  /**
   * 获取当前活动
   */
  getActivity() {
    http.fxGet(api.gift_activity_detail.replace(/:rid/, this.data.rid), {}, (res) => {
      utils.logger(res.data, '获取当前活动')
      if (res.success) {
        this.setData({
          currentActivity: res.data
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let rid = options.rid
    this.setData({
      rid: rid,
      'form.rid': rid,
      'form.openid': app.globalData.jwt.openid,
      isSmallB: app.globalData.jwt.is_small_b ? true : false
    })
    
    this.getActivity()
    this.getCurrentAddress()
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
    if (app.globalData.addressRid) {
      this.setData({
        'form.address_rid': app.globalData.addressRid
      })
      // 清空来源
      app.globalData.addressRef = ''
      
      // 更新地址
      this.getCurrentAddress()
    }
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

  }
})