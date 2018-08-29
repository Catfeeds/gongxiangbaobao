// pages/branderStoreList/branderStoreList.js
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
    seiperIndex:0, // 轮播图选中的点
    HighStoreList:[], // 精选品牌列表
    categoryId: 1, // 分类的id
    isNext:false, // 是否有下一页
    storeList:[], // 店铺的列表
    categoryList: [{
        name: "特色",
        num: 0,
        id: 1
      },
      {
        name: "精选",
        num: 0,
        id: 2
      }
    ],
    params: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
    }
  },

  // 切换分类
  handleChangeCategory(e) {
    console.log(e.currentTarget.dataset.id)
    this.setData({
      categoryId: e.currentTarget.dataset.id
    })

    if (e.currentTarget.dataset.id == 2) {
      this.getHighStore()
    }
  },

  // 轮播图发生改变
  handleChangeSwiper (e) {
    this.setData({
      seiperIndex: e.detail.current
    })
  },

  // 品牌馆 -- 特色
  getCharacteristicBranderStore() {
    wx.showLoading()
    http.fxGet(api.column_feature_store, this.data.params, (result) => {
      console.log(result, "特色品牌管")
      wx.hideLoading()
      if (result.success) {
        let data = this.data.storeList
        result.data.stores.forEach((v)=>{
          data.push(v)
        })

        this.setData({
          isNext: result.data.next,
          storeList:data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 品牌馆 -- 精选
  getHighStore() {
    http.fxGet(api.column_handpick_store, this.data.params, (result) => {
      console.log(result, "特色品牌管中的精选")
      if (result.success) {
        this.setData({
          HighStoreList:result.data
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
    this.getCharacteristicBranderStore()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.isNext){
      utils.fxShowToast("没有更多了")
      return
    }

    this.setData({
      ['params.page']: this.data.params.page + 1
    })

    this.getCharacteristicBranderStore()
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

  },
  // 跳转到品牌管详情
  handleTobrandStore(e) {
    wx.navigateTo({
      url: '../branderStore/branderStore?rid=' + e.currentTarget.dataset.rid,
    })
  },

  // 跳转到商品详情---
  handleInfomation(e) {
    console.log(e)
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&product=' + this.data.myProduct + "&storeRid=" + e.detail.storeRid
    })
  },

})