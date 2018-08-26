// pages/userLikeProduct/userLikeProduct.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 是否有下一页
    isNext: false,
    // 喜欢的列表
    likeProduct: [],
    // 获取商品的参数
    getProductParams: {
      page: 1,
      per_page: 10
    },
  },

  // 跳转到商品详情---
  handleInfomation(e) {
    console.log(e)
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&product=' + this.data.myProduct
    })
  },

  // 获取商品详情
  getUserLikeProduct() {
    http.fxGet(api.userlike, this.data.getProductParams, (result) => {
      console.log(result, "喜欢的商品列表")
      if (result.success) {
        let data = this.data.likeProduct
        result.data.products.forEach((v) => {
          data.push(v)
        })

        this.setData({
          likeProduct: data,
          isNext: result.data.next
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
    this.getUserLikeProduct()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

    //判断是否有下一页
    if (!this.data.isNext) {
      utils.fxShowToast("没有更多产品了")
      return
    }
    this.setData({
      ['getProductParams.page']: this.data.getProductParams.page - 0 + 1
    })
    //加载
    this.getUserLikeProduct()

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
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})