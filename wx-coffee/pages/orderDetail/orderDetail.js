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
    this.getOrderDetail()
  },

  /**
   * 订单详情
   */
  getOrderDetail () {
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

  /**
   * 支付订单
   */
  handlePayOrder(e) {
    let rid = e.currentTarget.dataset.rid
    // 添加自定义扩展信息
    let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}

    http.fxPost(api.order_prepay_sign, { rid: rid, storeId: extConfig.storeId, authAppid: extConfig.authAppid }, function (res) {
      if (res.success) {
        let payParams = res.data

        if (!payParams || util.isEmptyObject(payParams)) {
          // 显示错误消息
          wx.showToast({
            title: '订单支付失败',
            icon: 'none',
            duration: 2000
          })
        } else {
          // 发起支付
          app.wxpayOrder(rid, payParams)
        }
      }
    })
  },

  /**
   * 确认收货
   */
  handleSignOrder (e) {
    let that = this
    let rid = e.currentTarget.dataset.rid
    http.fxPost(api.order_signed, { rid: rid }, function (res) {
      if (res.success) {
        wx.showToast({
          title: '已签收',
          icon: 'success',
          duration: 2000
        })

        that.setData({
            currentOrder: that.formatOrderData(res.data.order)
        })
      }
    })
  },

  /**
   * 取消订单
   */
  handleCancelOrder (e) {
    let that = this
    let rid = e.currentTarget.dataset.rid
    http.fxPost(api.order_cancel, { rid: rid }, function (res) {
      if (res.success) {
        wx.showToast({
          title: '已取消',
          icon: 'success',
          duration: 2000
        })

        that.setData({
          currentOrder: that.formatOrderData(res.data.order)
        })
      }
    })
  },

  /**
   * 修正订单数据
   */
  formatOrderData(currentOrder) {
    // 格式化订单时间格式、状态文本
    currentOrder.created_at = util.timestamp2string(currentOrder.created_at)
    currentOrder.status_title = util.orderStatusTitle(currentOrder.status)
    if (currentOrder.received_at) {
      currentOrder.received_at = util.timestamp2string(currentOrder.received_at)
    }
    return currentOrder
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