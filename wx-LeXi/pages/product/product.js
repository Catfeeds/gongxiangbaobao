// pages/product/product.js
let app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //关闭按钮
    off_icon:false,
    //关闭按钮动画
    OffAnimationData:[],
    //动画
    animationData:[],
    // 屏幕的高度
    window_height: app.globalData.system.screenHeight*2,
    coupon_show: false,
    //选择规格的盒子是否隐藏
    pick: false,
    swiper_infomation: [
      { img: "../../images/timg.jpg" },
      { img: "../../images/timg.jpg" },
      { img: "../../images/timg.jpg" },
    ]

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
  animationOffFn(){
    this.animation.height("0").step()
    this.setData({
      animationData: this.animation.export(),
      off_icon: false
    })
  },
    // 查看全部的盒子信息的盒子打开
  animationOnFn(){
    this.animation.bottom(0+"rpx").step()
    this.setData({
      animationData: this.animation.export(),
      off_icon:true
    })
    
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log()

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.animation = wx.createAnimation({
      transformOrigin:"bottom bottom",
      duration: 500,
      timingFunction: 'linear',
    })
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
  receiveOrderTap() {
    console.log(22)
    wx.switchTab({
      url: '../cart/cart',
    })
  },
  watchTap() {
    wx.navigateTo({
      url: '../watch/watch',
    })
  },
  //优惠卷隐藏和显示
  coupon_show() {
    this.setData({
      coupon_show: true
    })
  }
})