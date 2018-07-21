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
    orderInfomation: [], // 订单参数---
    logisticsCompany: [], // 物流公司及模板信息---
    shoppingCart: [{}], //添加到购物车的内容产品内容
    coupon: false,
    couponList: [], // 所有的优惠券列表
    pickCoupon: [],//选择后每一项里面的优惠券列表
    pickCouponProductId:'',// 店铺的id
    is_coupon: true,//优惠券
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
  // receiveAddress() {
  //   var address = wx.getStorageSync('orderParams').address_rid
  //   console.log(address)
  //   http.fxGet(api.address_update.replace(/:rid/g, address), {}, (result) => {
  //     console.log(result)
  //     if (result.success) {
  //       this.setData({
  //         receiveAddress: result.data
  //       })
  //     } else {
  //       utils.fxShowToast(result.status.message)
  //     }
  //   })
  // },

  //获取默认的物流信息---
  // getLogistics() {
  //   var order = []
  //   var params = {
  //     address_rid: wx.getStorageSync('orderParams').address_rid,
  //     product_items: []
  //   }
  //   this.data.order.forEach((item, list) => {
  //     item.forEach((v, i) => {
  //       params.product_items.push({
  //         sku_rid: v.rid,
  //         quantity: v.needQuantity,
  //         freight_template_id: v.fid
  //       })
  //     })
  //     http.fxPost(api.cheapLogisitcs, params, (result) => {
  //       console.log(result)
  //       if (result.success) {
  //         //把所有的物流公司放到第一个
  //         item[0].logisticsCompany = result.data
  //         // 选择合适的模板单存放
  //         result.data.express_info.forEach((every, index) => {
  //           if (every.express.express_id == result.data.min_express) {
  //             item[0].n_ame = every.express.express_name
  //             item[0].firstLogisticsCompanyExpress_id = every.express.express_id
  //             item[0].firstLogisticsCompanyFreight = every.freight
  //             item[0].firstLogisticsCompanyMax_days = every.max_days
  //             item[0].firstLogisticsCompanyMin_days = every.min_days
  //           }
  //         })
  //       } else {
  //         utils.fxShowToast(result.status.message)
  //       }
  //     })
  //     order.push(item)
  //   })
  //   this.setData({
  //     order: order
  //   })
  //   console.log(this.data.order)
  // },

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

  //获取产品的详情---
  getOrderProdectInfo() {
    var skus = app.globalData.orderSkus
    var skusList = []
    var store_items = {}

    console.log(skus)

    Object.keys(skus.data).forEach((key) => {
      console.log(skus.data[key], key)
      
      store_items[key]={
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
        }
      })
      skusList.push(skus.data[key])
    })
    console.log(store_items)
    this.setData({
      order: skusList,// 订单页面渲染
      orderInfomation: store_items // 订单参数
    })

    console.log(this.data.order)
    console.log( this.data.orderInfomation)
    // skusList.forEach((item, list) => {
    //   item.forEach((v, i) => {
    //     params.product_items.push({
    //       sku_rid: v.rid,
    //       quantity: v.needQuantity,
    //       freight_template_id: v.fid
    //     })
    //   })

    //   http.fxPost(api.cheapLogisitcs, params, (result) => {
    //     console.log(result)
    //     if (result.success) {
    //       //把所有的物流公司放到第一个
    //       item[0].logisticsCompany = result.data
    //       // 选择合适的模板单存放
    //       result.data.express_info.forEach((every, index) => {
    //         if (every.express.express_id == result.data.min_express) {
    //           item[0].firstLogisticsCompanyName = every.express.express_name
    //           item[0].firstLogisticsCompanyExpress_id = every.express.express_id
    //           item[0].firstLogisticsCompanyFreight = every.freight
    //           item[0].firstLogisticsCompanyMax_days = every.max_days
    //           item[0].firstLogisticsCompanyMin_days = every.min_days
    //         }
    //       })
    //     } else {
    //       utils.fxShowToast(result.status.message)
    //     }
    //   })
    //   order.push(item)
    // })
    // console.log(order)
    // setTimeout(() => {
    //   this.setData({
    //     order: order
    //   })
    // }, 1000)
  },
  // 选择优惠券后
  radioChange(e){
    console.log(e)
    var params = JSON.parse(e.detail.value)
    console.log(params)
    
    console.log(this.data.orderInfomation[params.store_rid].coupon_price)
    this.setData({
      ['orderInfomation.'+ params.store_rid + '.coupon_price']: params.price,
      ['orderInfomation.' + params.store_rid + '.coupon_codes']: params.code
    })
    console.log(this.data.orderInfomation)
  },
  //优惠券弹框里面的内容
  couponTap(e) {
    console.log(this.data.couponList)
    console.log(e.currentTarget.dataset.order_rid)
    
    if (e.currentTarget.dataset.order_rid){
      var coupon = this.data.couponList[e.currentTarget.dataset.order_rid]
      coupon.forEach((v, i) => {
        v.get_at = utils.timestamp2string(v.get_at, 'date')
        v.end_at = utils.timestamp2string(v.end_at, 'date')
      })
      this.setData({
        pickCoupon: coupon,//选择的优惠券列表
        pickCouponProductId: e.currentTarget.dataset.order_rid// 优惠券店铺的id

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
    // let params = {
    //   store_rid: '', // String	必需	 	        当前店铺rid
    //   is_distribute: '', //Integer  可选          0    是否分销 0、否 1、是
    //   original_store_rid: '', //String    可选               原店铺rid
    //   coupon_codes: [], //Array	可选	 	优惠券码列表
    //   items:''
    //   //Array	必需	 	订单明细参数
    // }
    // let paramsItems={
    //   rid: '', //String	必需	 	sku
    //   quantity: 1, //Number	必需	1	购买数量
    //   express_id: '', //Integer	必需	 	物流公司ID
    //   warehouse_id: '', //Number	可选	 	发货的仓库ID
    // }
    // let outParams=[]
    // console.log(this.data.order)
    // this.data.order.forEach((v,i)=>{
    //   console.log(v,'每一项')
    //   params.store_rid = v[0].current_store_rid
    //   params.is_distribute = v[0].is_distribute
    //   params.original_store_rid = v[0].store_rid

    //   let items=[]
    //   v.forEach((item,list)=>{
    //     console.log(item)
    //     console.log(item.firstLogisticsCompanyExpress_id)
    //     paramsItems.rid = item.rid
    //     paramsItems.express_id = item.firstLogisticsCompanyExpress_id
    //     paramsItems.quantity = item.needQuantity
    //     items.push(paramsItems)
    //   })
    //   params.items = items
    //   outParams.push(params)
    // })
    // console.log(outParams)
    // console.log(wx.getStorageSync('orderParams'))
    // http.fxPost(api.order_create, wx.getStorageSync('orderParams'), (result) => {
    //   console.log(result)
    // })
    // wx.navigateTo({
    //   url: '../paymentSuccess/paymentSuccess',
    // })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getOrderProdectInfo() // 获取订单详情
    this.GetcouponList() // 获取优惠券
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
    console.log(e.currentTarget.dataset.index)
    console.log(e.currentTarget.dataset.templet)
    app.globalData.logisticsMould = e.currentTarget.dataset.templet
    setTimeout(() => {
      wx.navigateTo({
        url: '../pickLogistics/pickLogistics?index=' + e.currentTarget.dataset.index,
      })
    }, 1000)

  },

})