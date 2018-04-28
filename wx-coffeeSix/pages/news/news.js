// pages/news/news.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    news_info: [
      {id:1, title: "节日大降价通知", info: "XX产品大降价" }, 
      {id:2, title: "新品上架", info: "XX产品新品上架" }, 
      {id:3, title: "节日休息通知", info: "店铺休息" }
      ]

  },

  // 跳转
  catchtapTo:function(){
      wx.navigateTo({
        url: '',
        success: function(res) {},
        fail: function(res) {},
        complete: function(res) {},
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