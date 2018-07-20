// pages/product/product.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    skuPrice:'',// sku价格---
    couponList: '', // 优惠券列表---couponList
    fullSubtractionList: '', // 满减---
    isWatch:false, // 是否关注过店铺
    storeInfo: [], // 店铺的信息---
    needSpecifications: [], // 需要的规格---
    needColor: [], //需要的颜色---
    pickColor: [], // 所有的颜色---
    pickSpecifications: [], // 所有的规格---
    productInfomation: [], // 商品详情列表---
    rid: '', // 商品的rid---
    off_icon: false, //关闭按钮
    OffAnimationData: [], //关闭按钮动画
    animationData: [], //动画
    window_height: app.globalData.system.screenHeight * 2, // 屏幕的高度
    coupon_show: false,
    pick: false, //选择规格的盒子是否隐藏---
    ShopCartNum: [], //购物车的数量---
    newProductList: [], // 最新的商品列表---
    //最新产品的请求参数
    newProductParams: {
      page: 1,
      per_page: 10
    }
  },
  // 关闭优惠卷呼出框
  handleOffCouponTap(){
    this.setData({
      coupon_show:false
    })
  },
  
  // 领取优惠券
  getReceiveCoupon(e) {
    console.log(e.currentTarget.dataset.rid)
    http.fxPost(api.coupon_grant, { rid: e.currentTarget.dataset.rid }, (result) => {
      console.log(result)
      if (result.success) {
        utils.fxShowToast('领取成功','success')
        this.getCouponAndFullSubtraction()
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  // 优惠券，满减
  getCouponAndFullSubtraction(){
    this.setData({
      couponList: app.globalData.couponList, // 优惠券列表
      fullSubtractionList: app.globalData.fullSubtractionList, // 满减---
    })
  },
  // 增加浏览记录
  postAddBrowses(){
    http.fxPost(api.user_browses,{rid:this.data.rid},(result)=>{
      if(result.success){
      }else{
      }
    })
  },
  // 加入心愿单
  handleaddDesireTap() {
    http.fxPost(api.wishlist, {
      rids: [this.data.rid]
    }, (result) => {
      console.log(result)
      if (result.success) {
        utils.fxShowToast('成功添加', "success")
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  // 获取店铺信息
  getstoreInfo() {
    this.setData({
      storeInfo: app.globalData.storeInfo
    })
  },
  // 加入购物车盒子显示
  handleAddCartShow() {
    this.setData({
      pick: true
    })
  },
  // 加入购物车
  handleAddCart() {
    var rid
    if (this.data.needSpecifications == '' || this.data.needColor == '') {
      wx.showToast({
        title: '请选择',
        icon: 'none',
        duration: 1500
      })
      return
    }
    this.data.productInfomation.skus.forEach((v, i) => {
      if (v.mode == this.data.needSpecifications + ' ' + this.data.needColor) {
        rid = v.rid
        this.setOrderParamsProductId(v.rid) // 设置订单的商品id,sku---
      }
    })
    var addCartParams = {
      rid: '', //String	必填	 商品sku
      quantity: 1, //Integer	可选	1	购买数量
      option: '', //String	可选	 	其他选项
      open_id: '' //String	独立小程序端必填	 	独立小程序openid
    }
    addCartParams.open_id = wx.getStorageSync("jwt").openid
    addCartParams.rid = rid
    http.fxPost(api.cart, addCartParams, (result) => {
      if (result.success) {
        console.log(result)
        utils.fxShowToast('成功购物车')
        this.getShopCartNum()
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  // 获取购物车商品数
  getShopCartNum() {
    var params = {
      open_id: wx.getStorageSync("jwt").openid
    }
    http.fxGet(api.cart_item_count, params, (result) => {
      if (result.success) {
        console.log(result)
        this.setData({
          ShopCartNum: result.data.item_count
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  // 查找sku的价格
  getSkuPrice() {
    var sku = this.data.needSpecifications + " " + this.data.needColor
    console.log(sku, this.data.productInfomation )
    this.data.productInfomation.skus.forEach((v,i)=>{
      if (v.mode == sku){
        this.setData({
          skuPrice:v.price
        })
      }
    })
  },
  //点击规格按钮
  handleSpecificationsTap(e) {
    var newData = []
    var haveProduct = []
    var havespecifications = []
    if (!e.currentTarget.dataset.ispick) {
      wx.showToast({
        title: '亲！此商品库存不足',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    //改变按钮颜色
    this.data.pickSpecifications.forEach((v, i) => {
      this.setData({
        ['pickSpecifications[' + i + '].is_bg']: false
      })
      if (e.currentTarget.dataset.icon == v.name) {
        this.setData({
          ['pickSpecifications[' + i + '].is_bg']: true,
          needSpecifications: v.name
        })
      }
    })
    // 拼接颜色
    this.data.pickColor.forEach((v, i) => {
      newData.push(e.currentTarget.dataset.specificationsname + ' ' + v.name)
    })
    // 把拼接的颜色和后台发过来的数据做比较
    newData.forEach((v, i) => {
      this.data.productInfomation.skus.forEach((e, index) => {
        if (e.mode == v) {
          haveProduct.push(v)
        }
      })
    })
    // 把找到的颜色记录下来
    haveProduct.forEach((v, i) => {
      var newstring = v.split(' ')[1]
      havespecifications.push(newstring)
    })
    //去改变按钮颜色
    this.data.pickColor.forEach((v, i) => {
      if (havespecifications.indexOf(v.name) == -1) {
        this.setData({
          ["pickColor[" + i + "].disabled"]: false
        })
      } else {
        this.setData({
          ["pickColor[" + i + "].disabled"]: true
        })
      }
    })
    //查找价格
    this.getSkuPrice()
  },

  // 点击颜色按钮
  handlePickColor(e) {
    var newData = []
    var haveProduct = []
    var havespecifications = []
    if (!e.currentTarget.dataset.ispick) {
      wx.showToast({
        title: '亲！此商品库存不足',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    //改变按钮颜色
    this.data.pickColor.forEach((v, i) => {
      this.setData({
        ['pickColor[' + i + '].is_bg']: false
      })
      if (e.currentTarget.dataset.icon == v.name) {
        this.setData({
          ['pickColor[' + i + '].is_bg']: true,
          needColor: v.name
        })
      }
    })
    // 拼接规格
    this.data.pickSpecifications.forEach((v, i) => {
      newData.push(v.name + " " + e.currentTarget.dataset.colorname)
    })
    // 把拼接的规格和后台发过来的数据做比较
    newData.forEach((v, i) => {
      this.data.productInfomation.skus.forEach((e, index) => {
        if (e.mode == v) {
          haveProduct.push(v)
        }
      })
    })
    // 把找到的规格记录下来
    haveProduct.forEach((v, i) => {
      var newstring = v.split(' ')[0]
      havespecifications.push(newstring)
    })
    //去改变按钮颜色
    this.data.pickSpecifications.forEach((v, i) => {
      if (havespecifications.indexOf(v.name) == -1) {
        this.setData({
          ["pickSpecifications[" + i + "].disabled"]: false
        })
      } else {
        this.setData({
          ["pickSpecifications[" + i + "].disabled"]: true
        })
      }
    })
    //查找价格
    this.getSkuPrice()

  },
  // 过滤产品的颜色去重
  filterColor() {
    var newColor = []
    var colorTwo = []
    this.data.productInfomation.skus.forEach((v, i) => {
      if (newColor.indexOf(v.s_color) == -1) {
        newColor.push(v.s_color)
      }
    })
    newColor.forEach((v, i) => {
      colorTwo.push({
        name: v,
        disabled: true,
        is_bg: false
      })
    })
    this.setData({
      pickColor: colorTwo
    })
  },
  //过滤产品的型号
  filterSpecifications() {
    var newColor = []
    var colorTwo = []
    this.data.productInfomation.skus.forEach((v, i) => {
      if (newColor.indexOf(v.s_model) == -1) {
        newColor.push(v.s_model)
      }
    })
    newColor.forEach((v, i) => {
      colorTwo.push({
        name: v,
        disabled: true,
        is_bg: false
      })
    })
    this.setData({
      pickSpecifications: colorTwo
    })
  },
  // 获取商品详情
  getProductInfomation() {
    http.fxGet(api.product_detail.replace(/:rid/g, this.data.rid), {}, (result) => {
      if (result.success) {
        console.log(result)
        this.setData({
          productInfomation: result.data
        })
        wx.setStorageSync('logisticsIdFid', result.data.fid)
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  //选择规格的盒子隐藏
  handleSpecificationsHide() {
    this.setData({
      pick: false
    })
  },
  //选择规格的盒子显示
  pickShowTap() {
    this.setData({
      pick: true
    })
  },
  //选择规格的盒子隐藏
  pickHideTap() {
    this.setData({
      pick: false
    })
  },
  // 查看全部的盒子信息的盒子关闭
  animationOffFn() {
    this.animation.height("0").step()
    this.setData({
      animationData: this.animation.export(),
      off_icon: false
    })
  },
  // 查看全部的盒子信息的盒子打开
  animationOnFn() {
    this.animation.bottom(0 + "rpx").step()
    this.setData({
      animationData: this.animation.export(),
      off_icon: true
    })
  },
  // 设置订单参数的 商品的rid store_items.itemsrid = 
  setOrderParamsProductId(e) {
    var productId = wx.getStorageSync('orderParams')
    productId.store_items[0].items[0].rid = e
    console.log(productId)
    wx.setStorageSync('orderParams', productId)
  },
  //商品详情
  handleProductInfoTap(e) {
    wx.pageScrollTo({
      scrollTop: 0
    })
    this.setData({
      rid: e.currentTarget.dataset.rid
    })
    this.getProductInfomation() // 获取商品详情---
  },
  // 获取最新的商品
  getNewProduct() {
    http.fxGet(api.latest_products, this.data.newProductParams, (result) => {
      if (result.success) {
        console.log(result)
        this.setData({
          newProductList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
      console.log(result)
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options, product) {
    this.setData({
      rid: options.rid,
      isWatch: app.globalData.isWatchstore
    })

    this.getProductInfomation() // 获取商品详情---
    this.getCouponAndFullSubtraction() // 获取优惠券---
    this.getNewProduct() // 获取最新的商品---
    setTimeout(() => {
      this.filterColor() //过滤商品的颜色---
      this.filterSpecifications() //过滤产品的规格---
      this.postAddBrowses()// 增加浏览记录
    }, 1500)

    this.getShopCartNum() // 获取购物车商品数量---
    this.getstoreInfo() // 获取店铺信息---
    console.log(this.rid)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.animation = wx.createAnimation({
      transformOrigin: "bottom bottom",
      duration: 500,
      timingFunction: 'linear',
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    console.log(app.globalData.storeInfo)
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
  onShareAppMessage: function(res) {
    if (res.target.dataset.from == 3) {
      return {
        title: "转发的标题",
        path: '/pages/share/share',
        success: function (e) {
          console.log(e)
        },
        fail: function (e) {
          console.log(e)
        }
      }
    }
  },
  // 选好了按钮
  receiveOrderTap() {
    var rid
    if (this.data.needSpecifications == '' || this.data.needColor == '') {
      wx.showToast({
        title: '选择不完整',
        icon: 'none',
        duration: 1500
      })
      return
    }
    this.data.productInfomation.skus.forEach((v, i) => {
      if (v.mode == this.data.needSpecifications + ' ' + this.data.needColor) {
        rid = v.rid
        this.setOrderParamsProductId(v.rid) // 设置订单的商品id---
      }
    })
    wx.navigateTo({
      url: '../receiveAddress/receiveAddress?rid=' + rid,
    })
  },

  watchTap() {
    wx.navigateTo({
      url: '../watch/watch',
    })
  },
  //优惠卷隐藏和显示
  coupon_show() {
    // handleGoIndex
    this.setData({
      coupon_show: true
    })
  },
  // 回到首页
  handleGoIndex() {
    wx.navigateBack({
      delta: 1
    })
  },
  //跳转到购物车
  handleToCartTap() {
    console.log("cart")
    wx.switchTab({
      url: '../cart/cart',
    })
  }
})