// pages/cart/cart.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    falseheckbox: false,//falseheckbox---
    checkboxPick: [],//选中的物品---
    changeCart: false,//购物车是否编辑---
    shoppingCart: [{}],//添加到购物车的内容产品内容---
    payment: 0,//应该支付的总金额---
    //添加购物车和修改购买数量的时候参数
    addCartParams:{
      rid:'', //	商品Id
      quantity:1, // 1	购买数量
      option:'', // 其他选项
      open_id:'', //	独立小程序openid
    },
    // 心愿单的内容---
    thinkOrder: [{}],
  },
  // 获取购物车 ---
  getCartProduct() {
    http.fxGet(api.cart, {
      open_id: wx.getStorageSync('jwt').openid
    }, (result) => {
      console.log(result)
      if (result.success) {
        this.setData({
          shoppingCart: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  //  获取心愿单---
  getDesireOrder(){
    http.fxGet(api.wishlist,{},(result)=>{
      if (result.success){
        console.log(result)
        this.setData({
          thinkOrder:result.data
        })
      }else{
        utils.fxShowToast(result.status.message)
      }

    })
  },
  //心愿单添加到购物车
  addCartTap(e) {
    var select = e.currentTarget.dataset.rid
    var newThinkOrder = this.data.thinkOrder.filter((v, i) => {
      return select != v.id
    })
    var newCart = this.data.thinkOrder.filter((v, i) => {
      return select == v.id
    })
    this.setData({
      thinkOrder: newThinkOrder,
      shoppingCart: this.data.shoppingCart.concat(newCart)
    })
    this.paymentPrice()
  },

  //编辑按钮点击后左边的选择,赋值给data---
  checkboxChange(e) {
    console.log(e.detail.value)
    this.setData({
      checkboxPick: e.detail.value
    })
  },

  //当点击移除---
  clearCart() {
    http.fxPost(api.clearCart, { open_id: wx.getStorageSync("jwt").openid, rids: this.data.checkboxPick},(result)=>{
      if(result.success){
        console.log(result)
        this.getCartProduct()
      }else{
        utils.fxShowToast(result.status.message)
      }
    })
    //重新计算
    this.paymentPrice()
  },
  // 放入心愿单--
  addDesire(){
    http.fxPost(api.wishlist, { rids: this.data.checkboxPick},(result)=>{
      if(result.success){
        console.log(result)
        this.getDesireOrder()
        this.getCartProduct()
        this.paymentPrice()
      }else{
        utils.fxShowToast(result.status.message)
      }
    })
  },
  //购物车点击移除按钮和放入心愿单按钮---
  cartClearTap(e) {
    var cartAllInfo = []
    var btnType = e.currentTarget.dataset.type
    if (btnType == "clear") {
      this.clearCart()
    } else if (btnType == "addThink") {
      this.addDesire()
      
    }
  },
  //编辑按钮购物车---
  changeCartTap(e) {
    var status = e.currentTarget.dataset.change
    console.log(e.currentTarget.dataset.change)
    if (status == "start") {
      this.setData({
        changeCart: true
      })
    } else if (status == "over") {
      this.setData({
        changeCart: false
      })
    }
  },
  // 应该支付的总金额shoppingCart---
  paymentPrice() {
    this.setData({
      payment: 0
    })
    console.log(this.data.shoppingCart.items)
    this.data.shoppingCart.items.map((value, index) => {
      this.setData({
        payment: ((this.data.payment * 1000 + value.product.sale_price * value.quantity * 1000) / 1000).toFixed(2)
      })
    })
  },

  //增加数量或者减少数量---
  changeQuantity(e){
    console.log(e.currentTarget.dataset)
    var is_function = e.currentTarget.dataset.function
    var index = e.currentTarget.dataset.index
    var openid = wx.getStorageSync('jwt').openid
    var rid = e.currentTarget.dataset.rid
    this.setData({
      ['addCartParams.rid']: rid,
      ['addCartParams.open_id']: openid,
    })
    if (is_function =='add'){
      if (this.data.shoppingCart.items[index].quantity-0+1 > this.data.shoppingCart.items[index].product.stock_quantity){
        utils.fxShowToast('仓库中数量不足')
        return false
      }else{
        this.setData({
          ['addCartParams.quantity']: this.data.shoppingCart.items[index].quantity - 0 + 1,
        })
        this.putRenovateCart()
        this.setData({
          ['shoppingCart.items['+index+'].quantity']: this.data.shoppingCart.items[index].quantity-0+1
        })
      }
    } else if(is_function == 'subtract'){
      if (this.data.shoppingCart.items[index].quantity-1<0){
        utils.fxShowToast('不能倒贴的')
        return false
      }else{
        this.setData({
          ['addCartParams.quantity']: this.data.shoppingCart.items[index].quantity - 1,
        })
        this.putRenovateCart()
        this.setData({
          ['shoppingCart.items[' + index + '].quantity']: this.data.shoppingCart.items[index].quantity - 1
        })
      }
    }
  },
  //更新购物车---
  putRenovateCart(e){
    http.fxPut(api.cart, this.data.addCartParams,(result)=>{
      console.log(result)
      if(result.success){
      }else{
        utils.fxShowToast('添加失败')
        return
      }

    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getCartProduct() // 获取购物车商品
    this.getDesireOrder() // 获取心愿单
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
    //计算金额
    setTimeout(()=>{
      this.paymentPrice()
    },1000)
    
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
  //去首页
  indexTap() {
    wx.switchTab({
      url: '../index/index',
    })
  },
  //提示信息
  warn(title, content) {
    wx.showModal({
      title: title,
      content: content,
    })
  },
  //结算跳转
  chekoutTap() {
    wx.navigateTo({
      url: '../receiveAddress/receiveAddress',
    })
  }
})