/**
 * 生活馆管理
 */
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sid: '', // 当前生活馆rid
    activeSubMenu: 'lifeStore',
    lifeStore: { // 生活馆信息
      phases: 1
    },
    createdAt: 0, // 生活馆创建日期
    timer: null,
    expired: false, // 是否已过实习期
    leftTimer: { // 剩余时间
      days: 0,
      hours: 0, 
      minutes: 0,
      seconds: 0,
    },
    collect: {
      all_count: 0, // 总计成交订单
      today_count: 0, // 今日成交数
      pending_commission_price: 0, // 待结算金额
      today_commission_price: 0, // 今日收益
      total_commission_price: 0, // 累计收益
      cash_price: 0, // 可提现金额
      total_cash_price: 0 // 累计已提现
    }
  },

  /**
   * 切换个人中心
   */
  handleGoUser() {
    wx.switchTab({
      url: '../user/user',
    })
  },

  /**
   * 跳转至交易记录
   */
  handleGoTrade () {
    wx.navigateTo({
      url: '../lifeStoreTransaction/lifeStoreTransaction'
    })
  },

  /**
   * 跳转至提现
   */
  handleGoWithdraw () {
    wx.navigateTo({
      url: '../lifeStoreWithdraw/lifeStoreWithdraw'
    })
  },

  /**
   * 计算剩余时间
   */
  practiceLeftTimer () {
    let endTs = this.data.createdAt + 30 * 24 * 60 * 60 // 30天内
    let leftTime = endTs - utils.timestamp() // 计算剩余的毫秒数 
    console.log('Left time: ' + leftTime)
    if (leftTime < 0) {
      clearInterval(this.data.timer)
      this.setData({
        expired: true,
        timer: null
      })
      return
    }
    let days = parseInt(leftTime / 60 / 60 / 24, 10) // 计算剩余的天数 
    let hours = parseInt(leftTime / 60 / 60 % 24, 10) // 计算剩余的小时 
    let minutes = parseInt(leftTime / 60 % 60, 10) // 计算剩余的分钟 
    let seconds = parseInt(leftTime % 60, 10) // 计算剩余的秒数 

    this.setData({
      leftTimer: {
        days: utils.checkTimeNumber(days),
        hours: utils.checkTimeNumber(hours),
        minutes: utils.checkTimeNumber(minutes),
        seconds: utils.checkTimeNumber(seconds),
      }
    })

    console.log(this.data.leftTimer)
  },

  /**
   * 获取生活馆提现汇总
   */
  getStoreCashCollect () {
    http.fxGet(api.life_store_cash_collect, { store_rid: this.data.sid }, (res) => {
      console.log(res, '提现汇总')
      if (!res.success) {
        utils.fxShowToast(res.status.message)
      }
      this.setData({
        'collect.cash_price': res.data.cash_price.toFixed(2),
        'collect.total_cash_price': res.data.total_cash_price.toFixed(2)
      })
    })
  },

  /**
   * 获取生活馆收益汇总
   */
  getStoreIncomeCollect () {
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
   * 获取生活馆订单汇总
   */
  getStoreOrdersCollect () {
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
   * 获取生活馆信息
   */
  getStoreInfo () {
    http.fxGet(api.life_store, {
      rid: this.data.sid
    }, (res) => {
      console.log(res, '生活馆信息')
      if (res.success) {
        this.setData({
          lifeStore: res.data,
          createdAt: res.data.created_at
        })
        this.practiceLeftTimer()
      } else {
        utils.fxShowToast(res.status.message)
      }
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
        sid: lifeStore.lifeStoreRid
      })

      this.getStoreInfo()
      this.getStoreOrdersCollect()
      this.getStoreIncomeCollect()
      this.getStoreCashCollect()
    } else {
      // 如不是小B商家，则跳转至首页
      wx.switchTab({
        url: '../index/index'
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
    let timer = setInterval(() => {
      this.practiceLeftTimer()
    }, 1000)

    this.setData({
      timer: timer
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
    clearInterval(this.data.timer)
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