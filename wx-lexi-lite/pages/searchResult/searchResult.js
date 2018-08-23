// pages/searchResult/searchResult.js
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
    prductIsNext:false, // 商品是否有下一页
    prodctList:[], // 商品列表

    storeIsNext:false, // 品牌馆是否有下一页
    storeList:[], // 品牌馆列表

    userList: [], // 用户的的列表
    userIsNext: false,

    navbarCategoryId: 1,
    navbarCategory: [{
        name: "商品",
        id: 1
      },
      {
        name: "品牌馆",
        id: 2
      },
      {
        name: "用户",
        id: 3
      }
    ],

    // 品牌馆搜索
    brandStoreParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
      qk: "", //必须	 	关键词
    },
    // 用户搜索
    userParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
      qk: "", //必须	 	关键词
    },

    // 搜索商品的参数
    productParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
      cids: '', //Number	可选	 	分类Id
      status: 1, //Number	可选	1	商品状态 -1: 所有 0: 仓库中; 1: 出售中; 2: 下架中; 3: 已售罄
      qk: '', //String	可选	 	搜索关键字
      min_price: '', //Number	可选	 	价格区间： 最小价格
      max_price: '', //Number	可选	 	价格区间： 最大价格
      sort_type: '', //Number	可选	0	排序: 1= 综合排序, 2= 价格由低至高, 3= 价格由高至低
      is_free_postage: '', //Number	可选	0	是否包邮: 0 = 全部, 1= 包邮
      is_preferential: '', //Number	可选	0	是否特惠: 0 = 全部, 1= 特惠
      is_custom_made: '', //Number	可选	0	是否可定制: 0 = 全部, 1= 可定制
    }
  },

  // 切换分类
  handleCategoryChange(e) {
    console.log(e.currentTarget.dataset.id)

    this.setData({
      navbarCategoryId: e.currentTarget.dataset.id
      
    })

    if (this.data.navbarCategoryId == 2) {
      if (this.data.storeList.length==0){
        this.getBrandStore() // 获取品牌管
      }
    }

    if (this.data.navbarCategoryId == 3) {
      this.getUser()
    }
  },

  //取消关注人
  hanleDeleteWatch(e) {
    let index = e.currentTarget.dataset.index
    console.log(index)
    http.fxPost(api.unfollow_user, {
      uid: e.currentTarget.dataset.uid
    }, (result) => {
      console.log(result)
      if (result.success) {
        this.setData({
          ['userList[' + index + '].follow_status']: result.data.followed_status
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  //添加关注人
  hanleAddWatch(e) {
    let index = e.currentTarget.dataset.index
    http.fxPost(api.follow_user, {
      uid: e.currentTarget.dataset.uid
    }, (result) => {
      console.log(result)
      if (result.success) {
        this.setData({
          ['userList[' + index + '].follow_status']: result.data.followed_status
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 跳转到其他人地主页
  handleToPeopleTap(e) {
    console.log(e.currentTarget.dataset.uid)
    if (e.currentTarget.dataset.index == 0) {
      wx.switchTab({
        url: '../user/user',
      })
    } else {
      wx.navigateTo({
        url: '../people/people?uid=' + e.currentTarget.dataset.uid,
      })
    }

  },

  // 取消关注店铺---
  handleDeleteWatch(e) {
    console.log(e.currentTarget.dataset.rid)
    console.log(e.currentTarget.dataset.index)
    let rid = e.currentTarget.dataset.rid
    let index = e.currentTarget.dataset.index

    http.fxPost(api.delete_watch, {
      rid: rid
    }, (result) => {
      if (result.success) {
        this.setData({
          ['storeList[' + index +'].is_follow_store']: false
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 添加关注店铺---
  handleAddWatch(e) {
    console.log(e)
    let rid = e.currentTarget.dataset.rid
    let index = e.currentTarget.dataset.index

    http.fxPost(api.add_watch, {
      rid: rid
    }, (result) => {
      if (result.success) {
        this.setData({
          ['storeList[' + index + '].is_follow_store']: true
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 跳转到商品详情---
  handleToProductInfoTap(e) {
    console.log(e.currentTarget.dataset.rid)
    wx.navigateTo({
      url: '../product/product?rid=' + e.currentTarget.dataset.rid
    })
  },

  // 跳转到搜索页面
  handleToSearch() {
    wx.navigateTo({
      url: '../search/search',
    })
  },

  // 跳转到商品详情---
  handleInfomation(e) {
    console.log(e)
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&product=' + this.data.myProduct
    })
  },

  // 跳转到品牌详情
  handleTobrandStore(e){
    let rid = e.currentTarget.dataset.storeRid
    wx.navigateTo({
      url: '../branderStore/branderStore?rid=' + rid
    })

  },

  // 搜索商品 
  getSearch() {
    wx.showLoading()
    http.fxGet(api.core_platforms_search_products, this.data.productParams, (result) => {
      wx.hideLoading()
      console.log(result, "商品搜索结果")
      let data = this.data.prodctList
      result.data.products.forEach((v)=>{
        data.push(v)
      })

      if (result.success) {
        this.setData({
          prodctList: data,
          prductIsNext:result.data.next
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 搜索品牌商店 
  getBrandStore(){
    wx.showLoading()
    http.fxGet(api.core_platforms_search_stores, this.data.brandStoreParams, (result) => {
      wx.hideLoading()
      console.log(result, "品牌店结果")
      let data = this.data.storeList
      result.data.stores.forEach((v) => {
        data.push(v)
      })

      if (result.success) {
        this.setData({
          storeList: data,
          storeIsNext: result.data.next
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 搜索用户的列表
  getUser(){
    wx.showLoading()
    http.fxGet(api.core_platforms_search_users, this.data.userParams, (result) => {
      wx.hideLoading()
      console.log(result, "搜获用户结果")
      let data = this.data.userList
      result.data.users.forEach((v) => {
        v.username = common.sliceString(v.username,14)
        data.push(v)
      })

      if (result.success) {
        this.setData({
          userList:data ,
          userIsNext: result.data.next
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
    console.log(options)

    this.setData({
      ['productParams.qk']: options.text,
      ['brandStoreParams.qk']: options.text,
      ['userParams.qk']: options.text
    })
    this.getSearch()

  },

  /**
 * 页面上拉触底事件的处理函数
 */
  onReachBottom: function () {

    // 商品的触底加载
    if (this.data.navbarCategoryId==1){
      if (!this.data.prductIsNext){
        utils.fxShowToast("没有更多商品了")
        return
      }

      this.setData({
        ['productParams.page']: this.data.productParams.page + 1
      })

      this.getSearch() 
    }

    // 商品的触底加载
    if (this.data.navbarCategoryId==2){
      if (!this.data.storeIsNext){
        utils.fxShowToast("没有更多商品了")
        return
      }

      this.setData({
        ['brandStoreParams.page']: this.data.brandStoreParams.page + 1
      })

      this.getBrandStore() 
    }

    // 用户列表
    if (this.data.navbarCategoryId == 3) {
      if (!this.data.userIsNext) {
        utils.fxShowToast("没有更多商品了")
        return
      }

      this.setData({
        ['userParams.page']: this.data.userParams.page + 1
      })

      this.getUser()
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})