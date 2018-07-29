//app.js
const http = require('./utils/http.js')
const api = require('./utils/api.js')
const util = require('./utils/util.js')

App({
  onLaunch: function() {
    // 展示本地存储能力
    let logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 获取自定义第三方扩展信息
    let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}

    this.globalData.app_id = extConfig.authAppid
    this.globalData.storeRid = extConfig.storeRid

    console.log(extConfig, '第三方拓展信息')

    this.globalData.app_id = extConfig.authAppid
    this.globalData.configInfo = extConfig

    // 从本地缓存中获取数据
    const jwt = wx.getStorageSync('jwt')
    console.log(jwt,'jwt')
    this.globalData.jwt = jwt

    // 检查 jwt 是否存在 如果不存在调用登录
    if (!jwt || !jwt.token) {
      this.globalData.isLogin = false
      this.login()
    } else {
      // 验证token是否过期
      console.log(util.checkTokenIsExpired(jwt), 'Token expired')

      if (util.checkTokenIsExpired(jwt)) {
        this.globalData.isLogin = false
        // 过期重新登录
        this.login()
      } else {
        // 设置全局变量
        this.globalData.isLogin = true
        this.globalData.token = jwt.token
        this.globalData.uid = jwt.uid
        // 更新用户信息
        this.updateUserInfo(jwt)
      }
      // console.log('现在调取的是没有登陆')
      // 获取购物车数量
      this.getCartTotalCount()
    }

    // 获取地理位置
    this.getUserLocation()
  },

  login: function(cb) {
    // 调用login获取code
    wx.login({
      success: (res) => {
        // 发送 res.code 到后台换取 openId
        const code = res.code
        console.log('Login code: ' + code)

        // 发送请求获取 jwt
        http.fxPost(api.user_authorize, {
          auth_app_id: this.globalData.app_id,
          code: code
        }, (res) => {
          console.log(res, '自动登录')
          if (res.success) {
            let isBind = res.data.is_bind
            // 登录成功，得到jwt后存储到storage
            wx.setStorageSync('jwt', res.data)

            if (isBind) {
              this.globalData.isLogin = true
              this.globalData.token = res.data.token
              this.globalData.uid = res.data.uid
              //更新用户信息
              this.updateUserInfo(res.data)
              // 回调函数
              if (cb) {
                return typeof cb == 'function' && cb(true)
              }
            }
          } else {
            // 显示错误信息
            wx.showToast({
              title: res.status.message,
              icon: 'none',
              duration: 2000
            })
          }
        })
      }
    })
  },

  // 更新用户信息
  updateUserInfo (jwt) {
    this.globalData.userInfo = {
      avatar: jwt.avatar,
      username: jwt.username,
      mobile: jwt.mobile,
      username: jwt.username
    }
  },

  /**
   * 支付订单
   */
  wxpayOrder: function(rid, payParams, cb) {
    // 提交成功，发起支付
    wx.requestPayment({
      timeStamp: payParams.timeStamp.toString(),
      nonceStr: payParams.nonceStr,
      package: 'prepay_id=' + payParams.prepay_id,
      signType: 'MD5',
      paySign: payParams.pay_sign,
      success: function(res) {
        if (res.errMsg == 'requestPayment:ok') {
          wx.showToast({
            title: '支付成功',
          })

          // 支付成功，更新订单状态
          http.fxPost(api.order_paid_status, {
            rid: rid
          }, function(result) {
            if (result.success) {
              // 跳转至详情
              wx.navigateTo({
                url: './../payment/payment?rid=' + rid,
              })
            }
          })
        }
      },
      fail: function(res) {
        console.log(res.errMsg)
        if (res.errMsg == 'requestPayment:fail') {
          wx.showToast({
            title: res.err_desc,
          })
        } else if (res.errMsg == 'requestPayment:fail cancel') {
          wx.showToast({
            title: '已取消支付',
          })
        }
        return typeof cb == 'function' && cb()
      }
    })
  },

  /**
   * 获取购物车数量
   */
  getCartTotalCount () {
    http.fxGet(api.cart_item_count, {}, (res) => {
      console.log(res, '购物车数量')
      if (res.success) {
        this.globalData.cartTotalCount = res.data.item_count
        if (this.globalData.cartTotalCount > 0) {
          wx.setTabBarBadge({
            index: 1,
            text: '' + this.globalData.cartTotalCount
          })
        }
      }
    })
  },

  /**
   * 获取用户地理位置
   */
  getUserLocation: function() {
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

  globalData: {
    isLogin: false,
    app_id: null,
    token: null,
    uid: 0,
    // 登录相关信息
    jwt: {},
    // 第三方配置信息
    configInfo: '',
    // 店铺的信息
    storeRid: '',
    storeInfo: [],
    // 登录用户信息
    userInfo: null,
    // 地址位置
    location: {},
    // 购物车数量
    cartTotalCount: 0,
    // 选中的产品
    checkedBuyItems: [],
    // 选中的收货地址
    checkedDeliveryAddress: {},
    system: [],
    // 主题商品列表
    themeProdct: [],
    // 是否关注过
    isWatchstore: false,
    // 订单页面最合适的运费模板
    logisticsMould: '',
    // 订单页面的sku信息
    orderInfoSkus: '',
    // 优惠卷
    couponList: {},
    // 满减
    fullSubtractionList: {},
    // 店铺是否经过认证
    isAuthenticationStore: '',
    // 订单里面的sku
    orderSkus: '',
    // 评论订单的时候的商品
    critiqueProduct: '',
    // 选择运费模板里面的需要的订单信息
    pickLogistics: ''
  }
})