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
    showLoginModal: false,
    showBindForm: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
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
      utils.logger(e.detail, '获取用户授权信息')
      if (e.detail.userInfo) {
        // 用户点击允许按钮
        this.setData({
          showBindForm: true
        })

        let userAuth = e.detail
        // 检测当前用户登录态是否有效
        wx.checkSession({
          success: (res) => {
            utils.logger(res, 'check session success')
            this.getUserAuthInfo(userAuth)
          },
          fail: (res) => {
            utils.logger(res, 'check session fail')

            app.refreshUserSessionKey((e) => {
              this.getUserAuthInfo(userAuth)
            })
          }
        })
      } else {
        // 用户点击拒绝按钮
        utils.fxShowToast('拒绝授权，你可以选择微信一键快捷授权')
      }
    },

    /**
     * 获取用户授权信息
     */
    getUserAuthInfo (userAuth) {
      utils.logger(userAuth, '更新用户解密信息')
      const jwt = wx.getStorageSync('jwt')
      let params = {
        encrypted_data: userAuth.encryptedData,
        auth_app_id: app.globalData.appId,
        openid: jwt.openid,
        iv: userAuth.iv
      }

      utils.logger(params, '用户授权参数')

      // 更新用户授权信息
      http.fxPost(api.auth_weixin, params, (res) => {
        utils.logger(res, '授权解密成功')
        if (!res.success) {
          utils.fxShowToast(res.status.message)
        }
      })
    },

    /**
     * 微信一键授权回调
     */
    handleGotPhoneNumber(e) {
      let gotParams = e
      if (e.detail.errMsg == 'getPhoneNumber:ok') {

        // 检测当前用户登录态是否有效
        wx.checkSession({
          success: (res) => {
            utils.logger(res, 'check session success')
            app.handleGotPhoneNumber(e, (success) => {
              if (success) {
                this.setData({
                  showLoginModal: true,
                  visible: false
                })
                wx.showTabBar()
              } else {
                utils.fxShowToast('登录失败，稍后重试！')
                wx.navigateTo({
                  url: '/pages/index/index',
                })
              }
            })
          },
          fail: (res) => {
 
            app.refreshUserSessionKey((e) => {
              app.handleGotPhoneNumber(gotParams, (success) => {
                if (success) {
                  this.setData({
                    showLoginModal: true,
                    visible: false
                  })
                } else {
                  utils.fxShowToast('登录失败，稍后重试！')
                  wx.navigateTo({
                    url: '/pages/index/index',
                  })
                }
              })
            })
          }
        })
        
      } else {
        utils.fxShowToast('拒绝授权，你可以选择手机号动态登录')
      }      
    }

  }
})