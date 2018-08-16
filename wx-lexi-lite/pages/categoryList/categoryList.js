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
    isNext:false, // 是否有分页
    productList: [], // 商品列表

    pickQuantity: "", // 商品的数量
    openPickBox: false, // 筛选的模态框
    sortBox: false, // 排序的模态框

    params: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
      id: "",  // Number	必须	 	当前分类编号
      cids: '',//String	可选	 	分类Id, 多个用, 分割
      qk: "",//String	可选	 	搜索关键词
      min_price: '',//Number	可选	 	价格区间： 最小价格
      max_price: '',//Number	可选	 	价格区间： 最大价格
      sort_type: '',//Number	可选	0	排序: 0= 不限, 1= 综合排序, 2= 价格由低至高, 3= 价格由高至低
      is_free_postage: '',//Number	可选	0	是否包邮: 0 = 全部, 1= 包邮
      is_preferential: '',//Number	可选	0	是否特惠: 0 = 全部, 1= 特惠
      is_custom_made: '',//Number	可选	0	是否可定制: 0 = 全部, 1= 可定制
    }
  },

getcategoryList(){
  wx.showLoading()
  http.fxGet(api.category_products, this.data.params,(result)=>{
    console.log(result,"分类产品的列表")
    wx.hideLoading()
    if(result.success){

      let data = this.data.productList
      result.data.products.forEach((v,i)=>{
        data.push(v)
      })

      this.setData({
        isNext: result.data.next,
        productList: data,
        pickQuantity: result.data.count
      })

    }else{
      utils.fxShowToast(result.status.message)
    }
  })
},

  /**
   * 生命周期函数--监听页面加载 
   */
  onLoad: function (options) {
    console.log(options)
    wx.setNavigationBarTitle({
      title: options.titleName,
    })

    this.setData({
      ["params.id"]: options.categryId
    })

    this.getcategoryList()
  },

  // 获取筛选
  handlePickProduct(e) {
    console.log(e)
    let rids = e.detail.category
    let minPrice = e.detail.minPrice
    let maxPrice = e.detail.maxPrice
    this.setData({
      productList: [],
      ['params.page']: e.detail.page ? e.detail.page : this.data.page,
      ['params.cids']: rids == undefined ? "" : rids.join(','),
      ['params.min_price']: minPrice,
      ['params.max_price']: maxPrice
    })

    this.getcategoryList()
  },

  // 获取排序的产品
  handleSort(e = 0) {
    console.log(e.detail.rid)
    if (e.detail.rid != undefined) {
      this.setData({
        productList: [],
        ['params.page']: 1,
        ['params.sort_type']: e.detail.rid
      })
    }

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
      openPickBox: animation.export()
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


  // 打开排序的盒子
  handelOffPick() {
    let animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })

    animation.top(0).step()

    this.setData({
      sortBox: animation.export()
    })

  },

  // 关闭排序的盒子
  handleSortOff() {
    let animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })

    animation.top(10000).step()

    this.setData({
      sortBox: animation.export()
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
      utils.fxShowToast("没有更多了")
      return
    }

    this.getcategoryList()

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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  // 跳转到搜索页面
  handleToSearch(){
    wx.navigateTo({
      url: '../search/search',
    })
  },
  // 跳转到商品详情---
  handleInfomation(e) {
    console.log(e)
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&product=' + this.data.myProduct + "&storeRid=" + e.detail.storeRid
    })
  },
})