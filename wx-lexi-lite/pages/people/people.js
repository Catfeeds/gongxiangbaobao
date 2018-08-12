// pages/people/people.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

    classInfo: 1, // 切换---
    // 切换类型---
    classList: [{
      rid: 1,
      num: 0,
      name: "喜欢"
    },
    {
      rid: 2,
      num: 0,
      name: "收藏"
    },
    {
      rid: 3,
      num: 0,
      name: "设计馆"
    }
    ],
  },
  
  // 获取去别人的首页的关注
  getOtherFollow(){

  },

  // 获取别人的粉丝

getOtherFans(){

},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
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