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
    isShowDowLoad: false, // 下载询问框
    bigPhotoShow: false, // 是否显示大图
    bigPhotoCurrent: 0, // 大图应该展现的位置
    bigSwiperHeight: 0, // 大图的高度

    isShowOfficial: false, // 官方优惠券
    backBtnIsShow: false, // 是否显示回到顶部按钮
    isLoading: true,
    showHomeBtn: false, // 显示回到首页按钮
    showBack: false, // 是否显示回到自己生活馆

    showShareModal: false, // 分享模态框
    shareProduct: '', // 分享某个商品
    posterUrl: '', // 海报图url
    posterSaving: false, // 是否正在保存
    posterBtnText: '保存分享',
    readyOver: false, // 加载是否完成

    isDistributed: false, // 是否属于分销
    isSmallB: false, // 是不是小b商家

    originalStoreRid: '', // 原店铺的rid
    storeRid: '', // 店铺的id
    rid: '', // 商品的rid---
    likePeople: {}, // 喜欢该商品的人
    productTop: {}, // 获取第一屏幕的信息
    productInfomation: { // 商品详情---
      is_distributed: true
    },
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

    allInfo: false, // 查看全部
    logisticsTime: {}, // 交货时间
    dkcontent: '',
    swiperIndex: 1,
    is_mobile: false, //  绑定手机模板
    couponList: { // 优惠券列表---couponList
      coupons: [],
      official_coupon: []
    },
    fullSubtractionList: [], // 满减---
    isWatch: false, // 是否关注过店铺
    storeInfo: [], // 店铺的信息---

    off_icon: false, // 关闭按钮
    offAnimationData: [], // 关闭按钮动画
    animationData: [], // 动画
    window_height: app.globalData.system.screenHeight * 2, // 屏幕的高度
    coupon_show: false,
    userPhoto: '', // 用户的头像

    newProductParams: { // 最新产品的请求参数
      page: 1,
      per_page: 10
    },
    newProductList: { // 最新的商品列表---
      products: [{}, {}, {}, {}, {}, {}]
    },
    similarList: [], // 相似产品的列表
    runEnv: 1,

    // 11.11 11.12 活动
    elevenCoupon: { // 11.11活动
      coupons: []
    },
    twelveCoupon: { // 11.12活动
      coupons: []
    },

    isElevenCoupon: false, // 双11的模态框
    isTwelveCoupon: false, // 11.12返场
  },

  /**
   * 回到自己的生活馆
   */
  handleBackLifeStore() {
    app.globalData.showingLifeStoreRid = app.globalData.lifeStore.lifeStoreRid
    app.globalData.fromMenu = 'visitLifeStore'

    wx.switchTab({
      url: '../index/index',
    })
  },

  // 去别人的主页
  handleToPeople(e) {
    let uid = e.currentTarget.dataset.uid
    wx.navigateTo({
      url: '../people/people?uid=' + uid
    })
  },

  // 添加关注---
  handleAddWatch(e) {
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return false
    }

    http.fxPost(api.add_watch, {
      rid: this.data.storeRid
    }, (result) => {
      utils.logger(result, '添加关注店铺')

      if (result.success) {
        this.setData({
          'storeInfo.is_followed': true,
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 取消关注---
  handleDeleteWatch() {

    http.fxPost(api.delete_watch, {
      rid: this.data.storeRid
    }, (result) => {
      utils.logger(result, '取消关注店铺')
      if (result.success) {
        this.setData({
          'storeInfo.is_followed': false,
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 下载图片
   */
  handowLoadPhoto() {
    let index = this.data.bigPhotoCurrent - 1
    this.setData({
      posterUrl: this.data.productTop.assets[index].view_url,
    })
    this.handleSaveShare()
    this.handleDowloadShow()
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

    // scene格式：rid + '-' + sid
    let scene = rid
    if (lastVisitLifeStoreRid) {
      scene += '-' + lastVisitLifeStoreRid
    }

    let params = {
      rid: rid,
      type: 4,
      path: 'pages/product/product',
      scene: scene,
      auth_app_id: app.globalData.app_id
    }
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

  // 用户登录优惠券
  getCouponsByUser() {
    http.fxGet(api.user_login_coupon, {
      store_rid: this.data.originalStoreRid
    }, (result) => {
      utils.logger(result, '登陆的优惠券')
      result.data.coupons.forEach((v, i) => {
        v.user_coupon_start = utils.timestamp2string(v.start_date, 'date')
        v.user_coupon_end = utils.timestamp2string(v.end_date, 'date')
      })
      result.data.official_coupon.forEach((v, i) => {
        v.user_coupon_start = utils.timestamp2string(v.start_date, 'date')
        v.user_coupon_end = utils.timestamp2string(v.end_date, 'date')
      })

      if (result.success) {
        this.setData({
          couponList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 未登录的优惠群 和 满减
  getCoupons(e) {
    http.fxGet(api.noCouponsList, {
      store_rid: this.data.originalStoreRid
    }, (result) => {
      utils.logger(result, '没有登陆获取优惠券')
      result.data.coupons.forEach((v, i) => {
        v.user_coupon_start = utils.timestamp2string(v.start_date, 'date')
        v.user_coupon_end = utils.timestamp2string(v.end_date, 'date')
      })

      let coupon = [] // 优惠券
      let full = [] // 满减券

      if (result.success) {
        if (e == 'manjian') {
          // 登陆，筛选满减
          result.data.coupons.forEach((v, i) => {
            utils.logger(v)
            if (v.type == 3) {
              full.push(v)
            }
          })

          this.setData({
            fullSubtractionList: full
          })

          app.globalData.fullSubtractionList = result.data
        } else {
          // 未登录
          result.data.coupons.forEach((v, i) => {
            utils.logger(v)
            if (v.type == 3) {
              full.push(v)
            } else {
              coupon.push(v)
            }
          })

          this.setData({
            ['couponList.coupons']: coupon, // 优惠券列表---couponList
            fullSubtractionList: full, // 满减---
          })

          app.globalData.fullSubtractionList.coupons = full
          app.globalData.couponList.coupons = coupon
        }
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 分享的模态框弹出
   */
  handleShareTap() {
    this.setData({
      showShareModal: true
    })

    this.getWxaPoster()

  },

  /**
   * 滑块变化
   */
  handleSwiperChange: function(e) {
    this.setData({
      swiperIndex: e.detail.current - 0 + 1,
      bigSwiperHeight: this.data.productTop.assets[e.detail.current].h
    })
  },

  /**
   * 加入购物车
   */
  handleAddCart(e) {
    app.handleSendNews(e.detail.formId)

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
        utils.logger(result, '加入购物车')
        if (result.success) {
          // 隐藏弹出层
          this.hideSkuModal()

          // 更新数量
          this.updateCartTotalCount(result.data.item_count)

        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    }
  },

  /**
   * 直接购买
   */
  handleQuickBuy(e) {
    app.handleSendNews(e.detail.formId)

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
    let isLike = this.data.productTop.is_like
    let rid = this.data.productTop.rid

    if (isLike) {
      this.setData({
        ['productTop.is_like']: false,
        ['productTop.like_count']: this.data.productTop.like_count - 1
      })

      this._handleUserLikePhoto(app.globalData.jwt.uid, 'delete')

      // 喜欢，则删除
      http.fxDelete(api.userlike, {
        rid: rid
      }, (result) => {
        if (!result.success) {
          utils.fxShowToast(result.status.message)
        }
      })
    } else {
      this.setData({
        ['productTop.is_like']: true,
        ['productTop.like_count']: this.data.productTop.like_count - 0 + 1,
      })

      this._handleUserLikePhoto(app.globalData.jwt.uid, 'add')

      // 未喜欢，则添加
      http.fxPost(api.userlike, {
        rid: rid
      }, (result) => {
        if (!result.success) {
          utils.fxShowToast(result.status.message)
        }
      })
    }
  },

  //操作喜欢的头像
  _handleUserLikePhoto(e, action = 'add') {
    utils.logger(e)
    let likePhoto = this.data.likePeople.product_like_users
    let myPhoto = -1

    likePhoto.forEach((v, i) => {
      if (v.uid == e) {
        myPhoto = i
      }
    })

    if (action == 'add') {
      utils.logger(app.globalData.jwt.avatar, app.globalData.jwt.uid)

      if (likePhoto.length >= 10) {
        likePhoto[9] = {
          avatar: app.globalData.jwt.avatar,
          uid: app.globalData.jwt.uid,
        }
      } else {
        likePhoto[likePhoto.length] = {
          avatar: app.globalData.jwt.avatar,
          uid: app.globalData.jwt.uid,
        }
      }

    } else {
      if (myPhoto != -1) {
        likePhoto.splice(myPhoto, 1)
      }
    }
    this.setData({
      'likePeople.product_like_users': likePhoto
    })
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
    if (!this.data.productTop.is_wish) {
      utils.fxShowToast('添加成功', 'success')
      this.setData({
        ['productTop.is_wish']: true
      })

      http.fxPost(api.wishlist, {
        rids: [this.data.rid]
      }, (result) => {
        utils.logger(result)
        if (result.success) {

        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    } else {
      utils.fxShowToast('移除心愿单', 'success')
      this.setData({
        ['productTop.is_wish']: false
      })

      http.fxDelete(api.wishlist, {
        rids: [this.data.rid]
      }, (result) => {
        utils.logger(result)
        if (result.success) {} else {
          utils.fxShowToast(result.status.message)
        }
      })
    }
  },

  // 关闭登陆框
  handelOffTap() {
    utils.handleShowTabBar()
    this.setData({
      is_mobile: false
    })
  },

  // 商品详情
  handleProductInfoTap(e) {

    let rid = e.currentTarget.dataset.rid
    wx.redirectTo({
      url: '/pages/product/product?rid=' + rid
    })
  },

  // 相似产品的详情
  handleSimilarInfo(e) {

    let rid = e.currentTarget.dataset.rid
    wx.redirectTo({
      url: '/pages/product/product?rid=' + rid
    })
  },

  // 回首页
  handleBackHome() {
    wx.switchTab({
      url: '../index/index',
    })
  },

  // 删除上一页的下架的产品 
  _deleteParentProduct() {
    let page = getCurrentPages()
    let parentPage = page[page.length - 2]
    let rid = this.data.productInfomation.rid
    if (parentPage.route == 'pages/user/user') {
      let deleteMark = parentPage.data.deletePageProductAtProduct

    }
  },

  // 删除我的喜欢--已下架的
  _deleteMylike(e) {

  },

  // 删除我的浏览记录--已下架的
  _deleteMyBrowse(e) {

  },

  // 删除我的浏览记录--已下架的
  _deleteMyXinYuan(e) {

  },

  // 跳转到品牌馆
  handleTobrandStore(e) {
    wx.navigateTo({
      url: '../branderStore/branderStore?rid=' + e.currentTarget.dataset.rid,
    })
  },

  // 交货时间
  // getLogisticsTime(e, rid) {
  //   http.fxGet(api.logistics_core_freight_template.replace(/:rid/g, e), {
  //     product_rid: this.data.rid,
  //     store_rid: this.data.storeRid
  //   }, (result) => {
  //     utils.logger(result, '交货时间数据')
  //     if (result.success && result.data.items.length != 0) {

  //       result.data.items.forEach((v, i) => {
  //         if (v.is_default) {
  //           //循环完毕
  //           this.setData({
  //             logisticsTime: v
  //           })
  //         }
  //       })
  //     }
  //   })
  // },

  /**
   * 分享产品的图片
   */
  handleShareProductPhoto(e) {

    http.fxPost(api.market_share_product_card, {
      rid: e
    }, result => {
      this.setData({
        'shareProduct.cover': result.data.image_url
      })
    })

  },

  // 相似的商品 products/similar
  getSimilar() {
    http.fxGet(api.products_similar, {
      page: 1,
      per_page: 10,
      rid: this.data.rid
    }, (result) => {
      utils.logger(result, '相似的产品')
      if (result.success) {
        this.setData({
          similarList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取产品信息的第一屏
  getProductTop() {
    let jwt = wx.getStorageSync('jwt')
    let openid = jwt.openid
    http.fxGet(api.products_basic, {
      rid: this.data.rid,
      sid: jwt.store_rid || ''
    }, result => {
      if (result.success) {
        result.data.assets.forEach(v => {
          v.h = 750 * v.height / v.width
        })
        // console.log(result,'第一屏幕')
        this.setData({
          productTop: result.data,
          isDistributed: result.data.is_distributed,
          bigSwiperHeight: result.data.assets[0].h
        })

        // 如果已经下架就删除
        if (result.data.status == 2) {
          // 删除来源页面的商品
          // this._deleteParentProduct()

          wx.showModal({
            title: '很抱歉',
            content: '该商品已下架',
            confirmColor: '#5fe4b1',
            showCancel: false,
            success: () => {
              wx.navigateBack({
                delta: 1
              })
            }
          })
        }

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 喜欢此商品的人数
  getLikePeople() {
    let params = {
      page: 1, // Number	可选	1	当前页码
      per_page: 10, // Number	可选	10	每页数量
      rid: this.data.rid // 必须	 	商品编号
    }

    http.fxGet(api.product_userlike, params, result => {
      if (result.success) {
        result.data.product_like_users = result.data.product_like_users.reverse()
        this.setData({
          likePeople: result.data
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取商品详情 
  getProductInfomation() {
    let jwt = wx.getStorageSync('jwt')
    let openid = jwt.openid

    http.fxGet(api.products_detail.replace(/:rid/g, this.data.rid), {
      user_record: "1",
      rid: this.data.rid,
      openid: openid,
    }, (result) => {
      if (result.success) {
        this.setData({
          productInfomation: result.data,
          originalStoreRid: result.data.store_rid, // 原店铺的rid
          dkcontent: result.data.content,
          storeRid: result.data.store_rid
        })

        //获取分享的图片
        this.handleShareProductPhoto(this.data.rid)

        // 获取本店铺的产品
        this.getNewProduct(result.data.store_rid)

        // 处理html数据---
        wxparse.wxParse('dkcontent', 'html', this.data.dkcontent, this, 5)

        // 获取交货时间
        // this.getLogisticsTime(result.data.fid, result.data.rid)

        this.getStoreInfo() // 店铺信息---

        // 获取相似
        this.getSimilar()

        if (!app.globalData.isLogin) {
          // 未登录
          this.getCoupons()
        } else {
          // 登陆
          this.getCouponsByUser()
          this.getCoupons('manjian')
        }
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 跳转分销上架
   */
  handleGoSale(e) {
    let rid = this.data.rid
    wx.navigateTo({
      url: '/distributes/pages/distributeSubmit/distributeSubmit?rid=' + rid
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

  // 领取11.11优惠券
  handleReciveElevenCoupon(e) {
    // 是否登陆
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return
    }

    let id = e.currentTarget.dataset.rid
    let index = e.currentTarget.dataset.index
    http.fxPost(api.market_coupons_activity_grant, {
      id: id
    }, result => {
      if (result.success) {
        utils.fxShowToast('领取成功', 'success')
        this.setData({
          ['elevenCoupon.coupons[' + index + '].is_grant']: result.data.coupons.is_grant
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })

  },

  // 领取11.12 返场券
  handleReciveTwelveCoupon(e) {
    // 是否登陆
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return
    }

    let id = e.currentTarget.dataset.rid
    let index = e.currentTarget.dataset.index
    http.fxPost(api.market_coupons_activity_grant, {
      id: id
    }, result => {
      if (result.success) {
        utils.fxShowToast('领取成功', 'success')
        this.setData({
          ['twelveCoupon.coupons[' + index + '].is_grant']: result.data.coupons.is_grant
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
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

  // 领取官方优惠券
  handleReciiveOfficial(e) {
    // 是否登陆
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return
    }

    let code = e.currentTarget.dataset.rid
    let idx = e.currentTarget.dataset.idx
    console.log(code, idx)
    this.setData({
      ['couponList.official_coupon[' + idx + '].is_grant']: 1
    })

    http.fxPost(api.market_official_coupons_grant, {
      rid: code
    }, result => {

      utils.logger(result, "领取官方优惠券")
      if (result.success) {
        utils.fxShowToast("成功领取", "success")
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取本店铺的相关商品
  getNewProduct(e) {
    http.fxGet(api.life_store_products, {
      sid: this.data.storeRid,
      is_distributed: 1
    }, (result) => {
      utils.logger(result, '获取店铺的相关产品')
      if (result.success) {
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
    utils.logger(e.currentTarget.dataset.index)

    let idx = e.currentTarget.dataset.index
    http.fxPost(api.coupon_grant, {
      rid: e.currentTarget.dataset.rid,
      store_rid: this.data.storeRid
    }, (result) => {
      utils.logger(result)
      if (result.success) {
        utils.fxShowToast('领取成功', 'success')

        this.setData({
          ['couponList.coupons[' + idx + '].status']: 1
        })

        return
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
      rid: this.data.rid,
    }
    http.fxGet(api.product_skus, params, (result) => {
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
    http.fxGet(api.shop_info, {
      rid: this.data.originalStoreRid
    }, (result) => {
      utils.logger(result, '原店铺信息')
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

  // 双11优惠券
  getElevenCoupon() {
    http.fxGet(api.market_master_activity_double, {
      open_id: app.globalData.jwt.openid
    }, result => {
      this.setData({
        elevenCoupon: result.data
      })
    })
  },

  //11.12返厂优惠券 
  getTwelveCoupon() {
    http.fxGet(api.market_master_activity_return, {
      open_id: app.globalData.jwt.openid
    }, result => {
      this.setData({
        twelveCoupon: result.data
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options, product) {
    utils.logger(options, product, '上一页传递参数')
    // 检测网络
    app.ckeckNetwork()

    // scene格式：rid + '-' + sid
    let scene = decodeURIComponent(options.scene)
    let rid = ''
    if (scene && scene != undefined && scene != 'undefined') {
      let sceneAry = scene.split('-')
      rid = utils.trim(sceneAry[0])
      // 生活馆ID
      if (sceneAry.length == 2) {
        let lifeStoreRid = utils.trim(sceneAry[1])
        app.updateLifeStoreLastVisit(lifeStoreRid)
        app.globalData.showingLifeStoreRid = lifeStoreRid
       
        this.setData({
          showHomeBtn: true
        })
      }
    } else {
      rid = options.rid
    }

    this.setData({
      rid: rid,
      cartTotalCount: app.globalData.cartTotalCount,
      // isWatch: app.globalData.isWatchstore,
    })

    if (app.globalData.isLogin) {
      this.setData({
        userPhoto: app.globalData.userInfo.avatar
      })
    }

    this.getProductTop() // 获取第一屏的信息
    this.getLikePeople() // 喜欢该商品的人
    this.getProductInfomation() // 获取商品详情---
    this.getSkus()

    this.getElevenCoupon() // 11.11
    this.getTwelveCoupon() // 11.12
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

  /**
   * 是否存在某个sku
   */
  hasExistItem(mode, color) {
    for (const item of this.data.skus.items) {
      if (item.s_model === mode && item.s_color === color && item.stock_count > 0) {
        return true
      }
    }
    return false
  },

  /**
   * 选定一个型号
   */
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
    // app.updateCartTotalCount(item_count,1)
    app.getCartTotalCount()
    this.setData({
      cartTotalCount: item_count
    })
  },

  /**
   * 验证是否选择sku
   */
  validateChooseSku() {
    if (this.data.skus.colors.length == 0 && this.data.skus.modes.length == 0 && this.data.skus.items.length==1) {
      this.setData({
        'choosed.rid': this.data.skus.items[0].rid
      })
      return true
    }else{
      if (!this.data.choosed) {
        return false
      }
      if (!this.data.quantity) {
        return false
      }
      return true
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.animation = wx.createAnimation({
      transformOrigin: 'bottom bottom',
      duration: 500,
      timingFunction: 'linear',
    })

    this.setData({
      readyOver: true
    })

    let that = this
    setTimeout(() => {
      that.setData({
        isLoading: false
      })
    }, 350)
  },

  /**
   * 监听页面滚动
   */
  onPageScroll(e) {
    // 设置回到顶部按钮是否显示
    let windowHeight = app.globalData.systemInfo.windowHeight
    if (e.scrollTop >= windowHeight) {
      if (!this.data.backBtnIsShow) {
        this.setData({
          backBtnIsShow: true
        })
      }
    }
    if (e.scrollTop < windowHeight) {
      if (this.data.backBtnIsShow) {
        this.setData({
          backBtnIsShow: false
        })
      }
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      cartTotalCount: app.globalData.cartTotalCount,
    })

    // 判断是否是小B，并且在自己的生活馆
    const lifeStore = wx.getStorageSync('lifeStore')
    if (lifeStore.isSmallB) {
      utils.logger('showingLifeStoreRid: ' + app.globalData.showingLifeStoreRid)
      if (app.globalData.showingLifeStoreRid != '' && app.globalData.showingLifeStoreRid != lifeStore.lifeStoreRid) {
        this.setData({
          isSmallB: true,
          showBack: true
        })
      }
    } else {
      if (app.globalData.showingLifeStoreRid != '') {
        this.setData({
          showBack: true
        })
      }
    }

    // 判断app里agent 里面的关注有没有发生过变动
    if (app.globalData.agent.productFollowChange != 0) {
      if (app.globalData.agent.productFollowChange == 1) {
        this.setData({
          'storeInfo.is_followed': true,
        })
      } else {
        this.setData({
          'storeInfo.is_followed': false,
        })
      }

      app.globalData.agent.productFollowChange = 0
    }

    // 获取当前环境
    this.getRunEnv()
  },

  /**
   * 获取运行环境
   */
  getRunEnv() {
    http.fxGet(api.run_env, {}, (res) => {
      if (res.success) {
        utils.logger(res, '环境变量')
        this.setData({
          runEnv: res.data.status
        })
      }
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
    let title = this.data.productTop.name
    return app.shareWxaProduct(this.data.rid, title, this.data.shareProduct.cover)
  },

  watchTap() {
    wx.navigateTo({
      url: '../watch/watch',
    })
  },

  // 优惠卷隐藏和显示
  coupon_show() {
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

  /**
   * 喜欢列表
   */
  handelToLikeThisProductTap(e) {
    wx.navigateTo({
      url: '../likeThisProduct/likeThisProduct?rid=' + this.data.rid
    })
  },

  // 打开11.11模态框
  handleOpenEleven() {
    this.setData({
      isElevenCoupon: true
    })
  },

  //关闭11.11模态框
  handelOffEleven() {
    this.setData({
      isElevenCoupon: false
    })
  },

  // 打开11.12返厂
  handleOpenTwelve() {
    this.setData({
      isTwelveCoupon: true
    })
  },

  // 关闭11.12返厂
  handelOffTwelve() {
    this.setData({
      isTwelveCoupon: false
    })
  },

  /**
   * 回到顶部
   */
  handleBackTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 888
    })
  },

  // 查看大图
  handleLookBigPhoto() {
    this.setData({
      bigPhotoCurrent: this.data.swiperIndex,
    }, () => {
      this.setData({
        bigPhotoShow: true
      })
    })
  },

  // 关闭滑动的盒子
  handleOffBigSwiperBox() {
    this.setData({
      bigPhotoShow: false
    })
  },

  handleBigSwiperChange(e) {
    this.setData({
      bigPhotoCurrent: e.detail.current + 1,
      bigSwiperHeight: this.data.productTop.assets[e.detail.current].h
    })
  },

  // 打开领取官方优惠券
  handleOpenOfficialBox() {
    let agent = this.data.isShowOfficial
    if (agent) {
      agent = false
    } else {
      agent = true
    }

    this.setData({
      isShowOfficial: agent
    })
  },

  // 询问是否下载的弹框
  handleDowloadShow() {
    let agent = this.data.isShowDowLoad
    if (agent) {
      agent = false
    } else {
      agent = true
    }

    this.setData({
      isShowDowLoad: agent
    })
  },

  // 防止点击穿透
  handleCilickPrevent() {
    return
  }


})