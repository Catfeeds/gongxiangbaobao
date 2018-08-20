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
    sid: '',
    showModal: false,
    collect: {
      cash_price: 0, // 可提现金额
      total_cash_price: 0 // 累计已提现
    }
  },

  /**
   * 点击提现
   */
  handleShowWithdraw () {
    if (this.data.collect.cash_price > 10) {
      this.setData({
        showModal: true
      })
    }
  },

  /**
   * 提交提现命令
   */
  handleSubmitWithdraw () {

  },

  /**
   * 查看对账单
   */
  handleViewBill () {
    wx.navigateTo({
      url: '../lifeStoreBill/lifeStoreBill',
    })
  },

  /**
   * 获取生活馆提现汇总
   */
  getStoreCashCollect() {
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const lifeStore = wx.getStorageSync('lifeStore')
    // 小B商家获取自己生活馆
    if (lifeStore.isSmallB) {
      this.setData({
        sid: lifeStore.lifeStoreRid
      })
      
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