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
  handleUtterance(e) {
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
    var logisticsId = wx.getStorageSync("logisticsIdFid")
    var order = []
    var params = {
      address_rid: wx.getStorageSync('orderParams').address_rid,
      product_items: []
    }

    this.data.order.forEach((item, list) => {
      item.forEach((v, i) => {
        params.product_items.push({
          sku_rid: v.rid,
          quantity: v.needQuantity,
          freight_template_id: v.fid
        })
      })
      http.fxPost(api.cheapLogisitcs, params, (result) => {
        console.log(result)
        if (result.success) {
          //把所有的物流公司放到第一个
          item[0].logisticsCompany = result.data
          // 选择合适的模板单存放
          result.data.express_info.forEach((every, index) => {
            if (every.express.express_id == result.data.min_express) {
              item[0].n_ame = every.express.express_name
              item[0].firstLogisticsCompanyExpress_id = every.express.express_id
              item[0].firstLogisticsCompanyFreight = every.freight
              item[0].firstLogisticsCompanyMax_days = every.max_days
              item[0].firstLogisticsCompanyMin_days = every.min_days
            }
          })
        } else {
          utils.fxShowToast(result.status.message)
        }
      })
      order.push(item)
    })
    this.setData({
      order: order
    })
    console.log(this.data.order)
  },

  //获取产品的详情---
  getOrderProdectInfo() {
    var skus = app.globalData.orderSkus
    var skusList = []
    var order = []

    var params = {
      address_rid: wx.getStorageSync('orderParams').address_rid,
      product_items: []
    }

    Object.keys(skus.data).forEach((key) => {
      console.log(skus.data[key])
      skusList.push(skus.data[key])
    })
    // console.log(skus, "产品的详情")
    // this.setData({
    //   order: skusList
    // })
    console.log(this.data.order)
    skusList.forEach((item, list) => {
      item.forEach((v, i) => {
        params.product_items.push({
          sku_rid: v.rid,
          quantity: v.needQuantity,
          freight_template_id: v.fid
        })
      })

      http.fxPost(api.cheapLogisitcs, params, (result) => {
        console.log(result)
        if (result.success) {
          //把所有的物流公司放到第一个
          item[0].logisticsCompany = result.data
          // 选择合适的模板单存放
          result.data.express_info.forEach((every, index) => {
            if (every.express.express_id == result.data.min_express) {
              item[0].firstLogisticsCompanyName = every.express.express_name
              item[0].firstLogisticsCompanyExpress_id = every.express.express_id
              item[0].firstLogisticsCompanyFreight = every.freight
              item[0].firstLogisticsCompanyMax_days = every.max_days
              item[0].firstLogisticsCompanyMin_days = every.min_days
            }
          })
        } else {
          utils.fxShowToast(result.status.message)
        }
      })
      order.push(item)
    })
    console.log(order)
    setTimeout(()=>{
      this.setData({
        order: order
      })
    },1000)
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
    http.fxPost(api.order_create, wx.getStorageSync('orderParams'), (result) => {
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
    console.log(e.currentTarget.dataset.index)
    console.log(e.currentTarget.dataset.templet)
    app.globalData.logisticsMould = e.currentTarget.dataset.templet
    setTimeout(()=>{
      wx.navigateTo({
        url: '../pickLogistics/pickLogistics?index=' + e.currentTarget.dataset.index,
      })
    },1000)

  },

})