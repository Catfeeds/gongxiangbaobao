//index.js
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabPisition: false,//tab是否定位
    catgory:[
      {name:"精品",rid:1},
      { name: "作品", rid: 2 },
      { name: "人气", rid: 3 }
    ],//分类
    catgoryActive:1//分类的选项

    
  },

  //分类选项的函数
  catgoryActiveTap(e){
    console.log(e.currentTarget.dataset.rid)
    this.setData({
      catgoryActive:e.currentTarget.dataset.rid
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
//监听页面的滚动
  onPageScroll:function(e){
  console.log(e)
  if (e.scrollTop>=464){
    this.setData({
      tabPisition:true
    })
  } else if (e.scrollTop <464){
    this.setData({
      tabPisition: false
    })
  }
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

  //跳转到关于品牌页面
  brandInformationTap(){
    console.log(11)
    wx.navigateTo({
      url: '../brandInformation/brandInformation'
    })
  }

})