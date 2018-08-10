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

    }
    //探索的
    if (categoryId = 3) {
      this.getExploreAdvertisement() //广告位
      this.getCategory() // 分类
      this.getEditRecommend() // 编辑推荐
      this.getCharacteristicBranderStore() // 特色品牌管
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

  /**探索页面end**/

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

  }
})