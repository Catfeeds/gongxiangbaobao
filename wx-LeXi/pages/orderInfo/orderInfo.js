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
    order: [], // 所有的订单信息---
    receiveAddress: [], // 收货地址---
    orderInfomation: [], // 订单详情---
    logisticsCompany: [], // 物流公司及模板信息---

    coupon: false,
    o: [1, 1, 1, 1, 1],
    //优惠券
    is_coupon: true,
    //添加到购物车的内容产品内容
    shoppingCart: [{}, ],

  },
  // 祝福y语录
  handleUtterance(e){
    console.log(e.detail.value)
    var orderParams = wx.getStorageSync('orderParams')
    orderParams.blessing_utterance = e.detail.value
    wx.setStorageSync('orderParams', orderParams)
  },
  // 给商家的注意事项
  handleGiveShop(e) {
    var orderParams = wx.getStorageSync('orderParams')
    orderParams.buyer_remark = e.detail.value
    wx.setStorageSync('orderParams', orderParams)
  },
  // 收货地址
  receiveAddress() {
    var address = wx.getStorageSync('orderParams').address_rid
    console.log(address)
    http.fxGet(api.address_update.replace(/:rid/g, address), {}, (result) => {
      console.log(result)
      if (result.success) {
        this.setData({
          receiveAddress: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  //获取默认的物流信息---
  getLogistics() {
    // var logisticsId = wx.getStorageSync("logisticsIdFid")
    var params = {
      address_rid: wx.getStorageSync('orderParams').address_rid,
      product_items: []
    }
    this.data.order.forEach((v, i) => {
      params.product_items.push({
        sku_rid: v.rid,
        quantity: v.shopingQuantity,
        freight_template_id: v.fid
      })
    })
    console.log(params)
    http.fxPost(api.cheapLogisitcs, params, (result) => {
      // 三个运费模板
      console.log(result.data)
      app.globalData.logisticsMould = result.data
      result.data.express_info.forEach((v,i)=>{
        if (v.express.express_id == result.data.min_express){
          this.setData({
            logisticsCompany: v
          })
        }
      })
    })
  },

  //获取产品的详情---
  getOrderProdectInfo() {
    console.log(wx.getStorageSync('orderParams'))
    var orderParams = wx.getStorageSync('orderParams').store_items[0].items
    console.log(orderParams)
    var prductSkuArr = orderParams.map((v, i) => {
      return v.rid
    })
    var prductSkustr = prductSkuArr.join(',')
    console.log(prductSkustr)
    //获取sku的详情
    http.fxGet(api.by_sku, {
      rids: prductSkustr
    }, (result) => {
      var skuInfo = []
      var skuCode = []
      console.log(result, "产品的详情")

      if (result.success) {
        var orderParams = wx.getStorageSync('orderParams').store_items[0].items
        console.log(orderParams)
        orderParams.forEach((v, i) => {
          var rid = v.rid
          result.data[rid].shopingQuantity = v.quantity
        })
        console.log(result)
        //赋值页面
        Object.keys(result.data).forEach((key) => {
          skuInfo.push(result.data[key])
          skuCode.push(key)
        })
        this.setData({
          order: skuInfo
        })
        //sku 信息 给下一页用
        app.globalData.orderInfoSkus = skuInfo
        //调取默认的运费模板
        this.getLogistics()
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  //
  couponTap(e) {
    console.log()
    var i
    if (e.currentTarget.dataset.is_coupon == 1) {
      i = true
    } else {
      i = false
    }
    this.setData({
      coupon: i
    })
  },
  //支付,并跳转到支付成功页面---
  paymentSuccess() {
    console.log(wx.getStorageSync('orderParams'))
    http.fxPost(api.order_create, this.data.orderInfomation, (result) => {
      console.log(result)
    })
    // wx.navigateTo({
    //   url: '../paymentSuccess/paymentSuccess',
    // })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getOrderProdectInfo() // 获取订单详情
    this.receiveAddress() // 收货地址---
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

  },
  //选择其他物流
  otherLogisticsTap(e) {
    console.log(e.currentTarget.dataset.rid)
    wx.navigateTo({
      url: '../pickLogistics/pickLogistics',
    })
  },

})