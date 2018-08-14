// pages/people/people.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
let wxparse = require("../../wxParse/wxParse.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    otherPeopleUid:[], // 其他人的uid
    otherPeopleInfo:[], // 其他人地个人中心
    otherWatchStoreList:[], //获取其他人关注地店铺列表
    otherLikeList:[], //获取其他人的喜欢商品列表
    userBrowsesProduct:[], // 其他人的最近浏览
    desireOrderProduct:[], // 其他人的心愿单
    watchStoreList:[], // 其他人设计管

    classInfo: 1, // 切换---
    // 切换类型---
    classList: [{
      rid: 1,
      num: 0,
      name: "喜欢"
    },
    {
      rid: 2,
      num: 0,
      name: "收藏"
    },
    {
      rid: 3,
      num: 0,
      name: "设计馆"
    }
    ],

    // 翻页参数
    nextPageParmas:{
      page:	1,//Number	可选	1	当前页码
      per_page:	10,//Number	可选	10	每页数量
    }
  },
  
  // 获取去别人的首页的关注
  getOtherFollow(){

  },

  // 获取别人的粉丝

getOtherFans(){

},

// 获取其他人个人中心
getOtherPeopleInfo(e){
  console.log(e)
  http.fxGet(api.users_other_user_center, {uid:e}, (result) => {
    console.log(result, "获取其他人个人中心")
    if (result.success) {
      let params = this.data.classList
      params.forEach((v,i)=>{
        if(v.rid==1){
          v.num = result.data.user_like_counts

        }
        if (v.rid == 2) {
          v.num = result.data.wish_list_counts
        }
        if (v.rid == 3) {
          v.num = result.data.followed_stores_counts
        }
        if (result.data.username!=null){
          wx.setNavigationBarTitle({ title: result.data.username})
        }else{
          wx.setNavigationBarTitle({ title: "乐喜" })
        }
      })

      this.setData({
        classList:params,
        otherPeopleInfo: result.data
      })
    } else {
      utils.fxShowToast(result.status.message)
    }
  })
},

// 获取别人关注地店铺列表 users/other_followed_stores
getOtherWatchStore(e){
  http.fxGet(api.users_other_followed_stores, { ...this.data.nextPageParmas, uid: e }, (result) => {
    console.log(result, "获取其他人关注地店铺列表")
    if (result.success) {
      this.setData({
        otherWatchStoreList: result.data
      })
    } else {
      utils.fxShowToast(result.status.message)
    }
  })
},

// 获取别人喜欢列表 users/user_like_counts
  getOtherLikeQuantity(e){
    console.log()
    http.fxGet(api.other_userlike, {uid: e }, (result) => {
      console.log(result, "获取其他人喜欢列表")
      if (result.success) {
        this.setData({
          otherLikeList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 分类获取 喜欢 收藏 设计管
  // 获取商品
  getProduct(e = 1) {
    // 是否登陆
    if (!app.globalData.isLogin) {
      return
    }
    switch (e) {
      case 1:
        // this.getOtherLikeQuantity(this.data.otherPeopleUid) // 获取别人的喜欢
        break;
      case 2:
        //最近查看
        http.fxGet(api.user_browses, {}, (result) => {
          if (result.success) {
            console.log(result)
            this.setData({
              userBrowsesProduct: result.data
            })
          } else {
            utils.fxShowToast(result.status.message)
          }
        })
        //心愿单
        http.fxGet(api.other_wishlist, { user_id: this.data.otherPeopleUid}, (result) => {
          console.log(this.data.otherPeopleUid)
          if (result.success) {
            console.log(result,"其他人心愿单")
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
        http.fxGet(api.users_other_followed_life_stores, { user_id: this.data.otherPeopleUid } , (result) => {
          console.log(result, "设计管")
          if (result.success) {
            this.setData({
              watchStoreList: result.data
            })
          } else {
            utils.fxShowToast(result.status.message)
          }
        });
    }
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      otherPeopleUid: options.uid
    })

    this.getOtherPeopleInfo(options.uid) // 获取其他人个人中心
    // this.getOtherWatchStore(options.uid) // 获取其他人关注地店铺列表
    this.getOtherLikeQuantity(options.uid) // 获取其他人的喜欢


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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  handleDynamicTap(e){
    wx.navigateTo({
      url: '../dynamic/dynamic?from=people&uid=' + this.data.otherPeopleUid
    })
  },
  // 切换类别
  classTap(e) {
    console.log(e.currentTarget.dataset.rid)
    this.setData({
      classInfo: e.currentTarget.dataset.rid
    })
    this.getProduct(e.currentTarget.dataset.rid)
  },
})