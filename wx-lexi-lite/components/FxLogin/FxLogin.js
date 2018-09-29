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
    canSubmit: false
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

    handleCloseCountryModal() {
      this.setData({
        showCountryModal: false
      })
    },

    // 输入手机号码
    handleMobileChnange(e) {
      console.log(e.detail.value)
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

    handleGetVerfyCode() {
      let mobile_number = this.data.loginForm.mobile_number - 0
      if (!(/^[1][3,4,5,7,8][0-9]{9}$/.test(mobile_number))) {
        utils.fxShowToast('输入的手机号码错误')
        return
      }
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
      let lastVisitLifeStore = wx.getStorageSync('lastVisitLifeStoreRid') || false

      let params = {
        area_code: this.data.loginForm.country_code,
        auth_app_id: app.globalData.configInfo.authAppid, // 小程序ID
        openid: app.globalData.jwt.openid, //	用户标识
        mobile: this.data.loginForm.mobile_number, // 	手机号
        verify_code: this.data.loginForm.verify_code, //	手机验证码
        last_store_rid: lastVisitLifeStore
      }
      console.log(params, "提交授权后端传参")

      if (!this.data.canSubmit) {
        utils.fxShowToast('请先完成输入')
        return
      }

      http.fxPost(api.bind_mobile, params, (res) => {
        console.log(res)
        if (res.success) {
          utils.fxShowToast('登录成功', 'success')

          app.globalData.isLogin = true
          wx.setStorageSync('jwt', res.data)

          app.globalData.token = res.data.token
          app.globalData.uid = res.data.uid
          //更新用户信息
          app.updateUserInfo(res.data)
          // 更新小B身份
          app.updateLifeStoreInfo(res.data)
          // 更新最后浏览
          if (lastVisitLifeStore) {
            app.updateLifeStoreLastVisit(lastVisitLifeStore)
          }
          // 触发关闭回调
          this.triggerEvent('closeEvent')
        } else {
          utils.fxShowToast(result.status.message)
        }
      })
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
     * 获取用户授权手机号
     */
    handleGotPhoneNumber(e) {
      console.log(e)
      if (e.detail.errMsg == 'getPhoneNumber:ok') {
        // 调用login获取code
        wx.login({
          success: (res) => {
            // 发送 res.code 到后台换取 openId
            const code = res.code
            console.log('Login code: ' + code)

            let lastVisitLifeStore = wx.getStorageSync('lastVisitLifeStoreRid') ||false

            http.fxPost(api.wxa_authorize_bind_mobile, {
              code: code,
              auth_app_id: app.globalData.app_id,
              encrypted_data: e.detail.encryptedData,
              iv: e.detail.iv,
              last_store_rid: lastVisitLifeStore
            }, (res) => {
              console.log(res, '微信授权手机号')
              if (res.success) {
                // 登录成功，得到jwt后存储到storage
                wx.setStorageSync('jwt', res.data)
                console.log(res.data, 'jwt信息')
                app.globalData.isLogin = true
                app.globalData.token = res.data.token
                app.globalData.uid = res.data.uid
                app.globalData.jwt = res.data
                //更新用户信息
                app.updateUserInfo(res.data)
                // 更新小B身份
                app.updateLifeStoreInfo(res.data)
                // 更新最后浏览
                if (lastVisitLifeStore) {
                  app.updateLifeStoreLastVisit(lastVisitLifeStore)
                }
                // 回调函数
                app.hookLoginCallBack()

                // 触发关闭回调
                this.triggerEvent('closeEvent')

              } else {
                utils.fxShowToast(res.status.message)
              }
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
        console.log(result)
        this.setData({
          country_pick: result.data
        })
      })
    }

  }
})