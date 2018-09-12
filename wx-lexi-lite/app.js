//app.js
const http = require('./utils/http.js')
const api = require('./utils/api.js')
const util = require('./utils/util.js')

const common = require('./utils/common.js')

App({
  onLaunch: function () {
    // 展示本地存储能力
    let logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 获取自定义第三方扩展信息
    let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}

    console.log(extConfig, '第三方拓展信息')

    this.globalData.configInfo = extConfig
    this.globalData.app_id = extConfig.authAppid
    this.globalData.storeRid = extConfig.storeRid
    
    // 从本地缓存中获取数据
    const jwt = wx.getStorageSync('jwt')
    console.log(jwt, 'jwt')
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

        // 更新小B身份
        this.updateLifeStoreInfo(jwt)

        // 已登录，则直接执行
        this.hookLoginCallBack()
      }
    }

    // 获取地理位置
    this.getUserLocation()
  },

  /**
   * 登录
   */
  login: function () {
    return new Promise((resolve, reject) => {

      if (this.globalData.userLoaded) {
        return resolve({ success: true })
      }

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
              console.log(res.data, 'jwt信息')
              if (isBind) {
                this.globalData.isLogin = true
                this.globalData.token = res.data.token
                this.globalData.uid = res.data.uid
                //更新用户信息
                this.updateUserInfo(res.data)
                // 更新小B身份
                this.updateLifeStoreInfo(res.data)

                // 回调函数
                this.hookLoginCallBack()

                resolve({ success: true })
              }
            } else {
              // 显示错误信息
              wx.showToast({
                title: res.status.message,
                icon: 'none',
                duration: 2000
              })

              reject({ success: false })
            }
          })
        }
      })
    })
  },

  // 登录后回调事件
  hookLoginCallBack() {
    console.log('登录后，执行回调函数')
    // 获取购物车数量
    this.getCartTotalCount()
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
   * 更新登录用户的生活馆信息
   */
  updateLifeStoreInfo(jwt) {
    let lifeStore = {
      isSmallB: false,
      lifeStoreRid: ''
    }

    if (jwt.is_small_b) {
      lifeStore = {
        isSmallB: jwt.is_small_b,
        lifeStoreRid: jwt.store_rid
      }
    }

    wx.setStorageSync('lifeStore', lifeStore)
  },

  /**
   * 更新用户最后访问的生活馆信息
   */
  updateLifeStoreLastVisit (sid) {
    wx.setStorageSync('lastVisitLifeStoreRid', sid)

    // 登录用户，更新至服务端；
    // 未登录用户，临时保存至客户端
    if (this.globalData.isLogin) {
      // 同步更新至服务端
      http.fxPost(api.life_store_update_rid, {
        last_store_rid: sid
      }, (result) => {
        console.log(result, '更新最近的生活馆')
        if (!result.success) {
          utils.fxShowToast(result.status.message)
        } else {
          console.log('已成功更新最近的生活馆！')
        }
      })
    }
  },
  
  /**
   * 获取用户最后访问的生活馆rid
   */
  getLastVisitLifeStore () {
    http.fxGet(api.life_store_last_visit, {}, function (result) {
      if (result.success) {
        lastVisitLifeStoreRid = result.data.last_store_rid

        wx.setStorageSync('lastVisitLifeStoreRid', lastVisitLifeStoreRid)
      }
    })
  },

  /**
   * 分享小程序至好友
   * 验证生活馆或其他分销信息
   */
  getDistributeLifeStoreRid () {
    let lastVisitLifeStoreRid = wx.getStorageSync('lastVisitLifeStoreRid')

    if (!lastVisitLifeStoreRid) {
      const lifeStore = wx.getStorageSync('lifeStore')
      if (lifeStore && lifeStore.isSmallB) {
        lastVisitLifeStoreRid = lifeStore.lifeStoreRid
      }
    }

    return lastVisitLifeStoreRid
  },

  /**
   * 分享商品详情页
   */
  shareWxaProduct (rid, title, imageUrl) {
    let lastVisitLifeStoreRid = this.getDistributeLifeStoreRid()

    // scene格式：rid + '-' + sid
    let scene = rid
    if (lastVisitLifeStoreRid) {
      scene +=  '-' + lastVisitLifeStoreRid
    }

    return {
      title: title,
      path: 'pages/product/product?scene=' + scene,
      imageUrl: imageUrl,
      success: (res) => {
        console.log(res, '分享商品成功!')
      }
    }
    
  },

 /**
   * 分享平台
   */

  shareLeXi(){
    let uid = wx.getStorageSync("jwt")
    return {
      title: "乐喜",
      path: 'pages/index/index?uid=' + uid.uid,
      imageUrl: "https://static.moebeast.com/vimage/share-lexi.png",
      success: (res) => {
        console.log(res, '分享商品成功!')
      }
    }
  },


  /**
   * 订单成功后，清除订单相关全局变量
   */
  cleanOrderGlobalData () {
    this.globalData.deliveryCountries = []
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

          // 跳转至详情
          wx.redirectTo({
            url: './../paymentSuccess/paymentSuccess?rid=' + rid,
          })

          // 支付成功，更新订单状态
          // http.fxPost(api.order_paid_status, {
          //   rid: rid
          // }, function (result) {
          //   console.log(result,"修改订单状态=============")
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
        console.log(res.errMsg,'支付失败了')
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
   * 获取购物车数量
   */
  getCartTotalCount() {
    http.fxGet(api.cart_item_count, { open_id: this.globalData.jwt.openid }, (res) => {
      console.log(res, '购物车数量')
      if (res.success) {
        this.globalData.cartTotalCount = res.data.item_count
        if (this.globalData.cartTotalCount > 0) {
          wx.showTabBarRedDot({
            index: 2
          })
        }
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

  globalData: {
    isLogin: false,
    app_id: null,
    token: null,
    uid: 0,
    // 检测用户加载是否完成，异步问题
    userLoaded: false,
    // 支付成功后的订单
    paymentSuccessOrder: {},
    // 登录相关信息
    jwt: {},
    // 第三方配置信息
    configInfo: '',
    // 店铺主人信息
    storeOwnerInfo: '',
    // 店铺的信息
    storeRid: '',
    storeInfo: [],
    // 当前登录用户的生活馆
    lifeStore: {},
    // 当前用户最后访问的生活馆
    lastVisitLifeStoreRid: '',
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
    deliveryCountries: [],
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
    pickLogistics: '',
    // 订单的参数
    orderParams: {
      authAppid: '',
      address_rid: '', // String	必需	 	收货地址ID
      outside_target_id: '', // String	可选	 	 
      invoice_type: 1, // Integer	可选	1	发票类型
      invoice_info: '', // String	可选	{}	 
      ship_mode: '', // Integer	可选	1	1、发快递 2、自提
      from_client: 1, // String	可选	 	来源客户端，1、小程序；2、H5  6、PAD
      affiliate_code: '', // String	可选	 	推广码
      bonus_code: '', // String	可选	 	官方红包码
      sync_pay: 1, // Integer	可选	0	是否同步返回支付参数 0、否 1、是
      openid: '',
      store_items: [{
        store_rid: '', // String	必需	 	当前店铺rid
        is_distribute: '', // Integer	可选	0	是否分销 0、否 1、是
        original_store_rid: '', // String	可选	 	原店铺rid
        buyer_remark: '', // String	可选	 	买家备注
        blessing_utterance: '', // String	可选	 	买家寄语
        coupon_codes: '', // String	可选	 	优惠券码
        items: [{
          rid: '', // String	必需	 	sku
          quantity: '', // Number	必需	1	购买数量
          express_id: '', // Integer	必需	 	物流公司ID
          warehouse_id: '' // Number	可选	 	发货的仓库ID
        }]
      }]
    }
  }
})