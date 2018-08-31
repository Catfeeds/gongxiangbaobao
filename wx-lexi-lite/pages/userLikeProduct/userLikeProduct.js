// pages/userLikeProduct/userLikeProduct.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isDisabled: false, // 是否禁用
    leftTimer: null, // 延迟句柄
    rightTimer: null, // 延迟句柄
    categoryList: [], // 分类列表
    checkedCids: [], // 选择的分类
    showFilterModal:false,// 筛选
    openPickBox: false, // 筛选的模态框
    sortBox: false, // 筛选的模态框
    // 是否有下一页
    isNext: false,
    // 喜欢的列表
    likeProduct: [],
    // 获取商品的参数
    getProductParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
      min_price:'', //Number	可选	 	价格区间： 最小价格
      max_price:'', //Number	可选	 	价格区间： 最大价格
      sort_type:1 , //Number	可选	0	排序: 0= 不限, 2= 价格由低至高, 3= 价格由高至低
      is_free_postage:0 , //Number	可选	0	是否包邮: 0 = 全部, 1= 包邮
      is_preferential:0 , //Number	可选	0	是否特惠: 0 = 全部, 1= 特惠
    },
    // 推荐
    recommendList:[
      { name: "包邮", id: '1', isActive: false},
      { name: "特惠", id: "2", isActive: false},
    ]
  },

  // 打开筛选的模态框
  handleSortShow() {

    this.setData({
      sortBox: true
    })

  },

  // 获取排序的产品
  handleSort(e) {
    console.log(e.detail.rid)
    
      this.setData({
        likeProduct: [],
        ['getProductParams.page']: 1,
        ['getProductParams.sort_type']: e.currentTarget.dataset.rid
      })

    this.handleSortOff()
    
    this.getUserLikeProduct()
  },

  // 关闭排序的盒子
  handleSortOff() {

    this.setData({
      sortBox: false
    })
  },


  // 打开筛选的盒子
  handelOffPick() {
    this.getCategories()
    let animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })

    animation.top(0).step()

    this.setData({
      // openPickBox: animation.export(),
      showFilterModal:true,
    })

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

  /**
 * 关闭弹窗回调
 */
  handleCloseFilterModal(e) {
    this.setData({
      showFilterModal: false
    })
  },

  // 跳转到商品详情---
  handleInfomation(e) {
    console.log(e)
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&product=' + this.data.myProduct + "&&storeRid=" + e.detail.storeRid
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
 * 滑块最低价格
 */
  handleChangeMinPrice(e) {
    let minPrice = e.detail.lowValue
    if (this.data.getProductParams.max_price == -1) {
      if (minPrice == '不限') {
        minPrice = 800
      }
    }
    this.setData({
      'getProductParams.min_price': minPrice
    })

    if (this.data.leftTimer) {
      clearTimeout(this.data.leftTimer)
    }

    let _t = setTimeout(() => {
      this.getUserLikeProduct()
      this.setData({
        likeProduct: []
      })
    }, 2000)

    this.setData({
      leftTimer: _t
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
      'getProductParams.max_price': maxPrice
    })

    if (this.data.rightTimer) {
      clearTimeout(this.data.rightTimer)
    }

    let _t = setTimeout(() => {
      this.getUserLikeProduct()
      this.setData({
        likeProduct:[]
      })
    }, 2000)

    this.setData({
      rightTimer: _t
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
 * 选择推荐
 */
  handleToggleCategory(e) {
    console.log(e.currentTarget.dataset.index)
    let index = e.currentTarget.dataset.index
    let id = e.currentTarget.dataset.id

    if (id==1){
      this.setData({
        ['getProductParams.is_free_postage']:this.data.getProductParams.is_free_postage==0?1:0
      })

    }else{
      this.setData({
        ['getProductParams.is_preferential']: this.data.getProductParams.is_preferential==0?1:0
      })

    }

    if (this.data.recommendList[index].isActive){
      this.setData({
        ['recommendList[' + index +'].isActive']:false
      })
    }else {
      this.setData({
        ['recommendList[' + index + '].isActive']: true
      })
    }

    this.getUserLikeProduct()
  },

  // 获取商品列表
  getUserLikeProduct() {
    wx.showLoading()
    http.fxGet(api.userlike, this.data.getProductParams, (result) => {
      wx.hideLoading()
      console.log(result, "喜欢的商品列表")
      if (result.success) {
        let data = this.data.likeProduct
        result.data.products.forEach((v) => {
          data.push(v)
        })

        this.setData({
          likeProduct: data,
          isNext: result.data.next,
          totalCount: result.data.count,
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getUserLikeProduct()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

    //判断是否有下一页
    if (!this.data.isNext) {
      utils.fxShowToast("没有更多产品了")
      return
    }
    this.setData({
      ['getProductParams.page']: this.data.getProductParams.page - 0 + 1
    })
    //加载
    this.getUserLikeProduct()

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
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})