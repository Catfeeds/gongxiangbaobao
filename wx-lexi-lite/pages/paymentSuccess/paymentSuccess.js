const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    order: [],// 订单
    logisticsPriceSum: 0,
    orderRid: ''
  },

  // 查看订单
  examineOrder(e) {
    let rid = e.currentTarget.dataset.rid
    wx.navigateTo({
      url: '../orderInfo/orderInfo?rid=' + this.data.orderRid
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options, '支付页面，上一页的参数')
    console.log(app.globalData.paymentSuccessOrder)

    let order = app.globalData.paymentSuccessOrder
    this.setData({
      order: order,
      orderRid: options.rid
    })

    order.orders.forEach((v,i)=>{
      this.setData({
        logisticsPriceSum: this.data.logisticsPriceSum + v.freight
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
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
    return app.shareLeXi()
  }
  
})