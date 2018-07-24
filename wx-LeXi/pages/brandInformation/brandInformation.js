// pages/brandInformation/brandInformation.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    createdTime:[], // 开馆时间---
    storeInfo:[], // 店铺的信息---
    storeOwnerInfo:[], //店铺主人的信息---
  },
  //获取店铺休息，和店铺主人的信息
  getAllInfo(){
    this.setData({
      storeInfo: wx.getStorageSync('storeInfo'),
      storeOwnerInfo: wx.getStorageSync('storeOwnerInfo'),
      isAuthentication:app.globalData.isAuthenticationStore
    })
    this.getStoreCreatedTime()
    console.log(this.data.storeOwnerInfo)
  },
  //开馆时间
  getStoreCreatedTime(){
    var createdTime = utils.timestamp2string(this.data.storeInfo.created_at,'date')
    this.setData({
      createdTime: createdTime
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getAllInfo() // 获取店铺信息
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