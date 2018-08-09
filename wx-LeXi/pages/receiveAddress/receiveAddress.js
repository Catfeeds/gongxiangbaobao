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
    path: true, // 页面来源
    addressList: [], // 地址列表---
    address_rid: '', // 选择的rid
    order: ''
  },

  // 选择的地址
  radioChange(e) {
    app.globalData.orderParams.address_rid = e.detail.value
    this.setData({
      address_rid: e.detail.value
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
      console.log(result, '地址列表')
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
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
    wx.getStorageSync('allPlaces') || common.getReceivePlaces() // 加载收货地址
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

  },

  // 选择地址
  addAddressTap() {
    wx.navigateTo({
      url: '../address/address'
    })
  },

  // 继续提交订单
  submitOrderTap() {
    wx.redirectTo({
      url: '../checkout/checkout'
    })
  }
  
})