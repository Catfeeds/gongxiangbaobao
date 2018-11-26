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
    order: [], // 订单
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
  onLoad: function(options) {

    http.fxGet(api.orders_after_payment_rid.replace(/:rid/, options.rid), {}, (result) => {
      utils.logger(result, '订单详情')
      if (result.success) {
        result.data.orders.forEach((v, i) => {
          v.created_item = utils.timestamp2string(v.created_at, "cn")
        })

        this.setData({
          order: result.data,
          orderRid: options.rid
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let that = this
    setTimeout(() => {
      that.setData({
        readyOver: true,
        isLoading: false
      })
    }, 350)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return app.shareLeXi()
  }

})