// pages/find/find.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
const adressData = wx.getStorageSync('allPlaces')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    youLike: [], // 猜你喜欢
    advertisement: [], // 广告
    wonderfulStories: [], // 精彩故事
  },

  // 生活志愿详情
  handleLiveInfo(e) {
    let rid = e.currentTarget.dataset.rid
    wx.navigateTo({
      url: '../findInfo/findInfo?rid=' + rid + "&&category=" + e.currentTarget.dataset.category
    })
  },

  //猜你喜欢
  getYouLike() {
    http.fxGet(api.life_records_guess_likes, {}, (result) => {
      console.log(result, "猜你喜欢")
      if (result.success) {
        this.setData({
          youLike: result.data
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 精彩故事
  getWonderfulStories() {
    http.fxGet(api.life_records_wonderful_stories, {}, (result) => {
      console.log(result, "精彩故事")
      if (result.success) {
        this.setData({
          wonderfulStories: result.data
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 生活志主题
  getLiveTheme() {
    http.fxGet(api.marketBanners.replace(/:rid/g, "discover_ad"), {}, (result) => {
      console.log(result, "发现的头部广告")
      if (result.success) {
        this.setData({
          advertisement: result.data
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })

  },

  // 头部广告
  getAdvertisement() {
    http.fxGet(api.marketBanners.replace(/:rid/g, "discover_ad"), {}, (result) => {
      console.log(result, "发现的头部广告")
      if (result.success) {
        this.setData({
          advertisement: result.data
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
    this.getAdvertisement() // 头部广告
    this.getYouLike() // 猜你喜欢
    this.getWonderfulStories() // 精彩故事
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