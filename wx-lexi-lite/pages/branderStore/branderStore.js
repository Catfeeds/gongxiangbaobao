// pages/branderStore/branderStore.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
const common = require('./../../utils/common.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isDisabled: false, // 是否禁用
    leftTimer: null, // 延迟句柄
    rightTimer: null, // 延迟句柄
    categoryList: [], // 分类列表
    checkedCids: [], // 选择的分类
    showFilterModal: false, // 筛选
    openPickBox: false, // 筛选的模态框
    sortBox: false, // 筛选的模态框

    // 文章
    liveIsNext: false, // 是否有下一页
    wonderfulStories: [], // 列表

    shareBrandUrl: '', // 品牌管的url
    storeRid: "", //店铺的rid
    isNext: [], // 是否有下一页面
    storeInfo: [], // 店铺的详情
    couponList: {
      coupons: []
    }, // 优惠券列表---couponList
    productList: [], // 店铺商品列表
    announcement: [], // 店铺的公告
    categoryId: 1, // 分类的id
    announcementShow: '', // 详细信息动画盒子
    openPickBox: false, // 筛选的模态框
    fullSubtractionList: [], // 满减
    // 推荐
    recommendList: [{
        name: "包邮",
        id: '1',
        isActive: false
      },
      {
        name: "特惠",
        id: "2",
        isActive: false
      },
      {
        name: "可定制",
        id: "3",
        isActive: false
      },
    ],
    titleCategoryList: [{
        name: "商品",
        num: 0,
        id: 1
      },
      {
        name: "文章",
        num: 0,
        id: 2
      }
    ],
    // 获取生活志文章的列表
    liveParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
      sid: '', //String	必须	 	店铺编号
      type: 0, //Number	可选	0	生活志类型: 0 = 全部, 1= 文章, 2= 种草清单
    },
    // 请求商品的
    params: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
      sid: '', //String	必须	 	店铺编号
      cid: '', //Number	可选	 	分类Id
      status: 1, //Number	可选	1	商品状态 -1: 所有 0: 仓库中; 1: 出售中; 2: 下架中; 3: 已售罄
      is_distributed: 1, //Number	必选	 	商品类别 0: 全部; 1：自营商品；2：分销商品
      qk: '', //String	可选	 	搜索关键字
      min_price: '', //Number	可选	 	价格区间： 最小价格
      max_price: '', //Number	可选	 	价格区间： 最大价格
      sort_type: 1, //Number	可选	0	排序: 0= 不限, 1= 综合排序, 2= 价格由低至高, 3= 价格由高至低
      is_free_postage: '', //Number	可选	0	是否包邮: 0 = 全部, 1= 包邮
      is_preferential: '', //Number	可选	0	是否特惠: 0 = 全部, 1= 特惠
      is_custom_made: '', //Number	可选	0	是否可定制: 0 = 全部, 1= 可定制
    },
    //
    // 优惠券的请求参数
    couponParams: {
      page: 1,
      per_page: 10,
      status: 1, // 优惠券状态 -1: 禁用；1：正常；2：已结束
      'type': '' // 是否满减活动 3、满减
    },
  },

  /**
   * 滑块最低价格
   */
  handleChangeMinPrice(e) {
    let minPrice = e.detail.lowValue
    if (this.data.params.max_price == -1) {
      if (minPrice == '不限') {
        minPrice = 800
      }
    }
    this.setData({
      ['params.min_price']: minPrice
    })

    if (this.data.leftTimer) {
      clearTimeout(this.data.leftTimer)
    }

    let _t = setTimeout(() => {
      this.products()
      this.setData({
        productList: []
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
      'params.min_price': 0,
      'params.max_price': -1,
      'params.cids': ''
    })
  },

  /**
   * 滑块最高价格
   */
  handleChangeMaxPrice(e) {
    console.log(e.detail.highValue)
    let maxPrice = e.detail.highValue
    if (maxPrice == '不限') {
      maxPrice = -1
    }
    this.setData({
      ['params.max_price']: maxPrice
    })

    if (this.data.rightTimer) {
      clearTimeout(this.data.rightTimer)
    }

    let _t = setTimeout(() => {
      this.products()
      this.setData({
        productList: []
      })
    }, 2000)

    this.setData({
      rightTimer: _t
    })
  },

  /**
   * 关闭弹窗回调
   */
  handleCloseFilterModal(e) {
    this.setData({
      showFilterModal: false
    })
  },

  /**
   * 分类列表
   */
  // getCategories() {
  //   http.fxGet(api.categories,{}, (result) => {
  //     console.log(result, '分类列表')
  //     if (result.success) {
  //       this.setData({
  //         categoryList: result.data.categories
  //       })
  //     } else {
  //       utils.fxShowToast(result.status.message)
  //     }
  //   })
  // },

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
      productList: [],
      'params.cids': _checkedCids.join(','),
      'params.page': 1
    })

    this.products()
  },

  /**
   * 选择推荐
   */
  handleToggleRecommendList(e) {
    console.log(e.currentTarget.dataset.index)
    let index = e.currentTarget.dataset.index
    let id = e.currentTarget.dataset.cid
    console.log(id)

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
        productList: [], // 商品列表
        ['params.is_free_postage']: this.data.params.is_free_postage == 0 ? 1 : 0
      })
    }

    if (id == 2) {
      this.setData({
        productList: [], // 商品列表
        ['params.is_preferential']: this.data.params.is_preferential == 0 ? 1 : 0
      })
    }

    if (id == 3) {
      this.setData({
        productList: [], // 商品列表
        ['params.is_custom_made']: this.data.params.is_custom_made == 0 ? 1 : 0
      })
    }

    this.products()
  },


  // 切换分类
  handleChangeCategory(e) {
    console.log(e.currentTarget.dataset.id)
    this.setData({
      categoryId: e.currentTarget.dataset.id
    })

    if (e.currentTarget.dataset.id == 2) {
      this.getArticle()
    }
  },

  // 跳转到商品详情---
  handleInfomation(e) {
    console.log(e)
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&product=' + this.data.myProduct + "&storeRid=" + e.detail.storeRid
    })
  },

  // 生活志愿详情
  handleLiveInfo(e) {
    let rid = e.currentTarget.dataset.rid

    if (e.currentTarget.dataset.type == 1) {
      wx.navigateTo({
        url: '../findInfo/findInfo?rid=' + rid + "&&category=" + e.currentTarget.dataset.category
      })
    }

    if (e.currentTarget.dataset.type == 2) {
      wx.navigateTo({
        url: '../plantNoteInfo/plantNoteInfo?rid=' + rid
      })
    }

  },

  // 打开排序的盒子
  handelOffPick() {
    this.setData({
      sortBox: true
    })
  },

  // 打开筛选的模态框
  handleSortShow() {
    // this.getCategories()

    this.setData({
      showFilterModal: true
    })

  },

  // 关闭排序的盒子
  handleSortOff() {
    this.setData({
      sortBox: false
    })
  },

  // 关闭筛选的模态框
  handelOffPickBox() {
    let animationOff = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })

    animationOff.top(10000).step()

    this.setData({
      openPickBox: animationOff.export()
    })

  },

  // 获取排序的产品
  handleSort(e) {

    this.setData({
      productList: [],
      ['params.page']: 1,
      ['params.sort_type']: e.currentTarget.dataset.rid
    })

    this.handleSortOff()
    this.products()
  },

  // 获取筛选
  handlePickProduct(e) {
    console.log(e)
    let rids = e.detail.category
    let minPrice = e.detail.minPrice
    let maxPrice = e.detail.maxPrice
    this.setData({
      productList: [],
      ['params.page']: e.detail.page ? e.detail.page : this.data.page,
      ['params.cids']: rids == undefined ? "" : rids.join(','),
      ['params.min_price']: minPrice,
      ['params.max_price']: maxPrice
    })

    this.products()
  },

  // 详情的盒子显示
  handleAnnouncementShow() {
    // announcementShow
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: "ease",
      delay: 0
    })
    animation.top(0).step()

    this.setData({
      announcementShow: animation
    })
  },

  // 关注店铺
  handelAddfollow() {

    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return false
    }

    http.fxPost(api.add_watch, {
      rid: this.data.storeRid
    }, (result) => {
      if (result.success) {

        this.setData({
          ['storeInfo.is_followed']: true
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 取消关注店铺
  handeldeleteFollow() {

    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return false
    }

    http.fxPost(api.delete_watch, {
      rid: this.data.storeRid
    }, (result) => {
      if (result.success) {

        this.setData({
          ['storeInfo.is_followed']: false
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 详情的盒子隐藏
  handleAnnouncementHidden() {
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: "ease",
      delay: 0
    })
    animation.top(10000).step()

    this.setData({
      announcementShow: animation
    })
  },

  // 跳转到品牌故事
  handelToBrandInfo(e) {

    wx.navigateTo({
      url: '../brandInformation/brandInformation?rid=' + e.currentTarget.dataset.rid
    })
  },

  // 关闭登陆框
  hanleOffLoginBox(e) {
    console.log(e)
    wx.showTabBar()
    this.setData({
      // is_mobile: e.detail.offBox
      is_mobile: false
    })
    app.globalData.isLogin = true
  },

  // 获取文章列表
  getArticle() {
    http.fxGet(api.core_platforms_life_records, this.data.liveParams, (result) => {
      console.log(result, "生活志文章列表")
      if (result.success) {

        let newData = this.data.wonderfulStories
        result.data.life_records.forEach((v) => {
          newData.push(v)
        })

        this.setData({
          liveIsNext: result.data.next,
          wonderfulStories: newData
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取店铺的商品列表 life_store_products
  products() {
    wx.showLoading()
    http.fxGet(api.life_store_products, this.data.params, (result) => {
      wx.hideLoading()
      console.log(result, "店铺商品列表")
      if (result.success) {
        let data = this.data.productList
        result.data.products.forEach((v) => {
          data.push(v)
        })

        this.setData({
          isNext: result.data.next,
          productList: data,
          totalCount: result.data.count
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
        setTimeout(() => {
          this.getCouponsByUser()
        }, 200)

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 用户登录优惠券
  getCouponsByUser() {
    console.log(this.data.storeRid, "原店铺的rid")

    http.fxGet(api.user_login_coupon, {
      store_rid: this.data.storeRid
    }, (result) => {
      console.log(result, '登陆的优惠券')

      result.data.coupons.forEach((v, i) => {
        v.user_coupon_start = utils.timestamp2string(v.start_date, "date")
        v.user_coupon_end = utils.timestamp2string(v.end_date, "date")
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
      store_rid: this.data.storeRid
    }, (result) => {
      console.log(result, '没有登陆获取优惠券')

      let coupon = [] // 优惠券
      let full = [] // 满减券

      if (result.success) {

        result.data.coupons.forEach((v, i) => {
          v.user_coupon_start = utils.timestamp2string(v.start_date, "date")
          v.user_coupon_end = utils.timestamp2string(v.end_date, "date")
        })

        if (e == "manjian") {
          // 登陆， 筛选满减
          result.data.coupons.forEach((v, i) => {
            console.log(v)
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
            console.log(v)
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


  // 获取店铺的信息 official_store/info categoryList
  getStoreInfo() {
    http.fxGet(api.official_store_info, {
      rid: this.data.storeRid
    }, (result) => {
      console.log(result, "店铺的详情")

      if (result.success) {
        let categoryList = []
        result.data.categories.forEach((v, i) => {
          let categoryItem = {}
          categoryItem.id = v[0]
          categoryItem.name = v[1]

          categoryList.push(categoryItem)
        })

        console.log(categoryList, '分类的信息')

        this.setData({
          categoryList: categoryList,
          ['titleCategoryList[0].num']: result.data.product_count,
          ['titleCategoryList[1].num']: result.data.life_record_count,
          storeInfo: result.data
        })

        if (!app.globalData.isLogin) {
          // 未登录
          this.getCoupons()
        } else {
          // 登陆
          this.getCouponsByUser()
          this.getCoupons("manjian")
        }

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取店铺公告---official_store_announcement
  getAnnouncement() {
    http.fxGet(api.official_store_announcement, {
      rid: this.data.storeRid
    }, (result) => {
      console.log(result, "店铺的公告")
      if (result.success) {
        result.data.delivery_date = utils.timestamp2string(result.data.delivery_date, "date") //发货时间
        result.data.end_date = utils.timestamp2string(result.data.end_date, "date") // 休馆结束
        result.data.begin_date = utils.timestamp2string(result.data.begin_date, "date") // 休馆开始

        this.setData({
          announcement: result.data
        })

      } else {
        utils.fxShowToast(result.status.message)
      }

    })
  },

  // 分享的品牌管图片
  getSharePhotoUrl(rid) {
    http.fxPost(api.market_share_store, {
      rid: rid
    }, (result) => {
      console.log(result, "分享品牌管图片的地址")
      if (result.success) {

        this.setData({
          shareBrandUrl: result.data.image_url
        })
      } else {

      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    this.setData({
      ['params.sid']: options.rid,
      storeRid: options.rid,
      ['liveParams.sid']: options.rid
    })

    this.getStoreInfo() // 店铺详情
    this.getAnnouncement() // 店铺的公告
    this.products() // 获取店铺的商品列表

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

    if (this.data.categoryId == 1) {
      if (!this.data.isNext) {
        utils.fxShowToast("没有更多商品了")
        return
      }

      this.setData({
        ['params.page']: this.data.params.page + 1
      })
      this.products()
    }


    if (this.data.categoryId == 2) {
      if (!this.data.liveIsNext) {
        utils.fxShowToast("没有更多了")
        return
      }

      this.setData({
        ['liveParams.page']: this.data.liveParams.page + 1
      })
      this.getArticle()
    }

  },

  // 优惠卷隐藏和显示
  coupon_show() {
    // handleGoIndex
    this.setData({
      coupon_show: true
    })
  },

  // 关闭优惠卷呼出框
  handleOffCouponTap() {
    this.setData({
      coupon_show: false
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getSharePhotoUrl(this.data.storeRid)
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
  onShareAppMessage: function() {
    // 分享小程序
    let title = this.data.storeInfo.name
    let imageUrl = this.data.shareBrandUrl

    let lastVisitLifeStoreRid = app.getDistributeLifeStoreRid()
    // scene格式：rid + '-' + sid
    let scene = this.data.storeRid
    if (lastVisitLifeStoreRid) {
      scene += '-' + lastVisitLifeStoreRid
    }
    console.log('pages/branderStore/branderStore?scene=' + scene, "分享的连接")
    return {
      title: title,
      path: 'pages/branderStore/branderStore?scene=' + scene + "&&rid=" + this.data.storeRid,
      imageUrl: imageUrl,
      success:(res) => {
       console.log("分享成功")
      }
    }
  },



})