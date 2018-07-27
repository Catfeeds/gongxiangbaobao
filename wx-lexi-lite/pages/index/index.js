//index.js
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    
    pickCategory: 2,//选择分类
    //分类列表
    category:[
      {name:'生活馆',id:1},
      {name:'精选',id:2},
      {name:'探索',id:3}
    ]
  },
// 分类的选择
  handlePickCategory(e){
    this.setData({
      pickCategory: e.currentTarget.dataset.categoryId
    })
    console.log(e.currentTarget.dataset.categoryId)
  },

  //设置头部信息
  handleSetNavigationBar(e='首页',){
    wx.setNavigationBarTitle({
      title: e
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.handleSetNavigationBar('设计师何自然的品牌管')// 设置头部信息
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

  }
})