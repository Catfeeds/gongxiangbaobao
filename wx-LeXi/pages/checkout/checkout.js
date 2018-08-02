// pages/checkout/checkout.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    paymentBtn: false,// 支付按钮
    order: [], // 所有的订单信息---
    itemOrderLogisticsPrice: {}, // 每笔订单运费
    receiveAddress: [], // 收货地址---
    orderInfomation: [], // 订单参数---
    logisticsCompany: [], // 物流公司及模板信息---
    shoppingCart: [{}], // 添加到购物车的内容产品内容

    coupon: false,
    couponList: [], // 所有的优惠券列表
    pickCoupon: [], // 选择后每一项里面的优惠券列表
    pickCouponProductId: '', // 店铺的id
    is_coupon: true, // 优惠券
    fullReductionParams: '', // 满减活动的参数
    fullReductionList: '', // 满减活动列表

    // 页面的订单明细
    pageOrderInfo: {
      firstPrice: 0, //小计
      logisticsPrice: 0, //配送
      firstOrderPrice: 0, //收单优惠
      fullSubtraction: 0, //满减
      couponPrice: 0, //优惠券
      alstPrice: 0, //订单总计
    },
  },

  // 获取收货地址
  getReceiveAddress() {
    http.fxGet(api.address_info.replace(/:rid/g, app.globalData.orderParams.address_rid), {}, (result) => {
      console.log(result, '获取收货地址')
      if (result.success) {
        this.setData({
          receiveAddress: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 祝福y语录
  handleUtterance(e) {
    this.setData({
      ['orderInfomation.' + e.target.dataset.rid + '.blessing_utterance']: e.detail.value
    })
  },

  // 给商家的注意事项
  handleGiveShop(e) {
    this.setData({
      ['orderInfomation.' + e.target.dataset.rid + '.buyer_remark']: e.detail.value
    })
  },

  // 订单总计
  orderLastPrice() {
    var lastPrice = this.data.pageOrderInfo.firstPrice - this.data.pageOrderInfo.logisticsPrice - this.data.pageOrderInfo.firstOrderPrice - this.data.pageOrderInfo.fullSubtraction - this.data.pageOrderInfo.couponPrice + this.data.pageOrderInfo.logisticsPrice

    this.setData({
      ['pageOrderInfo.alstPrice']: lastPrice
    })
  },

  // 首单优惠
  getFirst() {
    http.fxPost(api.first_order_reduction, {
      pay_amount: this.data.pageOrderInfo.firstPrice
    }, (result) => {
      console.log(result, '首单优惠')
      if (result) {
        this.setData({
          ['pageOrderInfo.firstOrderPrice']: result.data.discount_amount
        }, () => {
          this.orderLastPrice() // 订单总计
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取满减
  getFullReduction() {
    let params = this.data.orderInfomation
    let items = []
    Object.keys(params).forEach((key) => {
      let item = {
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

    // 发送请求获取满减
    console.log(items)

    setTimeout(() => {
      http.fxPost(api.full_reduction, {
        items: items
      }, (result) => {
        console.log(items)
        console.log(result)
        if (result.success) {
          let fullSubtractionPrice = 0

          // 计算满减的总共金额
          Object.keys(result.data).forEach((key) => {
            if (result.data[key] == []) {
              fullSubtractionPrice = fullSubtractionPrice + result.data[key].amount
            }
          })

          this.setData({
            fullReductionList: result.data,
            ['pageOrderInfo.fullSubtraction']: fullSubtractionPrice
          }, () => {
            this.orderLastPrice() // 订单总计
          })
        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    }, 1000)
  },

  // 获取优惠券
  getCouponList(e) {
    let products = app.globalData.orderSkus
    let product = []

    Object.keys(products.data).forEach((key) => {
      let productItem = {
        rid: key, // String	必须	 	店铺rid
        sku_items: []
      }
      products.data[key].forEach((v, i) => {
        let sku = {
          sku: v.rid, // String	必须	 	sku
          quantity: v.quantity, // Integer	必须	 	数量
        }
        productItem.sku_items.push(sku)
      })

      product.push(productItem)
    })

    http.fxPost(api.order_info_page_coupon, {
      items: product
    }, (result) => {
      if (result.success) {
        this.setData({
          couponList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取运费
  getFreight() {
    let order = this.data.orderInfomation
    let params = {
      address_rid: app.globalData.orderParams.address_rid,
      items: []
    }

    Object.keys(order).forEach((key) => {
      let productsList = {
        rid: key,
        sku_items: []
      }

      Object.keys(order[key].items).forEach((e) => {
        let skus = {
          sku: e,
          quantity: order[key].items[e].quantity,
          express_id: order[key].items[e].express_id
        }
        productsList.sku_items.push(skus)
      })

      params.items.push(productsList)
    })

    console.log(params)
    setTimeout(() => {
      http.fxPost(api.calculate_logisitcs, params, (result) => {
        console.log(result)
        if (result.success) {
          let sum = 0
          Object.keys(result.data).forEach((key) => {
            sum = result.data[key] - 0 + sum
          })
          this.setData({
            paymentBtn: true,
            itemOrderLogisticsPrice: result.data,
            ['pageOrderInfo.logisticsPrice']: sum
          }, () => {
            this.orderLastPrice() //计算总额
          })
        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    }, 800)
  },

  // 获取每件商品的物流公司列表logistics_product_express
  getLogisticsCompanyList() {
    let skus = app.globalData.orderSkus
    let params = []

    Object.keys(skus.data).forEach((key) => {
      let items = {
        rid: key,
        sku_items: []
      }
      skus.data[key].forEach((v, i) => {
        let item = {
          sku: v.rid
        }
        items.sku_items.push(item)
      })
      params.push(items)
    })

    console.log(params)
    http.fxPost(api.logistics_product_express, {
      items: params
    }, (result) => {
      console.log(result)
      if (result.success) {
        this.setData({
          logisticsCompany: result.data
        }, () => {
          this.handleLogisticsSetingOrder()
          // this.getLogisticsPrice()// 获取运费
        })
      } else {
        utils.fxShowToast(result.status.message)
      }

    })
  },

  // 选择的物流信息设置到订单参数里
  handleLogisticsSetingOrder() {
    let order = this.data.orderInfomation
    let params = this.data.logisticsCompany

    Object.keys(params).forEach((key) => {
      Object.keys(params[key]).forEach((e) => {
        params[key][e].express.forEach((v, i) => {
          if (v.is_default) {
            order[key].items[e].express_id = v.express_id
          }
        })
      })
    })

    console.log(order)
    setTimeout(() => {
      this.setData({
        orderInfomation: order
      }, () => {
        this.getFreight()
      })
    }, 800)
  },

  // 获取产品的详情---
  getOrderProdectInfo() {
    let skus = app.globalData.orderSkus
    let skusList = []
    let store_items = {}
    let generalPrice = 0

    console.log(skus)

    Object.keys(skus.data).forEach((key) => {
      store_items[key] = {
        store_rid: app.globalData.storeRid, // String	必需	 	当前店铺rid
        is_distribute: app.globalData.storeRid == key ? 0 : 1, // Integer	可选	0	是否分销 0、否 1、是
        original_store_rid: key, // String	可选	 	原店铺rid
        buyer_remark: '', // String	可选	 	买家备注
        blessing_utterance: '', // String	可选	 	买家寄语
        coupon_codes: '', // String	可选	 	优惠券码
        coupon_price: 0, // String  自定义 优惠券的金额
        items: {} // Array	必需	 	订单明细参数
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
      this.getFullReduction() // 获取满减
      this.getCouponList() // 获取优惠券
      this.getFirst() // 获取首单优惠
      this.getLogisticsCompanyList() // 获取物流公司的列表
    })
  },

  // 选择优惠券后
  radioChange(e) {
    let params = JSON.parse(e.detail.value)
    console.log(this.data.orderInfomation[params.store_rid].coupon_price)
    this.setData({
      ['orderInfomation.' + params.store_rid + '.coupon_price']: params.price,
      ['orderInfomation.' + params.store_rid + '.coupon_codes']: params.code
    }, () => {
      let couponPriceSum = 0
      Object.keys(this.data.orderInfomation).forEach((key) => {
        couponPriceSum = this.data.orderInfomation[key].coupon_price - 0 + couponPriceSum
      })

      this.setData({
        ['pageOrderInfo.couponPrice']: couponPriceSum
      }, () => {
        this.orderLastPrice() // 计算最后金额
      })
    })
  },

  // 优惠券弹框里面的内容
  couponTap(e) {
    console.log(this.data.couponList)
    console.log(e.currentTarget.dataset.order_rid)
    if (e.currentTarget.dataset.order_rid) {
      let coupon = this.data.couponList[e.currentTarget.dataset.order_rid]
      coupon.forEach((v, i) => {
        v.get_at = utils.timestamp2string(v.get_at, 'date')
        v.end_at = utils.timestamp2string(v.end_at, 'date')
      })

      this.setData({
        pickCoupon: coupon, // 选择的优惠券列表
        pickCouponProductId: e.currentTarget.dataset.order_rid // 优惠券店铺的id
      })
    }

    let i
    if (e.currentTarget.dataset.is_coupon == 1) {
      i = true
    } else {
      i = false
    }

    this.setData({
      coupon: i,
    })
  },

  // 支付,并跳转到支付成功页面---
  paymentSuccess() {
    console.log(this.data.orderInfomation)
    let orderParams = this.data.orderInfomation
    let store_items = []

    Object.keys(orderParams).forEach((key) => {
      let store_item = {
        store_rid: orderParams[key].store_rid, // String	必需	 	当前店铺rid
        is_distribute: orderParams[key].is_distribute, // Integer	可选	0	是否分销 0、否 1、是
        original_store_rid: orderParams[key].original_store_rid, // String	可选	 	原店铺rid
        buyer_remark: orderParams[key].buyer_remark, // String	可选	 	买家备注
        blessing_utterance: orderParams[key].blessing_utterance, // String	可选	 	买家寄语
        coupon_codes: orderParams[key].coupon_codes, // String	可选	 	优惠券码
        items: [], // Array	必需	 	订单明细参数
      }

      Object.keys(orderParams[key].items).forEach((even) => {
        let sku = {
          rid: even, // String	必需	 	sku
          quantity: orderParams[key].items[even].quantity, // Number	必需	1	购买数量
          express_id: orderParams[key].items[even].express_id, // Integer	必需	 	物流公司ID
          warehouse_id: '' // Number	可选	 	发货的仓库ID
        }
        store_item.items.push(sku)
      })

      store_items.push(store_item)
    })

    // 补充参数
    app.globalData.orderParams.authAppid = app.globalData.configInfo.authAppid
    app.globalData.orderParams.openid = app.globalData.jwt.openid
    app.globalData.orderParams.store_items = store_items

    http.fxPost(api.order_create, app.globalData.orderParams, (result) => {
      console.log(result, '新增订单')
      if (result.success) {
        let currentOrder = result.data.orders[0]
        app.wxpayOrder(currentOrder.rid, result.data.pay_params)
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOrderProdectInfo() // 获取订单详情
    this.getReceiveAddress() // 收货地址---
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

  // 选择其他物流
  otherLogisticsTap(e) {
    app.globalData.logisticsMould = e.currentTarget.dataset.item.express
    app.globalData.pickLogistics = e.currentTarget.dataset.product

    wx.navigateTo({
      url: '../pickLogistics/pickLogistics?store_rid=' + e.currentTarget.dataset.store_rid + "&&sku_rid=" + e.currentTarget.dataset.sku_rid
    })
  }

})