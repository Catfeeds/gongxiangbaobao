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
    itemOrderLogisticsPrice:{},// 每笔订单运费
    receiveAddress: [], // 收货地址---
    orderInfomation: [], // 订单参数---
    logisticsCompany: [], // 物流公司及模板信息---
    shoppingCart: [{}], //添加到购物车的内容产品内容
    coupon: false,
    couponList: [], // 所有的优惠券列表
    pickCoupon: [], //选择后每一项里面的优惠券列表
    pickCouponProductId: '', // 店铺的id
    is_coupon: true, //优惠券
    fullReductionParams: '', // 满减活动的参数
    fullReductionList: '', // 满减活动列表
    //页面的订单明细
    pageOrderInfo:{
      firstPrice:0,//小计
      logisticsPrice:0,//配送
      firstOrderPrice:0,//收单优惠
      fullSubtraction:0,//满减
      couponPrice:0,//优惠券
      alstPrice:0,//订单总计
    },
  },
  // 祝福y语录
  handleUtterance(e) {
    this.setData({
      ['orderInfomation.' + e.target.dataset.rid + '.blessing_utterance']: e.detail.value
    })
    console.log(this.data.orderInfomation)
  },
  // 给商家的注意事项
  handleGiveShop(e) {
    this.setData({
      ['orderInfomation.' + e.target.dataset.rid +'.buyer_remark']: e.detail.value
    })
    console.log(this.data.orderInfomation)
  },
  

  //订单总计
  orderLastPrice(){
    var lastPrice = this.data.pageOrderInfo.firstPrice - this.data.pageOrderInfo.logisticsPrice - this.data.pageOrderInfo.firstOrderPrice - this.data.pageOrderInfo.fullSubtraction - this.data.pageOrderInfo.couponPrice + this.data.pageOrderInfo.logisticsPrice
    this.setData({
      ['pageOrderInfo.alstPrice']: lastPrice
    })
  },

  //首单优惠
  getFirst(){
    http.fxPost(api.first_order_reduction, { pay_amount: this.data.pageOrderInfo.firstPrice},(result)=>{
      console.log(result)
      if(result){
        this.setData({
          ['pageOrderInfo.firstOrderPrice']:result.data.discount_amount
        },()=>{
          this.orderLastPrice()//订单总计
        })
      }else{
        utils.fxShowToast(result.status.message)
      }
    })
  },

  //获取满减
  getFullReduction() {
    console.log(this.data.skusList)
    console.log(this.data.orderInfomation)
    var params = this.data.orderInfomation
    var items = []
    Object.keys(params).forEach((key) => {
      var item = {
        rid: params[key].store_rid,
        sku_items: []
      }
      Object.keys(params[key].items).forEach((e) => {
        var i = {
          sku: params[key].items[e].rid,
          quantity: params[key].items[e].quantity
        }
        item.sku_items.push(i)
      })
      items.push(item)
    })
    //发送请求获取满减
    setTimeout(() => {
      http.fxPost(api.full_reduction, { items: items},(result)=>{
        console.log(items)
        console.log(result)
        if(result.success){
          var fullSubtractionPrice=0
          //计算满减的总共金额
          Object.keys(result.data).forEach((key)=>{
            console.log(result.data[key])
            fullSubtractionPrice = fullSubtractionPrice + result.data[key].amount
          })
          this.setData({
            fullReductionList:result.data,
            ['pageOrderInfo.fullSubtraction']:fullSubtractionPrice
          },()=>{
            this.orderLastPrice()//订单总计
          })
        }else{
          utils.fxShowToast(result.status.message)
        }
      })
    }, 1000)
  },

  // 获取优惠券
  GetcouponList(e) {
    var products = app.globalData.orderSkus
    var product = []
    Object.keys(products.data).forEach((key) => {
      console.log(products.data[key])
      var productItem = {
        rid: key, //String	必须	 	店铺rid
        sku_items: []
      }
      products.data[key].forEach((v, i) => {
        var sku = {
          sku: v.rid, //String	必须	 	sku
          quantity: v.quantity, //Integer	必须	 	数量
        }
        productItem.sku_items.push(sku)
      })
      product.push(productItem)
    })
    http.fxPost(api.order_info_page_coupon, {
      items: product
    }, (result) => {
      console.log(result)
      if (result.success) {
        this.setData({
          couponList: result.data
        })
        console.log(this.data.couponList)
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  // 获取运费
  getPrice(){
    console.log(this.data.orderInfomation)
    var order = this.data.orderInfomation
    var params={
      address_rid: wx.getStorageSync('orderParams').address_rid,
      items:[]
    }
    Object.keys(order).forEach((key)=>{
      console.log(key)
      var productsList={
        rid:key,
        sku_items:[]
      }

      Object.keys(order[key].items).forEach((e)=>{
        var skus={
          sku:e,
          quantity: order[key].items[e].quantity,
          express_id: order[key].items[e].express_id
        }
        productsList.sku_items.push(skus)
      }) 
      params.items.push(productsList)
    })
    console.log(params)
    setTimeout(()=>{
      http.fxPost(api.calculate_logisitcs, params,(result)=>{
        console.log(result)
        if(result.success){
          var sum = 0
          Object.keys(result.data).forEach((key)=>{
            sum = result.data[key] - 0 + sum
          })
          this.setData({
            itemOrderLogisticsPrice: result.data,
            ['pageOrderInfo.logisticsPrice']:sum
          },()=>{
            this.orderLastPrice()//计算总额
          })
        }else{
          utils.fxShowToast(result.status.message)
        }
      })
    },1000)



  },
  // 获取每件商品的物流公司列表logistics_product_express
  getLogisticsCompanyList(){
    var skus = app.globalData.orderSkus
    var params = []
    console.log(skus)
    Object.keys(skus.data).forEach((key)=>{
      var items={
        rid:key,
        sku_items:[]
      }
      skus.data[key].forEach((v,i)=>{
        var item = {
          sku: v.rid
        }
        items.sku_items.push(item)
      })
      params.push(items)
    })
    console.log(params)
    http.fxPost(api.logistics_product_express, { items: params},(result)=>{
      console.log(result)
      if(result.success){
        this.setData({
          logisticsCompany:result.data
        },()=>{
          this.handleLogisticsSetingOrder()
          // this.getLogisticsPrice()// 获取运费
        })
      }else{
        utils.fxShowToast(result.status.message)
      }

    })
  },
  //把选择的物流信息设置到订单参数里面
  handleLogisticsSetingOrder(){
    console.log(this.data.orderInfomation,'订单参数') 
    console.log(this.data.logisticsCompany,'物流模板')
    var order = this.data.orderInfomation
    var params = this.data.logisticsCompany
    Object.keys(params).forEach((key)=>{
      Object.keys(params[key]).forEach((e) => {
        console.log(order[key].items[e].express_id)
        console.log(params[key][e].express)
        // order[key][e].express_id = params[key][e]
        params[key][e].express.forEach((v,i)=>{
          if (v.is_default){
            order[key].items[e].express_id = v.express_id
          }
        })
      })
    })
    console.log(order)
    setTimeout(()=>{
      this.setData({
        orderInfomation: order
      },()=>{
        this.getPrice()
      })
      
    },1000)
  },
  //获取产品的详情---
  getOrderProdectInfo() {
    var skus = app.globalData.orderSkus
    var skusList = []
    var store_items = {}
    var generalPrice=0
    console.log(skus)

    Object.keys(skus.data).forEach((key) => {
      console.log(skus)
      store_items[key] = {
        store_rid: wx.getStorageSync('storeInfo').rid, //String	必需	 	当前店铺rid
        is_distribute: wx.getStorageSync('storeInfo').rid == key ? 0 : 1, //Integer	可选	0	是否分销 0、否 1、是
        original_store_rid: key, //String	可选	 	原店铺rid
        buyer_remark: '', //String	可选	 	买家备注
        blessing_utterance: '', //String	可选	 	买家寄语
        coupon_codes: '', //String	可选	 	优惠券码
        coupon_price: 0, //String  自定义 优惠券的金额
        items: {}, //Array	必需	 	订单明细参数
      }

      skus.data[key].forEach((v, i) => {
        store_items[key].items[v.rid] = {
          rid: v.rid, //String	必需	 	sku
          quantity: v.quantity, //Number	必需	1	购买数量
          express_id: "", //Integer	必需	 	物流公司ID
          warehouse_id: "", //Number	可选	 	发货的仓库ID
          sku_price: v.sale_price == 0 ? v.price : v.sale_price
        }
        var price = v.sale_price == 0 ? v.price : v.sale_price
        generalPrice = price * v.quantity + generalPrice
      })

      skusList.push(skus.data[key])
    })
    console.log(store_items)
    this.setData({
      order: skusList, // 订单页面渲染
      orderInfomation: store_items, // 订单参数
      ['pageOrderInfo.firstPrice']: generalPrice
    }, () => {
      this.getFullReduction() //获取满减
      this.GetcouponList() // 获取优惠券
      this.getFirst()//获取首单优惠
      this.getLogisticsCompanyList()// 获取物流公司的列表
    })

    console.log(this.data.order)
    console.log(this.data.orderInfomation)

  },
  // 选择优惠券后
  radioChange(e) {
    console.log(e)
    var params = JSON.parse(e.detail.value)
    console.log(params)
    console.log(this.data.orderInfomation[params.store_rid].coupon_price)
    this.setData({
      ['orderInfomation.' + params.store_rid + '.coupon_price']: params.price,
      ['orderInfomation.' + params.store_rid + '.coupon_codes']: params.code
    },()=>{
      var couponPriceSum = 0
      Object.keys(this.data.orderInfomation).forEach((key)=>{
        console.log(this.data.orderInfomation[key].coupon_price)
        couponPriceSum = this.data.orderInfomation[key].coupon_price - 0 + couponPriceSum
      })
      console.log(couponPriceSum)
      this.setData({
        ['pageOrderInfo.couponPrice']:couponPriceSum
      },()=>{
        this.orderLastPrice()// 计算最后金额
      })
      
    })
    console.log(this.data.orderInfomation)
  },
  //优惠券弹框里面的内容
  couponTap(e) {
    console.log(this.data.couponList)
    console.log(e.currentTarget.dataset.order_rid)
    if (e.currentTarget.dataset.order_rid) {
      var coupon = this.data.couponList[e.currentTarget.dataset.order_rid]
      coupon.forEach((v, i) => {
        v.get_at = utils.timestamp2string(v.get_at, 'date')
        v.end_at = utils.timestamp2string(v.end_at, 'date')
      })
      this.setData({
        pickCoupon: coupon, //选择的优惠券列表
        pickCouponProductId: e.currentTarget.dataset.order_rid // 优惠券店铺的id
      })
    }
    var i
    if (e.currentTarget.dataset.is_coupon == 1) {
      i = true
    } else {
      i = false
    }
    this.setData({
      coupon: i,

    })
  },
  //支付,并跳转到支付成功页面---
  paymentSuccess() {
 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getOrderProdectInfo() // 获取订单详情

    // this.receiveAddress() // 收货地址---
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
    console.log(e)
    console.log(e.currentTarget.dataset.store_rid)
    console.log(e.currentTarget.dataset.templet)
    console.log(e.currentTarget.dataset.product)
    app.globalData.logisticsMould = e.currentTarget.dataset.item.express
    app.globalData.pickLogistics = e.currentTarget.dataset.product
    setTimeout(() => {
      wx.navigateTo({
        url: '../pickLogistics/pickLogistics?store_rid=' + e.currentTarget.dataset.store_rid + "&&sku_rid=" + e.currentTarget.dataset.sku_rid,
      })
    }, 1000)
  },
})