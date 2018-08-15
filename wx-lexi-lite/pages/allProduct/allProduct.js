// pages/allProduct/allProduct.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    productList:[], // 商品列表
    touchBottomInfo:"", // 触底加载需要的信息,
    isLoadingNextPage: true,// 触底是否加载,
    editRecommendRequestParams:{
      page:1	,//Number	可选	1	当前页码
      per_page:10	,//Number	可选	10	每页数量
    }
  },

  /**来自首页探索页面里面的 start**/

  //编辑推荐
  editRecommend(){
    wx.showLoading()

    http.fxGet(api.column_explore_recommend, this.data.editRecommendRequestParams, (result) => {
      console.log(result, "编辑 推荐")
      wx.hideLoading()

      if (result.success) {
        let data = this.data.productList
        result.data.products.forEach((v) => {
          data.push(v)
        })

          this.setData({
            productList: data,
            isLoadingNextPage: result.data.next
          })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 百元好物
  getOneHundred(){
    wx.showLoading()

    http.fxGet(api.column_affordable_goods, this.data.editRecommendRequestParams, (result) => {
      console.log(result, "百元好物")
      wx.hideLoading()

      if (result.success) {
        let data = this.data.productList
        result.data.products.forEach((v) => {
          data.push(v)
        })

        this.setData({
          productList: data,
          isLoadingNextPage: result.data.next
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 优质新品
  getHighQuality(){
    wx.showLoading()

    http.fxGet(api.column_explore_new, this.data.editRecommendRequestParams, (result) => {
      console.log(result, "优质新品")
      wx.hideLoading()

      if (result.success) {
        let data = this.data.productList
        result.data.products.forEach((v) => {
          data.push(v)
        })

        this.setData({
          productList: data,
          isLoadingNextPage: result.data.next
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 特惠好设计 getGoodDesign
  getGoodDesign(){
    wx.showLoading()

    http.fxGet(api.column_preferential_design, this.data.editRecommendRequestParams, (result) => {
      console.log(result, "特惠好设计")
      wx.hideLoading()

      if (result.success) {
        let data = this.data.productList
        result.data.products.forEach((v) => {
          data.push(v)
        })

        this.setData({
          productList: data,
          isLoadingNextPage: result.data.next
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },


  /**来自编辑推荐页面里面的 end**/

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    //编辑推荐
    if(options.from=="editRecommend"){
      wx.setNavigationBarTitle({ title: "编辑推荐"})
      this.editRecommend()

      this.setData({
        touchBottomInfo: options.from
      })
    }

    // 百元好物
    if (options.from =="oneHundred"){
      wx.setNavigationBarTitle({ title: "百元好物" })
      this.getOneHundred()

      this.setData({
        touchBottomInfo: options.from
      })
    }

    //优质新品
    if (options.from == "highQualityList") {
      wx.setNavigationBarTitle({ title: "优质新品" })
      this.getHighQuality()

      this.setData({
        touchBottomInfo: options.from
      })
    }

    // 特惠好设计 getGoodDesign
    if (options.from == "goodDesign") {
      wx.setNavigationBarTitle({ title: "特惠好设计" })
      this.getGoodDesign()

      this.setData({
        touchBottomInfo: options.from
      })
    }




    console.log(options)
    switch (options.from) {
      case 'userBrowses':
        wx.setNavigationBarTitle({ title: "浏览记录"})
        //最近查看
        http.fxGet(api.user_browses, {}, (result) => {
          if (result.success) {
            console.log(result)
            this.setData({
              productList: result.data
            })
          } else {
            utils.fxShowToast(result.status.message)
          }
        })
        break;
      case 2:
        
        break;
      default:
        
    }
  },

  // 跳转到商品详情---
  handleInfomation(e) {
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&product=' + this.data.myProduct
    })
  },

  /**
   * onReachBottom 触底加载
   * **/ 

  onReachBottom(){
    console.log(this.data.touchBottomInfo)

    this.setData({
      ['editRecommendRequestParams.page']: this.data.editRecommendRequestParams.page - 0 + 1
    })

    if (!this.data.isLoadingNextPage) {
      utils.fxShowToast("没有更多了")
      return
    }

    // 触底加载编辑推荐
    if (this.data.touchBottomInfo == "editRecommend") {
      this.editRecommend()
    }

    //触底加载百元好物
    if (this.data.touchBottomInfo == "oneHundred") {
      this.getOneHundred()
    }

    //触底加载优质新品
    if (options.from == "highQualityList") {
      this.getHighQuality()
    }

    //触底加载特惠好设计 goodDesign
    if (options.from == "goodDesign") {
      this.getGoodDesign()
    }
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
  
  }
})