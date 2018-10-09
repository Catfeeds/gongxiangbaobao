/**
 * 生活馆管理
 */
const app = getApp()

const http = require('./../../../utils/http.js')
const api = require('./../../../utils/api.js')
const utils = require('./../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sid: '', //  生活馆rid
    showModal: false,
    activeStatus: 0,
    setIncomeStar: false,
    statusPanels: [
      { rid: 's0', name: '全部', status: 0, count: 0 },
      { rid: 's1', name: '待结算', status: 1, count: 0 },
      { rid: 's2', name: '成功', status: 2, count: 0 },
      { rid: 's3', name: '退款', status: 3, count: 0 }
    ],
    params: {
      store_rid: '', // 当前生活馆
      date_range: 'week', // 日期区间
      status: 0,
      page: 1, 
      per_page: 10
    },
    collect: {
      pending_commission_price: 0, // 待结算金额
      today_commission_price: 0, // 今日收益
      total_commission_price: 0 // 累计收益
    },
    totalCount: 0, // 总记录数
    orderList: [] // 交易订单列表
  },

  /**
   * 显示弹出框
   */
  handleShowModal () {
    this.setData({
      showModal: true
    })
  },

  /**
   * 改变日期
   */
  handleChangeDate (e) {
    let d = e.currentTarget.dataset.date
    this.setData({
      'params.date_range': d,
      'params.page': 1
    }) 

    this.getStoreOrders()
  },
  
  /**
   * 改变状态
   */
  handleChangeStatus (e) {
    let status = e.currentTarget.dataset.status
    this.setData({
      'activeStatus': parseInt(status),
      'params.status': status,
      'params.page': 1
    })

    this.getStoreOrders()
  },

  /**
   * 加密
   */
  handleSecretIncome() {
    wx.setStorageSync('setIncomeStar', !this.data.setIncomeStar)
    this.setData({
      setIncomeStar: !this.data.setIncomeStar
    })
  },

  /**
   * 获取交易订单列表
   */
  getStoreOrders () {
    console.log(this.data.params)
    http.fxGet(api.life_store_transactions, this.data.params, (res) => {
      console.log(res, '交易订单')
      if (!res.success) {
        utils.fxShowToast(res.status.message)
      }
      let transactions = this._rebuildTradeData(res.data.transactions)
      this.setData({
        'totalCount': res.data.count,
        'orderList': transactions
      })
    })
  },

  /**
   * 修正数据
   */
  _rebuildTradeData (transactions) {
    let _transactions = transactions.map((trade) => {
      trade.payed_at = utils.timestamp2string(trade.payed_at) 
      return trade
    })

    return _transactions
  },

  /**
   * 获取生活馆收益汇总
   */
  getStoreIncomeCollect() {
    http.fxGet(api.life_store_income_collect, { store_rid: this.data.sid }, (res) => {
      console.log(res, '收益汇总')
      if (!res.success) {
        utils.fxShowToast(res.status.message)
      }
      this.setData({
        'collect.pending_commission_price': res.data.pending_commission_price.toFixed(2),
        'collect.today_commission_price': res.data.today_commission_price.toFixed(2),
        'collect.total_commission_price': res.data.total_commission_price.toFixed(2)
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
        setIncomeStar: wx.getStorageSync('setIncomeStar') || false,
        'params.store_rid': lifeStore.lifeStoreRid
      })

      this.getStoreIncomeCollect()
      this.getStoreOrders()
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