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
    panelTabs: [{
        rid: 't1',
        name: 'hot',
        title: '热门单品'
      },
      {
        rid: 't2',
        name: 'sticked',
        title: '官方精选'
      },
      {
        rid: 't3',
        name: 'newest',
        title: '新品首发'
      }
    ],
    stickedProducts: {}, // 推荐分销-官方
    advertises: [], // 推荐广告图
    storeHeadlines: [], // 生活馆头条

    totalCount: 0, // 商品总数
    allProducts: {}, // 全部分销商品

    showSortModal: false, // 排序
    showIncomeModal: false, // 利润
    showFilterModal: false, // 筛选

    page: 1,
    perPage: 20,
    // 全部商品
    params: {
      sort_type: 1, // 0=默认排序, 1=综合排序, 2=价格由低至高, 3=价格由高至低
      profit_type: 0, // 利润排序 0=不限, 1=由低至高, 2=由高至低
      cids: '', // 分类Id, 多个用, 分割
      page: 1,
      per_page: 10,
      min_price: '', // 价格区间: 最小价格
      max_price: '' // 价格区间: 最大价格
    },
    checkedCids: [], // 选择的分类
    categoryList: [], // 分类列表

    isDisabled: false, // 是否禁用
    lineLeft: 0, // 线距离左边的距离
    lineWhite: 520, // 线的长度
    xLeft: 0, // 
    xRight: 600,
    windowWidth: 375, // 屏幕的宽度(真机)
    movableLeftRight: 37.5, // 滑块的左右距离（真机）
    movableRight: 560, // 右面滑块的偏移
    movableLeft: 0, // 左面滑块的偏移
    offsetLeft: 40, // 设计稿--左边滑块的移动距离
    offsetRight: 40, //

    leftLastTime: 0, // 左边滑块上次距离
    rightLastTime: 560, // 右边边滑块上次距离

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

    if (pageName == 'all') {
      this.getAllProducts()
      this.getCategories()
    } else { // 推荐
      this.getAdvertises()
      this.getStoreHeadlines()
      this.getHotDistribution()
    }
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

  // 轮播图发生变化的时候
  handleswiperItemCheng(e) {
    console.log(e, "轮播图发生变化的时候")

    this.setData({
      swiperIndex: e.detail.current
    })
  },

  /**
   * 排序
   */
  handleShowSortModal(e) {
    console.log(e)
    this.setData({
      showSortModal: true
    })
  },

  /**
   * 关闭弹窗回调
   */
  handleCloseSortModal(e) {
    this.setData({
      showSortModal: false
    })
  },

  /**
   * 利润
   */
  handleShowIncomeModal(e) {
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
   * 左边滑块
   */
  handleMovableLeft(e) {
    console.log(e)
    console.log(e.detail.x, '左面')
    console.log(750 * e.detail.x / this.data.windowWidth + 75, '在设计稿上左边移动的宽度')
    console.log(750 * e.detail.x / this.data.windowWidth, '左边滑块的偏移')
    console.log(this.data.lineWhite - 750 * e.detail.x / this.data.windowWidth, '线的长')

    let left = 750 * e.detail.x / this.data.windowWidth // 设计稿的左边距离长度
    this.setData({
      leftLastTime: left,
      lineWhite: this.data.lineWhite - (left - this.data.leftLastTime), // 线的长度
      movableLeft: left,
      offsetLeft: 750 * e.detail.x / this.data.windowWidth + 40
    })

    // 检查是否禁用

    // 设置金额
    let price = 0

    if (left > 0 && left <= 80) {

    }
    if (left > 80 && left <= 160) {
      price = 150
    }
    if (left > 160 && left <= 240) {
      price = 300
    }
    if (left > 240 && left <= 320) {
      price = 400
    }
    if (left > 320 && left <= 400) {
      price = 500
    }
    if (left > 400 && left <= 480) {
      price = 800
    }
    if (left > 480) {

    }

    this.setData({
      minPrice: price
    })

  },

  /**
   * 右面滑块
   */
  handleMovableRight(e) {
    console.log(e)
    console.log(e.detail.x, '右面')
    console.log(560 - 750 * e.detail.x / this.data.windowWidth, '在设计稿上右边移动的宽度')
    console.log(750 * e.detail.x / this.data.windowWidth, '右边滑块的偏移')

    let right = 750 * e.detail.x / this.data.windowWidth

    this.setData({
      rightLastTime: right,
      lineWhite: this.data.lineWhite - (this.data.rightLastTime - right), // 线的长度
      movableRight: right,
      offsetRight: 750 * e.detail.x / this.data.windowWidth + 75
    })
    console.log(this.data.movableRight, 33)

    // 检查是否禁用

    let price = -1

    if (right > 0 && right <= 80) {

    }
    if (right > 80 && right <= 160) {
      price = 150
    }
    if (right > 160 && right <= 240) {
      price = 300
    }
    if (right > 240 && right <= 320) {
      price = 400
    }
    if (right > 320 && right <= 400) {
      price = 500
    }
    if (right > 400 && right <= 480) {
      price = 800
    }
    if (right > 480) {
      price = -1
    }

    console.log('Right: '+ right +', Max price: ' + price)

    this.setData({
      maxPrice: price
    })

  },

  /**
   * 改变排序
   */
  handleChangeSorted(e) {
    let sort = e.currentTarget.dataset.sort
    this.setData({
      'params.sort_type': sort,
      'params.profit_type': 0,
      showSortModal: false
    })

    this.getAllProducts()
  },

  /**
   * 改变利润
   */
  handleChangeProfit(e) {
    let profit = e.currentTarget.dataset.profit
    console.log('profit: ' + profit)
    this.setData({
      'params.sort_type': 1,
      'params.profit_type': parseInt(profit),
      showIncomeModal: false
    })

    this.getAllProducts()
  },

  /**
   * 改变分类
   */
  handleToggleCategory(e) {
    let cid = e.currentTarget.dataset.cid

    let _checkedCids = this.data.checkedCids
    if (_checkedCids.indexOf(cid) == -1) { // 不存在，则增加
      _checkedCids.push(cid)
    } else { // 存在，则删除
      let idx = _checkedCids.indexOf(cid)
      _checkedCids.splice(idx, 1)
    }

    let _categories = this.data.categoryList
    _categories = _categories.map((cate) => {
      if (_checkedCids.indexOf(cate.id) != -1) {
        cate.checked = true
      } else {
        cate.checked = false
      }
      return cate
    })

    this.setData({
      categoryList: _categories,
      'params.cids': _checkedCids.join(',')
    })

    this.getAllProducts()
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
    http.fxGet(api.life_store_headlines, {
      type: 2
    }, (res) => {
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

    wx.showLoading({
      title: '加载中',
    })
    console.log(this.data.params)
    http.fxGet(api.distribute_products, this.data.params, (res) => {
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
        if (this.data.params.page > 1) {
          // 合并数组
          _products.push.apply(_products, pageProducts)
        } else {
          _products = pageProducts
        }

        this.setData({
          totalCount: res.data.count,
          allProducts: _products
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 分类列表
   */
  getCategories() {
    http.fxGet(api.categories, {}, (result) => {
      console.log(result, '分类列表')
      if (result.success) {
        this.setData({
          categoryList: result.data.categories
        })
      } else {
        utils.fxShowToast(result.status.message)
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
      let maxLen = 12
      if (product.is_free_postage) {
        maxLen = 10
      }
      product.name = this.truncate(product.name, maxLen)
      return product
    })
    return _mockProducts
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowWidth: res.windowWidth
        })
      }
    })

    if (this.data.pageActiveTab == 'stick') {
      this.getAdvertises()
      this.getStoreHeadlines()
      this.getHotDistribution()
    } else {
      this.getAllProducts()
      this.getCategories()
    }
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.loadingMore) {
      if (this.data.pageActiveTab == 'stick') {
        let page = this.data.page + 1
        this.setData({
          page: page
        })
        this._watchPanelChange(this.data.panelActiveTab)
      } else {
        let page = this.data.params.page + 1
        this.setData({
          'params.page': page
        })
        this.getAllProducts()
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})