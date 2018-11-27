//app.js
const http = require('./utils/http.js')
const api = require('./utils/api.js')
const utils = require('./utils/util.js')

App({
  onLaunch: function () {
    // 获取自定义第三方扩展信息
    let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}

    utils.logger(extConfig, '第三方拓展信息')

    this.globalData.configInfo = extConfig
    this.globalData.appId = extConfig.authAppid

    // 从本地缓存中获取数据
    const jwt = wx.getStorageSync('jwt')
    this.globalData.jwt = jwt

    // 检查 jwt 是否存在 如果不存在调用登录
    if (!jwt || !jwt.token) {
      this.globalData.isLogin = false
      this.login()
    } else {
      // 验证token是否过期
      utils.logger(utils.checkTokenIsExpired(jwt), 'Token expired')

      if (utils.checkTokenIsExpired(jwt)) {
        this.globalData.isLogin = false
        // 过期重新登录
        this.login()
      } else {
        // 已登录，则直接执行
        this.hookLoginCallBack(jwt)
      }
    }

    // 预先加载大陆地址
    this.getAddressPlaces()

    // 获取地理位置
    this.getUserLocation()

    // 设备信息
    this.getSystemInfo()
  },

  /**
   * 登录
   */
  login: function () {
    // 调用login获取code
    wx.login({
      success: (res) => {
        // 发送 res.code 到后台换取 openId
        const code = res.code

        // 发送请求获取 jwt
        http.fxPost(api.user_authorize, {
          auth_app_id: this.globalData.appId,
          code: code
        }, (res) => {
          utils.logger(res, '自动登录')

          let userLoaded = false
          if (res.success) {
            let isBind = res.data.is_bind
            // 登录成功，得到jwt后存储到storage
            wx.setStorageSync('jwt', res.data)
            this.globalData.jwt = res.data
            console.log(res.data, 'jwt信息')
            if (isBind) {
              // 回调函数
              this.hookLoginCallBack(res.data)
            }

            userLoaded = true
          } else {
            // 显示错误信息
            wx.showToast({
              title: res.status.message,
              icon: 'none',
              duration: 2000
            })
          }

          // 由于异步请求，可能会在 Page.onLoad 之后才返回
          // 所以此处加入 callback 以防止这种情况
          if (this.userInfoReadyCallback) {
            this.userInfoReadyCallback(userLoaded)
          }
        })
      }
    })
  },
  
  /**
   * 刷新用户session key
   */
  refreshUserSessionKey(cb) {
    // 调用login获取code
    wx.login({
      success: (res) => {
        // 发送 res.code 到后台换取 openId
        const code = res.code

        let params = {
          code: code,
          auth_app_id: this.globalData.appId
        }

        // 更新用户Session key
        http.fxPost(api.auth_refresh_session, params, (res) => {
          utils.logger(res, '刷新session成功')
          if (!res.success) {
            utils.fxShowToast(res.status.message)
          } else {
            return typeof cb == 'function' && cb(true)
          }
        })
      }
    })
  },

  /**
   * 获取用户授权手机号
   */
  handleGotPhoneNumber(e, cb) {
    http.fxPost(api.wxa_authorize_bind_mobile, {
      auth_app_id: this.globalData.app_id,
      encrypted_data: e.detail.encryptedData,
      iv: e.detail.iv,
      openid: this.globalData.jwt.openid
    }, (res) => {
      utils.logger(res, '微信授权手机号')
      if (res.success) {
        // 登录成功，得到jwt后存储到storage
        wx.setStorageSync('jwt', res.data)

        this.globalData.jwt = res.data

        // 回调函数
        this.hookLoginCallBack(res.data)

        return typeof cb == 'function' && cb(true)
      } else {
        utils.fxShowToast(res.status.message)

        return typeof cb == 'function' && cb(false)
      }
    })
  },

  // 登录后回调事件
  hookLoginCallBack(jwt) {
    // 设置全局变量
    this.globalData.isLogin = true
    this.globalData.token = jwt.token || null
    this.globalData.uid = jwt.uid || 0

    // 更新用户信息
    this.updateUserInfo(jwt)
  },

  // 更新用户信息
  updateUserInfo(jwt) {
    this.globalData.userInfo = {
      avatar: jwt.avatar,
      username: jwt.username,
      mobile: jwt.mobile,
      username: jwt.username
    }

    this.globalData.userLoaded = true

    wx.setStorageSync('userInfo', this.globalData.userInfo)
  },

  /**
   * 获取国家或地区下所有省市区
   * 默认值：1，为中国大陆
   */
  getAddressPlaces(country_id = 1, cb) {
    let cacheKey = 'places_' + country_id
    let allPlaces = wx.getStorageSync(cacheKey)
    if (!allPlaces || Object.keys(allPlaces).length == 0) {
      http.fxGet(api.provinces_cities, {
        country_id: country_id
      }, (result) => {
        if (result.success) {
          let places = result.data
          if (places && Object.keys(places).length > 0) {
            // 设置到本地缓存
            utils.logger(cacheKey, '缓存Key')
            wx.setStorageSync(cacheKey, places)
          }
          return typeof cb == 'function' && cb(places)
        } else {
          utils.logger(result.status.message, '预加载地址出错！！！')
          return typeof cb == 'function' && cb(false)
        }
      })
    } else {
      return typeof cb == 'function' && cb(allPlaces)
    }
  },

  /**
   * 支付订单
   */
  wxpayOrder: function (rid, payParams, cb) {
    // 提交成功，发起支付
    wx.requestPayment({
      timeStamp: payParams.timeStamp.toString(),
      nonceStr: payParams.nonceStr,
      package: 'prepay_id=' + payParams.prepay_id,
      signType: 'MD5',
      paySign: payParams.pay_sign,
      success: function (res) {
        utils.logger(res, '支付成功返回参数')
        if (res.errMsg == 'requestPayment:ok') {
          wx.showToast({
            title: '支付成功',
          })

          // 跳转至详情
          wx.redirectTo({
            url: './../paymentSuccess/paymentSuccess?rid=' + rid,
          })

          // 支付成功，更新订单状态
          // http.fxPost(api.order_paid_status, {
          //   rid: rid
          // }, function (result) {
          //   utils.logger(result,"修改订单状态=============")
          //   if (result.success) {

          //     // 跳转至详情
          //     wx.redirectTo({
          //       url: './../paymentSuccess/paymentSuccess?rid=' + rid,
          //     })
          //   }
          // })
        }
      },
      fail: function (res) {
        utils.logger(res.errMsg, '支付失败了')
        if (res.errMsg == 'requestPayment:fail') {
          wx.showToast({
            title: res.err_desc,
          })
        } else if (res.errMsg == 'requestPayment:fail cancel') {
          wx.showToast({
            title: '已取消支付',
          })

          // 跳转到订单
          wx.redirectTo({
            url: './../order/order',
          })
        }
        return typeof cb == 'function' && cb()
      }
    })
  },

  /**
   * 获取用户地理位置
   */
  getUserLocation: function () {
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        this.globalData.location = {
          latitude: res.latitude,
          longitude: res.longitude,
          speed: res.speed,
          accuracy: res.accuracy
        }
      },
    })
  },

  /**
   * 发送消息
   */
  handleSendNews(e) {
    console.log(e, 'formid')
    if (e == 'the formId is a mock one formid') {
      return
    }

    http.fxPost(api.users_save_form_ids, {
      form_ids: [e],
      openid: this.globalData.jwt.openid
    }, result => {
      console.log(result, '模板消息')
    })
  },

  /**
   * 设备信息
   */
  getSystemInfo() {
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.systemInfo = res
      },
      fail: (res) => {
        this.globalData.systemInfo.windowHeight = 555
      }
    })
  },

  globalData: {
    isLogin: false,
    appId: null,
    token: null,
    uid: 0,
    // 设备信息
    systemInfo: {},
    // 登录相关信息
    jwt: {},
    // 第三方配置信息
    configInfo: '',
    // 地址位置
    location: {},
    userInfo: null
  }
})