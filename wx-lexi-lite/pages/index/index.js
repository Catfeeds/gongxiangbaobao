//index.js
//获取应用实例
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
const common = require('./../../utils/common.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //探索
    characteristicStoreList:[], // 特色品牌商店
    ExploreAdvertisementList: [],// 广告位置
    categoryList:[], // 分类
    editRecommendList:[], // 编辑推荐
    highQualityList:[], // 优质新品
    gatherList:[], // 集合
    goodDesignList:[], // 特惠好设计
    oneHundredList:[], // 百元好物

    //精选里面的
    gratefulList:[], // 人气推荐
    handerAdvertisementList:[], // 头部广告
    middleAdvertisementList:[], // 精选的中间广告
    lexiPick:[], // 乐喜优选
    plantOrderList:[], //种草清单
    swiperIndex: 0, // 旋转木马当前选中项目


    is_mobile:false, // 验证是否登陆
    pickCategory: 2,//选择分类
    //分类列表
    category:[
      {name:'生活馆',id:1},
      {name:'精选',id:2},
      {name:'探索',id:3}
    ]
  },

  // 分类的选择
  handlePickCategory(e) {
    let categoryId = e.currentTarget.dataset.categoryId
    this.setData({
      pickCategory: categoryId
    })
    console.log(categoryId)
    //生活馆里面的东西
    if (categoryId = 1) {

    }
    //精选里面的
    if (categoryId = 2) {
      this.getOpenStoreGuide() //开馆指引
      this.getTodayRecommend() // 今日推荐

    }
    //探索的
    if (categoryId = 3) {
      if (this.data.ExploreAdvertisementList.length!=0){
        return
      }
      this.getExploreAdvertisement() //广告位
      this.getCategory() // 分类
      this.getEditRecommend() // 编辑推荐
      this.getCharacteristicBranderStore() // 特色品牌管
      this.getHighQuality() // 优质新品
      this.getGather() // 集合产品
      this.getGoodDesign() // 特惠好设计
      this.getOneHundred() // 百元好物
    }

  },

  /**探索页面start**/

  //广告位置
  getExploreAdvertisement() {
    http.fxGet(api.banners_explore, {}, (result) => {
      console.log(result,"广告位置")
      if (result.success) {
        this.setData({
          ExploreAdvertisementList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  //分类列表
  getCategory(){
    http.fxGet(api.categories, {}, (result) => {
      console.log(result,"fen lei")
      if (result.success) {
        this.setData({
          categoryList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 编辑推荐
  getEditRecommend(){
    http.fxGet(api.column_explore_recommend, {}, (result) => {
      console.log(result, "编辑 推荐")
      if (result.success) {
        this.setData({
          editRecommendList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 特色品牌管
  getCharacteristicBranderStore(){
    http.fxGet(api.column_feature_store, {}, (result) => {
      console.log(result, "特色品牌管")
      if (result.success) {
        this.setData({
          characteristicStoreList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 关注特色品牌管
  handleAddFollowed(e){
    console.log(e)
    console.log(e.currentTarget.index)
    console.log(e.currentTarget.rid)

    let index = e.currentTarget.dataset.index
    let rid = e.currentTarget.dataset.rid

    //检验是否登陆
    if (!app.globalData.isLogin){
      this.setData({
        is_mobile:true
      })
      return
    }
    http.fxPost(api.add_watch, { rid:rid},(result)=>{
      console.log(result)
      if(result.success){
        this.setData({
          ["characteristicStoreList.stores[" + index +"].is_followed"]:true
        })
      }else{
        utils.fxShowToast(result.status.message)
      }
    })



  },

  //取消关注特色品牌管
  handleDeleteFollowed(e){
    let index = e.currentTarget.dataset.index
    let rid = e.currentTarget.dataset.rid
    console.log(e)
    http.fxPost(api.delete_watch, { rid: rid }, (result) => {
      console.log(result)
      if (result.success) {
        this.setData({
          ["characteristicStoreList.stores[" + index + "].is_followed"]: false
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 优质新品
  getHighQuality(){
    http.fxGet(api.column_explore_new, {}, (result) => {
      console.log(result, "优质新品")
      if (result.success) {
        this.setData({
          highQualityList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 集合
  getGather(){
    http.fxGet(api.column_collections, {}, (result) => {
      console.log(result, "集合")
      if (result.success) {
        this.setData({
          gatherList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 特惠好设计
  getGoodDesign(){
    http.fxGet(api.column_preferential_design, {}, (result) => {
      console.log(result, "特惠好设计")
      if (result.success) {
        this.setData({
          goodDesignList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 百元好物
  getOneHundred(){
    http.fxGet(api.column_affordable_goods, {}, (result) => {
      console.log(result, "百元好物")
      if (result.success) {
        this.setData({
          oneHundredList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**探索页面end**/

  /**精选里面的 start**/

  // 开馆指引
  getOpenStoreGuide(){
    
  },

  // 今日推荐
  getTodayRecommend(){
    http.fxGet(api.column_affordable_goods, {}, (result) => {
      console.log(result, "今日推荐")
      if (result.success) {
        this.setData({
          oneHundredList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 人气推荐 column_handpick_recommend
  getGrateful(){
    http.fxGet(api.column_handpick_recommend, { page: 1, per_page:15}, (result) => {
      console.log(result, "人气推荐")
      if (result.success) {
        this.setData({
          gratefulList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 精选的中间广告banners_handpick_content  handerAdvertisementList
  getChoiceMiddleAdvertisement(){
    http.fxGet(api.banners_handpick_content, { page: 1, per_page: 15 }, (result) => {
      console.log(result, "精选区的中间广告")
      if (result.success) {
        this.setData({
          middleAdvertisementList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 精选区域的头部广告
  getChoiceHanderAdvertisement(){
    http.fxGet(api.banners_handpick, {}, (result) => {
      console.log(result, "精选区的头部广告")
      if (result.success) {
        this.setData({
          handerAdvertisementList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 乐喜优选 column/handpick_optimization
  getLitePick(){
    http.fxGet(api.column_handpick_optimization, {}, (result) => {
      console.log(result, "乐喜优选")
      if (result.success) {
        this.setData({
          lexiPick: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 种草清单 life_records/recommend
  getPlantOrder(){
    http.fxGet(api.life_records_recommend, {}, (result) => {
      console.log(result, "种草清单")
      if (result.success) {
        this.setData({
          plantOrderList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  //旋转木马
  swiperChange(e) {
    console.log(e.detail.current)
    this.setData({
      swiperIndex: e.detail.current
    })
  },



  /**精选里面的 end**/

  //设置头部信息
  handleSetNavigationBar(e='首页',){
    wx.setNavigationBarTitle({
      title: e
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.handleSetNavigationBar('设计师何自然的品牌管')// 设置头部信息

    // 精选里面的
    this.getChoiceHanderAdvertisement() //精选的头部广告
    this.getTodayRecommend() //今日推荐
    this.getGrateful() // 人气推荐
    this.getChoiceMiddleAdvertisement() // 精选的中间广告
    this.getLitePick() // 乐喜优选
    this.getPlantOrder() // 种草清单
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  // 点击分类
  handleCategoryInfoTap(e){
    console.log(e)

  },
  
  // 跳转到商品详情---
  handleInfomation(e) {
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&product=' + this.data.myProduct
    })
  },
  
  
})