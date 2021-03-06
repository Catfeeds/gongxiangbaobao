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
    systemWidth: '', // 设备的宽度
    isLoading: true,
    isFirstOrder: false, // 是否属于首单
    storeOrAuthoritativeCouponPick: true, // true为选择了商家的优惠券，false为选择了官方优惠，2选1
    authoritativeCouponPrice: 0, // 官方优惠券折扣
    paymentBtn: false, // 支付按钮
    order: [], // 所有的订单信息---
    itemOrderLogisticsPrice: {}, // 每笔订单运费
    receiveAddress: [], // 收货地址---
    orderInfomation: [], // 订单参数---
    logisticsCompany: [], // 物流公司及模板信息---
    shoppingCart: [{}], // 添加到购物车的内容产品内容

    authorityCouponShow: false, // 官方优惠券模态框
    authorityCouponList: [], // 官方优惠券列表
    coupon: false,
    couponList: [], // 所有的优惠券列表
    pickCoupon: [], // 选择后每一项里面的优惠券列表
    pickCouponProductId: '', // 店铺的id
    is_coupon: true, // 优惠券
    fullReductionParams: '', // 满减活动的参数
    fullReductionList: '', // 满减活动列表

    // 店铺信息
    storeInfo: '',

    // 页面的订单明细
    pageOrderInfo: {
      firstPrice: 0, // 小计
      logisticsPrice: 0, // 配送
      firstOrderPrice: 0, // 首单优惠
      fullSubtraction: 0, // 满减
      couponPrice: 0, // 优惠券
      alstPrice: 0, // 订单总计
    },
  },

  // 获取店铺的详情
  getStoreInfo() {
    this.setData({
      storeInfo: app.globalData.storeInfo
    })
  },

  // 获取是否属于首单
  getIsFirstOrder() {
    http.fxGet(api.is_first_order, {}, (result) => {
      if (result.success) {
        utils.logger(result.data, '是否属于首单')
        this.setData({
          isFirstOrder: result.data.is_new_user

        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取收货地址
  getReceiveAddress() {
    http.fxGet(api.address_info.replace(/:rid/g, app.globalData.orderParams.address_rid), {}, (result) => {
      utils.logger(result, '获取收货地址')
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

  // 订单总计isFirstOrder
  orderLastPrice() {
    var lastPrice = (this.data.pageOrderInfo.firstPrice * 1000 - this.data.pageOrderInfo.fullSubtraction * 1000 - this.data.pageOrderInfo.couponPrice * 1000 + this.data.pageOrderInfo.logisticsPrice * 1000) / 1000

    if (this.data.isFirstOrder) {
      this.setData({
        ['pageOrderInfo.firstOrderPrice']: (lastPrice * 0.1).toFixed(2)
      })
      lastPrice = lastPrice * 0.9
    }

    this.setData({
      ['pageOrderInfo.alstPrice']: lastPrice.toFixed(2)
    })
  },

  // 首单优惠
  getFirst() {
    http.fxPost(api.first_order_reduction, {
      pay_amount: this.data.pageOrderInfo.firstPrice
    }, (result) => {
      utils.logger(result, '首单优惠')
      if (result) {
        this.setData({
          ['pageOrderInfo.firstOrderPrice']: result.data.discount_amount.toFixed(2)
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
    utils.logger(items)

    setTimeout(() => {
      http.fxPost(api.full_reduction, {
        items: items
      }, (result) => {
        utils.logger(result, '满减金额')
        if (result.success) {

          let fullSubtractionPrice = 0

          // 计算满减的总共金额
          Object.keys(result.data).forEach((key) => {
            if (result.data[key].length != 0 && result.data[key].length != undefined && result.data[key].length != 'undefined') {
              fullSubtractionPrice = fullSubtractionPrice + result.data[key].amount
            }
          })

          this.setData({
            fullReductionList: result.data,
            ['pageOrderInfo.fullSubtraction']: (fullSubtractionPrice - 0).toFixed(2)
          }, () => {
            this.orderLastPrice() // 订单总计
          })
          utils.logger(this.data.pageOrderInfo.fullSubtraction)
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
    utils.logger(products, "每个店铺")

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
      utils.logger(product, "获取优惠券需求的参数")
      if (result.success) {
        this.setData({
          couponList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 领取官方优惠券按钮后
  handleAuthoritativeCoupon(e) {
    app.globalData.orderParams.bonus_code = e.detail.value.code

    let item = this.data.orderInfomation
    Object.keys(item).forEach((key) => {
      utils.logger(item[key])
      item[key].coupon_codes = ''
    })

    utils.logger(this.data.orderInfomation, '选择后的优惠卷')

    let option = e.detail.value
    let coupon = JSON.parse(option)

    app.globalData.orderParams.bonus_code = coupon.code

    this.setData({
      orderInfomation: item,
      authoritativeCouponPrice: coupon.amount,
      storeOrAuthoritativeCouponPick: false,
      ['pageOrderInfo.couponPrice']: (coupon.amount - 0).toFixed(2)
    })

    this.orderLastPrice() // 计算最后金额
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

    utils.logger(params)

    setTimeout(() => {
      http.fxPost(api.calculate_logisitcs, params, (result) => {
        utils.logger(result)
        if (result.success) {
          let sum = 0
          Object.keys(result.data).forEach((key) => {
            sum = result.data[key] - 0 + sum
          })
          this.setData({
            paymentBtn: true,
            itemOrderLogisticsPrice: result.data,
            ['pageOrderInfo.logisticsPrice']: sum.toFixed(2)
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

    utils.logger(params)

    http.fxPost(api.logistics_product_express, {
      items: params
    }, (result) => {
      utils.logger(result, '获取运费模板')
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

    utils.logger(order)
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

    utils.logger(skus)

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
          express_id: '', //Integer	必需	 	物流公司ID
          warehouse_id: '', //Number	可选	 	发货的仓库ID
          sku_price: v.sale_price == 0 ? v.price : v.sale_price
        }
        let price = v.sale_price == 0 ? v.price : v.sale_price
        generalPrice = price * v.quantity + generalPrice
      })

      skusList.push(skus.data[key])
    })

    this.setData({
      order: skusList, // 订单页面渲染
      orderInfomation: store_items, // 订单参数
      ['pageOrderInfo.firstPrice']: generalPrice.toFixed(2)
    }, () => {
      this.getFullReduction() // 获取满减
      this.getCouponList() // 获取优惠券
      // this.getFirst() // 获取首单优惠
      this.getLogisticsCompanyList() // 获取物流公司的列表
      this.getAuthorityCoupon(generalPrice, skusList)
    })
  },

  // 选择优惠券后 店铺
  radioChange(e) {
    app.globalData.orderParams.bonus_code = ''
    let params = JSON.parse(e.detail.value)
    utils.logger(this.data.orderInfomation[params.store_rid].coupon_price)

    this.setData({
      storeOrAuthoritativeCouponPick: true,
      ['orderInfomation.' + params.store_rid + '.coupon_price']: params.price,
      ['orderInfomation.' + params.store_rid + '.coupon_codes']: params.code
    }, () => {
      let couponPriceSum = 0
      Object.keys(this.data.orderInfomation).forEach((key) => {
        couponPriceSum = this.data.orderInfomation[key].coupon_price - 0 + couponPriceSum
      })

      this.setData({
        ['pageOrderInfo.couponPrice']: couponPriceSum.toFixed(2)
      }, () => {
        this.orderLastPrice() // 计算最后金额
      })
    })

    utils.logger(this.data.orderInfomation, '选择后的优惠卷')
  },

  // 优惠券弹框里面的内容couponList
  couponTap(e) {
    if (e.currentTarget.dataset.order_rid) {
      let coupon = this.data.couponList[e.currentTarget.dataset.order_rid]
      coupon.forEach((v, i) => {
        v.start_time = utils.timestamp2string(v.get_at, 'date')
        v.end_time = utils.timestamp2string(v.end_at, 'date')
      })

      this.setData({
        pickCoupon: coupon, // 选择的优惠券列表
        pickCouponProductId: e.currentTarget.dataset.order_rid // 优惠券店铺的id
      })
    }

    utils.logger(this.data.couponList[e.currentTarget.dataset.order_rid])
    let couponStatus = this.data.couponList[e.currentTarget.dataset.order_rid]
    utils.logger(this.data.couponList, "优惠券")
    if (couponStatus != undefined && couponStatus.length == 0) {
      utils.fxShowToast('没有可用的优惠券')
      return
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

  // 获取官方优惠
  getAuthorityCoupon(e, order) {
    utils.logger(order)

    let skus = [] // 获得官方优惠券所需的sku
    order.forEach((item, index) => {
      item.forEach((only,i) => {
        skus.push(only.rid)

        // 循环结束发送请求
        if (order.length - 1 == index && item.length-1 == i) {
          // 获取官方的券
          http.fxPost(api.checkout_authority_couponList, {
            amount: e,
            sku: skus
          }, (result) => {
            utils.logger(result, '官方优惠券')

            if (result.success) {
              result.data.coupons.forEach((v, i) => {
                utils.logger(v)
                v.start_time = utils.timestamp2string(v.start_at, 'date')
                v.end_time = utils.timestamp2string(v.expired_at, 'date')

                // 设置data
                if (result.data.coupons.length - 1 == i) {
                  this.setData({
                    authorityCouponList: result.data
                  })
                }
              })

            } else {
              utils.fxShowToast(result.status.message)
            }
          })
        }

      })
    })
  },


  // 官方的优惠券
  handleAuthorityCoupon() {
    utils.logger(this.data.authorityCouponList)
    if (this.data.authorityCouponList.length == 0) {
      utils.fxShowToast('无优惠券可用')
      return
    }

    let optine = this.data.authorityCouponShow
    if (optine) {
      optine = false
    } else {
      optine = true
    }

    this.setData({
      authorityCouponShow: optine
    })
  },

  // 支付,并跳转到支付成功页面---
  paymentSuccess() {
    utils.logger(this.data.orderInfomation)
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

    const jwt = wx.getStorageSync('jwt')

    // 补充参数
    app.globalData.orderParams.authAppid = app.globalData.configInfo.authAppid
    app.globalData.orderParams.openid = jwt.openid
    app.globalData.orderParams.store_items = store_items

    http.fxPost(api.order_create, app.globalData.orderParams, (result) => {
      utils.logger(app.globalData.orderParams, "提交订单，向后端传参")
      utils.logger(result, '新增订单')
      if (result.success) {
        // 记录订单用在支付成功的页面
        app.globalData.paymentSuccessOrder = result.data

        let currentOrder = result.data.orders[0]

        // 如下单成功，返回支付参数为空，则跳转至订单列表
        if (Object.keys(result.data.pay_params).length == 0) {
          // 跳转至详情
          wx.redirectTo({
            url: './../order/order',
          })
        } else {
          app.wxpayOrder(currentOrder.rid, result.data.pay_params)
        }
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取屏幕宽度
  getSystemWidth() {
    this.setData({
      systemWidth: app.globalData.windowWidth
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getSystemWidth()
    this.getStoreInfo()
    this.getIsFirstOrder() // 查看是否属于首单
    this.getReceiveAddress() // 收货地址---
    this.loadOrder()
  },

  /**
   * 加载订单相关
   */
  loadOrder() {
    this.getOrderProdectInfo() // 获取订单详情
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let that = this
    setTimeout(() => {
      that.setData({
        isLoading: false
      })
    }, 350)
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
    return common.shareLexi(app.globalData.storeInfo.name, app.globalData.shareBrandUrl)
  },

  // 选择其他物流
  otherLogisticsTap(e) {
    app.globalData.logisticsMould = e.currentTarget.dataset.item.express
    app.globalData.pickLogistics = e.currentTarget.dataset.product

    wx.navigateTo({
      url: '../pickLogistics/pickLogistics?store_rid=' + e.currentTarget.dataset.store_rid + "&sku_rid=" + e.currentTarget.dataset.sku_rid
    })
  }

})