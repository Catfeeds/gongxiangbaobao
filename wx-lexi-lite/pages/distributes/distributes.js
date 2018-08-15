
/**
 * 选品中心
 */
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: true,
    vertical: false,
    autoplay: false,
    circular: false,
    interval: 2000,
    duration: 500,

    swiperIndex: 0, // 轮播图的index

    pageActiveTab: 'stick', // stick, all

    panelActiveTab: 'hot',
    panelTabs: [
      { rid: 't1', name: 'hot', title: '热门单品' },
      { rid: 't2', name: 'sticked', title: '官方精选' },
      { rid: 't3', name: 'newest', title: '新品首发' }
    ],
    stickedProducts: {}, // 推荐分销-官方
    advertises: [], // 推荐广告图
    storeHeadlines: [], // 生活馆头条

    allProducts: {}, // 全部分销商品

    showSortModal: false, // 排序
    showIncomeModal: false, // 利润
    showFilterModal: false, // 筛选

    page: 1,
    perPage: 20,
    loadingMore: true
  },

  /**
   * 切换页面
   */
  handleChangePage(e) {
    let pageName = e.currentTarget.dataset.name
    this.setData({
      pageActiveTab: pageName,
      page: 1
    })

    this.getAllProducts()
  },

  /**
   * 切换
   */
  handleChangePanel(e) {
    let panelName = e.currentTarget.dataset.name
    this.setData({
      panelActiveTab: panelName,
      page: 1
    })

    this._watchPanelChange(panelName)
  },

  /**
   * 排序
   */
  handleShowSortModal (e) {
    console.log(e)
    this.setData({
      showSortModal: true
    })
  },

  /**
   * 关闭弹窗回调
   */
  handleCloseSortModal (e) {
    this.setData({
      showSortModal: false
    })
  },

  /**
   * 利润
   */
  handleShowIncomeModal (e) {
    this.setData({
      showIncomeModal: true
    })
  },

  /**
   * 关闭弹窗回调
   */
  handleCloseIncomeModal(e) {
    this.setData({
      showIncomeModal: false
    })
  },

  /**
   * 排序
   */
  handleShowFilterModal(e) {
    this.setData({
      showFilterModal: true
    })
  },

  /**
   * 关闭弹窗回调
   */
  handleCloseFilterModal(e) {
    this.setData({
      showFilterModal: false
    })
  },

  /**
   * 跳转分销上架
   */
  handleGoSale(e) {
    let rid = e.currentTarget.dataset.rid
    wx.navigateTo({
      url: '/pages/distributeSubmit/distributeSubmit?rid=' + rid
    })
  },

  /**
   * 分享-销售
   */
  handleShareDistribute(e) {
    let rid = e.currentTarget.dataset.rid

  },

  /**
   * 推荐-广告图
   */
  getAdvertises() {
    http.fxGet(api.marketBanners.replace(/:rid/, 'center_ad'), {}, (result) => {
      console.log(result, '推荐广告')
      if (result.success) {
        this.setData({
          advertises: result.data.banner_images
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 获取生活馆头条
   */
  getStoreHeadlines() {
    http.fxGet(api.life_store_headlines, { type: 2 }, (res) => {
      console.log(res, '生活馆头条')
      if (res.success) {
        let l = res.data.headlines.length
        // 暂时展示2条
        this.setData({
          storeHeadlines: res.data.headlines.splice(0, 2)
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 获取热门单品
  getHotDistribution() {
    let params = {
      page: this.data.page,
      per_page: this.data.perPage
    }

    wx.showLoading({
      title: '加载中',
    })

    http.fxGet(api.get_hot_distribution, params, (res) => {
      console.log(res, '热门分销单品')
      wx.hideLoading()
      if (res.success) {
        // 没有下一页了
        if (!res.data.next) {
          this.setData({
            loadingMore: false
          })
        }

        let _products = this.data.stickedProducts
        if (this.data.page > 1) {
          // 合并数组
          _products.push.apply(_products, res.data.products)
        } else {
          _products = res.data.products
        }
        this.setData({
          stickedProducts: _products
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 获取官方推荐
  getStickedDistribution() {
    let params = {
      page: this.data.page,
      per_page: this.data.perPage
    }
    wx.showLoading({
      title: '加载中',
    })
    http.fxGet(api.get_sticked_distribution, params, (res) => {
      console.log(res, '官方精选分销商品')
      wx.hideLoading()
      if (res.success) {
        // 没有下一页了
        if (!res.data.next) {
          this.setData({
            loadingMore: false
          })
        }

        let _products = this.data.stickedProducts
        if (this.data.page > 1) {
          // 合并数组
          _products.push.apply(_products, res.data.products)
        } else {
          _products = res.data.products
        }
        this.setData({
          stickedProducts: _products
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 获取最新发布分销商品
  getNewestDistribution() {
    let params = {
      page: this.data.page,
      per_page: this.data.perPage
    }
    wx.showLoading({
      title: '加载中',
    })

    http.fxGet(api.get_new_distribution, params, (res) => {
      console.log(res, '最新分销商品')
      wx.hideLoading()
      if (res.success) {
        // 没有下一页了
        if (!res.data.next) {
          this.setData({
            loadingMore: false
          })
        }

        let _products = this.data.stickedProducts
        if (this.data.page > 1) {
          // 合并数组
          _products.push.apply(_products, res.data.products)
        } else {
          _products = res.data.products
        }
        this.setData({
          stickedProducts: _products
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 获取全部分销商品
   */
  getAllProducts() {
    let params = {
      page: this.data.page,
      per_page: this.data.perPage
    }

    wx.showLoading({
      title: '加载中',
    })

    http.fxGet(api.get_all_distribution, params, (res) => {
      console.log(res, '全部分销商品')
      wx.hideLoading()
      if (res.success) {
        // 没有下一页了
        if (!res.data.next) {
          this.setData({
            loadingMore: false
          })
        }
        let pageProducts = this._rebuildProducts(res.data.products)
        let _products = this.data.allProducts
        if (this.data.page > 1) {
          // 合并数组
          _products.push.apply(_products, pageProducts)
        } else {
          _products = pageProducts
        }

        this.setData({
          allProducts: _products
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 切换panel触发
   */
  _watchPanelChange(panelName) {
    switch (panelName) {
      case 'hot':
        this.getHotDistribution()
        break
      case 'sticked':
        this.getStickedDistribution()
        break
      case 'newest':
        this.getNewestDistribution()
        break
    }
  },

  truncate(s, max = 10) {
    if (s.length > max) {
      return s.substr(0, max) + '...'
    }
    return s
  },

  /**
   * 修正数据
   */
  _rebuildProducts(products) {
    let _mockProducts = products.map(product => {
      product.name = this.truncate(product.name, 12)
      return product
    })
    return _mockProducts
  },

  // 轮播图发生变化的时候
  handleswiperItemCheng(e) {
    console.log(e, "轮播图发生变化的时候")

    this.setData({
      swiperIndex: e.detail.current
    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (this.data.pageActiveTab == 'stick') {
      this.getAdvertises()
      this.getStoreHeadlines()
      this.getHotDistribution()
    } else {
      this.getAllProducts()
    }
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
    if (this.data.loadingMore) {
      let page = this.data.page + 1
      this.setData({
        page: page
      })

      if (this.data.pageActiveTab == 'stick') {
        this._watchPanelChange(this.data.panelActiveTab)
      } else {
        this.getAllProducts()
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})

