const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')

//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cid: '',
    page: 1,
    per_page: 10,
    navList: [],
    products: [],
    loadingMoreHidden: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    wx.setNavigationBarTitle({
      title: options.title || '分类'
		})
    
    this.setData({
      cid: options.cid
    })

    // 获取同级分类
    this.getSiblingsCategories(options.cid)
    // 获取某分类下产品
    this.getCategoryProducts()
  },

  /**
   * 获取同级分类
   */
  getSiblingsCategories (cid) {
    const that = this
    const params = {
      cid: cid,
      per_page: 50
    };
    http.fxGet(api.siblings_categories, params, function (result) {
      if (result.success) {
        that.setData({
          navList: result.data.categories
        })
      }
    })
  },

  /**
   * 获取分类下的产品
   */
  getCategoryProducts() {
    const that = this
    const params = {
      cid: this.data.cid,
      page: this.data.page,
      per_page: this.data.per_page
    }

    wx.showLoading({
      title: '加载中',
    })

    http.fxGet(api.products, params, function (res) {
      wx.hideLoading()
      if (res.success) {
        // 没有下一页了
        if (!res.data.next) {
          that.setData({
            loadingMoreHidden: false
          })
        }

        let _products = that.data.products
        if (that.data.page > 1) {
          // 合并数组
          _products.push.apply(_products, res.data.products)
        } else {
          _products = res.data.products
        }
        that.setData({
          products: _products
        })
      }
    })
  },

  handleProductTap (e) {
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&title=' + e.detail.title
    })
  },

  /**
   * 切换分类
   */
  handleCategoryTab (e) {
    this.setData({
      page: 1,
      cid: e.currentTarget.dataset.rid
    })
    this.getCategoryProducts()
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
      this.getCategoryProducts()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})