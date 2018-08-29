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
    dateKeys: [], // 月份keys
    statements: {}
  },

  /**
   * 账单详情
   */
  handleViewDetail (e) {
    let rid = e.currentTarget.dataset.rid
    wx.navigateTo({
      url: '../lifeStoreBillDetail/lifeStoreBillDetail?record_id=' + rid,
    })
  },

  /**
   * 获取对账单
   */
  getStoreBills() {
    http.fxGet(api.life_store_statements, { store_rid: this.data.sid }, (res) => {
      console.log(res.data, '对账单')
      if (!res.success) {
        utils.fxShowToast(res.status.message)
      }

      this.setData({
        'dateKeys': Object.keys(res.data.statements)
      })
      
      this._rebuildStatementData(res.data.statements)
    })
  },

  /**
   * 修正对账单数据
   */
  _rebuildStatementData(data) {
    let allStatements = {}
    Object.keys(data).map(month => {
      let statements = data[month]['statements']
      let _statementList = []
      if (statements && statements.length > 0) {
        _statementList = statements.map(statement => {
          statement.created_at = utils.timestamp2dateStr(statement.created_at)
          statement.actual_account_amount = statement.actual_account_amount.toFixed(2)
          return statement
        })
      }
      
      allStatements[month] = {
        total_amount: data[month]['total_amount'].toFixed(2),
        statements: _statementList
      }
    })

    this.setData({
      'statements': allStatements
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

      this.getStoreBills()
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