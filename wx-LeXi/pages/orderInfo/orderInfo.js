// pages/orderInfo/orderInfo.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderInfomation:[], // 订单详情---
    logisticsCompany:[],// 物流公司及模板信息---
    coupon:false,
    o:[1,1,1,1,1],
    //优惠券
    is_coupon:true,
    //添加到购物车的内容产品内容
    shoppingCart: [
      {
        id: 6,
        title: "图像加载被中断",
        currentPrice: 500,
        originPrice: 999,
        logisticsExpenses: 0,//运费信息：0为没有运费用，包邮，其他为运费的价格
        is_like: true,//是否喜欢
        is_likeNumber: 66,//喜欢的人数
        shopName: "bbq_BBQ_123亲",//店铺名称
        shopingNumber: 1,//购买的数量
        img: "http://www.hzxznjs.com/uploads/160728/1-160HQ64603a7.jpg",
        color: "白色",
        repertoryNumber: 12,
        size: "M"
      },
    ],
    order:[1,2]
  },

  // 写死的物流模板
  logisiticsmoble(){
    var i = wx.getStorageSync('orderParams')
    i.store_items[0].items[0].express_id=7
    console.log(i)
    this.setData({
      orderInfomation:i
    })
  },

  //获取物流信息---
  getLogistics() {
    var logisticsId = wx.getStorageSync("logisticsIdFid")
    http.fxGet(api.logisitcs.replace(/:rid/, logisticsId),{},(result)=>{
      console.log(result)
      console.log(result.data.express_id)
      this.setData({
        logisticsCompany: result.data
      })
    })
  },
  
  // 获取订单详情---
  getOrderInfo() {
    var orderParams=wx.getStorageSync('orderParams')
    //获取地址
    http.fxGet(api.address_update.replace(/:rid/g, orderParams.address_rid),{},(result)=>{
      console.log(result,'地址信息')
    })
    //获取产品的详情
    http.fxGet(api.product_detail.replace(/:rid/g, orderParams.store_items[0].items[0].rid),{},(result)=>{
      console.log(result, "产品的详情")
    })
  },
  //
  couponTap(e){
    console.log()
    var i
    if (e.currentTarget.dataset.is_coupon==1){
      i=true
    }else{
      i=false
    }
    this.setData({
      coupon:i
    })
  },
  //支付,并跳转到支付成功页面---
  paymentSuccess() {
    console.log(this.data.orderInfomation)
    http.fxPost(api.order_create, this.data.orderInfomation,(result)=>{
      console.log(result)
    })
    // wx.navigateTo({
    //   url: '../paymentSuccess/paymentSuccess',
    // })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOrderInfo() // 获取去订单详情
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
    // this.getLogistics() //获取运费的模板
    this.logisiticsmoble() // 写死的运费模板
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  //选择其他物流
  otherLogisticsTap(){
    wx.navigateTo({
      url: '../pickLogistics/pickLogistics',
    })
  },

})