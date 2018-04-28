const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')

//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    rid: '',
    page: 1,
    per_page: 10,
    brand: {},
    products: [],
    loadingMoreHidden: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.title || '品牌'
    });

    this.setData({
      rid: options.rid
    })

    this.getBrandDetail()
    this.getBrandProducts()
  },

  /**
   * 品牌详情
   */
  getBrandDetail () {
    const that = this
    http.fxGet(api.brand_detail.replace(/:rid/g, this.data.rid), {}, function (res) {
      if (res.success) {
        that.setData({
          brand: res.data
        })
      }
    })
  },

  /**
   * 获取品牌下的产品
   */
  getBrandProducts () {
    const that = this
    const params = {
      page: this.data.page,
      per_page: this.data.per_page
    }

    wx.showLoading({
      title: '加载中',
    })

    http.fxGet(api.brand_products.replace(/:rid/g, this.data.rid), params, function (res) {
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

  /**
   * 查看产品
   */
  handleProductTap (e) {
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&title=' + e.detail.title
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
      this.getBrandProducts()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})