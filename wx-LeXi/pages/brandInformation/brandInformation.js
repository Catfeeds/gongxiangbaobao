// pages/brandInformation/brandInformation.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

let wxparse = require('../../wxParse/wxParse.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    createdTime:[], // 开馆时间---
    storeInfo:[], // 店铺的信息---
    shopOwner:[], // 店铺主人的信息---
    isAuthentication: '',
    createdTime: '', // 开馆时间
    dkcontent:'',
  },

  getUserIdentityLabel (val) {
    switch (val) {
      case 1:
        return '独立设计师'
      case 2:
        return '艺术家'
      case 3:
        return '手作艺人'
      case 4:
        return '业余设计师'
      default:
        return '原创商户经营'
    }
  },

  // 获取店铺主人的信息
  getShopOwner() {
    http.fxGet(api.masterInfo, {}, (result) => {
      if (result.success) {
        console.log(result.data, '店铺主人信息')
        result.data.user_label = this.getUserIdentityLabel(result.data.user_identity)
        this.setData({
          shopOwner: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取店铺休息，和店铺主人的信息
  getAllInfo () {
    console.log(app.globalData.storeInfo)
    this.setData({
      storeInfo: app.globalData.storeInfo,
      isAuthentication: app.globalData.isAuthenticationStore,
      dkcontent: app.globalData.storeInfo.detail.content
    })
    this.getStoreCreatedTime()
  },

  // 开馆时间
  getStoreCreatedTime () {
    let createdTime = utils.timestamp2string(this.data.storeInfo.created_at, 'date')
    this.setData({
      createdTime: createdTime
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getShopOwner() // 店铺主人
    this.getAllInfo() // 获取店铺信息
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //处理数据
    wxparse.wxParse('dkcontent', 'html', this.data.dkcontent, this, 5)
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
    return common.shareLexi(app.globalData.storeInfo.name, app.globalData.shareBrandUrl)
  }
})