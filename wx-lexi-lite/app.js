// app.js
const http = require('./utils/http.js')
const api = require('./utils/api.js')
const utils = require('./utils/util.js')
const common = require('./utils/common.js')

App({
  onLaunch: function() {
    // 获取自定义第三方扩展信息
    let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}

    utils.logger(extConfig, '第三方拓展信息')

    this.globalData.configInfo = extConfig
    this.globalData.app_id = extConfig.authAppid
    this.globalData.storeRid = extConfig.storeRid

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

    this.getRunEnv()

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
  login: function() {
    // 调用login获取code
    wx.login({
      success: (res) => {
        // 发送 res.code 到后台换取 openId
        const code = res.code

        let lastStoreRid = wx.getStorageSync('lastVisitLifeStoreRid')

        // 发送请求获取 jwt
        http.fxPost(api.user_authorize, {
          auth_app_id: this.globalData.app_id,
          code: code,
          last_store_rid: lastStoreRid
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
          auth_app_id: this.globalData.app_id
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
    let lastVisitLifeStore = wx.getStorageSync('lastVisitLifeStoreRid') || false

    http.fxPost(api.wxa_authorize_bind_mobile, {
      auth_app_id: this.globalData.app_id,
      encrypted_data: e.detail.encryptedData,
      iv: e.detail.iv,
      openid: this.globalData.jwt.openid,
      last_store_rid: lastVisitLifeStore
    }, (res) => {
      utils.logger(res, '微信授权手机号')
      if (res.success) {
        // 登录成功，得到jwt后存储到storage
        wx.setStorageSync('jwt', res.data)

        this.globalData.jwt = res.data

        // 更新最后浏览
        if (lastVisitLifeStore) {
          this.updateLifeStoreLastVisit(lastVisitLifeStore)
        }

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

    // 更新小B身份
    this.updateLifeStoreInfo(jwt)

    // 绑定好友关系
    this.bindFriend()

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

    this.globalData.lifeStore = lifeStore

    wx.setStorageSync('lifeStore', lifeStore)
  },

  /**
   * 当登录用户获得小B身份后，同步更新本地缓存的Jwt信息
   */
  mergeLifeStoreToJwt(lifeStore) {
    const jwt = wx.getStorageSync('jwt')

    if (lifeStore && lifeStore.is_small_b) {
      jwt.is_small_b = lifeStore.is_small_b
      jwt.store_rid = lifeStore.store_rid

      wx.setStorageSync('jwt', jwt)
    }
  },

  /**
   * 更新用户最后访问的生活馆信息
   */
  updateLifeStoreLastVisit(sid) {
    wx.setStorageSync('lastVisitLifeStoreRid', sid)

    // 登录用户，更新至服务端；
    // 未登录用户，临时保存至客户端
    if (this.globalData.isLogin) {
      // 同步更新至服务端
      http.fxPost(api.life_store_update_rid, {
        last_store_rid: sid
      }, (result) => {
        if (!result.success) {
          utils.fxShowToast(result.status.message)
        } else {
          utils.logger('已成功更新最近的生活馆！')
        }
      })
    }
  },

  /**
   * 绑定好友关系
   */
  bindFriend() {
    const game_inviter = wx.getStorageSync('game_inviter')
    const jwt = wx.getStorageSync('jwt')
    let isNew = 0
    if (jwt.is_new) {
      isNew = 1
    }
    if (game_inviter && Object.keys(game_inviter).length > 0) {
      let data = {
        source_user_sn: game_inviter.uid,
        from_module: 1,
        is_new: isNew
      }
      http.fxPost(api.bind_friend, data, (res) => {
        utils.logger(res, '绑定好友关系')
        if (!res.success) {
          utils.fxShowToast(result.status.message)
        } else {
          // 绑定成功后，则清除
          wx.removeStorageSync('game_inviter')
        }
      })
    }
  },

  /**
   * 更新游戏分享次数
   */
  updateGameShare() {
    if (this.globalData.isLogin) {
      http.fxPost(api.question_share, {}, (res) => {
        if (!res.success) {
          utils.logger('更新游戏分享回调失败')
        }
      })
    }
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
   * 获取用户最后访问的生活馆rid
   */
  getLastVisitLifeStore() {
    http.fxGet(api.life_store_last_visit, {}, function(result) {
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
  getDistributeLifeStoreRid() {
    let lastVisitLifeStoreRid = wx.getStorageSync('lastVisitLifeStoreRid')

    if (!lastVisitLifeStoreRid) {
      const lifeStore = wx.getStorageSync('lifeStore')
      if (lifeStore && lifeStore.isSmallB) {
        lastVisitLifeStoreRid = lifeStore.lifeStoreRid
      }
    }
    utils.logger(lastVisitLifeStoreRid)
    return lastVisitLifeStoreRid
  },

  /**
   * 分享商品详情页
   */
  shareWxaProduct(rid, title, imageUrl) {
    let lastVisitLifeStoreRid = this.getDistributeLifeStoreRid()

    // scene格式：rid + '-' + sid
    let scene = rid
    if (lastVisitLifeStoreRid) {
      scene += '-' + lastVisitLifeStoreRid
    }

    utils.logger('pages/product/product?scene=' + scene)
    return {
      title: title,
      path: 'pages/product/product?scene=' + scene,
      imageUrl: imageUrl + '-pwxa',
      success: (res) => {
        utils.logger(res, '分享商品成功!')
      }
    }

  },

  /**
   * 分享平台
   */
  shareLeXi() {
    let lastVisitLifeStoreRid = this.getDistributeLifeStoreRid()
    let jwt = wx.getStorageSync('jwt')

    // scene格式：sid + '-' + uid
    let scene = ''
    if (lastVisitLifeStoreRid) {
      scene = lastVisitLifeStoreRid
      if (jwt.uid) {
        scene += '-' + jwt.uid
      }
    }

    return {
      title: '让有趣变得流行',
      path: 'pages/index/index?scene=' + scene,
      imageUrl: "https://static.moebeast.com/vimage/share-lexi.png",
      success: (res) => {
        utils.logger(res, '分享成功!')
      }
    }
  },

  /**
   * 订单成功后，清除订单相关全局变量
   */
  cleanOrderGlobalData() {
    this.globalData.deliveryCountries = []
    // 重新获取购物车数量
    this.getCartTotalCount()
  },

  /**
   * 支付订单
   */
  wxpayOrder: function(rid, payParams, formId, cb) {
    // 提交成功，发起支付
    wx.requestPayment({
      timeStamp: payParams.timeStamp.toString(),
      nonceStr: payParams.nonceStr,
      package: 'prepay_id=' + payParams.prepay_id,
      signType: 'MD5',
      paySign: payParams.pay_sign,
      success: (res) => {
        utils.logger(res, '支付成功返回参数')
        if (res.errMsg == 'requestPayment:ok') {
          wx.showToast({
            title: '支付成功',
          })

          // 跳转至详情
          wx.redirectTo({
            url: './../paymentSuccess/paymentSuccess?rid=' + rid,
          })
          // 发送form id
          http.fxPost(api.users_save_form_ids, {
            prepay_id: formId,
            openid: this.globalData.jwt.openid,
            order_rid: rid,
            app_id: this.globalData.app_id,
          }, result => {})

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
      fail: function(res) {
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
   * 获取购物车数量
   */
  getCartTotalCount() {
    const jwt = wx.getStorageSync('jwt')

    http.fxGet(api.cart_item_count, {
      open_id: jwt.openid
    }, (res) => {
      utils.logger(res, '购物车数量')
      if (res.success) {
        this.updateCartTotalCount(res.data.item_count, res.data.is_new)
      }
    })
  },

  /**
   * 更新购物车数量
   */
  updateCartTotalCount(cnt, isNew = 0) {
    this.globalData.cartTotalCount = cnt
    if (isNew > 0) {
      wx.showTabBarRedDot({
        index: 2
      })
    } else {
      wx.hideTabBarRedDot({
        index: 2
      })
    }
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

  /**
   * 获取运行环境
   */
  getRunEnv() {
    http.fxGet(api.run_env, {}, (res) => {
      if (res.success) {
        this.globalData.runEnv = res.data.status
      }
    })
  },

  /**
   * 发送消息
   */
  handleSendNews(e) {
    if (e == 'the formId is a mock one formid') {
      return
    }

    http.fxPost(api.users_save_form_ids, {
      form_ids: [e],
      app_id: this.globalData.app_id,
      openid: this.globalData.jwt.openid
    }, result => {})
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

  /**
   * 检测网络
   */
  ckeckNetwork() {
    wx.onNetworkStatusChange((res) => {
      if (res.networkType == "none") {
        wx.navigateTo({
          url: './../networkError/networkError',
        })
      } else {}
    })
  },

  /**
   * 全局变量
   */

  globalData: {
    isLogin: false,
    app_id: null,
    token: null,
    uid: 0,
    // 设备信息
    systemInfo: {},
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
    // 用于当下一页面改变的时候告诉父级别页面 
    agent: {
      // 产品详情的关注变动 0没有动过 1为关注 2为取消关注
      productFollowChange: 0,
      // 选品中心是否有变动
      distributeChange: false,
      distributeValue: {
        rid: '',
        value: ''
      },
      
      // 选品搜索结果是否有变动
      distributeSearchChange:false,
      distributeSearchValue:{
        rid: '',
        value: ''
      },

      // 首页的馆主推荐是否有变动
      storeOwnerCommendChange:false,
    },
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
      last_store_rid: '', // 最近浏览的小b店铺rid
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
    },
    runEnv: 1
  }
})