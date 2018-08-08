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
    rid: '', // 商品的rid---
    productInfomation: [], // 商品详情列表---
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
    }
  },

  /**
   * 滑块变化
   */
  handleSwiperChange: function (e) {
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

      http.fxGet(api.by_store_sku, { rids: this.data.choosed.rid }, (result) => {
        if (result.success) {
          Object.keys(result.data).forEach((key) => {
            console.log(result.data[key]) // 每个店铺
            result.data[key].forEach((v, i) => { //每个sku
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
            ['productInfomation.is_like']:false,
            ['productInfomation.like_count']: this.data.productInfomation.like_count-1
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
            ['productInfomation.like_count']: this.data.productInfomation.like_count-0 + 1,
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
    if (!this.data.productInfomation.is_wish){
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

  // 交货时间
  getLogisticsTime(e,rid) {
    http.fxGet(api.logisitcs.replace(/:rid/g,e), {product_rid:rid}, (result)=>{
      console.log(result.data,'交货时间')
      if(result.success){
        let min = result.data.items[0].min_days
        let max = result.data.items[0].max_days
        result.data.items.forEach((v,i)=>{
          if (v.is_default){
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
    http.fxGet(api.product_detail.replace(/:rid/g, this.data.rid), {
      user_record: "1"
    }, (result) => {
      if (result.success) {
        console.log(result, '产品详情')
        this.setData({
          productInfomation: result.data,
          dkcontent: result.data.content
        })
        // 处理html数据---
        wxparse.wxParse('dkcontent', 'html', this.data.dkcontent, this, 5)
        // 交货时间
        this.getLogisticsTime(result.data.fid, result.data.rid)
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
      allInfo:true
    })
  },

  // 设置订单参数的 商品的sku-rid store_items.itemsrid = 
  setOrderParamsProductId(e) {
    app.globalData.orderParams.store_items[0].items[0].rid = e
  },

  // 获取最新的商品
  getNewProduct() {
    http.fxGet(api.latest_products, this.data.newProductParams, (result) => {
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
    http.fxPost(api.coupon_grant, {
      rid: e.currentTarget.dataset.rid
    }, (result) => {
      console.log(result)
      if (result.success) {
        utils.fxShowToast('领取成功', 'success')
        this.getCouponAndFullSubtraction()
        let topPage = getCurrentPages()
        let topPagePath = topPage[topPage.length - 2]

        topPagePath.getCouponsByUser()
        setTimeout(()=>{
          this.getCouponAndFullSubtraction()
        },200)
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 优惠券，满减
  getCouponAndFullSubtraction() {
    console.log(app.globalData.couponList, app.globalData.fullSubtractionList, )
    this.setData({
      couponList: app.globalData.couponList, // 优惠券列表
      fullSubtractionList: app.globalData.fullSubtractionList, // 满减---
    })
  },

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

  // 获取店铺信息
  getstoreInfo() {
    this.setData({
      storeInfo: app.globalData.storeInfo
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options, product) {
    utils.handleShowLoading()
    // scene格式：rid + '#' + customer_rid
    let scene = decodeURIComponent(options.scene)
    let rid = ''
    if (scene && scene != 'undefined') {
      let scene_ary = scene.split('#')
      rid = scene_ary[0]
      // 分销商ID
      if (scene_ary.length == 2) {
        let customer_rid = scene_ary[1]
        wx.setStorageSync('customer_rid', customer_rid)
      }
    } else {
      rid = options.rid
    }

    this.setData({
      rid: options.rid,
      // cartTotalCount: app.globalData.cartTotalCount,
      isWatch: app.globalData.isWatchstore,
    })
    if (app.globalData.isLogin){
      this.setData({
        userPhoto: app.globalData.userInfo.avatar
      })
    }

    this.getstoreInfo() // 店铺信息---
    this.getProductInfomation() // 获取商品详情---
    this.getSkus()
    
    this.getCouponAndFullSubtraction() // 获取优惠券---
    this.getNewProduct() // 获取最新的商品---
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
        success: function (res) {
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
    if (res.target.dataset.from == 3) {
      return {
        title: "转发的标题",
        path: '/pages/share/share',
        success: function(e) {
          console.log(e)
        },
        fail: function(e) {
          console.log(e)
        }
      }
    }
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

  // 回到首页
  handleGoIndex() {
    wx.navigateBack({
      delta: 1
    })
  },

  // 跳转到购物车
  handleToCartTap() {
    console.log("cart")
    wx.switchTab({
      url: '../cart/cart',
    })
  },

  // 关闭
  hanleOffLoginBox(e) {
    console.log(e)
    this.setData({
      is_mobile:false
    })
  },

  handelToLikeThisProductTap(e){
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return false
    }
    // console.log(e.currentTarget.dataset.rid)
    wx.navigateTo({
      url: '../likeThisProduct/likeThisProduct?rid=' + e.currentTarget.dataset.rid
    })
  }
})