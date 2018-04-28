const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const util = require('./../../utils/util.js')

// 获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    focus: true,
    searchPosition: false,
    // 查询词
    query: '',
    page: 1,
    per_page: 10,
    searchHistory: [],
    productList: [],
    loadingMoreHidden: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.isLogin) {
      this.getSearchHistory()
    }
  },

  /**
   * 开始搜索
   */
  handleStartSearch (e) {
    this.setData({
      query: e.detail.query
    })
    
    this.getSearchList(e.detail.query)
  },

  /**
   * 获取搜索结果
   */
  getSearchList (qk) {
    let that = this
    let params = {
      page: this.data.page,
      per_page: this.data.per_page,
      qk: qk,
      user_id: app.globalData.uid
    }

    http.fxPost(api.search, params, function (res) {
      if (res.success) {
        // 没有下一页了
        if (!res.data.next) {
          that.setData({
            loadingMoreHidden: false
          })
        }

        let products = that.data.productList
        if (that.data.page > 1) {
          // 合并数组
          products.push.apply(products, res.data.paginated_products)
        } else {
          products = res.data.paginated_products
        }

        that.setData({
          productList: products
        })
      }
    })
  },

  /**
   * 获取搜索历史
   */
  getSearchHistory () {
    let that = this

    http.fxGet(api.search_history, {}, function (res) {
      if (res.success) {
        that.setData({
          searchHistory: res.data.search_items
        })
      }
    })
  },

  /**
   * 快速搜索
   */
  handleQuickSearch (e) {
    let query = e.currentTarget.dataset.query
    this.setData({
      query: query
    })
    this.getSearchList(query)
  },

  /**
   * 查看产品
   */
  handleProductTap (e) {
    wx.navigateTo({
      url: './../product/product?rid=' + e.detail.rid + '&title=' + e.detail.title
    })
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
    if (this.data.loadingMoreHidden) {
      let page = this.data.page + 1
      this.setData({
        page: page
      })
      this.handleStartSearch()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})