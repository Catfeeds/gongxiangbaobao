// components/FxLogin/FxLogin.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
const common = require('./../../utils/common.js')

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
    loginForm: {
      country_code: '+86',
      mobile_number: '',
      verify_code: ''
    },
    country_pick: [],
    pickIndex: -1,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showBindForm: false,
    showCountryModal: false,
    showClearBtn: false,
    hasError: false,
    canGotCode: false,
    is_time: false,
    time: 0,
    canSubmit: false,
  },

  /**
   * 组建钩子函数
   * **/
  created() {
    this.getCountries()
  },

  /**
   * 组件的方法列表
   */
  methods: {

    // 选择国家的模态框是否弹出
    handleShowCountryModal() {
      this.setData({
        showCountryModal: true
      })

      wx.setNavigationBarTitle({
        title: '选择国家与地区'
      })
    },

    /**
     * 选中某个国家
     */
    handlePickCountry(e) {
      this.setData({
        pickIndex: e.currentTarget.dataset.index,
        'loginForm.country_code': e.currentTarget.dataset.code,
        showCountryModal: false
      })
    },

    /**
     * 显示国家选择
     */
    handleCloseCountryModal() {
      this.setData({
        showCountryModal: false
      })
    },

    // 输入手机号码
    handleMobileChnange(e) {
      let _mobile = e.detail.value
      let _showClearBtn = false
      let _canGotCode = false
      if (_mobile) {
        _showClearBtn = true
        _canGotCode = true
      }
      this.setData({
        'loginForm.mobile_number': _mobile,
        showClearBtn: _showClearBtn,
        canGotCode: _canGotCode
      })
    },

    /**
     * 清除手机号
     */
    handleClearMobile() {
      this.setData({
        'loginForm.mobile_number': '',
        showClearBtn: false,
        canGotCode: false
      })
    },

    /**
     * 验证码事件
     */
    handleVerifyCode(e) {
      this.setData({
        'loginForm.verify_code': e.detail.value
      })

      this._verification()
    },

    /**
     * 校验绑定手机号码
     */
    _verification() {
      if (this.data.loginForm.verify_code != '' && this.data.loginForm.mobile_number != '') {
        this.setData({
          canSubmit: true
        })
      } else {
        this.setData({
          canSubmit: false
        })
      }
    },

    /**
     * 获取验证码
     */
    handleGetVerfyCode() {
      let mobile_number = this.data.loginForm.mobile_number - 0
      let params = {
        mobile: mobile_number.toString(),
        area_code: this.data.loginForm.country_code,
        page: 'phone_verify_code'
      }

      this.setData({
        is_time: true,
        time: 60
      })

      if (this.data.is_time == true) {
        let pageTime = setInterval(() => {
          this.setData({
            time: --this.data.time
          })
          if (this.data.time == 0) {
            clearInterval(pageTime)
            this.setData({
              is_time: false
            })
          }
        }, 1000)
      }

      http.fxPost(api.auth_get_msm_code, params, (result) => {
        console.log(result)
        if (!result.success) {
          utils.fxShowToast(result.status.message)
        }
      })
    },

    /**
     * 提交授权
     */
    handleSubmitLogin() {
      let params = {
        area_code: this.data.loginForm.country_code,
        auth_app_id: app.globalData.configInfo.authAppid, // 小程序ID
        openid: app.globalData.jwt.openid, //	用户标识
        mobile: this.data.loginForm.mobile_number, // 	手机号
        verify_code: this.data.loginForm.verify_code //	手机验证码
      }

      if (!this.data.canSubmit) {
        utils.fxShowToast('请先完成输入')
        return
      }

      http.fxPost(api.bind_mobile, params, (res) => {
        utils.logger(res, '登录成功', )
        if (res.success) {
          utils.fxShowToast('登录成功', 'success')

          wx.setStorageSync('jwt', res.data)
          app.globalData.jwt = res.data

          // 回调函数
          app.hookLoginCallBack(res.data)

          // 触发关闭回调
          this.triggerEvent('closeEvent')
        } else {
          utils.fxShowToast(res.status.message)
        }
      })
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
    getUserAuthInfo(userAuth) {
      utils.logger(userAuth, '更新用户解密信息')
      const jwt = wx.getStorageSync('jwt')
      let params = {
        encrypted_data: userAuth.encryptedData,
        auth_app_id: app.globalData.app_id,
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
          },
          fail: (res) => {

            app.refreshUserSessionKey((e) => {
              app.handleGotPhoneNumber(gotParams, (success) => {
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
            })
          }
        })

      } else {
        utils.fxShowToast('拒绝授权，你可以选择手机号动态登录')
      }
    },

    /**
     * 获取所有国家
     */
    getCountries() {
      http.fxGet(api.countries, {}, (result) => {
        utils.logger(result, '所有国家')
        this.setData({
          country_pick: result.data
        })
      })
    }

  }
})