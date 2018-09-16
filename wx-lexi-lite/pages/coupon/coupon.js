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
    storeInfo: {}, // 店铺详情
    normalCouponList: [], // 可用红包 非官方
    exceedCouponList: [], // 不可用红包 非官方

    authorityNormalCouponList: [], // 官方的可用红包
    authorityExceedCouponList: [], // 官方的不可用红包
    useCouponList: [], // 已经使用的 
    red_bag: []
  },

  // 官方优惠券 红包列表 
  getRedBag() {
    http.fxGet(api.authority_coupon, {}, (result) => {
      console.log(result, '红包列表')

      if (result.success) {
        
        let normalCouponList = []
        let exceedCouponList = []
        let authorityNormalCouponList = []
        let authorityExceedCouponList = []

        result.data.coupons.forEach((v, i) => {

          v.start_time = utils.timestamp2string(v.start_at, 'date')
          v.end_time = utils.timestamp2string(v.expired_at, 'date')

          // 没有过期的非官方的优惠券 没有使用过的 
          if (v.type == 1 && !v.is_expired && !v.is_used) {
            normalCouponList.push(v)
          }

          // 过期的非官方的优惠券 使用过 
          if (v.type == 1 && v.is_expired && v.is_used) {
            exceedCouponList.push(v)
          }

          // 没有过期的官方优惠券
          if (v.type == 2 && !v.is_expired && !v.is_used) {
            authorityNormalCouponList.push(v)
          }

          // 过期的官方优惠券
          if (v.type == 2 && v.is_expired && v.is_used) {
            authorityExceedCouponList.push(v)
          }

          // 设置data
          if (result.data.coupons.length - 1 == i) {
            this.setData({
              normalCouponList: normalCouponList,
              exceedCouponList: exceedCouponList,
              authorityNormalCouponList: authorityNormalCouponList,
              authorityExceedCouponList: authorityExceedCouponList
            })
          }
        })
        console.log(this.data.normalCouponList)
      } else {
        utils.fxShowToast(result.status.message)
      }

    })
  },

  // 未使用// 已经过期 优惠券
  getUserCoupon(o = 'N01', v = 1, i = 10) {
    var params = {
      page: v, //Number	可选	1	当前页码
      per_page: i, //Number	可选	10	每页数量
      status: o, //String	可选	N01	N01: 未使用;N02: 已使用; N03: 已过期
    }

    let normalCouponList = this.data.normalCouponList // 未使用的 可用红包 非官方
    let exceedCouponList = this.data.exceedCouponList // 已经过期 不可用红包 非官方

    http.fxPost(api.user_coupons, params, (result) => {
      console.log(result.data, o)
      result.data.coupons.forEach((v, i) => {
        v.start_time = utils.timestamp2string(v.get_at, 'date')
        v.end_time = utils.timestamp2string(v.end_at, 'date')

        if (o == 'N01') {
          console.log(v,"1")
          this.setData({
            normalCouponList: normalCouponList.push(v)
          })
        }

        if (o == 'N02' || o == 'N03') {
          this.setData({
            useCouponList: exceedCouponList.push(v)
          })
        }

        if (result.data.coupons.length-1 ==i){
          console.log(normalCouponList, exceedCouponList,"商家")
          this.setData({
            normalCouponList: normalCouponList,
            exceedCouponList: exceedCouponList
          })
        }
      })
    })
  },

  // 使用优惠券
  handleUseCouponTap(e) {
    console.log(e.currentTarget.dataset.rid)
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

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getUserCoupon() // N01: 未使用
    this.getUserCoupon('N02') // N02: 已使用
    this.getUserCoupon('N03') // N03: 已过期
    this.getRedBag() // 红包列表
    console.log(app.globalData.storeInfo)
    this.setData({
      storeInfo: app.globalData.storeInfo
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
  onShareAppMessage: function() {
    return app.shareLeXi()
  }
})