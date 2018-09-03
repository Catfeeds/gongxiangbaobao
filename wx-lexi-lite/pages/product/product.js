// pages/product/product.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
let wxparse = require("../../wxParse/wxParse.js")

Page({
  /**
   * 页面的初始数据
   */
  data: {
    showShareModal:false, // 分享模态框
    shareProduct: '', // 分享某个商品
    posterUrl: '', // 海报图url

    isDistributed: false, // 是否属于分销
    isSmallB: false, // 是不是小b商家
    originalStoreRid: "", // 原店铺的rid
    storeRid:'', // 店铺的id
    rid: '', // 商品的rid---
    productInfomation: {
      is_distributed:true
    }, // 商品详情---
    product: {},
    productContent: {},
    skus: {
      modes: [],
      colors: []
    },
    choosed: {},
    choosedSkuText: '',
    cartTotalCount: 0,
    activeModeIdx: 0,
    activeColorIdx: 0,
    hasMode: false,
    hasColor: false,
    chooseMode: {},
    chooseColor: {},
    quantity: 1,
    pick: false, // 颜色/规格的盒子是否隐藏---

    posterImage: '',
    posterSaving: false,
    posterBtnText: '保存图片',

    allInfo: false, // 查看全部
    logisticsTime: {}, // 交货时间
    dkcontent: '',
    swiperIndex: 1,
    is_mobile: false, //  绑定手机模板
    couponList: [], // 优惠券列表---couponList
    fullSubtractionList: [], // 满减---
    isWatch: false, // 是否关注过店铺
    storeInfo: [], // 店铺的信息---

    off_icon: false, // 关闭按钮
    OffAnimationData: [], //关闭按钮动画
    animationData: [], //动画
    window_height: app.globalData.system.screenHeight * 2, // 屏幕的高度
    coupon_show: false,
    newProductList: [], // 最新的商品列表---
    userPhoto: "", // 用户的头像
    // 最新产品的请求参数
    newProductParams: {
      page: 1,
      per_page: 10
    },
    // 优惠券的请求参数
    couponParams: {
      page: 1,
      per_page: 10,
      status: 1, // 优惠券状态 -1: 禁用；1：正常；2：已结束
      'type': '', // 是否满减活动 3、满减
      
    },
  },

  /**
 * 保存当前海报到相册
 */
  handleSaveShare() {
    // 下载网络文件至本地
    wx.downloadFile({
      url: this.data.posterUrl,
      success: function (res) {
        if (res.statusCode === 200) {
          // 保存文件至相册
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(res) {
              wx.showToast({
                title: '海报保存成功',
              })
            },
            fail(res) {
              wx.showToast({
                title: '海报保存失败',
              })
            }
          })
        }
      }
    })
  },

  /**
 * 取消分享-销售
 */
  handleCancelShare(e) {
    this.setData({
      showShareModal: false,
      posterUrl: '',
      shareProduct: {}
    })
  },

  /**
 * 生成推广海报图
 */
  getWxaPoster() {
    let rid = this.data.rid
    let lastVisitLifeStoreRid = app.getDistributeLifeStoreRid()

    // scene格式：rid + '#' + sid
    let scene = rid
    if (lastVisitLifeStoreRid) {
      scene += '#' + lastVisitLifeStoreRid
    }

    let params = {
      rid: rid,
      type: 4,
      path: 'pages/product/product?scene=' + scene,
      auth_app_id: app.globalData.app_id
    }
    http.fxPost(api.wxa_poster, params, (result) => {
      console.log(result, '生成海报图')
      if (result.success) {
        this.setData({
          posterUrl: result.data.image_url
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },


  // 获取与登录用户相关的店铺优惠券 or 满减
  getCouponsByUser(type = ' ') {
    console.log(this.data.originalStoreRid)

    this.setData({
      ['couponParams.type']: type
    })
    // 优惠券
    http.fxGet(api.user_login_coupon, { ...this.data.couponParams,
      store_rid: this.data.originalStoreRid
    }, (result) => {
      if (result.success) {
        if (type != 3) {
          console.log(result, '登陆的优惠券')
          let parms = result.data
          parms.coupons.forEach((v, i) => {
            v.user_coupon_start = utils.timestamp2string(v.start_date, "date")
            v.user_coupon_end = utils.timestamp2string(v.end_date, "date")
          })

          this.setData({
            couponList: result.data
          })
          app.globalData.couponList = result.data
        } else {

          // 调取满减
          this.getCoupons('loginFullSubtractionList')

        }
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 用户未登录时获取店铺优惠券 or 满减活动列表
  getCoupons(e) {
    http.fxGet(api.noCouponsList, {
      store_rid: this.data.originalStoreRid
    }, (result) => {
      console.log(result, '没有登陆获取优惠券')
      if (result.success) {
        let coupon = [] // 优惠券
        let full = [] // 满减券
        result.data.coupons.forEach((v, i) => {
          console.log(v)
          if (v.type == 3) {
            full.push(v)
          } else {
            coupon.push(v)
          }
        })
        console.log(full, "满减")
        // 如果是登陆状态下调取直接赋值满减
        if (e == "loginFullSubtractionList") {
          this.setData({
            fullSubtractionList: full
          })
          app.globalData.fullSubtractionList = result.data
          console.log(result.data, "满减")
        } else {
          this.setData({
            ['couponList.coupons']: coupon, // 优惠券列表---couponList
            fullSubtractionList: full, // 满减---
          })
          app.globalData.fullSubtractionList.coupons = full
          app.globalData.couponList.coupons = coupon
        }
        console.log(full, '满减')
        console.log(full, '满减')
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

/**
 * 分享的模态框弹出
 * **/
  handleShareTap(){
    this.setData({
      showShareModal:true
    })

    this.getWxaPoster()
  },

  /**
   * 滑块变化
   */
  handleSwiperChange: function(e) {
    this.setData({
      swiperIndex: e.detail.current - 0 + 1
    })
  },

  /**
   * 加入购物车
   */
  handleAddCart(e) {
    if (this.validateChooseSku()) {
      this.setOrderParamsProductId(this.data.choosed.rid) // 设置订单的商品id,sku---
      let cartParams = {
        rid: this.data.choosed.rid, // String	必填	 商品sku
        quantity: this.data.quantity, // Integer	可选	1	购买数量
        option: '', // String	可选	 	其他选项
        open_id: app.globalData.jwt.openid // String	独立小程序端必填/独立小程序openid
      }

      http.fxPost(api.cart_addon, cartParams, (result) => {
        console.log(result,"加入购物车")
        if (result.success) {
          // 隐藏弹出层
          this.hideSkuModal()

          // 更新数量
          this.updateCartTotalCount(result.data.item_count)
        }
      })
    }
  },

  /**
   * 直接购买
   */
  handleQuickBuy(e) {
    if (this.validateChooseSku()) {
      this.setOrderParamsProductId(this.data.choosed.rid) // 设置订单的商品id,sku---

      http.fxGet(api.by_store_sku, {
        rids: this.data.choosed.rid
      }, (result) => {
        if (result.success) {
          let deliveryCountries = [] // 发货的国家列表

          Object.keys(result.data).forEach((key) => {

            result.data[key].forEach((v, i) => { // 每个sku
              // 收集所有发货国家或地区，验证是否跨境
              if (deliveryCountries.indexOf(v.delivery_country_id) === -1) {
                deliveryCountries.push(v.delivery_country_id)
              }

              // 当前店铺的rid
              v.current_store_rid = app.globalData.storeInfo.rid
              // 是否为分销商品
              if (v.store_rid != app.globalData.storeInfo.rid) {
                v.is_distribute = 1
              } else {
                v.is_distribute = 0
              }

              // 需求数量
              v.quantity = 1
            })
          })

          app.globalData.orderSkus = result
          app.globalData.deliveryCountries = deliveryCountries
          
          // 设置当前商品的物流模板
          wx.setStorageSync('logisticsIdFid', this.data.productInfomation.fid)
          wx.navigateTo({
            url: './../receiveAddress/receiveAddress?from_ref=cart&&rid=' + this.data.choosed.rid,
          })
        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    }
  },

  // 点击喜欢
  handleBindLike(e) {
    // 是否登陆
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return
    }
    let isLike = this.data.productInfomation.is_like
    let rid = this.data.productInfomation.rid
    console.log(isLike)
    if (isLike) {
      // 喜欢，则删除
      http.fxDelete(api.userlike, {
        rid: rid
      }, (result) => {
        if (result.success) {
          console.log(result)
          this.setData({
            ['productInfomation.is_like']: false,
            ['productInfomation.like_count']: this.data.productInfomation.like_count - 1
          })

        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    } else {
      // 未喜欢，则添加
      http.fxPost(api.userlike, {
        rid: rid
      }, (result) => {
        if (result.success) {
          this.setData({
            ['productInfomation.is_like']: true,
            ['productInfomation.like_count']: this.data.productInfomation.like_count - 0 + 1,
            ['productInfomation.product_like_users']: this.data.productInfomation.product_like_users.push({})
          })
        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    }
  },

  // 关闭优惠卷呼出框
  handleOffCouponTap() {
    this.setData({
      coupon_show: false
    })
  },

  // 加入心愿单
  handleaddDesireTap() {
    // 是否绑定
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return false
    }
    if (!this.data.productInfomation.is_wish) {
      http.fxPost(api.wishlist, {
        rids: [this.data.rid]
      }, (result) => {
        console.log(result)
        if (result.success) {
          utils.fxShowToast('成功添加', "success")
          this.setData({
            ['productInfomation.is_wish']: true
          })
        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    } else {
      http.fxDelete(api.wishlist, {
        rids: [this.data.rid]
      }, (result) => {
        console.log(result)
        if (result.success) {
          utils.fxShowToast('移除添加', "success")
          this.setData({
            ['productInfomation.is_wish']: false
          })
        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    }
  },

  //关闭登陆框
  handelOffTap() {
    utils.handleShowTabBar()
    this.setData({
      is_mobile: false
    })
  },

  // 商品详情
  handleProductInfoTap(e) {
    wx.pageScrollTo({
      scrollTop: 0
    })
    this.setData({
      rid: e.currentTarget.dataset.rid
    })

    this.getProductInfomation() // 获取商品详情---
  },

  // 跳转到品牌管详情
  handleTobrandStore(e) {
    wx.navigateTo({
      url: '../branderStore/branderStore?rid=' + e.currentTarget.dataset.rid,
    })
  },

  // 交货时间
  getLogisticsTime(e, rid) {
    console.log(e, rid, "交货时间的数据")
    http.fxGet(api.logistics_core_freight_template.replace(/:rid/g, e), {
      product_rid: this.data.rid,
      store_rid: this.data.storeRid
    }, (result) => {
      console.log(result, '交货时间数据')
      if (result.success) {
        let min = result.data.items[0].min_days
        let max = result.data.items[0].max_days
        result.data.items.forEach((v, i) => {
          if (v.is_default) {
            //循环完毕
            this.setData({
              logisticsTime: v
            })
          }
        })
      }
    })
  },

  // 获取商品详情
  getProductInfomation() {
    console.log(this.data.rid, "rid")
    http.fxGet(api.product_detail.replace(/:rid/g, this.data.rid), {
      user_record: "1"
    }, (result) => {
      if (result.success) {
        console.log(result, '产品详情')
        console.log(result.data.store_rid, 'rid')
        this.setData({
          productInfomation: result.data,
          originalStoreRid: result.data.store_rid, // 原店铺的rid
          dkcontent: result.data.content,
          isDistributed: result.data.is_distributed
        })
        
        // 获取本店铺的产品
        this.getNewProduct(result.data.store_rid) 
        // 处理html数据---
        wxparse.wxParse('dkcontent', 'html', this.data.dkcontent, this, 5)
        // 交货时间
        this.getLogisticsTime(result.data.fid, result.data.rid)

        this.getStoreInfo() // 店铺信息---

        this.getCouponsByUser() // 获取登陆用户地优惠券
        this.getCouponsByUser(3) // 获取满减
        
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 加入购物车盒子显示
  handleAddCartShow() {
    // 是否绑定
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return false
    }
    this.setData({
      pick: true
    })
  },

  // 选择规格的盒子显示
  handlePickShow() {
    //是否绑定
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return false
    }

    this.setData({
      pick: true
    })
  },

  // 隐藏弹出层
  hideSkuModal() {
    this.setData({
      pick: false
    })
  },

  // 点击sku层，不触发隐藏
  handleSkuModal() {
    return false
  },

  // 查看全部的盒子信息的盒子关闭
  animationOffFn() {
    this.setData({
      allInfo: false
    })
  },

  // 查看全部的盒子信息的盒子打开
  animationOnFn() {
    this.setData({
      allInfo: true
    })
  },

  // 设置订单参数的 商品的sku-rid store_items.itemsrid = 
  setOrderParamsProductId(e) {
    app.globalData.orderParams.store_items[0].items[0].rid = e
  },

  // 获取本店铺的相关商品
  getNewProduct(e) {
    http.fxGet(api.life_store_products, {sid:e}, (result) => {
      console.log(result,"获取店铺的相关产品")
      if (result.success) {
        console.log(result)
        this.setData({
          newProductList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 领取优惠券
  getReceiveCoupon(e) {
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return false
    }
    console.log(e.currentTarget.dataset.rid)
    console.log(e.currentTarget.dataset.index)

    let idx = e.currentTarget.dataset.index
    http.fxPost(api.coupon_grant, {
      rid: e.currentTarget.dataset.rid,
      store_rid: this.data.storeRid
    }, (result) => {
      console.log(result)
      if (result.success) {
        utils.fxShowToast('领取成功', 'success')
        // this.getCouponAndFullSubtraction()
        // let topPage = getCurrentPages()
        // let topPagePath = topPage[topPage.length - 2]

        // this.getCouponAndFullSubtraction()
        // setTimeout(() => {
        //   this.getCouponsByUser()
        // }, 200)
        console.log("领取成功")

      this.setData({
        ['couponList.coupons[' + idx + '].status']:1
      })
      
      return 
      } else {

        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 优惠券，满减 originalStoreRid 商品店铺地 rid
  // getCouponAndFullSubtraction() {

  //   console.log(app.globalData.couponList, app.globalData.fullSubtractionList, )

  //   let full = []
  //   app.globalData.fullSubtractionList.coupons.forEach((v,i)=>{
  //     if (v.type==3){
  //       full.push(v)
  //     }
  //   })

  //   this.setData({
  //     couponList: app.globalData.couponList, // 优惠券列表
  //     fullSubtractionList: full, // 满减---
  //   })
  //   console.log(this.data.fullSubtractionList)
  // },

  /**
   * 获取sku数量
   */
  getSkus() {
    let params = {
      rid: this.data.rid
    }
    http.fxGet(api.product_skus, params, (result) => {
      console.log(result.data, 'skus信息')
      if (result.success) {
        this.setData({
          skus: result.data
        })
        this.initialShowSku()
      }
    })
  },

  // 获取商品原店铺信息
  getStoreInfo() {
    console.log(this.data.originalStoreRid)
    http.fxGet(api.shop_info, {
      rid: this.data.originalStoreRid
    }, (result) => {
      console.log(result, '原店铺信息')
      if (result.success) {
        app.globalData.storeInfo = result.data
        this.setData({
          storeInfo: app.globalData.storeInfo
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options, product) {
    console.log(options, product, "上一页穿的参数")

    utils.handleShowLoading()
    // scene格式：rid + '#' + sid
    let scene = decodeURIComponent(options.scene)
    let rid = ''
    if (scene && scene != 'undefined') {
      let sceneAry = scene.split('#')
      rid = sceneAry[0]
      // 生活馆ID
      if (sceneAry.length == 2) {
        let lifeStoreRid = scene_ary[1]
        app.updateLifeStoreLastVisit(lifeStoreRid)
      }
    } else {
      rid = options.rid
    }

    this.setData({
      rid: options.rid,
      storeRid:options.storeRid,
      // cartTotalCount: app.globalData.cartTotalCount,
      isWatch: app.globalData.isWatchstore,
    })


    if (app.globalData.isLogin) {
      this.setData({
        userPhoto: app.globalData.userInfo.avatar
      })
    }

    // 判断是否是小B

    if (wx.getStorageSync("jwt").is_small_b) {

      this.setData({
        isSmallB: true
      })
    }

    this.getProductInfomation() // 获取商品详情---
    this.getSkus()

    // this.getCouponAndFullSubtraction() // 获取优惠券---
    // this.getNewProduct() // 获取最新的商品---
  },

  // 初始化sku
  initialShowSku() {
    let hasMode = this.data.skus.modes.length > 0 ? true : false
    let hasColor = this.data.skus.colors.length > 0 ? true : false
    let choosed = {}
    let chooseMode = {}
    let chooseColor = {}
    let activeColorIdx = 0
    let activeModeIdx = 0

    // 默认选中一个，有库存的
    if (hasMode) {
      for (let i = 0; i < this.data.skus.items.length; i++) {
        if (this.data.skus.items[i].stock_count > 0) {
          choosed = this.data.skus.items[i]
          activeModeIdx = this.getModeIndex(this.data.skus.items[i].s_model)
          chooseMode = this.data.skus.modes[activeModeIdx]
          break
        }
      }
    }

    if (hasColor) {
      for (let i = 0; i < this.data.skus.items.length; i++) {
        if (this.data.skus.items[i].stock_count > 0) {
          choosed = this.data.skus.items[i]
          activeColorIdx = this.getColorIndex(this.data.skus.items[i].s_color)
          chooseColor = this.data.skus.colors[activeColorIdx]
          break
        }
      }
    }

    // 同时存在时，color获取实际存在的一个
    if (hasMode && hasColor) {
      for (let i = 0; i < this.data.skus.items.length; i++) {
        if (this.data.skus.items[i].stock_count > 0) {
          choosed = this.data.skus.items[i]
          activeModeIdx = this.getModeIndex(this.data.skus.items[i].s_model)
          activeColorIdx = this.getColorIndex(this.data.skus.items[i].s_color)
          chooseMode = this.data.skus.modes[activeModeIdx]
          chooseColor = this.data.skus.colors[activeColorIdx]
          break
        }
      }
    }

    this.setData({
      hasMode: hasMode,
      hasColor: hasColor,
      choosed: choosed,
      chooseMode: chooseMode,
      chooseColor: chooseColor,
      activeModeIdx: activeModeIdx,
      activeColorIdx: activeColorIdx,
    });

    this.renewStockStatus()

    this.choosedSku()
  },

  /**
   * 获取激活颜色索引
   */
  getColorIndex(name) {
    for (let k = 0; k < this.data.skus.colors.length; k++) {
      if (this.data.skus.colors[k].name == name) {
        return k
      }
    }
  },

  /**
   * 获取激活型号索引
   */
  getModeIndex(name) {
    for (let k = 0; k < this.data.skus.modes.length; k++) {
      if (this.data.skus.modes[k].name == name) {
        return k
      }
    }
  },

  /**
   * 验证是否有库存
   */
  renewStockStatus() {
    // 仅型号选项
    if (this.data.hasMode && !this.data.hasColor) {
      let tmpModes = []
      for (const mode of this.data.skus.modes) {
        for (const item of this.data.skus.items) {
          if (item.s_model == mode.name && item.stock_count <= 0) {
            mode.valid = false
          }
        }
        tmpModes.push(mode)
      }

      this.setData({
        'skus.modes': tmpModes
      })
    }

    // 仅颜色选项
    if (this.data.hasColor && !this.data.hasMode) {
      let tmpColors = []
      for (const color of this.data.skus.colors) {
        for (const item of this.data.skus.items) {
          if (item.s_color == color.name && item.stock_count <= 0) {
            color.valid = false
          }
        }
        tmpColors.push(color)
      }
      this.setData({
        'skus.colors': tmpColors
      })
    }

    // 型号、颜色同时存在
    if (this.data.hasMode && this.data.hasColor) {
      let chooseMode = this.data.chooseMode
      let filter_colors = []
      for (const c of this.data.skus.colors) {
        if (!this.hasExistItem(chooseMode.name, c.name)) {
          c.valid = false
        } else {
          c.valid = true
        }
        filter_colors.push(c)
      }

      let chooseColor = this.data.chooseColor
      let filter_modes = []
      for (const m of this.data.skus.modes) {
        if (!this.hasExistItem(m.name, chooseColor.name)) {
          m.valid = false
        } else {
          m.valid = true
        }
        filter_modes.push(m)
      }

      this.setData({
        'skus.modes': filter_modes,
        'skus.colors': filter_colors
      })
    }

  },

  /**
   * 选中sku信息
   */
  choosedSku() {
    if (this.data.choosed) {
      let sku_txt = [];
      if (this.data.choosed.s_model) {
        sku_txt.push(this.data.choosed.s_model)
      }
      if (this.data.choosed.s_color) {
        sku_txt.push(this.data.choosed.s_color)
      }

      this.setData({
        choosedSkuText: sku_txt.join(' ') + '，' + this.data.quantity + '个'
      })
    }
  },

  hasExistItem(mode, color) {
    for (const item of this.data.skus.items) {
      if (item.s_model === mode && item.s_color === color && item.stock_count > 0) {
        return true
      }
    }
    return false
  },

  handleChooseMode(e) {
    const that = this;
    const idx = e.currentTarget.dataset.idx;
    const valid = e.currentTarget.dataset.valid;
    if (!valid) return;

    let activeModeIdx = idx;
    let chooseMode = this.data.skus.modes[idx];
    // 重新筛选与型号匹配的颜色
    let filter_colors = []
    for (const c of this.data.skus.colors) {
      if (!this.hasExistItem(chooseMode.name, c.name)) {
        c.valid = false
      } else {
        c.valid = true
      }
      filter_colors.push(c)
    }

    let choosed = {};
    for (const item of this.data.skus.items) {
      if (item.s_model == chooseMode.name) {
        if (that.data.hasColor) {
          if (item.s_color == that.data.chooseColor.name) {
            choosed = item
          }
        } else {
          choosed = item
        }
      }
    }

    this.setData({
      choosed: choosed,
      chooseMode: chooseMode,
      activeModeIdx: activeModeIdx,
      'skus.colors': filter_colors
    });

    this.choosedSku()
  },

  /**
   * 选择颜色
   */
  handleChooseColor(e) {
    console.log(e)
    const idx = e.currentTarget.dataset.idx;
    const valid = e.currentTarget.dataset.valid;
    if (!valid) return;

    let activeColorIdx = idx;
    let chooseColor = this.data.skus.colors[idx];

    // 重新筛选与颜色匹配的型号
    let filter_modes = [];
    for (const m of this.data.skus.modes) {
      if (!this.hasExistItem(m.name, chooseColor.name)) {
        m.valid = false
      } else {
        m.valid = true
      }
      filter_modes.push(m)
    }
    let choosed = {};
    for (const item of this.data.skus.items) {
      if (item.s_color == chooseColor.name) {
        if (this.data.hasMode) {
          if (item.s_model == this.data.chooseMode.name) {
            choosed = item
          }
        } else {
          choosed = item
        }
      }
    }

    this.setData({
      choosed: choosed,
      chooseColor: chooseColor,
      activeColorIdx: activeColorIdx,
      'skus.modes': filter_modes
    });

    this.choosedSku()
  },

  /**
   * 更新购物车数量
   */
  updateCartTotalCount(item_count) {
    app.globalData.cartTotalCount = item_count
    this.setData({
      cartTotalCount: item_count
    })
  },

  /**
   * 验证是否选择sku
   */
  validateChooseSku() {
    if (!this.data.choosed) {
      return false
    }
    if (!this.data.quantity) {
      return false
    }
    return true
  },

  /**
   * 生成推广海报
   */
  handleGenPoster(e) {
    let that = this

    this.setData({
      seePosterModal: true
    })

    let rid = e.currentTarget.dataset.rid
    // 添加自定义扩展信息
    let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}

    let params = {
      rid: rid,
      path: 'pages/product/product',
      auth_app_id: extConfig.authAppid
    }

    http.fxPost(api.wxacode, params, (res) => {
      if (res.success) {
        that.setData({
          posterImage: res.data.wxa_image
        })
      }
    })
  },

  /**
   * 保存海报至本地
   */
  handleSavePoster() {
    let that = this

    if (this.data.posterImage && !this.data.posterSaving) {
      this.setData({
        posterSaving: true,
        posterBtnText: '正在保存...'
      })
      // 下载网络文件至本地
      wx.downloadFile({
        url: this.data.posterImage,
        success: function(res) {
          if (res.statusCode === 200) {
            // 保存文件至相册
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success(res) {
                wx.showToast({
                  title: '图片保存成功',
                })
                that.setData({
                  posterSaving: false,
                  posterBtnText: '保存图片',
                  seePosterModal: false
                })
              },
              fail(res) {
                console.log(res)
                that.setData({
                  posterSaving: false,
                  posterBtnText: '保存图片'
                })
              }
            })
          }
        }
      })
    } else {
      wx.showToast({
        title: '图片正在生成中',
        icon: 'loading',
        duration: 2000
      })
    }
  },

  /**
   * 隐藏生成海报框
   */
  hidePosterModal() {
    this.setData({
      seePosterModal: false
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    utils.handleHideLoading()
    this.animation = wx.createAnimation({
      transformOrigin: "bottom bottom",
      duration: 500,
      timingFunction: 'linear',
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    wx.hideLoading()
    console.log(app.globalData.storeInfo)
    this.setData({

      cartTotalCount: app.globalData.cartTotalCount,

    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    
    let title = this.data.productInfomation.name
    return app.shareWxaProduct(this.data.rid, title, this.data.productInfomation.cover)

    console.log(this.data.rid, title, this.data.productInfomation.cover)
  },

  watchTap() {
    wx.navigateTo({
      url: '../watch/watch',
    })
  },

  // 优惠卷隐藏和显示
  coupon_show() {
    // handleGoIndex
    this.setData({
      coupon_show: true
    })
  },

  // 跳转到购物车
  handleToCartTap() {
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return false
    }
    console.log("cart")
    wx.switchTab({
      url: '../cart/cart',
    })
  },

  // 关闭
  hanleOffLoginBox(e) {
    console.log(e)
    this.setData({
      is_mobile: false
    })
  },

  handelToLikeThisProductTap(e) {

    // console.log(e.currentTarget.dataset.rid)
    wx.navigateTo({
      url: '../likeThisProduct/likeThisProduct?rid=' + e.currentTarget.dataset.rid
    })
  }
})