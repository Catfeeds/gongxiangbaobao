// pages/window/window.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
const common = require('./../../utils/common.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    categoryActive:'recommend',
    category:[{name:'关注',code:'follow'},{name:'推荐',code:'recommend'}],

    recommendWindow: {// 推荐橱窗的列表
      count:0,
      shop_windows:[1]
    }, 
    recommendWindowParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
    },

    followWindow: {// 关注橱窗的列表
      count: 0,
      shop_windows: [1]
    },
    followWindowParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
    },
  },

  // 切换橱窗
  handleToggleCategory(e){
    console.log(e)
    this.setData({
      categoryActive:e.currentTarget.dataset.code
    })
  },

  // 关注橱窗
  handleAddFollow(e){


  },

  // 取消关注橱窗
  handleDeleteFollow(){

  },

  // 去橱窗详情
  handleGoWindowDetail(e) {
    let windowRid = e.currentTarget.dataset.windowRid
    wx.navigateTo({
      url: '../windowDetail/windowDetail?windowRid=' + windowRid,
    })
  },

  // 去拼接橱窗
  handleGoAddWindow(){
    wx.navigateTo({
      url: '../addWindow/addWindow',
    })
  },

  // 获取橱窗列表
  getRecommendWindow() {
    http.fxGet(api.shop_windows_recommend, this.data.recommendWindowParams, result => {
      console.log(result, "获取橱窗列表")
      if (result.success) {
        this.setData({
          recommendWindow: result.data
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getRecommendWindow()
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
    return app.shareLeXi()
  }

})