// pages/receiveCoupon/receiveCoupon.js
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
    authorityCouponList: [], // 官方优惠券

    highBrandCouponList: [], // 精选品牌馆优惠券
    highBrandCouponParams: { // 精选品牌馆优惠券
      store_category: 0, //Number 必填 0 店铺分类id,0、 推荐
      page: 1, //Number 可选 1 当前页码
      per_page: 10, // Number 可选 10 每页数量
    },

    highProductCouponList: [], // 精选商品优惠券
    highProductCouponParams: {
      store_category: 0, //Number 必填 0 店铺分类id,0、 推荐
      page: 1, //Number 可选 1 当前页码
      per_page: 10, // Number 可选 10 每页数量
    },

    categoryCommonCoupon: [], // 分类列表的同享券
    commonCouponParams: {
      store_category: 0, //Number 必填 0 店铺分类id,0、 推荐
      page: 1, //Number 可选 1 当前页码
      per_page: 10, // Number 可选 10 每页数量
    },

    couponCtaegory: "common", // 分类优惠券的切换
    categoryCode: "recommend",
    category: [],
    is_mobile:false
  },

  // 切换优惠券的分类
  handleChangeCouponClass(e) {
    this.setData({
      couponCtaegory: e.currentTarget.dataset.code
    })

  },

  // 切换分类
  handleChangeCtaegory(e) {
    console.log(e.currentTarget.dataset)
    let code = e.currentTarget.dataset.code

    if (code!= 'recommend' && this.data.categoryCode != code) {
      this.setData({
        categoryCommonCoupon:[],
        'commonCouponParams.store_category': code,
        'commonCouponParams.page': 1
      })
      
      this.getCategoryCommonCouupon()
    }

    this.setData({
      categoryCode: code
    })

  },

  // 领取官方优惠
  handleReceiveAuthorityCoupon(e) {
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }

    console.log(e)
    let code = e.currentTarget.dataset.code
    let idx = e.currentTarget.dataset.idx
    console.log(this.data.authorityCouponList[idx])

    // 已经领取
    if (this.data.authorityCouponList[idx].is_grant) {
      wx.switchTab({
        url: '../index/index',
      })
    }

    // 没有领取
    if (!this.data.authorityCouponList[idx].is_grant && this.data.authorityCouponList[idx].surplus_count != 0) {
      http.fxPost(api.market_official_coupons_grant, {
        rid: code
      }, result => {
        console.log(result, "领取官方优惠券")
        if (result.success) {
          this.setData({
            ['authorityCouponList[' + idx + '].is_grant']: true
          })

          utils.fxShowToast("成功领取", "success")

        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    }

    // 无法领取
    if (!this.data.authorityCouponList[idx].is_grant && this.data.authorityCouponList[idx].surplus_count == 0) {
      utils.fxShowToast("亲！优惠券已经被领完")
    }
  },

  // 去品牌商店
  handleTobrandStore(e) {
    console.log(e)
    wx.navigateTo({
      url: '../branderStore/branderStore?rid=' + e.currentTarget.dataset.rid,
    })
  },

  // 去商品详情
  handleToProductInfo(e) {
    wx.navigateTo({
      url: '../product/product?rid=' + e.currentTarget.dataset.rid,
    })
  },

  // 关闭登陆框
  hanleOffLoginBox(e) {
    this.setData({
      // is_mobile: e.detail.offBox,
      is_mobile: false
    })
  },

  // 跳转到优惠券页面
  handleToCoupon(){
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }
    wx.navigateTo({
      url: '../coupon/coupon',
    })
  },

  // 获取分类列表的同享券优惠券
  getCategoryCommonCouupon() {
    http.fxGet(api.market_coupon_center_shared, this.data.commonCouponParams, result => {
      console.log(result, '分类列表的同享券')
      let data = this.data.categoryCommonCoupon
      if (result) {
        this.setData({
          categoryCommonCoupon: data.concat(result.data.coupons) 
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })

  },

  // 分类列表
  getCategory() {
    http.fxGet(api.categories, {}, (result) => {
      console.log(result, "fen lei")
      if (result.success) {
        this.setData({
          category: result.data.categories
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 精选品牌馆优惠券
  getHighBrandCoupon() {
    http.fxGet(api.market_coupon_center_shared, this.data.highBrandCouponParams, result => {
      console.log(result, '精选品牌馆优惠券')
      if (result) {
        this.setData({
          highBrandCouponList: result.data.coupons
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 精选商品券
  getHighProductCoupon() {
    http.fxGet(api.market_coupon_center_single, { ...this.data.highProductCouponParams,
      open_id: app.globalData.jwt.openid
    }, result => {
      console.log(result, '精选商品优惠券')
      if (result) {
        this.setData({
          highProductCouponList: result.data.coupons
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取官方优惠券
  getAuthorityCoupon() {
    http.fxGet(api.market_official_coupons_recommend, {
      open_id: app.globalData.jwt.openid
    }, result => {
      console.log(result, '官方优惠券')
      if (result.success) {

        this.setData({
          authorityCouponList: result.data.official_coupons
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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
    this.getCategory() // 分类
    this.getAuthorityCoupon() // 官方优惠券
    this.getHighBrandCoupon() // 精选品牌馆优惠券
    this.getHighProductCoupon() // 精选商品的优惠券
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
  onShareAppMessage: function() {

  }
})