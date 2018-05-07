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
    navList: [
      { title: '全部', status: 0 },
      { title: '未付款', status: 1 },
      { title: '待发货', status: 5 },
      { title: '待收货', status: 10 },
      { title: '待评价', status: 20 }
    ],
    currentStatus: 1,
    statusTitle: '',
    page: 1,
    per_page: 5,
    orderList1: [],
    loadingMoreHidden: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const init_status = options.status || 0;

    this.setData({
      currentStatus: init_status
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getOrderList()
  },

  /**
   * 获取订单列表
   */
  getOrderList() {
    const that = this
    let params = {
      page: this.data.page,
      per_page: this.data.per_page,
      status: this.data.currentStatus
    }

    http.fxGet(api.orders, params, function (res) {
      if (res.success) {
        // 没有下一页了
        if (!res.data.next) {
          that.setData({
            loadingMoreHidden: false
          })
        }

        // 修改时间格式
        if (res.data.orders.length) {
          let tmpOrders = res.data.orders.map(function (item, key, ary) {
            item.created_at = util.timestamp2string(item.created_at)
            item.status_title = util.orderStatusTitle(item.status)
            return item
          })
          res.data.orders = tmpOrders
        }

        let orders = that.data.orderList
        if (that.data.page > 1) {
          // 合并数组
          orders.push.apply(orders, res.data.orders)
        } else {
          orders = res.data.orders
        }
        that.setData({
          orderList: orders
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
        console.log(res)
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
   * 切换状态
   */
  handleStatus(e) {
    let status = e.currentTarget.dataset.status;
    console.log(status)
    let currentTab = this.data.navList.filter(function (item) {
      return item.status == status
    })
    this.setData({
      page: 1,
      loadingMoreHidden: true,
      currentStatus: status,
      statusTitle: currentTab[0].title
    })

    this.getOrderList()
  },

  /**
   * 查看订单详情
   */
  handleViewOrder(e) {
    let rid = e.currentTarget.dataset.rid
    wx.navigateTo({
      url: './../orderDetail/orderDetail?rid=' + rid
    })
  },

  // 去挑选
  handleGoChoose(e) {
    wx.switchTab({
      url: '../index/index',
    })
  },

  // 订单详情
  orderDetailTap(){
    wx.navigateTo({
      url: '../orderDetail/orderDetail',
    })
  },

  //跳转到评价的页面
  critiquePageTap(){
      wx.navigateTo({
        url: '../mycritique/mycritique',
      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
    if (this.data.loadingMoreHidden) {
      let page = this.data.page + 1
      this.setData({
        page: page
      })
      this.getOrderList()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})