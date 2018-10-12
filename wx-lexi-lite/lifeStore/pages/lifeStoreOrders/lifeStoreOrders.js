const app = getApp()

const http = require('./../../../utils/http.js')
const api = require('./../../../utils/api.js')
const utils = require('./../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sid: '',
    activeStatus: 0,
    statusPanels: [
      { rid: 's0', name: '全部', status: 0, count: 0 },
      { rid: 's1', name: '待发货', status: 1, count: 0 },
      { rid: 's2', name: '已收货', status: 2, count: 0 },
      { rid: 's3', name: '已完成', status: 3, count: 0 }
    ],
    collect: {
      all_count: 0,
      today_count: 0
    },
    params: {
      store_rid: '',
      page: 1,
      status: 0
    },
    orderList: [],
    loadingMore: false
  },

  /**
   * 改变状态
   */
  handleChangeStatus (e) {
    let status = e.currentTarget.dataset.status
    this.setData({
      activeStatus: status,
      'params.page': 1,
      'params.status': status
    })
    this.getStoreOrderList()
  },

  /**
   * 订单状态
   */
  _getOrderStatusLabel (status) {
    let label = ''
    switch (status) {
      case 1:
        label = '待发货'
        break
      case 2:
        label = '已发货'
        break
      case 3:
        label = '已完成'
        break
    }
    return label
  },

  /**
   * 更新提醒数量
   */
  _updateNoticeCount (result) {
    let panels = this.data.statusPanels.map((item) => {
      if (item.rid === 's1') {
        item.count = item.pending_shipment_not_read
      }
      if (item.rid === 's2') {
        item.count = item.shipment_not_read
      }
      if (item.rid === 's3') {
        item.count = item.finish_not_read
      }
      return item
    })

    this.setData({
      statusPanels: panels
    })
  },

  /**
   * 生活馆订单列表
   */
  getStoreOrderList() {
    wx.showLoading({
      title: '加载中...',
    })
    http.fxGet(api.life_store_orders_list, this.data.params, (res) => {
      console.log(res, '订单列表')
      wx.hideLoading()
      if (!res.success) {
        utils.fxShowToast(res.status.message)
        return
      }

      this._updateNoticeCount(res.data)

      for (let i=0; i< res.data.orders.length; i++) {
        // 时间格式化
        res.data.orders[i].created_at = utils.timestamp2string(res.data.orders[i].created_at, 'cn')
        res.data.orders[i].status_label = this._getOrderStatusLabel(res.data.orders[i].life_order_status)
        for (let k = 0; k < res.data.orders[i].items.length; k++) {
          res.data.orders[i].items[k].product_name = utils.truncate(res.data.orders[i].items[k].product_name, 13)
        }
      }

      let _orders = this.data.orderList
      if (this.data.page > 1) {
        // 合并数组
        _orders.push.apply(_orders, res.data.orders)
      } else {
        _orders = res.data.orders
      }

      this.setData({
        'orderList': _orders
      })
    })
  },

  /**
   * 获取生活馆订单汇总
   */
  getStoreOrdersCollect() {
    http.fxGet(api.life_store_orders_collect, { store_rid: this.data.sid }, (res) => {
      console.log(res, '订单汇总')
      if (!res.success) {
        utils.fxShowToast(res.status.message)
      }
      this.setData({
        'collect.all_count': res.data.all_count,
        'collect.today_count': res.data.today_count
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const lifeStore = wx.getStorageSync('lifeStore')
    // 小B商家获取自己生活馆
    if (lifeStore.isSmallB) {
      this.setData({
        sid: lifeStore.lifeStoreRid,
        'params.store_rid': lifeStore.lifeStoreRid
      })

      this.getStoreOrdersCollect()
      this.getStoreOrderList()
    } else {
      // 如不是小B商家，则跳转至首页
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
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
    this.getStoreOrdersCollect()
    this.getStoreOrderList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.loadingMore) {
      let page = this.data.params.page + 1
      this.setData({
        'params.page': page
      })
      this.getStoreOrderList()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})