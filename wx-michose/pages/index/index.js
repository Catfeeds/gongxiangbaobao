//index.js
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')

//获取应用实例
const app = getApp()

Page({
  data: {
    search_position: true,
    indicatorDots: false,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    // 轮换图
    swiperCurrent: 1,
    indexSlides: [],
    indexSlideCount: 0,
    // 优惠券
    couponList: [],
    // 最新产品集
    newestProducts: [],
    // 精选品牌集
    selectedBrands: [],
    // 专题活动
    eventTopics: [],
    granted: 'granted',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  onLoad: function (options) {
    // 设置转发
    wx.showShareMenu({
      withShareTicket: true
    })

    // scene格式：customer_rid
    let scene = decodeURIComponent(options.scene)
    if (scene && scene != 'undefined') {
      wx.setStorageSync('customer_rid', scene)
    }

    // 获取幻灯列表
    this.getIndexSlides()
    // 精选品牌
    this.getSelectedBrands()
    // 专题活动
    this.getEventTopic()
    // 新品
    this.getNewestProducts()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 登录后请求
    if (app.globalData.isLogin) {
      // 红包
      this.getCouponList()
    }
  },

  /**
   * 查看轮换图链接
   */
  handleSlideTap (e) {
    let xtype = e.currentTarget.dataset.type
    let rid = e.currentTarget.dataset.id
    let title = e.currentTarget.dataset.title

    if (xtype == 2) {  // 商品
      wx.navigateTo({
        url: '../product/product?rid=' + rid + '&title=' + title
      })
    } else if (xtype == 3) {  // 分类
      wx.navigateTo({
        url: '../list/list?cid=' + rid + '&title=' + title
      })
    } else if (xtype == 4) {  // 品牌
      wx.navigateTo({
        url: '../brand/brand?rid=' + rid + '&title=' + title
      })
    } else {  // 未知
      // do nothing
    }
  },

  /**
   * 领取优惠券
   */
  handleGrantCoupon (e) {
    const that = this
    let rid = e.currentTarget.dataset.rid
    let params = {
      rid: rid
    }

    http.fxPost(api.coupon_grant, params, function (res) {
      if (res.success) {
        let tmpCouponList = that.data.couponList.map(function(item, key, ary) {
          if (item.code == rid) {
            item.received = true
          }
          return item
        })
        that.setData({
          couponList: tmpCouponList
        })

        wx.showToast({
          title: '领取成功'
        })
      }
    })
  },

  /**
   * 滑块变化
   */
  handleSwiperChange: function (e) {
    this.setData({
      swiperCurrent: e.detail.current + 1
    })
  },

  /**
   * 点击搜索
   */
  bindClickSearch () {
    wx.navigateTo({
      url: '../search/search',
    })
  },
  
  /**
   * 查看产品
   */
  bindProductTap (options) {
    wx.navigateTo({
      url: '../product/product?rid=' + options.detail.rid + '&title=' + options.detail.title
    })
  },

  /**
   * 查看品牌
   */
  bindBrandTap (e) {
    wx.navigateTo({
      url: '../brand/brand?rid=' + e.detail.rid + '&title=' + e.detail.title
    })
  },

  /**
   * 获取红包列表
   */
  getCouponList () {
    const that = this
    let params = {}

    http.fxPost(api.coupons, params, function (result) {
      if (result.success) {
        that.setData({
          couponList: result.data.activity_coupons
        })
      }
    })
  },

  /**
   * 获取大图轮换
   */
  getIndexSlides () {
    const that = this
    const params = {
      spot: "wx_index_slide",
      per_page: 5
    };
    http.fxGet(api.slide_list, params, function (result) {
      if (result.success) {
        that.setData({
          indexSlides: result.data.slides,
          indexSlideCount: result.data.slides.length
        })
      }
    })
  },

  /**
   * 专题活动
   */
  getEventTopic () {
    const that = this
    const params = {
      spot: "wx_index_topic",
      per_page: 3
    };
    http.fxGet(api.slide_list, params, function (result) {
      if (result.success) {
        that.setData({
          eventTopics: result.data.slides
        })
      }
    })
  },

  /**
   * 新品上市
   */
  getNewestProducts() {
    const that = this;
    const params = {
      page: 1,
      per_page: 10
    };
    http.fxGet(api.latest_products, params, function (result) {
      if (result.success) {
        that.setData({
          newestProducts: result.data.products
        })
      }
    })
  },

  /**
   * 精选品牌
   */
  getSelectedBrands() {
    const that = this;
    const params = {
      page: 1,
      per_page: 8
    };
    http.fxGet(api.brand_list, params, function (result) {
      if (result.success) {
        that.setData({
          selectedBrands: result.data.brands
        })
      }
    })
  }
})