// pages/coupon/coupon.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,

    normalCouponList: [], // 店铺的优惠券
    IsNextStore: false,
    storeCouponParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
      status: 'N01', //String	N01: 未使用; N02: 已使用; N03: 已过期
    },

    authorityNormalCouponList: [], // 官方的可用红包
    IsNextAuthority: false,
    authorityParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
    },

    exceedCouponList: [], // 过期优惠券
    exceedIsnext: false,
    exceedCouponParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
    },

    couponActive: 1,
    couponCategory: [{
        name: '品牌券',
        rid: 1
      },
      {
        name: '乐喜券',
        rid: 2
      },
      {
        name: '已失效',
        rid: 3
      }
    ]
  },

  // 官方优惠券 红包列表 
  getRedBag() {
    http.fxGet(api.authority_coupon, this.data.authorityParams, (result) => {
      console.log(result, '官方红包列表')
      if (result.success) {

        result.data.coupons.forEach((v, i) => {
          v.start_time = utils.timestamp2string(v.start_at, 'date')
          v.end_time = utils.timestamp2string(v.expired_at, 'date')
        })

        let couponData = this.data.authorityNormalCouponList
        this.setData({
          authorityNormalCouponList: couponData.concat(result.data.coupons),
          IsNextAuthority: result.data.next
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 未使用商家
  getUserCoupon() {
    http.fxPost(api.market_core_user_coupons, this.data.storeCouponParams, (result) => {
      console.log(result, '商家券')
      result.data.coupons.forEach((v, i) => {
        v.start_time = utils.timestamp2string(v.get_at, 'date')
        v.end_time = utils.timestamp2string(v.end_at, 'date')
      })

      let couponData = this.data.normalCouponList
      this.setData({
        normalCouponList: couponData.concat(result.data.coupons),
        IsNextStore: result.data.next
      })

    })
  },

  // 已经过期的优惠券
  getExceedTime() {
    http.fxGet(api.market_user_expired, this.data.exceedCouponParams, (result) => {
      console.log(result, '过期的优惠券')
      result.data.coupons.forEach((v, i) => {
        v.start_time = utils.timestamp2string(v.get_at, 'date')
        v.end_time = utils.timestamp2string(v.end_at, 'date')
      })

      let couponData = this.data.exceedCouponList
      this.setData({
        exceedCouponList: couponData.concat(result.data.coupons),
        exceedIsnext: result.data.next
      })

    })
  },

  // 切换分类优惠券
  handlePickCategory(e) {
    console.log(e.currentTarget.dataset.rid)
    this.setData({
      couponActive: e.currentTarget.dataset.rid
    })

  },

  // 使用优惠券
  handleUseCouponTap(e) {
    wx.switchTab({
      url: '../index/index',
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
    let that = this
    setTimeout(() => {
      that.setData({
        readyOver: true,
        isLoading: false
      })
    }, 350)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getUserCoupon() // N01: 未使用
    this.getRedBag() // 红包列表
    this.getExceedTime() // 过期的优惠券

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
    return app.shareLeXi()
  }

})