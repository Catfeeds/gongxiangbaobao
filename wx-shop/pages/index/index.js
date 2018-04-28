//index.js
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')

//获取应用实例
const app = getApp()

Page({
  data: {
    search_position: true,
    indicatorDots: true,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    // 轮换图
    indexSlides: [],
    // 优惠券
    couponList: [],
    // 最新产品集
    newestProducts: [],
    // 精选品牌集
    selectedBrands: [],
    // 推荐商品
    stickedProducts: [],
    granted: 'granted',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
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
      }
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
    // 新品
    this.getNewestProducts()
    // 精选品牌
    this.getSelectedBrands()
    // 推荐商品
    this.getStickedProducts()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 登录后请求
    if (app.isLogin) {
      // 红包
      this.getCouponList()
    }
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

  getIndexSlides () {
    const that = this
    const params = {
      spot: "wx_index_slide",
      per_page: 5
    };
    http.fxGet(api.slide_list, params, function (result) {
      if (result.success) {
        that.setData({
          indexSlides: result.data.slides
        })
      }
    })
  },

  /**
   * 精选商品
   */
  getStickedProducts () {
    const that = this;
    const params = {
      page: 1,
      per_page: 12
    };
    http.fxGet(api.sticked_products, params, function (result) {
      if (result.success) {
        that.setData({
          stickedProducts: result.data.products
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
      per_page: 4
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