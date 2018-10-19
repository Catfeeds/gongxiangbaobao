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
    isLoading: true,
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
    stickedProducts: {}, // 推荐分销-官方--------
    advertises: [], // 推荐广告图
    storeHeadlines: [], // 生活馆头条

    totalCount: 0, // 商品总数
    allProducts: {}, // 全部分销商品------

    showSortModal: false, // 排序
    showIncomeModal: false, // 利润
    showFilterModal: false, // 筛选

    showShareModal: false, // 卖
    shareProduct: '', // 分享某个商品
    posterUrl: '', // 海报图url

    page: 1,
    perPage: 10,
    // 全部商品
    params: {
      sort_type: 1, // 0=默认排序, 1=综合排序, 2=价格由低至高, 3=价格由高至低
      profit_type: 0, // 利润排序 0=不限, 1=由低至高, 2=由高至低
      cids: '', // 分类Id, 多个用, 分割
      page: 1,
      qk: '',
      per_page: 10,
      min_price: 0, // 价格区间: 最小价格
      max_price: -1, // 价格区间: 最大价格
      sid: app.globalData.jwt.store_rid // 店铺的id
    },
    checkedCids: [], // 选择的分类
    categoryList: [], // 分类列表

    // 筛选器
    filter: {
      showReset: false,
      sortTitle: '综合排序',
      incomeTitle: '利润',
      conditionTitle: '筛选',
      conditionCount: 0, // 条件数
      totalCount: 0,
      cids: '', // 分类Id, 多个用, 分割
      min_price: 0, // 价格区间: 最小价格
      max_price: -1 // 价格区间: 最大价格
    },

    isDisabled: false, // 是否禁用
    leftTimer: null, // 延迟句柄
    rightTimer: null, // 延迟句柄
    
    loadingMore: true,
    loadingMoreAll:true
  },

  // 轮播图跳转
  handleLiveInfo(e) {
    let targetType = e.currentTarget.dataset.type
    let link = e.currentTarget.dataset.link

    if (targetType == 1) {

    }

    if (targetType == 2) {
      wx.navigateTo({
        url: '../product/product?rid=' + link
      })
    }

    if (targetType == 3) {
      wx.navigateTo({
        url: '../categoryList/categoryList?categryId=' + link
      })
    }

    if (targetType == 4) {
      wx.navigateTo({
        url: '../branderStore/branderStore?rid=' + link
      })
    }
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
      this.setData({
        swiperIndex:0
      })
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
    utils.logger(e, '轮播图发生变化')

    this.setData({
      swiperIndex: e.detail.current
    })
  },

  /**
   * 搜索词变化
   */
  handleQueryChange (e) {
    this.setData({
      'params.qk': e.detail.value
    })
    
    this.getAllProducts()
  },

  /**
   * 排序
   */
  handleShowSortModal(e) {
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
   * 重置回调事件
   */
  handleResetFilterCondition (e) {
    this.selectComponent('#fx-slider').reset()
    let _categories = this.data.categoryList
    _categories = _categories.map((cate) => {
      cate.checked = false
      return cate
    })
    
    this.setData({
      'categoryList': _categories,
      'filter.min_price': 0,
      'filter.max_price': -1,
      'filter.cids': '',
      'filter.showReset': false,
      'filter.conditionCount': 0,
      'filter.conditionTitle': '筛选',
      'filter.totalCount': 0,
      'params.cids': '',
      'params.page': 1,
      'params.min_price': 0,
      'params.max_price': -1
    })

    this.getAllProducts()
  },

  /**
   * 滑块最低价格
   */
  handleChangeMinPrice (e) {
    let minPrice = e.detail.lowValue
    if (this.data.params.max_price == -1) {
      if (minPrice == '不限') {
        minPrice = 800
      }
    }
    this.setData({
      'filter.min_price': minPrice,
      'filter.showReset': true
    })

    if (this.data.leftTimer) {
      clearTimeout(this.data.leftTimer)
    }
    
    let _t = setTimeout(()=>{
      this.getFilterProducts()
    }, 2000)

    this.setData({
      leftTimer: _t
    })
  },

  /**
   * 滑块最高价格
   */
  handleChangeMaxPrice (e) {
    utils.logger(e.detail.highValue)
    let maxPrice = e.detail.highValue
    if (maxPrice == '不限') {
      maxPrice = -1
    }
    this.setData({
      'filter.max_price': maxPrice,
      'filter.showReset': true
    })

    if (this.data.rightTimer) {
      clearTimeout(this.data.rightTimer)
    }

    let _t = setTimeout(() => {
      this.getFilterProducts()
    }, 2000)

    this.setData({
      rightTimer: _t
    })
  },

  /**
   * 改变排序
   * 0=默认排序, 1=综合排序, 2=价格由低至高, 3=价格由高至低
   */
  handleChangeSorted(e) {
    let sort = e.currentTarget.dataset.sort
    
    this.setData({
      'params.sort_type': sort,
      'params.profit_type': 0,
      'filter.sortTitle': this._getSortTitle(sort),
      'filter.incomeTitle': this._getIncomeTitle(0),
      showSortModal: false
    })

    this.getAllProducts()
  },

  /**
   * 改变利润
   * 利润排序 0=不限, 1=由低至高, 2=由高至低
   */
  handleChangeProfit(e) {
    let profit = e.currentTarget.dataset.profit
    utils.logger('profit: ' + profit)
    this.setData({
      'params.sort_type': 1,
      'params.profit_type': parseInt(profit),
      'filter.sortTitle': this._getSortTitle(1),
      'filter.incomeTitle': this._getIncomeTitle(profit),
      showIncomeModal: false
    })

    this.getAllProducts()
  },

  /**
   * 查看筛选器结果
   */
  handleViewFilterResult () {
    if (this.data.filter.showReset && this.data.filter.totalCount == 0) {
      return false
    }
    let conditionCount = this._getFilterConditionCount()
    this.setData({
      'params.cids': this.data.filter.cids,
      'params.min_price': this.data.filter.min_price,
      'params.max_price': this.data.filter.max_price,
      'params.page': 1,
      'filter.conditionCount': conditionCount,
      'filter.conditionTitle': '筛选 ' + conditionCount,
      showFilterModal: false
    })

    this.getAllProducts()
  },

  /**
   * 获取条件数
   */
  _getFilterConditionCount () {
    let count = this.data.checkedCids.length
    if (this.data.filter.min_price > 0) {
      count += 1
    }
    if (this.data.filter.max_price) {
      count += 1
    }
    return count
  },

  /**
   * 排序标题
   */
  _getSortTitle (sort) {
    sort = parseInt(sort)
    switch (sort) {
      case 1:
        return '综合排序'
      case 2:
        return '价格由低至高'
      case 3:
        return '价格由高至低'
      default:
        return '综合排序'
    }
  },

  /**
   * 利润标题
   */
  _getIncomeTitle (profit) {
    profit = parseInt(profit)
    switch (profit) {
      case 1:
        return '由低至高'
      case 2:
        return '由高至低'
      default:
        return '不限'
    }
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
      checkedCids: _checkedCids,
      'filter.showReset': true,
      'filter.cids': _checkedCids.join(',')
    })

    this.getFilterProducts()
  },

  /**
   * 跳转商品页
   */
  handleGoProduct (e) {
    let rid = e.currentTarget.dataset.rid
    wx.navigateTo({
      url: '/pages/product/product?rid=' + rid
    })
  },

  /**
   * 跳转分销上架
   */
  handleGoSale(e) {
    let index = e.currentTarget.dataset.idx
    let rid = e.currentTarget.dataset.rid
    wx.navigateTo({
      url: '/pages/distributeSubmit/distributeSubmit?rid=' + rid + '&index=' + index
    })
  },

  /**
   * 取消分享-销售
   */
  handleCancelShare (e) {
    this.setData({
      showShareModal: false,
      posterUrl: '',
      shareProduct: {}
    })
  },

  /**
   * 推荐分享-销售
   */
  handleStickShareDistribute (e) {
    let rid = e.currentTarget.dataset.rid
    let idx = e.currentTarget.dataset.idx

    this.setData({
      showShareModal: true,
      shareProduct: this.data.stickedProducts[idx]
    })

    this.getWxaPoster(rid)
  },

  /**
   * 分享-销售
   */
  handleShareDistribute (e) {
    let rid = e.currentTarget.dataset.rid
    let idx = e.currentTarget.dataset.idx
    this.setData({
      showShareModal: true,
      shareProduct: this.data.allProducts[idx]
    })

    this.getWxaPoster(rid)
  },

  /**
   * 保存当前海报到相册
   */
  handleSaveShare () {
    // 下载网络文件至本地
    wx.downloadFile({
      url: this.data.posterUrl,
      success: function (res) {
        if (res.statusCode === 200) {
          // 保存文件至相册
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(res) {
              utils.fxShowToast('保存成功', 'success')
            },
            fail(res) {
              if (res.errMsg === 'saveImageToPhotosAlbum:fail:auth denied') {
                wx.openSetting({
                  success(settingdata) {
                    utils.logger(settingdata)
                    if (settingdata.authSetting['scope.writePhotosAlbum']) {
                      utils.fxShowToast('保存成功')
                    } else {
                      utils.fxShowToast('保存失败')
                    }
                  }
                })
              } else {
                utils.fxShowToast('保存失败')
              }
            }
          })
        }
      }
    })
  },

  /**
   * 生成推广海报图
   */
  getWxaPoster (rid) {
    let lastVisitLifeStoreRid = app.getDistributeLifeStoreRid()

    // scene格式：rid + '#' + sid
    let scene = rid
    if (lastVisitLifeStoreRid) {
      scene += '-' + lastVisitLifeStoreRid
    }
    
    let params = {
      rid: rid,
      type: 4,
      path: 'pages/product/product',
      auth_app_id: app.globalData.app_id,
      scene: scene
    }
    http.fxPost(api.wxa_poster, params, (result) => {
      utils.logger(result, '生成海报图')
      if (result.success) {
        this.setData({
          posterUrl: result.data.image_url
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 推荐-广告图
   */
  getAdvertises() {
    http.fxGet(api.marketBanners.replace(/:rid/, 'center_ad'), {}, (result) => {
      utils.logger(result, '推荐广告')
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
      utils.logger(res, '生活馆头条')
      if (res.success) {
        let l = res.data.headlines.length

        let newData = []
        res.data.headlines.forEach((v, i) => {

          if (v.time > 24) {
            v.time = Math.ceil(v.time % 24) + '天'
          } else {
            v.time = v.time + '小时'
          }

          if (v.username - 0 != NaN && v.username.length > 9) {
            utils.logger(v)
            v.username = v.username.substr(0, 3) + '****' + v.username.substr(7, 4)
          }

          let newObj = []
          if ((i + 1) % 2 == 0) {
            newObj.push(v)
            newObj.push(res.data.headlines[i - 1])
            newData.push(newObj)
          }
        })

        // 暂时展示2条
        this.setData({
          storeHeadlines: newData
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
      per_page: this.data.perPage,
      sid:app.globalData.jwt.store_rid
    }

    http.fxGet(api.get_hot_distribution, params, (res) => {
      utils.logger(res, '热门分销单品')
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
      per_page: this.data.perPage,
      sid: app.globalData.jwt.store_rid
    }
    http.fxGet(api.get_sticked_distribution, params, (res) => {
      utils.logger(res, '官方精选分销商品')
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
      per_page: this.data.perPage,
      sid: app.globalData.jwt.store_rid
    }

    http.fxGet(api.get_new_distribution, params, (res) => {
      utils.logger(res, '最新分销商品')
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
   * 获取某筛选条件下商品
   */
  getFilterProducts () {
    let params = {
      cids: this.data.filter.cids, // 分类Id, 多个用, 分割
      min_price: this.data.filter.min_price, // 价格区间: 最小价格
      max_price: this.data.filter.max_price // 价格区间: 最大价格
    }

    http.fxGet(api.distribute_product_count, params, (res) => {
      utils.logger(res, '筛选商品')
      if (res.success) {
        this.setData({
          'filter.conditionCount': this._getFilterConditionCount(),
          'filter.totalCount': res.data.count
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
    utils.logger(this.data.params)
    http.fxGet(api.distribute_products, this.data.params, (res) => {
      utils.logger(res, '全部分销商品')
      if (res.success) {
        // 没有下一页了
        if (!res.data.next) {
          this.setData({
            loadingMoreAll: false
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
      utils.logger(result, '分类列表')
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
    wx.setNavigationBarTitle({
      title: '选品中心'
    })

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
    let that = this
    setTimeout(() => {
      that.setData({
        readyOver: true,
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
  onShareAppMessage (o) {
    utils.logger('分享商品从选品中心')

    let title = this.data.shareProduct.name
    return app.shareWxaProduct(this.data.shareProduct.rid, title, this.data.shareProduct.cover)
  }

})