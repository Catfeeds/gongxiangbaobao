//app.js
const http = require('./utils/http.js')
const api = require('./utils/api.js')
const util = require('./utils/util.js')

App({
  onLaunch: function () {
    // 展示本地存储能力
    let logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 获取自定义第三方扩展信息
    let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
    this.globalData.app_id = extConfig.authAppid
    wx.setStorageSync('fx', this.globalData)
    // 从本地缓存中获取数据
    const jwt = wx.getStorageSync('jwt')
    // 检查 jwt 是否存在 如果不存在调用登录
    if (!jwt || !jwt.token) {
      this.globalData.isLogin = false
      this.login()
    } else {
      // 验证token是否过期
      console.log('Token expired: ' + util.checkTokenIsExpired(jwt))
      if (util.checkTokenIsExpired(jwt)) {
        this.globalData.isLogin = false
        // 过期重新登录
        this.login()
      }
      // 获取地理位置
      this.getUserLocation()
      // 获取购物车数量
      this.getCartTotalCount()
    }
    // 获取店铺的rid
    this.getShopId()
  },

  login: function (cb) {
    let that = this
    console.log('调用login获取code')
    // 调用login获取code
    wx.login({
      success: function (res) {
        console.log(res)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        const code = res.code
        console.log('Login code: ' + code)
        // 发送请求获取 jwt
        http.fxPost(api.user_authorize, {
          auth_app_id: that.globalData.app_id,
          code: code
        }, function (res) {
          console.log(res)
          if (res.success) {
            let isBind = res.data.is_bind
            // 登录成功，得到jwt后存储到storage
            wx.setStorage({
              key: 'jwt',
              data: res.data
            })
            that.globalData.isLogin = true
            that.globalData.token = res.data.token
            that.globalData.uid = res.data.uid
            // 回调函数
            if (cb) {
              return typeof cb == 'function' && cb(true)
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

  // 获取商家的信息id
  getShopId(){
    http.fxGet(api.shop_info, {},(result)=> {
      console.log(result)
      if (result.success) {
        wx.setStorageSync('storeId', result.data.rid)
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
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
        if (res.errMsg == 'requestPayment:ok') {
          wx.showToast({
            title: '支付成功',
          })

          // 支付成功，更新订单状态
          http.fxPost(api.order_paid_status, { rid: rid }, function (result) {
            if (result.success) {
              // 跳转至详情
              wx.navigateTo({
                url: './../payment/payment?rid=' + rid,
              })
            }
          })
        }
      },
      fail: function (res) {
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
  getCartTotalCount() {
    let that = this
    http.fxGet(api.cart_item_count, {}, function (res) {
      if (res.success) {
        that.globalData.cartTotalCount = res.data.item_count
      }
    })
  },

  /**
   * 获取用户地理位置
   */
  getUserLocation: function () {
    let that = this
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        that.globalData.location = {
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
    userInfo: null,
    app_id: null,
    token: null,
    uid: 0,
    // 微信用户openid
    openid: '',
    // 地址位置
    location: {},
    // 购物车数量
    cartTotalCount: 0,
    // 选中的产品
    checkedBuyItems: [],
    // 选中的收货地址
    checkedDeliveryAddress: {},
    system: [],
    // 店铺的信息
    storeInfo:[],
    // 主题商品列表
    themeProdct:[],
    //书否关注过
    isWatchstore:false,
    //订单页面最合适的运费模板
    logisticsMould:'',
    // 订单页面的sku信息
    orderInfoSkus:''
  }
})