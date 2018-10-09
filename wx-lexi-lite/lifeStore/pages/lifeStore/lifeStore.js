/**
 * 生活馆
 */
const http = require('./../../../utils/http.js')
const api = require('./../../../utils/api.js')
const utils = require('./../../../utils/util.js')

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    rid: '', // 生活馆rid
    pickCategory: 1, // 选择分类
    // 分类列表
    category: [
      { name: '生活馆', id: 1 },
      { name: '精选', id: 2 },
      { name: '探索', id: 3 }
    ],
    lifeStore: {}, // 生活馆信息
    storeOwner: {}, // 生活馆馆长
    storeProducts: [], // 生活馆商品列表
    canAdmin: false, // 是否具备管理生活馆

    popularProducts: [], // 本周最受欢迎
    page: 1,
    perPage: 10,
    loadingMore: true
  },

  /**
   * 跳转分销中心
   */
  handleGoDistribute () {
    wx.navigateTo({
      url: '/pages/distributeCenter/distributeCenter'
    })
  },

  /**
   * 跳转商品详情
   */
  handleGoProduct (e) {
    let rid = e.currentTarget.dataset.rid
    wx.navigateTo({
      url: '/pages/product/product?rid=' + rid
    })
  },

  /**
   * 本周最受欢迎商品
   */
  getWeekPopular () {
    http.fxGet(api.distribution_week_popular, { page: 1, per_page: 4 }, (res) => {
      console.log(res, '最受欢迎商品')
      if (res.success) {
        this.setData({
          popularProducts: res.data.products
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 获取生活馆商品列表
   */
  getStoreProducts () {
    let params = {
      page: this.data.page,
      per_page: this.data.perPage,
      sid: this.data.rid,
      is_distributed: 2
    }

    wx.showLoading({
      title: '加载中',
    })

    http.fxGet(api.life_store_products, params, (res) => {
      console.log(res, '全部分销商品')
      wx.hideLoading()
      if (res.success) {
        // 没有下一页了
        if (!res.data.next) {
          this.setData({
            loadingMore: false
          })
        }

        let _products = this.data.storeProducts
        if (this.data.page > 1) {
          // 合并数组
          _products.push.apply(_products, res.data.products)
        } else {
          _products = res.data.products
        }

        this.setData({
          storeProducts: _products
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
    
  },

  /**
   * 获取生活馆信息
   */
  getLifeStore () {
    http.fxGet(api.life_store, { rid: this.data.rid }, (res) => {
      console.log(res, '生活馆信息')
      if (res.success) {
        this.setData({
          lifeStore: res.data
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取当前用户的生活馆
    const lifeStore = wx.getStorageSync('lifeStore')
    const userInfo = wx.getStorageSync('userInfo')

    let rid = options.rid || lifeStore.lifeStoreRid
    if (rid) {
      this.setData({
        rid: rid,
        storeOwner: userInfo
      })
    }

    this.getLifeStore()

    this.getStoreProducts()

    this.getWeekPopular()
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
    // 恢复page=1
    this.setData({
      page: 1
    })
    this.getStoreProducts()
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
    return app.shareLeXi()
  }
})