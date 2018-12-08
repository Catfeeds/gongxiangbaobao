// pages/distributesSearchRes/distributesSearchRes.js
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputText: '',

    showSortModal: false, // 排序
    showIncomeModal: false, // 利润
    showFilterModal: false, // 筛选

    allProducts: [], // 全部分销商品--
    isNext: true, // 是否有下一页
    isLoadProductShow: true, // 加载商品loading
    totalCount: 1, // 搜索数量

    showShareModal: false, // 卖
    shareProduct: '', // 分享某个商品
    posterUrl: '', // 海报图url

    checkedCids: [], // 选择的分类
    categoryList: [], // 分类列表

    isDisabled: false, // 是否禁用
    leftTimer: null, // 延迟句柄
    rightTimer: null, // 延迟句柄

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

    // 全部商品
    params: {
      page: 1, // Number	可选	1	当前页码
      per_page: 10, // Number	可选	10	每页数量
      cids: '', // Number	可选	 	分类Id
      status: 1, // Number	可选	1	商品状态 -1: 所有 0: 仓库中; 1: 出售中; 2: 下架中; 3: 已售罄
      qk: '', // String	可选	 	搜索关键字
      min_price: '', // Number	可选	 	价格区间： 最小价格
      max_price: '', // Number	可选	 	价格区间： 最大价格
      sort_type: 1, // Number	可选	0	排序: 1= 综合排序, 2= 价格由低至高, 3= 价格由高至低
      is_free_postage: '', // Number	可选	0	是否包邮: 0 = 全部, 1= 包邮
      is_preferential: '', // Number	可选	0	是否特惠: 0 = 全部, 1= 特惠
      is_custom_made: '' // Number	可选	0	是否可定制: 0 = 全部, 1= 可定制
    },
  },

  /**
   * 查看筛选器结果
   */
  handleViewFilterResult() {
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

    this.getSearch()
  },


  // 搜索商品 
  getSearch() {
    http.fxGet(api.distribute_products, this.data.params, (res) => {

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
          allProducts: _products,
          isNext: res.data.next,
          isLoadProductShow: false
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
 * 滑块最高价格
 */
  handleChangeMaxPrice(e) {
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
 * 滑块最低价格
 */
  handleChangeMinPrice(e) {
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

    let _t = setTimeout(() => {
      this.getFilterProducts()
    }, 2000)

    this.setData({
      leftTimer: _t
    })
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

  truncate(s, max = 10) {
    if (s.length > max) {
      return s.substr(0, max) + '...'
    }
    return s
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
   * 生成推广海报图
   */
  getWxaPoster(rid) {
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
   * 保存当前海报到相册
   */
  handleSaveShare() {
    // 下载网络文件至本地
    wx.downloadFile({
      url: this.data.posterUrl,
      success: function(res) {
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
   * 分享-销售
   */
  handleShareDistribute(e) {
    let rid = e.currentTarget.dataset.rid
    let idx = e.currentTarget.dataset.idx
    this.setData({
      showShareModal: true,
      shareProduct: this.data.allProducts[idx]
    })

    this.getWxaPoster(rid)
  },

  /**
   * 跳转商品页
   */
  handleGoProduct(e) {
    let rid = e.currentTarget.dataset.rid
    wx.navigateTo({
      url: '/pages/product/product?rid=' + rid
    })
  },

  // 跳转到搜索页面
  handleToSearch() {
    wx.navigateBack({
      delta: 1,
    })
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
 * 利润
 */
  handleShowIncomeModal(e) {
    this.setData({
      showIncomeModal: true
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

    this.getSearch()
  },


  /**
   * 利润标题
   */
  _getIncomeTitle(profit) {
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
   * 排序标题
   */
  _getSortTitle(sort) {
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

    this.getSearch()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 检测网络
    app.ckeckNetwork()
    wx.setNavigationBarTitle({
      title: '搜索结果',
    })

    this.setData({
      ['params.qk']: options.text,
      inputText: options.text || ''
    })
    this.getSearch()
    this.getCategories()
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
    this.handleCheckChange()
  },

  /**
   * 检测变动
   */
  handleCheckChange() {
    if (app.globalData.agent.distributeSearchChange) {
      let rid = app.globalData.agent.distributeSearchValue.rid
      let value = app.globalData.agent.distributeSearchValue.value
      this._handleReviseSell(rid, value)
      app.globalData.agent.distributeSearchChange = false
    }
  },

  /**
   * 改变上架按钮状态
   */
  _handleReviseSell(rid, option) {
    let allProduct = this.data.allProducts
    allProduct.forEach((v, i) => {
      if (v.rid == rid) {
        this.setData({
          ['allProducts[' + i + '].have_distributed']: option
        })
      }
    })
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
 * 获取某筛选条件下商品
 */
  getFilterProducts() {
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
 * 获取条件数
 */
  _getFilterConditionCount() {
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
   * 重置回调事件
   */
  handleResetFilterCondition(e) {
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

    this.getSearch()
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
    if (!this.data.isNext) {
      return
    }
    this.setData({
      'params.page': this.data.params.page + 1,
      isLoadProductShow: true
    })

    this.getSearch()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(e) {
    if (e.from == 'button') {
      return app.shareWxaProduct(this.data.shareProduct.rid, this.data.shareProduct.name, this.data.shareProduct.cover)
    } else {
      return app.shareLeXi()
    }
  }
})