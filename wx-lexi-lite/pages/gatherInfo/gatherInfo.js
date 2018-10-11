// pages/gatherInfo/gatherInfo.js
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
    isLoading: true,
    isLoadProductShow: true, // 加载动画
    product: [], //详情
    isNext: false, // 是否有下一页
    productList: [],
    params: {
      id: '', // Number	必须	 	集合编号
      page: 1, // Number	可选	1	当前页码
      per_page: 10 // Number	可选	10	每页数量
    }
  },

  // 获取列表
  getProducts() {
    http.fxGet(api.column_collections_detail, this.data.params, (result) => {
      console.log(result, '集合详情')
      if (result.success) {

        wx.setNavigationBarTitle({
          title: result.data.name,
        })

        let data = this.data.productList
        result.data.products.forEach((v) => {
          data.push(v)
        })
        
        result.data.cover = result.data.cover + '-bg75x40'

        this.setData({
          // isNext: result.data.next,
          productList: data,
          product: result.data,
          isLoadProductShow:false
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
    this.setData({
      ['params.id']: options.rid
    })

    this.getProducts()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (!this.data.isNext) {
      // utils.fxShowToast('没有更多了')
      return
    }

    this.setData({
      ['params.page']: this.data.params.page + 1,
      // isLoadProductShow:true
    })

    // this.getProducts()
  },

  // 跳转到商品详情---
  handleInfomation(e) {
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&product=' + this.data.myProduct + "&storeRid=" + e.detail.storeRid
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let that = this
    setTimeout(() => {
      that.setData({
        isLoading: false
      })
    }, 350)
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
    return app.shareLeXi()
  }
  
})