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
    normalCouponList: [], // 未使用的
    useCouponList: [], // 已经使用的
    exceedCouponList: [], // 已经过期
    red_bag:[]
  },
  // 红包列表 暂时隐藏
  getRedBag(){
    http.fxGet(api.red_bag,{},(result)=>{
      console.log(result,'红包列表')
      if(result.success){
        this.setData({
          red_bag: result.data
        })
      }else{

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
    http.fxPost(api.user_coupons, params, (result) => {
      console.log(result.data,o)
      result.data.coupons.forEach((v,i)=>{
        v.start_time=utils.timestamp2string(v.get_at,'date') 
        v.end_time = utils.timestamp2string(v.end_at,'date') 
      })
      if (o == 'N01') {
        this.setData({
          normalCouponList: result.data
        })
      }
      if (o == 'N02') {
        this.setData({
          useCouponList: result.data
        })
      }
      if (o == 'N03') {
        this.setData({
          exceedCouponList: result.data
        })
      }
    })
  },

  //乐喜优惠券
  getLxCoupon(){

  },
  // 使用优惠券
  handleUseCouponTap(e){
    console.log(e.currentTarget.dataset.rid)
    

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getUserCoupon() // N01: 未使用
    this.getUserCoupon('N02') // N02: 已使用
    this.getUserCoupon('N03') // N03: 已过期
    this.getRedBag()// 红包列表
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