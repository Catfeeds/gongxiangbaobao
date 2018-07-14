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
    receiveAddress:[], // 收货地址---
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
    order:[1]
  },
  // 收货地址
  receiveAddress(){
    var address = wx.getStorageSync('orderParams').address_rid
    console.log(address)
    http.fxGet(api.address_update.replace(/:rid/g, address),{},(result)=>{
      console.log(result)
      if(result.success){
        this.setData({
          receiveAddress: result.data
        })
      }else{
        utils.fxShowToast(result.status.message)
      }
    })
  },

  //获取默认的物流信息---
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
  
  // //获取产品的详情---
  getOrderProdectInfo() {
    console.log(wx.getStorageSync('orderParams'))
    var orderParams=wx.getStorageSync('orderParams').store_items[0].items
    console.log(orderParams)
    var prductSkuArr=orderParams.map((v,i)=>{
      return v.rid
    })
    var prductSkustr=prductSkuArr.join(',')
    console.log(prductSkustr)
    //获取产品的详情
    http.fxGet(api.by_sku, { rid: prductSkustr },(result)=>{
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
    this.getOrderProdectInfo() // 获取订单详情
    this.receiveAddress()// 收货地址---
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
    
    this.getLogistics() //获取默认的运费模板
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