// pages/search/search.js
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
    inputText: '', // 输入框的内容
    highQualityList: [] // 最近查看

  },

  // 优质新品
  getHighQuality() {
    http.fxGet(api.column_explore_new, {}, (result) => {
      console.log(result, "优质新品")
      if (result.success) {
        this.setData({
          highQualityList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 输入框输入信息
  handleInput(e) {
    console.log(e.detail.value)
    this.setData({
      inputText: e.detail.value
    })

  },

  // 关闭输入框
  handleDeleteInput() {
    this.setData({
      inputText: ''
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getHighQuality()
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

  },
  /**
   * 跳转商品详情
   */
  handleGoProduct(e) {
    let rid = e.currentTarget.dataset.rid
    wx.navigateTo({
      url: '/pages/product/product?rid=' + rid
    })
  },
})