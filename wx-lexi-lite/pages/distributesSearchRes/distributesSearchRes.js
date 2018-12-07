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