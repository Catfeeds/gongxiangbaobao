// pages/category/category.js
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cid: 0,  // 选中分类ID
    page: 1,
    per_page: 10,
    topCategories: [],
    childrenCategories: [],
    products: [],
    loadingMoreHidden: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
<<<<<<< HEAD
  onLoad (options) {
=======
  onLoad(options) {
>>>>>>> origin/zhaogaoshang
    // 获取一级分类
    this.getTopCategories()
  },

  /**
   * 获取一级分类
   */
<<<<<<< HEAD
  getTopCategories () {
=======
  getTopCategories() {
>>>>>>> origin/zhaogaoshang
    const that = this;
    const params = {
      per_page: 50
    };
    http.fxGet(api.categories, params, function (result) {
      if (result.success) {
        let _cid = that.data.cid
        if (_cid == 0 && result.data.categories.length) {
          // 默认设置第一个
          _cid = result.data.categories[0].id
        }
        that.setData({
          cid: _cid,
          topCategories: result.data.categories
        })
        // 获取分类下商品
        that.getCategoryProducts(_cid)
      }
    })
  },

  /**
   * 获取某分类下的商品
   */
<<<<<<< HEAD
  getCategoryProducts (_cid) {
=======
  getCategoryProducts(_cid) {
>>>>>>> origin/zhaogaoshang
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
<<<<<<< HEAD
        that.setData({
          products: _products
        })
        
=======
        console.log(_products, 22)
        that.setData({
          products: _products
        })
>>>>>>> origin/zhaogaoshang
      }
    })
  },

  handleProductTap(e) {
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&title=' + e.detail.title
    })
  },

  /**
   * 获取子分类
   */
<<<<<<< HEAD
  getChildCategories (pid=0) {
=======
  getChildCategories(pid = 0) {
>>>>>>> origin/zhaogaoshang
    const that = this
    const params = {
      pid: pid,
      per_page: 50
    };
    http.fxGet(api.categories, params, function (result) {
      if (result.success) {
        that.setData({
          childrenCategories: result.data.categories
        })
      }
    })
  },

  /**
   * 切换分类
   */
<<<<<<< HEAD
  handleChangeCategory (e) {
=======
  handleChangeCategory(e) {
>>>>>>> origin/zhaogaoshang
    let rid = e.currentTarget.dataset.rid
    this.setData({
      cid: rid
    })
    this.getCategoryProducts(rid)
  },

  /**
   * 点击某个分类
   */
<<<<<<< HEAD
  handleClickCategory (e) {
=======
  handleClickCategory(e) {
>>>>>>> origin/zhaogaoshang
    let rid = e.currentTarget.dataset.rid
    let name = e.currentTarget.dataset.name
    wx.navigateTo({
      url: '../list/list?cid=' + rid + '&title=' + name
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
<<<<<<< HEAD
  
=======
    
>>>>>>> origin/zhaogaoshang
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
<<<<<<< HEAD
  
=======

>>>>>>> origin/zhaogaoshang
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
<<<<<<< HEAD
  
=======

>>>>>>> origin/zhaogaoshang
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
<<<<<<< HEAD
  
=======

>>>>>>> origin/zhaogaoshang
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
<<<<<<< HEAD
  
=======

>>>>>>> origin/zhaogaoshang
  }
})