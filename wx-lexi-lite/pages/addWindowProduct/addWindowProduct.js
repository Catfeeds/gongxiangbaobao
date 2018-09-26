// pages/addWindowProduct/addWindowProduct.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    toggleCode:"like",
    category:[
      {name:"喜欢",code:"like"},
      {name:"心愿单",code:"thinkOrder"},
      {name:"最近查看",code:"browse"}
    ]
  },

  // 切换分类
  handleToggleCategory(e){
    this.setData({
      toggleCode:e.currentTarget.dataset.code
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