// pages/checkout/checkout.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

let isStartCompare = 0 // 当为2的时候开始比较

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isSubmiting: false, // 是否提交中

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

    //店铺信息
    storeInfo: '',

    // 页面的订单明细
    pageOrderInfo: {
      firstPrice: 0, //小计
      logisticsPrice: '', //配送
      firstOrderPrice: 0, //首单优惠
      fullSubtraction: 0, //满减
      couponPrice: 0, //优惠券
      alstPrice: 0, //订单总计
    },
  },

  // 提交表单
  handleSubmitInfo(e) {
    this.paymentSuccess(e.detail.formId)
  },

  // 祝福语录
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
      pay_amount: this.data.pageOrderInfo.firstPrice.toFixed(2)
    }, (result) => {
      utils.logger(result, '首单优惠')
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

  // 领取官方优惠券按钮后
  handleAuthoritativeCoupon(e) {
    utils.logger(this.data.orderInfomation, '订单参数')
    utils.logger(e.detail)

    let item = this.data.orderInfomation
    Object.keys(item).forEach((key) => {
      item[key].coupon_codes = ''
    })

    utils.logger(this.data.orderInfomation, '选择后的优惠卷')

    let option = e.detail.value
    let coupon = JSON.parse(option)
    let couponAmount = coupon.amount - 0
    app.globalData.orderParams.bonus_code = coupon.code

    // 重置选中
    let authorityCoupon = this.data.authorityCouponList
    authorityCoupon.coupons.forEach((v, index) => {
      if (index == coupon.index) {
        v.isActive = true
      } else {
        v.isActive = false
      }
    })

    this.setData({
      orderInfomation: item,
      authoritativeCouponPrice: couponAmount.toFixed(2),
      storeOrAuthoritativeCouponPick: false,
      ['pageOrderInfo.couponPrice']: (couponAmount - 0).toFixed(2),
      authorityCouponList: authorityCoupon
    })
    // this.handleAuthorityCoupon()
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

    setTimeout(() => {
      http.fxPost(api.calculate_logisitcs, params, (result) => {
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

  // 选择的物流信息设置到订单参数里 logisticsCompany
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

    setTimeout(() => {
      this.setData({
        orderInfomation: order
      }, () => {
        this.getFreight()
      })
    }, 800)
  },

  // 选择优惠券后 店铺
  radioChange(e) {
    app.globalData.orderParams.bonus_code = ''
    let params = JSON.parse(e.detail.value)
    utils.logger(this.data.orderInfomation[params.store_rid].coupon_price)

    let allStoreCouponList = this.data.couponList
    Object.keys(allStoreCouponList).forEach((key, index) => {

      if (key == params.store_rid) {
        allStoreCouponList[key].forEach((v, i) => {
          if (v.coupon.code == params.code) {
            v.isActive = true
          } else {
            v.isActive = false
          }
        })
      }

      if (Object.keys(allStoreCouponList).length - 1 == index) {
        this.setData({
          couponList: allStoreCouponList
        })

        this.handleActiveStoreCoupon()

        this.setData({
          storeOrAuthoritativeCouponPick: true,
        }, () => {
          this._handleCountPrice()
        })
      }
    })

  },

  // 优惠券弹框里面的内容couponList
  couponTap(e) {
    if (e.currentTarget.dataset.order_rid) {
      let coupon = this.data.couponList[e.currentTarget.dataset.order_rid]
      coupon.forEach((v, i) => {
        v.start_time = utils.timestamp2string(v.get_at, 'date')
        v.end_time = utils.timestamp2string(v.end_at, 'date')
      })
      utils.logger(e.currentTarget.dataset.order_rid, '店铺的orderRid')
      if (coupon.length == 0) {
        utils.fxShowToast('暂无优惠券可用')
        return
      }

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

  // 官方的优惠券
  handleAuthorityCoupon() {
    let option = this.data.authorityCouponShow
    if (this.data.authorityCouponList.coupons.length == 0) {
      utils.fxShowToast('暂无优惠券可用')
      return
    }

    if (option) {
      option = false
    } else {
      option = true
    }

    this.setData({
      authorityCouponShow: option
    })
  },

  // 不适用官方优惠券
  handleNoUseAuthorityCoupon() {
    let arrayData = this.data.authorityCouponList
    arrayData.coupons.forEach(v => {
      v.isActive = false
    })

    app.globalData.orderParams.bonus_code = ''
    this.setData({
      authoritativeCouponPrice: 0,
      storeOrAuthoritativeCouponPick: false,
      authorityCouponList: arrayData,
      'pageOrderInfo.couponPrice': 0
    })

    this.orderLastPrice() // 计算最后金额
  },

  // 不使用店铺
  handleNoUseStoreCoupon() {

    // 给每个优惠券加是否选中
    let objDada = this.data.couponList
    Object.keys(objDada).forEach(key => {
      if (objDada[key].length > 0) {
        objDada[key].forEach(v => {
          v.isActive = false
        })
      }
    })

    let item = this.data.orderInfomation
    Object.keys(item).forEach((key) => {
      item[key].coupon_codes = ''
      item[key].coupon_price = 0
    })

    this.setData({
      couponList: objDada,
      orderInfomation: item,
      'pageOrderInfo.couponPrice': 0,
      coupon: false,
    })

    this.orderLastPrice() // 计算最后金额
  },

  // 优惠券对比
  _handleCouponCompare() {

    isStartCompare += 1

    if (isStartCompare == 2) {
      let storeCoupon = this.data.couponList
      let officialCoupon = this.data.authorityCouponList
      utils.logger(storeCoupon, '店铺优惠券')
      utils.logger(officialCoupon, "官方优惠券")

      let storeCouponPrice = 0
      let officialCouponPrice = 0

      // 店铺优惠券合计金额
      Object.keys(storeCoupon).forEach((key) => {
        if (storeCoupon[key].length > 0) {
          storeCouponPrice += storeCoupon[key][0].coupon.amount
        }
      });

      // 最大的官方优惠券金额
      if (officialCoupon.coupons.length != 0) {
        officialCouponPrice = officialCoupon.coupons[0].amount
      }

      // 选择要用的优惠券
      this.setData({
        storeOrAuthoritativeCouponPick: storeCouponPrice >= officialCouponPrice
      })

      // 把比较设置为初始值
      isStartCompare = 0

      //如果选中的是店铺优惠券处理页面显示和字典
      if (this.data.storeOrAuthoritativeCouponPick) {
        // 给每个优惠券加是否选中
        let storeCoupon = this.data.couponList
        Object.keys(storeCoupon).forEach(key => {
          if (storeCoupon[key].length > 0) {
            storeCoupon[key][0].isActive = true
          }
        })

        // 处理默认选中后的订单拼接
        this.handleActiveStoreCoupon()
      }

      //如果选中的是官方优惠券处理字典
      if (!this.data.storeOrAuthoritativeCouponPick) {
        officialCoupon.coupons[0].isActive = true

        this.setData({
          authorityCouponList: officialCoupon
        })

        let event = {
          detail: {
            value: JSON.stringify({
              "code": officialCoupon.coupons[0].code,
              "amount": officialCoupon.coupons[0].amount,
              "min_amount": officialCoupon.coupons[0].min_amount
            })
          }
        }
        this.handleAuthoritativeCoupon(event)
      }
    }
  },

  // 处理店铺优惠券选中
  handleActiveStoreCoupon() {
    let orderParams = this.data.orderInfomation
    let coupon = this.data.couponList

    Object.keys(orderParams).forEach((key, index) => {
      Object.keys(coupon).forEach((item, one) => {
        if (key == item) {
          if (coupon[item].length != 0) {
            coupon[item].forEach(v => {
              if (v.isActive) {
                orderParams[key].coupon_price = v.coupon.amount
                orderParams[key].coupon_codes = v.coupon.code
              }
            })
          }
        }

        if (Object.keys(coupon).length - 1 == index) {
          this.setData({
            orderInfomation: orderParams,
            authoritativeCouponPrice: 0, // 把官方的制为0
            storeOrAuthoritativeCouponPick: true
          })

          this._handleCountPrice()
        }
      })
    })
  },

  // 选择官方优惠券后从新计算 页面顶部信息
  _handleCountPrice() {
    let couponPriceSum = 0
    Object.keys(this.data.orderInfomation).forEach((key) => {
      couponPriceSum = this.data.orderInfomation[key].coupon_price - 0 + couponPriceSum
    })

    this.setData({
      ['pageOrderInfo.couponPrice']: couponPriceSum - 0
    }, () => {
      this.orderLastPrice() // 计算最后金额
      utils.logger(app.globalData.orderParams.bonus_code)
    })
  },

  // 支付,并跳转到支付成功页面---
  paymentSuccess(formId) {

    // 改变按钮状态 预防对此点击
    this.setData({
      isSubmiting: true
    })

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
    const jwt = wx.getStorageSync('jwt')
    app.globalData.orderParams.openid = jwt.openid

    const lastStoreRid = wx.getStorageSync('lastVisitLifeStoreRid')
    if (lastStoreRid) { // 分销生活馆rid
      app.globalData.orderParams.last_store_rid = lastStoreRid
    }

    app.globalData.orderParams.authAppid = app.globalData.configInfo.authAppid
    app.globalData.orderParams.store_items = store_items

    http.fxPost(api.order_create, app.globalData.orderParams, (result) => {
      utils.logger(result, app.globalData.jwt.openid, '新增订单')
      if (result.success) {
        // 记录订单用在支付成功的页面
        app.globalData.paymentSuccessOrder = result.data

        // 清除下单过程相关全局变量
        app.cleanOrderGlobalData()

        let currentOrder = result.data.orders[0]

        app.wxpayOrder(result.data.order_rid, result.data.pay_params, formId)

        // 改变按钮状态 预防对此点击
        this.setData({
          isSubmiting: false
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取官方优惠券
  getAuthorityCoupon(e, order) {

    let skus = [] // 获得官方优惠券所需的sku
    order.forEach((item, index) => {
      item.forEach((only, i) => {
        skus.push(only.rid)

        // 循环结束发送请求
        if (order.length - 1 == index && item.length - 1 == i) {
          http.fxPost(api.checkout_authority_couponList, {
            amount: e,
            sku: Array.from(new Set(skus))
          }, (result) => {
            utils.logger(result, '官方优惠券')
            // 默认不选中
            if (result.success) {

              if (result.data.coupons.length != 0) {
                // 最后一个为补选中
                result.data.coupons[result.data.coupons.length] = {
                  amount: 0,
                  code: ''
                }
                // 设置为不可选中
                result.data.coupons.forEach(v => {
                  v.isActive = false
                })
                // 修改日期
                result.data.coupons.forEach((v, i) => {
                  v.start_time = utils.timestamp2string(v.start_at, 'date')
                  v.end_time = utils.timestamp2string(v.expired_at, 'date')
                })
              }

              this.setData({
                authorityCouponList: result.data
              })

              this._handleCouponCompare()
            } else {
              utils.fxShowToast(result.status.message)
            }
          })
        }
      })
    })
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

    http.fxPost(api.logistics_product_express, {
      items: params
    }, (result) => {
      utils.logger(result, '获取运费模板')
      if (result.success) {
        this.setData({
          logisticsCompany: result.data
        }, () => {
          this.handleLogisticsSetingOrder()
          // this.logisticsIsShow()
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // // 添加地址是否显示字段
  // logisticsIsShow() {
  //   let resultData = this.data.logisticsCompany
  //   let NewData = {}
  //   Object.keys(resultData).forEach((key, i) => {

  //     NewData[key] = this._handleExpress(resultData[key])
  //     if (Object.keys(resultData).length - 1 == i) {
  //       setTimeout(() => {
  //         this.setData({
  //           logisticsCompany: NewData
  //         })
  //       }, 1000)
  //     }
  //   })
  // },

  // // 处理物流模板
  // _handleExpress(e) {
  //   let event = e
  //   let arrayData = []
  //   let newObj = {}

  //   let promise = new Promise((ok, eror) => {
  //     Object.keys(event).forEach((key, index) => {
  //       event[key].sku_id = key
  //       arrayData.push(event[key])
  //       console.log(event[key])
  //       event[key].sort = event[key].fid.replace('Ft', '')
  //       event[key].sort = event[key].sort - 0

  //       // 排序
  //       if (Object.keys(event).length - 1 == index) {
  //         arrayData = arrayData.sort((a, b) => {
  //           return b.sort > a.sort
  //         })
  //         console.log(arrayData, '回调')
  //         ok()

  //       }
  //     })
  //   })

  //   promise.then(() => {

  //     arrayData.forEach((v, i) => {
  //       if (i + 1 != arrayData.length) {
  //         if (v.fid == arrayData[i + 1].fid) {
  //           v.isShow = false
  //         } else {
  //           v.isShow = true
  //         }
  //         arrayData[i + 1].isShow = true

  //       } else if (arrayData.length == 1) {
  //         v.isShow = true
  //       }
  //       newObj[v.sku_id] = v
  //     })

  //   })

  //   return newObj
  // },

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
        // 给每个优惠券加是否选中
        Object.keys(result.data).forEach(key => {
          if (result.data[key].length > 0) {
            result.data[key].forEach(v => {
              v.isActive = false
            })
          }

          if (result.data[key].length != 0) {
            result.data[key][result.data[key].length] = {
              coupon: {
                amount: 0,
                code: ''
              },
              isActive: false
            }
          }
        })

        this.setData({
          couponList: result.data
        })

        this._handleCouponCompare()
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
        let i = {
          sku: params[key].items[e].rid,
          quantity: params[key].items[e].quantity
        }
        item.sku_items.push(i)
      })

      items.push(item)
    })

    // 发送请求获取满减
    utils.logger(items)

    http.fxPost(api.full_reduction, {
      items: items
    }, (result) => {
      utils.logger(result, '满减金额')
      if (result.success) {
        let fullSubtractionPrice = 0

        // 计算满减的总共金额
        Object.keys(result.data).forEach((key) => {
          utils.logger(Object.keys(result.data[key]).length, "manjian")
          if (Object.keys(result.data[key]).length != 0) {
            fullSubtractionPrice = fullSubtractionPrice + result.data[key].amount
          }
        })

        this.setData({
          fullReductionList: result.data,
          'pageOrderInfo.fullSubtraction': (fullSubtractionPrice - 0).toFixed(2)
        }, () => {
          this.orderLastPrice() // 订单总计
        })

        utils.logger(this.data.pageOrderInfo.fullSubtraction)
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取产品的详情
  getOrderProductInfo() {
    let skus = app.globalData.orderSkus

    let skusList = []
    let store_items = {}
    let generalPrice = 0 // 合计

    Object.keys(skus.data).forEach((key) => {
      store_items[key] = {
        store_rid: key, // String	必需	 	当前店铺rid
        is_distribute: app.globalData.storeRid == key ? 0 : 1, // Integer	可选	0	是否分销 0、否 1、是
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
      // 排序商品
      skus.data[key] = skus.data[key].sort((a, b) => {
        return a.fid > b.fid
      })

      // 物流模板是否显示
      skus.data[key].forEach((v, i) => {
        // 如果商品数量大于1就去循环比较模板的fid是否一直
        if (skus.data[key].length > 1) {
          if (i + 1 != skus.data[key].length) {
            if (skus.data[key][i].fid == skus.data[key][i + 1].fid) {
              skus.data[key][i].is_wuliu_show = false
            } else {
              skus.data[key][i].is_wuliu_show = true
            }
            skus.data[key][i + 1].is_wuliu_show = true
          }
          // 如果商品数量是一个就直接赋值物流模板显示
        } else {
          skus.data[key][i].is_wuliu_show = true
        }

      })

      skusList.push(skus.data[key])
    })

    this.setData({
      order: skusList, // 订单页面渲染
      orderInfomation: store_items, // 订单参数
      'pageOrderInfo.firstPrice': generalPrice.toFixed(2)
    }, () => {
      this.getFullReduction() // 获取满减
      this.getCouponList() // 获取优惠券
      this.getLogisticsCompanyList() // 获取物流公司的列表
      this.getAuthorityCoupon(generalPrice, skusList)
    })
  },

  /**
   * 加载订单相关
   */
  loadOrder() {
    this.getOrderProductInfo() // 获取订单详情
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

  // 获取是否属于首单
  getIsFirstOrder() {
    http.fxGet(api.is_first_order, {}, (result) => {
      if (result.success) {
        utils.logger(result.data, "是否首单")
        this.setData({
          isFirstOrder: result.data.is_new_user
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取店铺的详情
  getStoreInfo() {
    this.setData({
      storeInfo: app.globalData.storeInfo
    })
    utils.logger(this.data.storeInfo, "店铺信息")
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 检测网络
    app.ckeckNetwork()

    const lastVisitLifeStoreRid = wx.getStorageSync('lastVisitLifeStoreRid')
    if (lastVisitLifeStoreRid) { // 如存在，直接放入
      app.globalData.orderParams.last_store_rid = lastVisitLifeStoreRid
    }

    this.getStoreInfo()
    this.getIsFirstOrder() // 查看是否属于首单
    this.getReceiveAddress() // 收货地址

    this.loadOrder()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let that = this
    setTimeout(() => {
      that.setData({
        readyOver: true,
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
    return app.shareLeXi()
  },

  // 选择其他物流
  otherLogisticsTap(e) {
    let fid = e.currentTarget.dataset.item.fid
    let arrayData = []
    app.globalData.logisticsMould = e.currentTarget.dataset.item.express

    e.currentTarget.dataset.product.forEach(v => {
      if (v.fid == fid) {
        arrayData.push(v)
      }
    })

    app.globalData.pickLogistics = arrayData

    wx.navigateTo({
      url: '../pickLogistics/pickLogistics?store_rid=' + e.currentTarget.dataset.store_rid + "&&sku_rid=" + e.currentTarget.dataset.sku_rid
    })
  },

  // 点击空
  handleTapNull() {

  }

})