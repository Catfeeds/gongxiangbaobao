// pages/critique/critique.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

    critique_catgry_list:[
      { name:"全部评价",rid:1},
      { name:"好评",rid:2},
      { name:"中评",rid:3},
      { name:"差评",rid:4},
      { name:"最新",rid:5},
      { name:"有图",rid:6}
    ],
    currentStatus:1
  
  },

// 选择查看评论
  handleStatus(e){
    this.setData({
      currentStatus: e.currentTarget.dataset.rid
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