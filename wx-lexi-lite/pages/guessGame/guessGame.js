/**
 * 猜图游戏登录过渡页
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
    is_mobile: false,
    showLoginModal: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showBindForm: false,
  },

  /**
   * 登录完成回调
   */
  handleCloseLogin() {
    this.setData({
      is_mobile: true,
      showBindForm: false
    })
  },

  /**
   * 微信一键授权回调
   */
  handleGotPhoneNumber (e) {
    app.handleGotPhoneNumber(e, (success) => {
      if (success) {
        if (app.globalData.isLogin) {
          this.setData({
            is_mobile: true,
            showLoginModal: false
          })

          // 开始游戏
          wx.redirectTo({
            url: '../guessGamePlay/guessGamePlay',
          })
        }
      } else {
        utils.fxShowToast('登录失败，稍后重试！')
        wx.navigateTo({
          url: '../index/index',
        })
      }
    })
  },

  /**
   * 获取用户授权信息
   */
  bindGetUserInfo (e) {
    console.log(e.detail.userInfo, '获取用户授权信息')
    if (e.detail.userInfo) {
      // 用户点击允许按钮
      this.setData({
        showBindForm: true
      })
    } else {
      // 用户点击拒绝按钮
      utils.fxShowToast('拒绝授权，你可以选择微信一键快捷授权')
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // scene格式：uid + '-' + code
    let scene = decodeURIComponent(options.scene)
    // 场景参数优先级高
    if (scene && scene != 'undefined') {
      let uid = ''
      let scene_ary = scene.split('-')
      uid = scene_ary[0]
      // 来源编码
      if (scene_ary.length == 2) {
        let code = scene_ary[1]
        wx.setStorageSync('game_inviter', {
          uid: uid,
          code: code
        })
      }
    }

    if (app.globalData.isLogin) {
      wx.redirectTo({
        url: '../guessGamePlay/guessGamePlay',
      })
    }

    // 给app.js 定义一个方法。
    app.userInfoReadyCallback = res => {
      console.log('用户信息请求完毕')
      if (res) { // 用户登录成功
        if (app.globalData.isLogin) {
          wx.redirectTo({
            url: '../guessGamePlay/guessGamePlay',
          })
        }
      }

      // 用户未注册或登录失败
      this.setData({
        showLoginModal: true
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
    if (!app.globalData.isLogin) {
      this.setData({
        showLoginModal: true
      })
    }
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