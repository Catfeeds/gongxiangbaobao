// 获取应用实例
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

const common = require('./../../utils/common.js')

Page({
  /**
   * 页面的初始数据xiaoyi.tian@taihuoniao.com
   */
  data: {
    isLoading: true,
    shareProductRid: '', // 分享商品的rid
    shareProductPhotoUrl: '', // 分享商品的url
    posterUrl: '', // 海报的url

    lookMany: false, // 查看更多的公告
    pickQuantity: '', // 商品的数量
    isDisabled: false, // 是否禁用
    leftTimer: null, // 延迟句柄
    rightTimer: null, // 延迟句柄
    categoryList: [], // 分类列表
    checkedCids: [], // 选择的分类
    showFilterModal: false, // 筛选
    openPickBox: false, // 筛选的模态框
    sortBox: false, // 筛选的模态框

    // 推荐
    recommendList: [{
        name: '包邮',
        id: '1',
        isActive: false
      },
      {
        name: '特惠',
        id: '2',
        isActive: false
      },
      {
        name: '可定制',
        id: '3',
        isActive: false
      }
    ],

    roundActive: 0, // 广告的轮播点索引
    pickQuantity: 0, // 筛选后的数量
    handelOffPick: false,
    isSortShow: false, // 排序
    advertisement: '', // 广告
    is_mobile: false, // 优惠券模板是否弹出
    isAuthentication: '', // 是否经过官方认证的店铺
    couponList: {}, // 优惠券列表---couponList
    fullSubtractionList: { // 满减---
      coupons: []
    },
    rid: [], // 店铺的rid---
    shareWhat: '', // 分享什么东西---
    ShopOwner: [], // 店铺主人的信息---

    highQualityProduct: [], // 优质精品---
    popularProductTheme: [], // 人气里面的主题---
    recommendProductList: [], // 推荐好物品---
    themeProduct: [], //主打设计---
    openid: '', // openid---
    browsers: [], // 浏览人数---
    announcement: false, //获取店铺的公告---
    shopInfo: [], //店铺信息--- 
    is_with: false, // 是否对这个店铺有关注---
    is_share: false, //分享 ---
    coupon_show: false, //优惠券是否显示
    catgoryActive: 1, //分类的选项-切换---

    currentNewProduct: [], // 人气里面最新---
    isNewProductNext: true, // 是否有下一页 

    myProduct: [], //作品列表---
    isLoadProductShow: true, // 加载作品load图
    isProductNext: true, // 是否有下一页 

    // 优惠券的请求参数
    couponParams: {
      page: 1,
      per_page: 10,
      status: 1, // 优惠券状态 -1: 禁用；1：正常；2：已结束
      'type': '' // 是否满减活动 3、满减
    },

    // 精品 作品 人气里面的请求参数---
    productCategoryParams: {
      page: 1, // 当前页码
      per_page: 10, // 每页数量
      start_date: '', // 发布日期的开始日期
      end_date: '', // 发布日期的结束日期
      cid: '', // 分类Id 
      status: '', // 商品状态 0:仓库中; 1:出售中; 2:下架中; 3:已售罄
      is_distributed: '', // 商品类别 0: 全部; 1：自营商品；2：分销商品
      qk: '', // 搜索关键字
      out_of_stock: '', // 商品库存 0: 全部; 1: 数量不足
      user_record: 1, // 用户是否喜欢
    },

    //分类 精选 作品 人气---
    catgory: [{
        name: '精选',
        rid: 1
      },
      {
        name: '作品',
        rid: 2
      },
      {
        name: '人气',
        rid: 3
      }
    ],

    url: '../../images/timg.jpg',
    tabPisition: false, // tab是否定位

    // 推荐好物里面的参数---
    recommendProductParams: {
      page: 1, // Number	可选	1	当前页码
      per_page: 10, // Number	可选	10	每页数量
    },

    // 人气里面的最新作品参数
    currentNewParams: {
      page: 1,
      per_page: 10
    },

    // 创造订单参数,待写入---
    createdOrder: {
      address_rid: '', // String	必需	 	收货地址ID
      outside_target_id: '', // String	可选	 	 
      invoice_type: 1, // Integer	可选	1	发票类型
      invoice_info: '', // String	可选	{}	 
      buyer_remark: '', // String	可选	 	买家备注
      blessing_utterance: '', // 买家语录
      from_client: '1', // String	可选	 	来源客户端，1、小程序；2、H5 3、App 4、TV 5、POS 6、PAD
      affiliate_code: '', // String	可选	 	推广码
      bonus_code: '', // String	可选	 	官方红包码
      customer_code: '', // String	可选	 	分销商代码
      sync_pay: 1, // Integer	可选	 	是否同步返回支付参数
      // Array	必需	 	店铺商品信息
      store_items: [{
        store_rid: '', // String	必需	 	店铺rid
        coupon_codes: [], // Array	可选	 	优惠券码列表
        // Array	必需	 	订单明细参数
        items: [{
          rid: '', // String	必需	 	sku
          quantity: 1, // Number	必需	1	购买数量
          express_id: '', // Integer	必需	 	物流公司ID
          warehouse_id: '' // Number	可选	 	发货的仓库ID
        }]
      }]
    },

    sortParams: { // 我的作品参数 
      page: 1, // Number	可选	1	当前页码
      per_page: 10, // N	可选	10	每页数量
      sort_type: 0, // 0	排序: 0 = 默认排序, 1= 最新, 2= 价格由低至高, 3= 价格由高至低
      cids: '', // 分类编号， 多个用, 隔开
      min_price: '', //	价格区间： 最小价格
      max_price: '', // 价格区间： 最大价格
      status: 1 // 1	商品状态： 0： 全部, 1: 上架中, 2: 下架中, 3: 仓库中, 4: 已售罄
    }
  },

  /**
   * 取消分享-销售
   */
  handleCancelShare(e) {
    this.setData({
      is_share: false,
    })
    wx.showTabBar()
  },

  // 打开公告
  handleLookMany() {
    this.setData({
      lookMany: true
    })
  },

  // 关闭公告
  handleOffLook() {
    this.setData({
      lookMany: false
    })
  },

  /**
   * 改变分类
   */
  handleToggleCategory(e) {
    let cid = e.currentTarget.dataset.cid

    let _checkedCids = this.data.checkedCids
    if (_checkedCids.indexOf(cid) == -1) { // 不存在，则增加
      _checkedCids.push(cid)
    } else { // 存在，则删除
      let idx = _checkedCids.indexOf(cid)
      _checkedCids.splice(idx, 1)
    }

    let _categories = this.data.categoryList
    _categories = _categories.map((cate) => {
      if (_checkedCids.indexOf(cate.id) != -1) {
        cate.checked = true
      } else {
        cate.checked = false
      }
      return cate
    })

    this.setData({
      categoryList: _categories,
      myProduct: [],
      'sortParams.cids': _checkedCids.join(','),
      'sortParams.page': 1
    })

    this.getPick()
  },

  /**
   * 分类列表
   */
  getCategories() {
    http.fxGet(api.store_categories, {
      sid: this.data.shopInfo.rid
    }, (result) => {
      utils.logger(result, '分类列表')
      if (result.success) {
        this.setData({
          categoryList: result.data.categories
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 滑块最低价格
   */
  handleChangeMinPrice(e) {
    let minPrice = e.detail.lowValue
    if (this.data.sortParams.max_price == -1) {
      if (minPrice == '不限') {
        minPrice = 800
      }
    }
    this.setData({
      ['sortParams.min_price']: minPrice
    })

    if (this.data.leftTimer) {
      clearTimeout(this.data.leftTimer)
    }

    let _t = setTimeout(() => {
      this.getPick()
      this.setData({
        myProduct: []
      })
    }, 2000)

    this.setData({
      leftTimer: _t
    })
  },

  /**
   * 重置回调事件
   */
  handleResetFilterCondition(e) {
    this.selectComponent('#fx-slider').reset()
    let _categories = this.data.categoryList
    _categories = _categories.map((cate) => {
      cate.checked = false
      return cate
    })

    this.setData({
      'categoryList': _categories,
      'sortParams.min_price': 0,
      'sortParams.max_price': -1,
      'sortParams.cids': ''
    })
  },

  /**
   * 关闭弹窗回调
   */
  handleCloseFilterModal(e) {
    this.setData({
      handelOffPick: false
    })

    wx.showTabBar()
  },

  /**
   * 选择推荐
   */
  handleToggleRecommendList(e) {
    let index = e.currentTarget.dataset.index
    let id = e.currentTarget.dataset.cid

    if (this.data.recommendList[index].isActive) {
      this.setData({
        ['recommendList[' + index + '].isActive']: false
      })
    } else {
      this.setData({
        ['recommendList[' + index + '].isActive']: true
      })
    }

    if (id == 1) {
      this.setData({
        myProduct: [], // 商品列表
        ['sortParams.is_free_postage']: this.data.sortParams.is_free_postage == 0 ? 1 : 0
      })
    }

    if (id == 2) {
      this.setData({
        myProduct: [], // 商品列表
        ['sortParams.is_preferential']: this.data.sortParams.is_preferential == 0 ? 1 : 0
      })
    }

    if (id == 3) {
      this.setData({
        myProduct: [], // 商品列表
        ['sortParams.is_custom_made']: this.data.sortParams.is_custom_made == 0 ? 1 : 0
      })
    }

    this.getPick()
  },

  /**
   * 滑块最高价格
   */
  handleChangeMaxPrice(e) {
    let maxPrice = e.detail.highValue
    if (maxPrice == '不限') {
      maxPrice = -1
    }
    this.setData({
      ['sortParams.max_price']: maxPrice
    })

    if (this.data.rightTimer) {
      clearTimeout(this.data.rightTimer)
    }

    let _t = setTimeout(() => {
      this.getPick()
      this.setData({
        myProduct: []
      })
    }, 2000)

    this.setData({
      rightTimer: _t
    })
  },

  // 获取筛选
  handlePickProduct(e) {
    console.log(e.detail.category)
    let rids = e.detail.category
    let minPrice = e.detail.minPrice
    let maxPrice = e.detail.maxPrice
    this.setData({
      myProduct: [],
      ['sortParams.page']: e.detail.page ? e.detail.page : this.data.page,
      ['sortParams.cids']: rids == undefined ? '' : rids.join(','),
      ['sortParams.min_price']: minPrice,
      ['sortParams.max_price']: maxPrice
    })
    this.getPick()
  },

  // 获取排序的产品
  handleSort(e = 0) {
    console.log(e.currentTarget.dataset.rid)
    if (e.currentTarget.dataset.rid != undefined) {
      this.setData({
        isSortShow: false,
        myProduct: [],
        ['sortParams.page']: 1,
        ['sortParams.sort_type']: e.currentTarget.dataset.rid
      })
    }

    wx.showTabBar()

    this.getPick()
  },

  // 我的作品
  getPick() {
    http.fxGet(api.products_index, this.data.sortParams, (result) => {
      utils.logger(result, '我的作品')
      if (result.success) {
        let data = this.data.myProduct

        this.setData({
          myProduct: data.concat(result.data.products),
          pickQuantity: result.data.count,
          isLoadProductShow: false,
          isProductNext: result.data.next,
          totalCount: result.data.count
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 跳转到关于品牌页面
  handleViewBrandStory() {
    wx.navigateTo({
      url: '../brandInformation/brandInformation'
    })
  },

  // 跳转广告相关页面
  handleToAdvInfo(e) {
    wx.navigateTo({
      url: '../product/product?rid=' + e.currentTarget.dataset.rid + '&product=' + this.data.myProduct
    })
  },

  // 创建订单参数 并且设置店铺的id
  createdOrderParams() {
    this.setData({
      ['createdOrder.store_items[0].store_rid']: this.data.rid
    })
    wx.setStorageSync('orderParams', this.data.createdOrder)
  },

  // 分享模板弹出
  handleShareBox(e) {
    let _rid = e.currentTarget.dataset.sharestore.rid
    this.setData({
      is_share: true,
      shareWhat: e.currentTarget.dataset,
      shareProductPhotoUrl: e.currentTarget.dataset.sharestore.cover
    })
    wx.hideTabBar()

    this.getWxaPoster(_rid) // 保存商品的海报
  },

  /**
   * 保存当前海报到相册
   */
  handleSaveShare() {
    // 下载网络文件至本地
    wx.downloadFile({
      url: this.data.posterUrl,
      success: (res) => {
        if (res.statusCode === 200) {
          // 保存文件至相册
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(res) {
              utils.fxShowToast('保存成功', 'success')
            },
            fail(res) {
              if (res.errMsg === 'saveImageToPhotosAlbum:fail:auth denied') {
                wx.openSetting({
                  success(settingdata) {
                    console.log(settingdata)
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
  },

  // 领取优惠券
  getReceiveCoupon(e) {
    // 是否登陆
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return
    }

    http.fxPost(api.coupon_grant, {
      rid: e.currentTarget.dataset.rid
    }, (result) => {
      if (result.success) {
        utils.fxShowToast('领取成功', 'success')
        this.getCouponsByUser()
      } else {
        utils.fxShowToast(result.status.message)
      }
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

  // 验证是否喜欢
  examineIsLike() {
    if (!app.globalData.isLogin) { // 如未登录
      return
    }
    let products = this.data.recommendProductList.products
    let productsArray = []
    products.forEach((v, i) => {
      productsArray.push(v.rid)
    })
    if (productsArray.length <= 0) { // 如为空
      return
    }
    let rids = productsArray.join(',')
    http.fxGet(api.usetIsLike, {
      rids: rids
    }, (result) => {
      utils.logger(result, '验证用户是否喜欢好物')
      if (result.success) {
        products.forEach((v, i) => {
          result.data.forEach((e, index) => {
            if (v.rid == e.rid) {
              v.is_like = e.is_like
            }
          })
        })
        this.setData({
          ['recommendProductList.products']: products
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 添加访问者---
  addBrowse() {
    const jwt = wx.getStorageSync('jwt')
    let params = {
      openid: jwt.openid, // String	必须	 	用户唯一标识
      rid: app.globalData.storeRid, // String	必须	 	店铺编号
      ip_addr: '', // String	可选	 	访问时IP
      agent: '' // String	可选	 	访问时代理
    }

    http.fxPost(api.add_browse, params, (result) => {
      utils.logger(result, '添加浏览人数')
      if (result.success) {
        this.getBrowseQuantity() // 浏览浏览人数---
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 添加关注---
  handleAddWatch() {
    // 是否登陆
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return
    }

    http.fxPost(api.add_watch, {
      rid: app.globalData.storeRid
    }, (result) => {
      if (result.success) {
        app.globalData.storeInfo.fans_count = app.globalData.storeInfo.fans_count - 0 + 1
        this.setData({
          shopInfo: app.globalData.storeInfo,
          is_with: true
        })
        app.globalData.isWatchstore = true
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 取消关注---
  handleDeleteWatch() {
    // 是否登陆
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return
    }

    http.fxPost(api.delete_watch, {
      rid: app.globalData.storeRid
    }, (result) => {
      if (result.success) {
        app.globalData.isWatchstore = false
        app.globalData.storeInfo.fans_count = app.globalData.storeInfo.fans_count - 1
        this.setData({
          shopInfo: app.globalData.storeInfo,
          is_with: false
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 分类选项的函数---
  handleGoryActiveTap(e = 1) {
    if (e.currentTarget == undefined) {
      this.setData({
        catgoryActive: e
      })
    } else {
      this.setData({
        catgoryActive: e.currentTarget.dataset.rid
      })
    }

    // 精选里面的
    if (this.data.catgoryActive === 1) {
      this.getThemeProduct() // 1,主打设计
      this.getThemeProduct(2) // 2,优质精选---
    }

    // 作品里面的
    if (this.data.catgoryActive === 2) {
      // this.getStoreProducts() // 店铺全部作品
    }

    // 人气里面的
    if (this.data.catgoryActive === 3) {

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

    let rid = e.currentTarget.dataset.id
    let isLike = e.currentTarget.dataset.islike
    let idx = e.currentTarget.dataset.index

    if (isLike) {
      // 喜欢，则删除
      http.fxDelete(api.userlike, {
        rid: rid
      }, (result) => {
        if (result.success) {
          this.setData({
            ['recommendProductList.products[' + idx + '].is_like']: false,
            ['recommendProductList.products[' + idx + '].like_count']: this.data.recommendProductList.products[idx].like_count - 1,
            ['recommendProductList.products[' + idx + '].product_like_users[0].avatar']: ''
          })
          console.log(this.data.recommendProductList.products, '头像')
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
            ['recommendProductList.products[' + idx + '].is_like']: true,
            ['recommendProductList.products[' + idx + '].like_count']: this.data.recommendProductList.products[idx].like_count + 1,
            ['recommendProductList.products[' + idx + '].product_like_users[0].avatar']: app.globalData.userInfo.avatar
          })
        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    }
  },

  // 人气最新商品
  getNewestProdcts() {
    http.fxGet(api.latest_products, this.data.currentNewParams, (result) => {
      if (result.success) {
        console.log(result.data, '最新商品')

        let data = this.data.currentNewProduct
        this.setData({
          currentNewProduct: result.data.products.concat(data),
          isNewProductNext: result.data.next,
          isLoadProductShow: false,
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 人气里面的主题
  getTheme() {
    http.fxGet(api.theme, {}, (result) => {
      console.log(result, '人气里面的主题')
      if (result.success) {
        this.setData({
          popularProductTheme: result.data.collections
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取浏览人数---
  getBrowseQuantity(page = 1, per_page = 10) {
    const jwt = wx.getStorageSync('jwt')
    let params = {
      rid: app.globalData.storeRid,
      page: page,
      per_page: per_page,
      openid: jwt.openid
    }
    
    http.fxGet(api.BrowseQuantityNumber.replace(/:rid/g, app.globalData.storeRid), params, (result) => {
      utils.logger(result, '浏览者数量')
      if (result.success) {
        this.setData({
          browsers: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取广告列表
  getAdvertises() {
    http.fxGet(api.marketBanners.replace(/:rid/g, 'shop_wxa_index'), {}, (result) => {
      utils.logger(result, '广告列表')
      if (result.success) {
        this.setData({
          advertisement: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 推荐好物---
  getRecommendProducts(e = 1) {
    this.setData({
      ['productCategoryParams.is_distributed']: e,
    })
    http.fxGet(api.sticked_products, this.data.productCategoryParams, (result) => {
      utils.logger(result, '推荐好物')
      if (result.success) {
        this.setData({
          recommendProductList: result.data
        }, () => {
          this.examineIsLike()
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 主打商品和优质精选---
  getThemeProduct(e = 1) {
    http.fxGet(api.theme_product, {
      'type': e
    }, (result) => {
      if (result.success) {
        if (e == 1) {
          console.log(result.data, '主打设计')
          this.setData({
            themeProduct: result.data
          })
        } else {
          console.log(result.data, '优质精选')
          this.setData({
            highQualityProduct: result.data
          })
        }
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取店铺商品列表
  getStoreProducts() {
    http.fxGet(api.products, this.data.productCategoryParams, (result) => {
      utils.logger(result, '首页的作品列表')
      if (result.success) {
        let data = this.data.myProduct

        this.setData({
          // myProduct: result.data.,
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取与登录用户相关的店铺优惠券 or 满减
  // getCouponsByUser(type = ' ') {
  //   this.setData({
  //     ['couponParams.type']: type
  //   })
  //   // 优惠券
  //   http.fxGet(api.user_login_coupon, this.data.couponParams, (result) => {
  //     if (result.success) {
  //       if (type != 3) {
  //         console.log(result, '登陆的优惠券')
  //         let parms = result.data
  //         parms.coupons.forEach((v,i)=>{
  //           v.user_coupon_start = utils.timestamp2string(v.start_date, "date")
  //           v.user_coupon_end = utils.timestamp2string(v.end_date, "date")
  //         })

  //         this.setData({
  //           couponList: result.data
  //         })
  //         app.globalData.couponList = result.data
  //       } else {
  //         console.log(result, '登陆的满减')
  //         // 调取满减
  //         this.getCoupons('loginFullSubtractionList')

  //       }
  //     } else {
  //       utils.fxShowToast(result.status.message)
  //     }
  //   })
  // },

  // 用户未登录时获取店铺优惠券 or 满减活动列表
  // getCoupons(e) {
  //   http.fxGet(api.coupons, {}, (result) => {
  //     console.log(result, '没有登陆获取优惠券')
  //     if (result.success) {
  //       let coupon = [] // 优惠券
  //       let full = [] // 满减券
  //       result.data.coupons.forEach((v, i) => {
  //         console.log(v)
  //         if (v.type == 3) {
  //           full.push(v)
  //         } else {
  //           coupon.push(v)
  //         }
  //       })
  //       // 如果是登陆状态下调取直接赋值满减
  //       if (e == "loginFullSubtractionList") {
  //         this.setData({
  //           ['fullSubtractionList.coupons']: full
  //         })
  //         app.globalData.fullSubtractionList = result.data
  //         console.log(result.data,"满减")
  //       } else {
  //         this.setData({
  //           ['couponList.coupons']: coupon, // 优惠券列表---couponList
  //           ['fullSubtractionList.coupons']: full, // 满减---
  //         })
  //         app.globalData.fullSubtractionList.coupons = full
  //         app.globalData.couponList.coupons = coupon
  //       }
  //       console.log(full,'满减')
  //       console.log(full,'满减')
  //     } else {
  //       utils.fxShowToast(result.status.message)
  //     }
  //   })
  // },

  // 用户登录优惠券
  getCouponsByUser() {
    utils.logger(this.data.originalStoreRid, '原店铺的rid')

    http.fxGet(api.user_login_coupon, {}, (result) => {
      utils.logger(result, '登陆的优惠券')

      result.data.coupons.forEach((v, i) => {
        v.user_coupon_start = utils.timestamp2string(v.start_date, 'date')
        v.user_coupon_end = utils.timestamp2string(v.end_date, 'date')
      })

      if (result.success) {
        this.setData({
          couponList: result.data
        })
        app.globalData.couponList = result.data
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

          app.globalData.fullSubtractionList = full

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
          app.globalData.fullSubtractionList.coupons = full
          app.globalData.couponList.coupons = coupon
        }

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 查看是否关注
  getIsWatch() {
    http.fxGet(api.examine_watch, {
      rid: app.globalData.storeRid
    }, (result) => {
      if (result.success) {
        utils.logger(result, '查看是否关注')
        this.setData({
          is_with: result.data.status
        })
        app.globalData.isWatchstore = result.data.status
      } else {
        utils.logger(result, '查看是否关注错')
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取店铺公告---
  getAnnouncement() {
    http.fxGet(api.store_announcement, {}, (result) => {
      if (result.data.content !== undefined) {
        this.setData({
          announcement: result.data.content
        })
      }
    })
  },

  // 获取店铺的信息
  getShopInfo() {
    http.fxGet(api.shop_info, {}, (result) => {
      utils.logger(result, '店铺信息')
      if (result.success) {
        app.globalData.storeInfo = result.data
        this.setData({
          shopInfo: app.globalData.storeInfo
        })
      } else {
        util.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 获取店铺主人的信息
   * **/
  getStoreOwner() {
    http.fxGet(api.masterInfo, {}, (result) => {
      if (result.success) {
        utils.logger(result.data, '店铺主人信息')
        this.setData({
          ShopOwner: result.data
        })

        app.globalData.storeOwnerInfo = result.data
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 乐喜平台的分享卡片
  getLexiShare() {
    http.fxPost(api.market_share_store, {
      rid: app.globalData.storeInfo.rid
    }, (result) => {
      utils.logger(result, '分享品牌馆图片地址')
      if (result.success) {
        app.globalData.shareBrandUrl = result.data.image_url
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 跳转到商品详情---
  handleInfomation(e) {
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&product=' + this.data.myProduct
    })
  },

  // 跳转到关注页面
  wacthTap() {
    wx.navigateTo({
      url: '../watch/watch',
    })
  },

  // 优惠卷隐藏和显示
  coupon_show() {
    let params = this.data.coupon_show
    if (params) {
      wx.showTabBar()
      params = false
    } else {
      wx.hideTabBar()
      params = true
    }
    this.setData({
      coupon_show: params
    })
  },

  //优惠券完成按钮
  handleOffCouponTap() {
    wx.showTabBar()
    this.setData({
      coupon_show: false
    })
  },

  // 进入主题页面
  handlethemeTap(e) {
    app.globalData.themeProdct = this.data.popularProductTheme[e.currentTarget.dataset.index]
    wx.navigateTo({
      url: '../theme/theme?id=' + e.currentTarget.dataset.id,
    })
  },

  // 关闭或开启优惠券的模态框
  hanleOffLoginBox(e) {
    this.setData({
      is_mobile: false
    })
  },

  // 排序的盒子
  handleSortShow() {
    this.setData({
      isSortShow: true
    })
    wx.hideTabBar()
  },

  // 排序的盒子关闭
  handleSortOff() {
    this.setData({
      isSortShow: false
    })
    wx.showTabBar()
  },

  // 打开筛选的盒子
  handelOffPick() {
    this.setData({
      handelOffPick: true
    })

    wx.hideTabBar()
    this.getCategories()
  },

  // 关闭分享模态框
  handleOffBox() {
    this.setData({
      is_share: false
    })
    wx.showTabBar()
  },

  // 阻止滑动穿透
  hanlePreventScroll() {
    return
  },

  // 轮播图的小点 选中的点
  handleRoundActive(e) {
    this.setData({
      roundActive: e.detail.current
    })
  },

  shareTap(e) {
    var sign
    if (e.currentTarget.dataset.is_share == '1') {
      sign = true
    } else {
      sign = false
    }
    this.setData({
      is_share: sign
    })
  },

  /**
   * 用户登录后更新数据
   */
  _refreshData() {
    // 添加浏览者
    this.addBrowse()
    // 查看是否关注
    this.getIsWatch()

    this.getCouponsByUser()
    this.getCoupons('manjian')

    this.getLexiShare()
  },

  /**
   * 获取初始化数据
   */
  getInitData () {
    // 获取店铺的信息
    this.getShopInfo()
    // 获取店铺公告
    this.getAnnouncement()

    // 获取主人信息
    this.getStoreOwner()

    // 获取商品 (精选)
    this.getThemeProduct() // 1,主打设计
    this.getRecommendProducts() // 推荐好物---
    this.getAdvertises() // 获取广告

    this.getThemeProduct(2) // 2,优质精选---   
    this.getPick() // 获取作品---

    this.getTheme() // 人气--主题---
    this.getNewestProdcts() // 人气--最新作品---
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    common.networkType()

    // 设置头部信息
    wx.setNavigationBarTitle({
      title: app.globalData.configInfo.name
    })

    // 获取无用户状态信息
    this.getInitData()

    // 给app.js 定义一个方法。
    app.userInfoReadyCallback = (res) => {
      utils.logger(res, '用户信息请求完毕')
      if (res) { // 登录请求成功
        if (app.globalData.isLogin) { // 登录成功
          this._refreshData()
        } else {
          // 用户未登录时
          this.getCoupons()
        }
      } else { // 登录请求失败
        this.setData({
          is_mobile: false
        })
      }
    }

    // 用户已登录时
    if (app.globalData.isLogin) { 
      this._refreshData()
    } else {
      // 用户未登录时
      this.getCoupons()
    }
  },

  /**
   * 页面触底事件的处理函数
   */
  onReachBottom: function() {
    switch (this.data.catgoryActive) {
      case 1:
        break;
      case 2:
        if (!this.data.isProductNext) {
          return
        }
        this.setData({
          'sortParams.page': this.data.sortParams.page + 1,
          isLoadProductShow: true
        })

        this.getPick() // 获取作品
        break;
      default:
        if (!this.data.isNewProductNext) {
          return
        }

        this.setData({
          ['currentNewParams.page']: this.data.currentNewParams.page + 1,
          isLoadProductShow: true,
        })

        this.getNewestProdcts()
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成   
   */
  onReady: function() {
    let that = this
    setTimeout(() => {
      that.setData({
        isLoading: false
      })
    }, 350)
  },

  // 页面的卷曲
  onPageScroll(e) {
    if (e.scrollTop > 620) {
      if (!this.data.tabPisition) {
        this.setData({
          tabPisition: true
        })
      }
    }

    if (e.scrollTop < 619) {
      if (this.data.tabPisition) {
        this.setData({
          tabPisition: false
        })
      }
    }

    this.setData({
      pageScrol: e.scrollTop
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

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
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    // ***注意！this.data.shareWhat.from == 2 为分享商品
    // ***注意！this.data.shareWhat.from == 1 为分享店铺
    // ***注意！target.dataset.from == 3 为分优惠券
    if (res.target != undefined && res.target.dataset.from == 3) {
      return {
        title: '转发的标题',
        path: '/pages/share/share',
        success: function(e) {
          console.log(e)
        },
        fail: function(e) {
          console.log(e)
        }
      }
    }

    if (res.from === 'button' && this.data.shareWhat.from == 2) {
      console.log(res.target)
      return {
        title: this.data.shareWhat.sharestore.name,
        imageUrl: this.data.shareWhat.sharestore.cover,
        path: '/pages/product/product?rid=' + this.data.shareWhat.sharestore.rid
      }
    }

    return common.shareLexi(app.globalData.storeInfo.name, app.globalData.shareBrandUrl)
  }

})