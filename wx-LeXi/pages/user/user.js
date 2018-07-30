// pages/user/user.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    is_mobile: false,// 注册的呼出框
    userBrowsesProduct: [], //用户浏览记录---
    userInfo: [],// 用户的信息
    classInfo: 1,// 切换---
    sotrF: false,
    likeProduct: [],// 喜欢的的商品---
    recentlyLookProduct: [],// 最近查看的商品---
    desireOrderProduct: [], //心愿单商品---

    product: [
      {
        title: "手作精品款牛皮手提黑包",
        img: "../../images/timg.jpg",
        price: 99,
        like: 123
      },
      {
        title: "手作精品款牛皮手提黑包",
        img: "../../images/timg.jpg",
        price: 99,
        like: 123
      },
      {
        title: "手作精品款牛皮手提黑包",
        img: " ../../images / timg.jpg",
        price: 99,
        like: 123
      },
      {
        title: "手作精品款牛皮手提黑包",
        img: " ../../images / timg.jpg",
        price: 99,
        like: 123
      },
      {
        title: "手作精品款牛皮手提黑包",
        img: " ../../images / timg.jpg",
        price: 99,
        like: 123
      },
      {
        title: "手作精品款牛皮手提黑包",
        img: " ../../images / timg.jpg",
        price: 99,
        like: 123
      },
      {
        title: "手作精品款牛皮手提黑包",
        img: "../../images/timg.jpg",
        price: 99,
        like: 123
      },
      {
        title: "手作精品款牛皮手提黑包",
        img: "../../images/timg.jpg",
        price: 99,
        like: 123
      },
      {
        title: "手作精品款牛皮手提黑包",
        img: " ../../images / timg.jpg",
        price: 99,
        like: 123
      },
      {
        title: "手作精品款牛皮手提黑包",
        img: " ../../images / timg.jpg",
        price: 99,
        like: 123
      },
    ],
    // 切换类型---
    classList:[
      {rid:1,num:123,name:"喜欢"},
      {rid:2,num:13,name:"收藏"},
      {rid:3,num:123,name:"设计馆"}
    ],
    // 获取商品的参数
    getProductParams:{
      page:1,
      per_page:10
    },
  },

  // 获取用户信息---
  getUserInfo () {
    http.fxGet(api.users_profile, {}, (result) => {
      if(result.success){
        console.log(result, '用户的信息')
        // 格式化时间
        result.data.profile.created_at = utils.timestamp2string(result.data.profile.created_at, 'cn')
        // 设置全局变量
        app.globalData.userInfo.profile = result.data.profile
        this.setData({
          userInfo: app.globalData.userInfo
        })      
      }else{
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 切换类别
  classTap (e) {
    console.log(e.currentTarget.dataset.rid)
    this.setData({
      classInfo: e.currentTarget.dataset.rid
    })
    this.getProduct(e.currentTarget.dataset.rid)
  },

  // 获取商品
  getProduct (e=1) {
    switch (e){
      case 1:
        http.fxGet(api.userlike, this.data.getProductParams,(result)=>{
          console.log(result)
          if(result.success){
            this.setData({
              likeProduct: result.data
            })
          }else{
            utils.fxShowToast(result.status.message)
          }
        })
      break;
      case 2:
        //最近查看
        http.fxGet(api.user_browses,{},(result)=>{
          if(result.success){
            console.log(result)
            this.setData({
              userBrowsesProduct: result.data
            })
          }else{
            utils.fxShowToast(result.status.message)
          }
        })
        //心愿单
        http.fxGet(api.wishlist, this.data.getProductParams, (result) => {
          if (result.success) {
            console.log(result)
            this.setData({
              desireOrderProduct: result.data
            })
          } else {
            utils.fxShowToast(result.status.message)
          }
        })        
      break;
      default:
        // 设计管
        http.fxGet(api.userlike, this.data.getProductParams,(result)=>{
          if(result.success){
            this.setData({
              // likeProduct: result.data
            })
          }else{
            utils.fxShowToast(result.status.message)
          }
        });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 注册呼出框
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return false
    }

    this.getUserInfo() // 获取用户的信息
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
    // 是否登陆
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return
    }
    this.getProduct() // 获取商品---
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**
   * 监听页面的滑动
   */
  onPageScroll(e) {

    if (e.scrollTop > 245) {
      this.setData({
        sotrF: true
      })
    } else if (e.scrollTop <= 245) {
      this.setData({
        sotrF: false
      })
    }

  },

  // 跳转到设置页面
  setTap(e) {
    wx.navigateTo({
      url: '../settings/settings'
    })
  },

  // 跳转到优惠券
  couponTap() {
    wx.navigateTo({
      url: '../coupon/coupon',
    })
  },

  // 跳转到红包页面
  redBagTap(){
    wx.navigateTo({
      url: '../redBag/redBag',
    })
  },

  // 跳转到订单页面 
  handleToOrderTap(){
    wx.navigateTo({
      url: '../order/order',
    })
  },

  // 跳转到商品详情---
  handleToProductInfoTap(e){
    console.log(e.currentTarget.dataset.rid)
    wx.navigateTo({
      url: '../product/product?rid=' + e.currentTarget.dataset.rid
    })
  },

  // 跳转到商品详情---
  handleInfomation(e) {
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&product=' + this.data.myProduct
    })
  },

  // 关闭
  hanleOffLoginBox(e) {
    console.log(e)
    this.setData({
      is_mobile: e.detail.offBox
    })
  },
  // 关注页面跳转
  handleWatchTap(){
    wx.navigateTo({
      url: '../watch/watch',
    })
  },
  //粉丝页面的跳转
  handleFollowerTap(){
    wx.navigateTo({
      url: '../myFollower/myFollower',
    })
  }
})