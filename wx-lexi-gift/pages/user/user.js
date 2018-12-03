// pages/user/user.js
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
    isLogin: false,
    isStoreOwner: false,
    showLoginModal: false, // 注册的呼出框
    userInfo: {},
    collectCount: {
      join_activity: 0,
      my_activity: 0,
      receive_activity: 0
    }
  },

  /**
   * 地址管理
   */
  handleGoAddress (e) {
    wx.navigateTo({
      url: '../addressList/addressList',
    })
  },

  /**
   * 我参与的
   */
  handleGoLottery () {
    wx.navigateTo({
      url: '../userLottery/userLottery',
    })
  },

  /**
   * 我送出的
   */
  handleGoSended () {
    wx.navigateTo({
      url: '../userSend/userSend',
    })
  },

  /**
   * 我接收的
   */
  handleGoReceive () {
    wx.navigateTo({
      url: '../userReceive/userReceive',
    })
  },

  /**
   * 显示登录框
   */
  handleGoLogin (e) {
    this._validateLoginStatus()
  },

  // 关闭登录框
  hanleOffLoginBox(e) {
    this.setData({
      showLoginModal: false
    })

    if (app.globalData.isLogin) {
      this.setData({
        isLogin: app.globalData.isLogin
      })
    }

    wx.showTabBar()
  },

  /**
   * 获取用户汇总数
   */
  getActivityCollect() {
    http.fxGet(api.gift_activity_count, {}, (res) => {
      utils.logger(res.data, '获取用户汇总')
      if (res.success) {
        this.setData({
          collectCount: res.data
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 验证登录状态
   */
  _validateLoginStatus () {
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        showLoginModal: true
      })

      return
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    this.setData({
      isLogin: app.globalData.isLogin,
      userInfo: app.globalData.userInfo
    })

    this.getActivityCollect()
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