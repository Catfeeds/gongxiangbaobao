const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const util = require('./../../utils/util.js')

// 获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    rid: '',
    currentOrder: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      rid: options.rid
    })

    this.getOrderDetail()
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
   * 订单详情
   */
  getOrderDetail() {
    let that = this

    http.fxGet(api.order_detail.replace(/:rid/g, this.data.rid), {}, function (res) {
      if (res.success) {
        let currentOrder = res.data
        // 格式化订单时间格式、状态文本
        currentOrder.created_at = util.timestamp2string(currentOrder.created_at)
        currentOrder.status_title = util.orderStatusTitle(currentOrder.status)
        if (currentOrder.received_at) {
          currentOrder.received_at = util.timestamp2string(currentOrder.received_at)
        }

        that.setData({
          currentOrder: currentOrder
        })
      }
    })
  },

  // 去挑选
  handleGoChoose () {
    wx.switchTab({
      url: '../index/index',
    })
  },

  /**
   * 跳转订单详情
   */
  handleViewOrder () {
    wx.navigateTo({
      url: './../orderDetail/orderDetail?rid=' + this.data.rid
    })
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