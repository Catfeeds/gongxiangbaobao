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
    stickAds: [],
    topCategories: [],
    childrenCategories: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    // 获取一级分类
    this.getTopCategories()
  },

  /**
   * 获取分类下推荐位
   */
  getCategoryStickAd () {
    const that = this
    const params = {
      spot: 'wx_cate_' + this.data.cid,
      per_page: 1
    };
    http.fxGet(api.slide_list, params, function (result) {
      if (result.success) {
        that.setData({
          stickAds: result.data.slides
        })
      }
    })
  },

  /**
   * 获取一级分类
   */
  getTopCategories () {
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
        
        // 获取二级分类
        that.getCategoryStickAd()
        that.getChildCategories(_cid)

      }
    })
  },

  /**
   * 获取子分类
   */
  getChildCategories (pid=0) {
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
  handleChangeCategory (e) {
    let rid = e.currentTarget.dataset.rid
    this.setData({
      cid: rid
    })
    this.getChildCategories(rid)
    this.getCategoryStickAd()
  },

  /**
   * 点击某个分类
   */
  handleClickCategory (e) {
    let rid = e.currentTarget.dataset.rid
    let name = e.currentTarget.dataset.name
    wx.navigateTo({
      url: '../list/list?cid=' + rid + '&title=' + name
    })
  },

  /**
   * 点击搜索
   */
  bindClickSearch() {
    wx.navigateTo({
      url: '../search/search',
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
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})