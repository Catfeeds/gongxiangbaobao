// pages/categoryList/categoryList.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLoadProductShow: true, // 加载更多商品
    isLoadPageShow: true, // 加载页面的点

    isDisabled: false, // 是否禁用
    leftTimer: null, // 延迟句柄
    rightTimer: null, // 延迟句柄
    categoryList: [], // 分类列表
    checkedCids: [], // 选择的分类
    showFilterModal: false, // 筛选
    openPickBox: false, // 筛选的模态框
    sortBox: false, // 筛选的模态框

    isNext: true, // 是否有分页
    productList: [], // 商品列表

    pickQuantity: '', // 商品的数量
    openPickBox: false, // 筛选的模态框
    sortBox: false, // 排序的模态框

    // 获取分类的参数
    categoryParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	100	每页数量
      pid: '' //Number	可选	0	父级ID
    },

    params: {
      page: 1, // Number	可选	1	当前页码
      per_page: 10, // Number	可选	10	每页数量
      id: '', // Number	必须	 	当前分类编号
      cids: '', // String	可选	 	分类Id, 多个用, 分割
      qk: '', // String	可选	 	搜索关键词
      min_price: '', // Number	可选	 	价格区间： 最小价格
      max_price: '', // Number	可选	 	价格区间： 最大价格
      sort_type: 1, // Number	可选	0	排序: 0= 不限, 1= 综合排序, 2= 价格由低至高, 3= 价格由高至低
      is_free_postage: '', // Number	可选	0	是否包邮: 0 = 全部, 1= 包邮
      is_preferential: '', // Number	可选	0	是否特惠: 0 = 全部, 1= 特惠
      is_custom_made: '' // Number	可选	0	是否可定制: 0 = 全部, 1= 可定制
    },

    // 推荐
    recommendList: [{
      name: '包邮',
      id: '1',
      isActive: false
    },
    {
      name: '特惠',
      id: "2",
      isActive: false
    },
    {
      name: '可定制',
      id: "3",
      isActive: false
    }
    ]
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
      ['params.min_price']: minPrice
    })

    if (this.data.leftTimer) {
      clearTimeout(this.data.leftTimer)
    }

    let _t = setTimeout(() => {
      this.getcategoryList()
      this.setData({
        productList: []
      })
    }, 2000)

    this.setData({
      leftTimer: _t
    })

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
      'params.min_price': 0,
      'params.max_price': -1,
      'params.cids': ''
    })
  },

  /**
   * 滑块最高价格
   */
  handleChangeMaxPrice(e) {
    console.log(e.detail.highValue)
    let maxPrice = e.detail.highValue
    if (maxPrice == '不限') {
      maxPrice = -1
    }
    this.setData({
      ['params.max_price']: maxPrice
    })

    if (this.data.rightTimer) {
      clearTimeout(this.data.rightTimer)
    }

    let _t = setTimeout(() => {
      this.getcategoryList()
      this.setData({
        productList: []
      })
    }, 2000)

    this.setData({
      rightTimer: _t
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
   * 分类列表
   */
  getCategories() {
    http.fxGet(api.categories, this.data.categoryParams, (result) => {
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
      productList: [],
      'params.cids': _checkedCids.join(','),
      'params.page': 1
    })

    this.getcategoryList()
  },

  /**
   * 选择推荐
   */
  handleToggleRecommendList(e) {
    let index = e.currentTarget.dataset.index
    let id = e.currentTarget.dataset.cid

    if (this.data.recommendList[index].isActive) {
      this.setData({
        ['recommendList[' + index + '].isActive']: false
      })
    } else {
      this.setData({
        ['recommendList[' + index + '].isActive']: true
      })
    }

    if (id == 1) {
      this.setData({
        productList: [], // 商品列表
        ['params.is_free_postage']: this.data.params.is_free_postage == 0 ? 1 : 0
      })
    }

    if (id == 2) {
      this.setData({
        productList: [], // 商品列表
        ['params.is_preferential']: this.data.params.is_preferential == 0 ? 1 : 0
      })
    }

    if (id == 3) {
      this.setData({
        productList: [], // 商品列表
        ['params.is_custom_made']: this.data.params.is_custom_made == 0 ? 1 : 0
      })
    }

    this.getcategoryList()
  },

  // 列表
  getcategoryList() {
    http.fxGet(api.category_products, this.data.params, (result) => {
      console.log(result, '分类产品的列表')
      if (result.success) {
        let data = this.data.productList
        result.data.products.forEach((v, i) => {
          data.push(v)
        })

        this.setData({
          isNext: result.data.next,
          productList: data,
          pickQuantity: result.data.count,
          totalCount: result.data.count,
          isLoadProductShow: false
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载 
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.titleName || '珠宝饰品',
    })

    this.setData({
      ['params.id']: options.categryId || 28,
      ['categoryParams.pid']: options.categryId || 28,
    })

    this.getcategoryList()
  },

  // 获取筛选
  handlePickProduct(e) {
    let rids = e.detail.category
    let minPrice = e.detail.minPrice
    let maxPrice = e.detail.maxPrice
    this.setData({
      productList: [],
      ['params.page']: e.detail.page ? e.detail.page : this.data.page,
      ['params.cids']: rids == undefined ? '' : rids.join(','),
      ['params.min_price']: minPrice,
      ['params.max_price']: maxPrice
    })

    this.getcategoryList()
  },

  // 获取排序的产品
  handleSort(e) {
    this.setData({
      productList: [],
      ['params.page']: 1,
      ['params.sort_type']: e.currentTarget.dataset.rid
    })

    this.handleSortOff()

    this.getcategoryList()
  },

  // 打开筛选的模态框
  handleSortShow() {
    let animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })

    animation.top(0).step()

    this.setData({
      showFilterModal: true,
      openPickBox: animation.export()
    })

    this.getCategories()
  },

  // 关闭筛选的模态框
  handelOffPickBox() {
    let animationOff = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })

    animationOff.top(10000).step()

    this.setData({
      openPickBox: animationOff.export()
    })
  },

  // 打开排序的盒子
  handelOffPick() {
    this.setData({
      sortBox: true
    })

  },

  // 关闭排序的盒子
  handleSortOff() {
    this.setData({
      sortBox: false
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      ['params.page']: this.data.params.page - 0 + 1
    })

    if (!this.data.isNext) {
      return
    }

    this.setData({
      isLoadProductShow: true
    })

    this.getcategoryList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({
      isLoadPageShow: false
    })
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.shareLeXi()
  },

  // 跳转到搜索页面
  handleToSearch() {
    wx.navigateTo({
      url: '../search/search',
    })
  },

  // 跳转到商品详情---
  handleInfomation(e) {
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&product=' + this.data.myProduct + "&storeRid=" + e.detail.storeRid
    })
  }

})