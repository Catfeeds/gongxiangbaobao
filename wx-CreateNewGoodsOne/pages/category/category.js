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
    // 带有背景图的分类
    catgory: [{
      rid: 1,
      name: '智能',
      img: "../../images/1@2x.png",
      bg_img: "../../images/index-photo/intelligence@2x.png"
    }, {
      rid: 2,
      name: "家具",
      img: "../../images/2@2x.png",
      bg_img: "../../images/index-photo/home-furnishing@2x.png"
    }, {
      rid: 3,
      name: "厨房",
      img: "../../images/3@2x.png",
      bg_img: "../../images/index-photo/kitchen@2x.png"
    }, {
      rid: 4,
      name: "美食",
      img: "../../images/4@2x.png",
      bg_img: "../../images/index-photo/food@2x.png"
    }, {
      rid: 5,
      name: "数码",
      img: "../../images/5-click@2x.png",
      bg_img: "../../images/index-photo/digital@2x.png"
    }, {
      rid: 6,
      name: "服饰",
      img: "../../images/6@2x.png",
      bg_img: "../../images/index-photo/clothes@2x.png"
    }, {
      rid: 7,
      name: "箱包",
      img: "../../images/7@2x.png",
      bg_img: "../../images/index-photo/bag@2x.png"
    }],
    cid: 0,  // 选中分类ID
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
        console.log(result.data.categories)
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
  },

  /**
   * 点击某个分类
   */
  handleClickCategory (e) {
    let rid = e.currentTarget.dataset.rid
    let name = e.currentTarget.dataset.name
    wx.navigateTo({
      url: '../product/product?cid=' + rid + '&title=' + name
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