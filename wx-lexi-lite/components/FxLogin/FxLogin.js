// components/FxLogin/FxLogin.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    visible: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    is_mobile: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showBindForm: false
  },

  /**
   * 组建钩子函数
   * **/
  created() {

  },
  /**
   * 组件的方法列表
   */
  methods: {

    /**
     * 登录完成回调
     */
    handleCloseLogin() {
      this.setData({
        showBindForm: false
      })
      wx.showTabBar()
      this.triggerEvent('closeEvent')
    },

    /**
     * 获取用户授权信息
     */
    bindGetUserInfo(e) {
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
     * 微信一键授权回调
     */
    handleGotPhoneNumber(e) {
      app.handleGotPhoneNumber(e, (success) => {
        if (success) {
          this.setData({
            is_mobile: true,
            visible: false
          })
        } else {
          utils.fxShowToast('登录失败，稍后重试！')
          wx.navigateTo({
            url: '/pages/index/index',
          })
        }
      })
    }

  }
})