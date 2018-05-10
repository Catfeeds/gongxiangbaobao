const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const util = require('./../../utils/util.js')

// 获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods_transport:1,//货物运输方式，是自提还是配送
    selectedAddress: {},
    products: [],
    timeIndex: 0,
    timedata: [
      '任意时间', 
      '周一到周五工作日', 
      '周六、周日'
    ],
    remark: '',
    // 优惠码
    couponCode: '',
    affiliateCode: '',
    totalCount: 0,
    // 1 微信支付
    paymentMode: 1,
    productAmount: 0,
    freight: 0,
    discountAmount: 0,
    // 可用优惠券说明
    usedCoupon: {},
    couponLabel: '',
    availableCoupons: [],
    seeCouponModal: false,
    // 合计
    totalAmount: 0
  },

// 配送方式1为外卖2为自提
  goods_transport_out:function(){
      this.setData({
        goods_transport: 1
      })
  },
  goods_transport_my:function(){
    this.setData({
      goods_transport: 2
    })
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      totalCount: app.globalData.checkedBuyItems.length,
      products: app.globalData.checkedBuyItems
    })

    this.updateOrderAmount()
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
    const that = this
    // 获取默认地址
    if (util.isEmptyObject(app.globalData.checkedDeliveryAddress)) {
      http.fxGet(api.address_default, {}, function (res) {
        console.log(res.data,77)
        if (res.success) {
          that.setData({
            selectedAddress: res.data
          })
        }
      })
    } else {
      this.setData({
        selectedAddress: app.globalData.checkedDeliveryAddress
      })
    }

    // 获取可用优惠券
    this.getAvailableCoupons()
  },

  /**
   * 获取用户可用红包
   */
  getAvailableCoupons () {
    const that = this
    let params = {
      pay_amount: this.data.totalAmount
    }

    http.fxPost(api.available_coupons, params, function (res) {
      if (res.success) {
        let availableCoupons = res.data.available_coupons

        // 修改时间格式
        if (availableCoupons.length) {
          let tmpBonus = availableCoupons.map(function (item, key, ary) {
            if (item.start_date) {
              item.start_date = util.timestamp2string(item.start_date, 'date')
            }
            if (item.end_date) {
              item.end_date = util.timestamp2string(item.end_date, 'date')
            }
            return item
          })
          availableCoupons = tmpBonus

          let maxCoupon = availableCoupons.filter(function (item) {
            if (item.max) {
              item.checked = true
              return item
            }
          })
          maxCoupon = maxCoupon[0]

          that.setData({
            usedCoupon: maxCoupon,
            couponCode: maxCoupon.code,
            discountAmount: maxCoupon.amount,
            couponLabel: availableCoupons.length + '张可用',
            availableCoupons: availableCoupons
          })

          that.updateOrderAmount()
        }

      }
    })
  },

  /**
   * 显示优惠券选择
   */
  showCouponModal () {
    this.setData({
      seeCouponModal: true
    })
  },

  /**
   * 隐藏优惠券选择
   */
  hideCouponModal () {
    this.setData({
      seeCouponModal: false
    })
  },

  /**
   * 选择优惠券
   */
  handleChooseCoupon (e) {
    let code = e.currentTarget.dataset.code

    let tmpCoupons = this.data.availableCoupons.map(function (item, key, ary) {
      if (item.code == code) {
        item.checked = true
      } else {
        item.checked = false
      }
      return item
    })

    let checkedCoupon = tmpCoupons.filter(function (item) {
      if (item.checked) {
        return item
      }
    })

    this.setData({
      usedCoupon: checkedCoupon[0],
      couponCode: checkedCoupon[0].code,
      discountAmount: checkedCoupon[0].amount,
      availableCoupons: tmpCoupons
    })
    
    this.updateOrderAmount()

    this.hideCouponModal()
  },

  /**
   * 更新订单金额
   */
  updateOrderAmount () {
    let productAmount = this.data.products.reduce(function (first, second) {
      if (second.product.sale_price > 0) {
        return first + second.product.sale_price * second.quantity
      } else {
        return first + second.product.price * second.quantity
      }
    }, 0);

    let totalAmount = productAmount + this.data.freight - this.data.discountAmount
    // 支付金额不能为负数
    if (totalAmount < 0) {
      totalAmount = 0.01
    }
    this.setData({
      productAmount: productAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2)
    })
  },

  /**
   * 提交并支付订单
   */
  handleCheckout (e) {
    const that = this
    // 添加自定义扩展信息
    let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
    let items = this.data.products.map(function (item, key, ary) {
      let deal_price = 0
      if (item.product.sale_price > 0) {
        deal_price = parseFloat(item.product.sale_price)
      } else {
        deal_price = parseFloat(item.product.price)
      }
      return {
        rid: item.rid,
        quantity: item.quantity,
        deal_price: deal_price,
        discount_amount: 0
      }
    })

    // 获取分销商代码
    let customerCode = wx.getStorageSync('customer_rid')

    let params = {
      storeId: extConfig.storeId,
      authAppid: extConfig.authAppid,
      address_rid: this.data.selectedAddress.rid,
      freight: this.data.freight,
      buyer_remark: this.data.remark,
      from_client: 1,
      customer_code: customerCode,
      affiliate_code: this.data.affiliateCode,
      coupon_code: this.data.couponCode,
      discount_amount: this.data.discountAmount,
      sync_pay: 1,
      items: items
    }

    console.log(params)

    http.fxPost(api.order_create, params, function (res) {
      if (res.success) {
        let currentOrder = res.data.order
        let payParams = res.data.pay_params
        
        if (!payParams || util.isEmptyObject(payParams)) {
          // 显示错误消息
          wx.showToast({
            title: '订单支付失败',
            icon: 'none',
            duration: 2000
          })
        } else {
          // 提交成功，发起支付
          app.wxpayOrder(currentOrder.rid, payParams, function () {
            // 跳转至详情
            wx.navigateTo({
              url: './../orderDetail/orderDetail?rid=' + currentOrder.rid,
            })
          })
        }
      } else {
        wx.showToast({
          title: res.status.message,
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  /**
   * 重新选择地址
   */
  handleChooseAddress (e) {
    wx.navigateTo({
      url: '../address/address?prev_ref=orderCheckout',
    })
  },

  /**
   * 编辑地址
   */
  handleEditAddress (e) {
    wx.navigateTo({
      url: '../address/address?prev_ref=orderCheckout',
    })
  },

  /**
   * 输入备注
   */
  handleRemarkInput (e) {
    this.setData({
      remark: e.detail.value
    })
  },

  /**
   * 选择送货时间
   */
  handleChangeTime (e) {
    this.setData({
      timeIndex: e.detail.value
    })
  },

  islastIndex(e) {
    console.log(e);
    return index + 1 == this.data.totalCount
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
  
  }
})