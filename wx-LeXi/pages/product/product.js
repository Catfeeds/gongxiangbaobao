// pages/product/product.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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