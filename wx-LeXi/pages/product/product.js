// pages/product/product.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

let wxparse = require('../../wxParse/wxParse.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    posterUrl: '', // 海报的url
    shareProductPhotoUrl: '', // 分享产品的url
    is_share: false,

    rid: '', // 商品的rid---
    productInfomation: [], // 商品详情---
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
    couponList: {
      coupons:[]
    }, // 优惠券列表---couponList
    fullSubtractionList: { // 满减---
      coupons: []
    },
    isWatch: false, // 是否关注过店铺
    storeInfo: [], // 店铺的信息---

    off_icon: false, // 关闭按钮
    OffAnimationData: [], //关闭按钮动画
    animationData: [], //动画
    window_height: app.globalData.system.screenHeight * 2, // 屏幕的高度
    coupon_show: false,
    newProductList: [], // 最新的商品列表---
    userPhoto: '', // 用户的头像
    // 最新产品的请求参数
    newProductParams: {
      page: 1,
      per_page: 10
    }
  },

  // 分享模板弹出
  handleShareBox(e) {
    let productRid = this.data.rid

    this.setData({
      is_share: true,
      shareProductPhotoUrl: this.data.productInfomation.cover + '-pwxa',
    })

    this.getWxaPoster(productRid) // 保存商品的海报
  },

  /**
   * 取消分享-销售
   */
  handleCancelShare(e) {
    this.setData({
      is_share: false,
      posterUrl: ''
    })
  },

  /**
   * 生成推广海报图
   */
  getWxaPoster(e) {
    let params = {
      rid: e,
      type: 3,
      path: 'pages/product/product',
      scene: e + '-' + app.globalData.storeInfo.rid,
      auth_app_id: app.globalData.app_id
    }

    utils.logger(params)

    http.fxPost(api.wxa_poster, params, (result) => {
      utils.logger(result, '生成海报图')
      if (result.success) {
        this.setData({
          posterUrl: result.data.image_url
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 保存当前海报到相册
   */
  handleSaveShare() {
    let that = this
    if (this.data.posterUrl && !this.data.posterSaving) {
      this.setData({
        posterSaving: true,
        posterBtnText: '正在保存...'
      })

      // 下载网络文件至本地
      wx.downloadFile({
        url: this.data.posterUrl,
        success: function(res) {
          if (res.statusCode == 200) {
            // 保存文件至相册
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function(data) {
                that.setData({
                  posterSaving: false,
                  posterBtnText: '保存分享'
                })
                utils.fxShowToast('保存成功', 'success')
              },
              fail: function(err) {
                utils.logger('下载海报失败：' + err.errMsg)
                that.setData({
                  posterSaving: false,
                  posterBtnText: '保存分享'
                })

                if (err.errMsg == 'saveImageToPhotosAlbum:fail:auth denied') {
                  wx.openSetting({
                    success(settingdata) {
                      utils.logger(settingdata)
                      if (settingdata.authSetting['scope.writePhotosAlbum']) {
                        utils.fxShowToast('保存成功')
                      } else {
                        utils.fxShowToast('保存失败')
                      }
                    }
                  })
                } else {
                  utils.fxShowToast('保存失败')
                }
              }
            })
          }
        }
      })
    }
  },

  /**
   * 滑块变化
   */
  handleSwiperChange(e) {
    this.setData({
      swiperIndex: e.detail.current - 0 + 1
    })
  },

  /**
   * 加入购物车
   */
  handleAddCart(e) {
    if (this.validateChooseSku()) {
      const jwt = wx.getStorageSync('jwt')
      this.setOrderParamsProductId(this.data.choosed.rid) // 设置订单的商品id,sku---
      let cartParams = {
        rid: this.data.choosed.rid, // String	必填	 商品sku
        quantity: this.data.quantity, // Integer	可选	1	购买数量
        option: '', // String	可选	 	其他选项
        open_id: jwt.openid // String	独立小程序端必填/独立小程序openid
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
   * 直接购买
   */
  handleQuickBuy(e) {
    if (this.validateChooseSku()) {
      this.setOrderParamsProductId(this.data.choosed.rid) // 设置订单的商品id,sku---

      http.fxGet(api.by_store_sku, {
        rids: this.data.choosed.rid
      }, (result) => {
        utils.logger(result, '每个商品')
        if (result.success) {
          let deliveryCountries = [] // 发货的国家列表

          Object.keys(result.data).forEach((key) => {
            utils.logger(result.data[key]) // 每个店铺
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
    let browssPhoto = this.data.productInfomation.product_like_users

    if (isLike) {
      // 喜欢，则删除
      http.fxDelete(api.userlike, {
        rid: rid
      }, (result) => {
        if (result.success) {
          utils.logger(result)
          this.setData({
            ['productInfomation.product_like_users']: browssPhoto.splice(0, browssPhoto.length - 1),
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
            ['productInfomation.product_like_users[' + browssPhoto.length + ']']: {
              avatar: app.globalData.jwt.avatar
            }
          })
          utils.logger(this.data.productInfomation.product_like_users)
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

    http.fxPost(api.wishlist, {
      rids: [this.data.rid]
    }, (result) => {
      utils.logger(result)
      if (result.success) {
        utils.fxShowToast('成功添加', 'success')
        this._upUserPageData()
        this.setData({
          ['productInfomation.is_wish']: true
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })

  },

  // 添加店铺关注
  handleAddFollow() {
    // 是否登陆
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return
    }

    this.setData({
      isWatch: true
    })

    http.fxPost(api.add_watch, {
      rid: app.globalData.storeRid
    }, (result) => {
      if (result.success) {
        utils.logger(result, '关注')
        app.globalData.storeInfo.fans_count = app.globalData.storeInfo.fans_count - 0 + 1

        app.globalData.isWatchstore = true
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 取消店铺的关注
  handleDeleteFollow() {
    this.setData({
      isWatch: false
    })
    http.fxPost(api.delete_watch, {
      rid: app.globalData.storeRid
    }, (result) => {
      utils.logger(result, '取消关注')
      if (result.success) {
        app.globalData.isWatchstore = false
        app.globalData.storeInfo.fans_count = app.globalData.storeInfo.fans_count - 1

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 移除心愿单
  handleDeleteDesire() {
    http.fxDelete(api.wishlist, {
      rids: [this.data.rid]
    }, (result) => {
      utils.logger(result)
      if (result.success) {
        utils.fxShowToast('移除添加', 'success')
        this._upUserPageData()
        this.setData({
          ['productInfomation.is_wish']: false
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 更新心愿单
  _upUserPageData() {
    // 获取页面来源
    var pages = getCurrentPages() // 获取加载的页面
    var currentPage = pages[pages.length - 2] // 获取当前页面的对象

    if (currentPage.route == 'pages/user/user') {
      currentPage.getDesireOrderProduct()
    }
  },

  // 其他产品详情
  handleProductInfoTap(e) {
    wx.redirectTo({
      url: '../product/product?rid=' + e.currentTarget.dataset.rid
    })
  },

  // 下架处理上级页面数据
  _handleParentData() {
    let router = getCurrentPages()
    let parentPage = router[router.length - 2]
    utils.logger(parentPage, '父页面')

    // 来源于user页面
    if (parentPage.route == 'pages/user/user') {
      //来源喜欢
      if (parentPage.data.classInfo == 1) {
        this.handleBindLike()
      }
      //来源心愿单
      if (parentPage.data.classInfo == 2) {
        this.handleDeleteDesire()
      }
    }
  },

  // 交货时间
  getLogisticsTime(e, rid) {
    http.fxGet(api.logisitcs.replace(/:rid/g, e), {
      product_rid: rid
    }, (result) => {
      utils.logger(result.data, '交货时间')
      if (result.success) {
        result.data.items.forEach((v, i) => {
          if (v.is_default) {
            // 循环完毕
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
      user_record: '1'
    }, (result) => {
      utils.logger(result, '产品详情')
      console.log(result, '产品详情')
      if (result.success) {
        this.getSkus() // 获取sku

        result.data.product_like_users = result.data.product_like_users.reverse()

        this.setData({
          productInfomation: result.data,
          dkcontent: result.data.content
        })

        // 下架
        if (result.data.status == 2) {
          wx.showModal({
            title: '很抱歉',
            content: '该商品已下架',
            showCancel: false,
            confirmColor: '#5fe4b1',
            success(res) {
              wx.navigateBack({
                delta: 1
              })
            }
          })

          this._handleParentData()
        }

        // 处理html数据---
        wxparse.wxParse('dkcontent', 'html', this.data.dkcontent, this, 5)
        if (result.data.fid) { // 交货时间
          this.getLogisticsTime(result.data.fid, result.data.rid)
        }
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

  // 获取最新的商品
  getNewProduct() {
    http.fxGet(api.latest_products, this.data.newProductParams, (result) => {
      if (result.success) {
        utils.logger(result, '最新产品')
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
    utils.logger(e.currentTarget.dataset.rid)
    http.fxPost(api.coupon_grant, {
      rid: e.currentTarget.dataset.rid
    }, (result) => {
      utils.logger(result)
      if (result.success) {
        utils.fxShowToast('领取成功', 'success')

        setTimeout(() => {
          this.getCouponAndFullSubtraction()
        }, 200)
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 优惠券，满减
  getCouponAndFullSubtraction() {
    utils.logger(this.data.fullSubtractionList)

    if (app.globalData.isLogin) { // 登录成功
      this.getCouponsByUser()
      this.getCoupons('manjian')
    } else {
      // 用户未登录时
      this.getCoupons()
    }
  },

  // 用户登录优惠券
  getCouponsByUser() {
    http.fxGet(api.user_login_coupon, {}, (result) => {
      utils.logger(result, '登陆的优惠券')
      console.log(result, '登陆的优惠券')

      result.data.coupons.forEach((v, i) => {
        v.user_coupon_start = utils.timestamp2string(v.start_date, 'date')
        v.user_coupon_end = utils.timestamp2string(v.end_date, 'date')
      })

      if (result.success) {
        this.setData({
          couponList: result.data || []
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 未登录的优惠群 和 满减
  getCoupons(e) {
    http.fxGet(api.noCouponsList, {}, (result) => {
      utils.logger(result, '没有登陆获取优惠券')

      if (result.success) {
        result.data.coupons.forEach((v, i) => {
          v.user_coupon_start = utils.timestamp2string(v.start_date, 'date')
          v.user_coupon_end = utils.timestamp2string(v.end_date, 'date')
        })

        let coupon = [] // 优惠券
        let full = [] // 满减券

        if (e == 'manjian') {
          // 登陆， 筛选满减
          result.data.coupons.forEach((v, i) => {
            if (v.type == 3) {
              full.push(v)
            }
          })

          this.setData({
            'fullSubtractionList.coupons': full
          })

        } else {
          // 未登录
          result.data.coupons.forEach((v, i) => {
            console.log(v)
            if (v.type == 3) {
              full.push(v)
            } else {
              coupon.push(v)
            }
          })

          this.setData({
            ['couponList.coupons']: coupon, // 优惠券列表---couponList
            'fullSubtractionList.coupons': full, // 满减---
          })
        }

      } else {
        utils.fxShowToast(result.status.message)
      }
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
      utils.logger(result.data, 'skus信息')
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
    http.fxGet(api.shop_info, {}, (result) => {
      utils.logger(result, '店铺信息')
      if (result.success) {
        app.globalData.storeInfo = result.data
        this.setData({
          storeInfo: app.globalData.storeInfo
        })
      } else {
        util.fxShowToast(result.status.message)
      }
    })
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

    if (this.data.productInfomation.stock_count == 0) {
      choosed.price = '已售罄'
      activeModeIdx = -1
      activeColorIdx = -1
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
    utils.logger(e)
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
    app.updateCartTotalCount(item_count)
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options, product) {
    // scene格式：rid + '-' + customer_rid
    let scene = decodeURIComponent(options.scene)
    let rid = ''
    if (scene && scene != 'undefined') {
      let scene_ary = scene.split('-')
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
      rid: rid,
      isWatch: app.globalData.isWatchstore
    })

    if (app.globalData.isLogin) {
      this.setData({
        userPhoto: app.globalData.userInfo.avatar
      })
    }

    this.getstoreInfo() // 店铺信息---
    this.getProductInfomation() // 获取商品详情---

    this.getNewProduct() // 获取最新的商品---
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.animation = wx.createAnimation({
      transformOrigin: 'bottom bottom',
      duration: 500,
      timingFunction: 'linear'
    })

    let that = this
    setTimeout(() => {
      that.setData({
        isLoading: false
      })
    }, 800)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      cartTotalCount: app.globalData.cartTotalCount
    })

    this.getCouponAndFullSubtraction() // 获取优惠券---
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
    // scene格式：rid + '-' + sid
    let scene = this.data.rid
    return {
      title: this.data.productInfomation.name,
      imageUrl: this.shareProductPhotoUrl,
      path: 'pages/product/product?scene=' + scene
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
    wx.switchTab({
      url: '../index/index',
    })
  },

  // 跳转到购物车
  handleToCartTap() {
    wx.switchTab({
      url: '../cart/cart',
    })
  },

  // 关闭
  hanleOffLoginBox(e) {
    this.setData({
      is_mobile: false
    })
  },

  handelToLikeThisProductTap(e) {
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return false
    }
    wx.navigateTo({
      url: '../likeThisProduct/likeThisProduct?rid=' + e.currentTarget.dataset.rid
    })
  }

})