// pages/lotteryList/lotteryList.js
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
    activityList: [],
    page: 1,
    perPage: 10,
    haveNext: true,
    moreLoading: false
  },

  /**
   * 获取formid, 去参与抽奖
   */
  handleGoLottery (e) {
    utils.logger(e.currentTarget, '通知参数')
    let rid = e.currentTarget.dataset.rid
    let kind = e.currentTarget.dataset.kind
    
    utils.logger(e.detail.formId, '通知模板')
    if (e.detail.formId != 'the formId is a mock one') {
      app.handleSendNews(e.detail.formId, rid)
    }
    
    if (kind == 3) {
      wx.navigateTo({
        url: '../myLottery/myLottery?rid=' + rid,
      })
    } else {
      wx.navigateTo({
        url: '../lottery/lottery?rid=' + rid,
      })
    }
  },

  /**
   * 获取热门活动列表
   */
  getActivityList() {
    this._startLoading()
    http.fxGet(api.gift_activity_more, { page: this.data.page, per_page: this.data.perPage }, (res) => {
      this._endLoading()
      utils.logger(res.data, '热门活动列表')
      if (res.success) {
        res.data.activity_list.map(item => {
          item.product_name = utils.truncate(item.product_name, 24)
          return item
        })

        this.setData({
          activityList: res.data.activity_list
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 开启loading
   */
  _startLoading() {
    this.setData({
      moreLoading: true
    })
  },

  /**
   * 结束loading
   */
  _endLoading() {
    this.setData({
      moreLoading: false
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.isLogin) {
      this.getActivityList()
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this
    setTimeout(() => {
      that.setData({
        isLoading: false
      })
    }, 350)
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
    this.setData({
      page: 1
    })
    this.getActivityList()
    
    wx.stopPullDownRefresh()
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
    return app.shareWxaGift()
  }
  
})