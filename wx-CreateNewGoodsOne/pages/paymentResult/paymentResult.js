// pages/paymentResult/paymentResult.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    payment_info:[
      { title: "订单编号", explain:"128379873744689"},
      { title: "下单时间", explain: "2017.07.18" },
      { title: "支付方式", explain: "微信支付" },
      { title: "订单金额", explain: "￥69.00" },
    ]
  
  },
  
  //返回首页
  indexTap(){
    wx.switchTab({
      url: '../index/index',
    })
  },

  //订单页面
  orderTap(){
    wx.navigateTo({
      url: '../order/order',
    })
  },
  //支付失败重新支付
  againPayment(){
    wx.navigateBack({
      delta:1
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
  
  }
})