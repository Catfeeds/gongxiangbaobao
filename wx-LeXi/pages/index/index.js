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
    pickQuantity: 0, // 筛选后的数量
    handelOffPick: false,
    isSortShow: false, // 排序
    advertisement: '', // 广告
    is_mobile: false, // 优惠券模板是否弹出
    isAuthentication: '', // 是否经过官方认证的店铺
    couponList: {}, // 优惠券列表---couponList
    fullSubtractionList: {}, // 满减---
    rid: [], // 店铺的rid---
    shareWhat: '', // 分享什么东西---
    ShopOwner: [], // 店铺主人的信息---
    currentNewProduct: [], // 人气里面最新---
    highQualityProduct: [], // 优质精品---
    popularProductTheme: [], // 人气里面的主题---
    myProduct: [], //作品列表---
    recommendProductList: [], // 推荐好物品---
    themeProduct: [], //主打设计---
    openid: '', // openid---
    BrowseQuantityInfo: [], // 浏览人数---
    announcement: false, //获取店铺的公告---
    shopInfo: [], //店铺信息--- 
    is_with: false, // 是否对这个店铺有关注---
    is_share: false, //分享 ---
    coupon_show: false, //优惠券是否显示
    catgoryActive: 1, //分类的选项-切换---
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
      user_record: true //用户是否喜欢
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
    tabPisition: false, //tab是否定位
    // 推荐好物里面的参数---
    recommendProductParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
    },
    // 人气里面的最新作品参数
    currentNewParams: {
      page: 1,
      per_page: 10
    },
    // 创造订单参数,待写入---
    createdOrder: {
      address_rid: '', //String	必需	 	收货地址ID
      outside_target_id: '', //String	可选	 	 
      invoice_type: 1, //Integer	可选	1	发票类型
      invoice_info: '', //String	可选	{}	 
      buyer_remark: '', //String	可选	 	买家备注
      blessing_utterance: '', // 买家语录
      from_client: '1', //String	可选	 	来源客户端，1、小程序；2、H5 3、App 4、TV 5、POS 6、PAD
      affiliate_code: '', //String	可选	 	推广码
      bonus_code: '', //String	可选	 	官方红包码
      customer_code: '', //String	可选	 	分销商代码
      sync_pay: 1, //Integer	可选	 	是否同步返回支付参数
      //Array	必需	 	店铺商品信息
      store_items: [{
        store_rid: '', //String	必需	 	店铺rid
        coupon_codes: [], //Array	可选	 	优惠券码列表
        //Array	必需	 	订单明细参数
        items: [{
          rid: '', //String	必需	 	sku
          quantity: 1, //Number	必需	1	购买数量
          express_id: '', //Integer	必需	 	物流公司ID
          warehouse_id: '', //Number	可选	 	发货的仓库ID
        }]
      }]
    },
    sortParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //N	可选	10	每页数量
      sort_type: 0, //0	排序: 0 = 默认排序, 1= 最新, 2= 价格由低至高, 3= 价格由高至低
      cids: '', //	 	分类编号， 多个用, 隔开
      min_price: '', //	 	价格区间： 最小价格
      max_price: '', //	 	价格区间： 最大价格
      status: '', //	1	商品状态： 0： 全部, 1: 上架中, 2: 下架中, 3: 仓库中, 4: 已售罄
    }
  },

  // 获取筛选
  handlePickProduct(e) {
    console.log(e.detail.category)
    let rids = e.detail.category
    let minPrice = e.detail.minPrice
    let maxPrice = e.detail.maxPrice
    this.setData({
      myProduct:[],
      ['sortParams.cids']: rids.join(','),
      ['sortParams.min_price']: minPrice,
      ['sortParams.max_price']: maxPrice
    })
    this.getPick()
  },

  // 获取排序的产品
  handleSort(e = 0) {
    console.log(e.detail.rid)
    if (e.detail.rid != undefined) {
      this.setData({
        ['sortParams.sort_type']: e.detail.rid
      })
    }
    this.getPick()
  },
  // 排序和筛选公共的接口
  getPick() {
    console.log(this.data.sortParams)
    http.fxGet(api.products_index, this.data.sortParams, (result) => {
      console.log(result)
      if (result.success) {
        if (this.data.myProduct.length==0){
          this.setData({
            myProduct: result.data,
            pickQuantity: result.data.products.length
          })
        }else{
          let newProduct = this.data.myProduct.products
          //把触底加载的数据添加进去
          result.data.products.forEach((v,i)=>{
            newProduct.push(v)
            if (result.data.products.length-1==i){
              this.setData({
                ['myProduct.products']: newProduct,
                ['myProduct.next']: result.data.next
              })
            }
          })
        }
        this.setData({
          pickQuantity: result.data.products.length
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

  // 创建订单参数 并且设置店铺的id
  createdOrderParams() {
    this.setData({
      ['createdOrder.store_items[0].store_rid']: this.data.rid
    })
    wx.setStorageSync('orderParams', this.data.createdOrder)
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

  // 分享模板弹出
  handleShareBox(e) {
    this.setData({
      is_share: true,
      shareWhat: e.currentTarget.dataset
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
      console.log(result, '验证用户是否喜欢好物')
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
    let params = {
      openid: app.globalData.jwt.openid, // String	必须	 	用户唯一标识
      rid: app.globalData.storeRid, // String	必须	 	店铺编号
      ip_addr: '', // String	可选	 	访问时IP
      agent: '', // String	可选	 	访问时代理
    }

    http.fxPost(api.add_browse, params, (result) => {
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

    if (isLike) {
      // 喜欢，则删除
      http.fxDelete(api.userlike, {
        rid: rid
      }, (result) => {
        if (result.success) {
          this.getRecommendProducts()
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
          this.getRecommendProducts()
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
        console.log(result.data,"最新的商品")
        if (this.data.currentNewProduct.length==0){
          this.setData({
            currentNewProduct: result.data
          })
        }else{
          let newProduct = this.data.currentNewProduct.products
          // newProduct
          result.data.products.forEach((v,i)=>{
            newProduct.push(v)
            if (result.data.products.length-1==i){
              this.setData({
                ['currentNewProduct.products']: newProduct,
                ['currentNewProduct.next']: result.data.next
              })
            }
          })
        }
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
  getBrowseQuantity(page = 1, per_page = 12) {
    let params = {
      rid: app.globalData.storeRid,
      page: page,
      per_page: per_page,
      openid: app.globalData.jwt.openid
    }
    console.log(params)
    http.fxGet(api.BrowseQuantityNumber.replace(/:rid/g, app.globalData.storeRid), params, (result) => {
      console.log(result, '浏览者数量')
      if (result.success) {
        this.setData({
          BrowseQuantityInfo: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取广告列表
  getAdvertises() {
    http.fxGet(api.marketBanners.replace(/:rid/g, 'shop_wxa_index'), {}, (result) => {
      console.log(result, '广告列表')
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
      console.log(result, '推荐好物')
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
      "type": e
    }, (result) => {
      if (result.success) {
        if (e == 1) {
          console.log(result.data,'主打设计')
          this.setData({
            themeProduct: result.data
          })
        } else {
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
      if (result.success) {
        this.setData({
          myProduct: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取与登录用户相关的店铺优惠券 or 满减
  getCouponsByUser(type = ' ') {
    this.setData({
      ['couponParams.type']: type
    })
    // 优惠券
    http.fxGet(api.coupons, this.data.couponParams, (result) => {
      if (result.success) {
        if (type != 3) {
          console.log(result, '登陆的优惠券')
          this.setData({
            couponList: result.data
          })
          app.globalData.couponList = result.data
        } else {
          console.log(result, '登陆的满减')
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
    http.fxGet(api.noCouponsList, {}, (result) => {
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
        // 如果是登陆状态下调取直接赋值满减
        if (e == "loginFullSubtractionList") {
          this.setData({
            ['fullSubtractionList.coupons']: full
          })
          app.globalData.fullSubtractionList = result.data
        } else {
          this.setData({
            ['couponList.coupons']: coupon, // 优惠券列表---couponList
            ['fullSubtractionList.coupons']: full, // 满减---
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
        console.log(result, '查看是否关注')
        this.setData({
          is_with: result.data.status
        })
        app.globalData.isWatchstore = result.data.status
      } else {
        console.log(result, '查看是否关注错')
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
      console.log(result, '店铺信息')
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

  // 设置头部
  getNavigationBarTitleText() {
    wx.setNavigationBarTitle({
      title: app.globalData.configInfo.name
    })
  },

  // 获取店铺的信息
  // getOwnerInfo(){
  //   console.log(app.globalData.storeOwnerInfo)
  //   this.setData({
  //     ShopOwner: app.globalData.storeOwnerInfo
  //   })
  // },
  /**
   * 获取店铺主人的信息
   * **/
  getStoreOwner() {
    http.fxGet(api.masterInfo, {}, (result) => {
      if (result.success) {
        console.log(result.data, '店铺主人信息')
        // result.data.user_label = this.getUserIdentityLabel(result.data.user_identity)
        this.setData({
          ShopOwner: result.data
        })
        // shopOwner: result.data
        app.globalData.storeOwnerInfo = result.data
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    utils.handleShowLoading()
    // 设置头部信息
    this.getNavigationBarTitleText()

    // 获取店铺的信息
    this.getShopInfo()
    //获取主人信息
    this.getStoreOwner()
    this.getAnnouncement() // 获取店铺公告---

    this.getBrowseQuantity() // 浏览浏览人数---

    if (app.globalData.isLogin) { // 用户已登录时
      // 查看是否关注
      this.getIsWatch()

      this.getCouponsByUser()
      this.getCouponsByUser(3)
    } else { // 用户未登录时
      this.getCoupons()
    }

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
   * 页面触底事件的处理函数
   */
  onReachBottom: function () {
    console.log(123)
    switch (this.data.catgoryActive) {
      case 1:

        break;
      case 2:
        this.setData({
          ['sortParams.page']: this.data.sortParams.page+1
        })
        if (!this.data.myProduct.next) {
          utils.fxShowToast("没有更多产品了")
          return
        }
        this.getPick() //获取作品
        break;
      default:
        this.setData({
          ['currentNewParams.page']: this.data.currentNewParams.page+1
        })
        if (!this.data.currentNewParams.next){
          utils.fxShowToast("没有更多产品了")
          return
        }
        this.getNewestProdcts()// 
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成   
   */
  onReady: function() {
    utils.handleHideLoading()
  },

  //监听页面的滚动
  onPageScroll: function(e) {
    // console.log(e)
    // if (e.scrollTop >= 622) {
    //   this.setData({
    //     tabPisition: true
    //   })
    // } else if (e.scrollTop < 622) {
    //   this.setData({
    //     tabPisition: false
    //   })
    // }
  },

  shareTap(e) {
    var sign
    if (e.currentTarget.dataset.is_share == "1") {
      sign = true
    } else {
      sign = false
    }
    this.setData({
      is_share: sign
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
    //***注意！ this.data.shareWhat.from==2 为分享商品
    //***注意！ this.data.shareWhat.from==1 为分享店铺
    //***注意！ target.dataset.from==3 为分优惠券
    console.log(this.data.shareWhat)
    console.log(res)
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
    if (res.from === 'button' && this.data.shareWhat.from == 2) {
      console.log(res.target)
      return {
        title: this.data.shareWhat.sharestore.name,
        imageUrl: this.data.shareWhat.sharestore.cover,
        path: '/page/product/product?rid=' + this.data.shareWhat.sharestore.rid
      }
    }
    if (res.from === 'button' && this.data.shareWhat.from == 1) {
      console.log(res.target, this.shopInfo)
      return {
        title: this.shopInfo.name,
        path: '/page/index/index'
      }
    }
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
    if (params){
      wx.showTabBar()
      params = false
    }else{
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
    console.log(e.currentTarget.dataset.id)
    console.log(this.data.popularProductTheme)
    app.globalData.themeProdct = this.data.popularProductTheme[e.currentTarget.dataset.index]
    wx.navigateTo({
      url: '../theme/theme?id=' + e.currentTarget.dataset.id,
    })
  },

  // 关闭或开启优惠券的模态框
  hanleOffLoginBox(e) {
    console.log(e)
    this.setData({
      is_mobile: e.detail.offBox
    })
  },
  // 排序的盒子
  handleSortShow() {
    this.setData({
      isSortShow: true
    })
  },
  // 排序的盒子关闭
  handleSortOff() {
    var params = this.data.isSortShow
    if (params) {
      params = false
    }else{
      params = true
    }
    this.setData({
      isSortShow: params
    })
  },
  //关闭筛选的盒子
  handelOffPick() {
    let params = this.data.handelOffPick
    if (params) {
      params = false
    } else {
      params = true
    }
    this.setData({
      handelOffPick: params
    })
  },
  // 关闭分享模态框
  handleOffBox(){
    this.setData({
      is_share:false
    })
  }
})