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
    watchStoreList: [], // 关注店铺的列表
    followerAddWatch: [], // 关注和粉丝的数量
    is_mobile: false, // 注册的呼出框
    userBrowsesProduct: [], //用户浏览记录---
    userInfo: [], // 用户的信息
    classInfo: 1, // 切换---
    sotrF: false,
    likeProduct: [], // 喜欢的的商品---
    recentlyLookProduct: [], // 最近查看的商品---
    desireOrderProduct: [], //心愿单商品---
    product: [{}],
    // 切换类型---
    classList: [{
        rid: 1,
        num: 123,
        name: "喜欢"
      },
      {
        rid: 2,
        num: 13,
        name: "收藏"
      },
      {
        rid: 3,
        num: 123,
        name: "设计馆"
      }
    ],
    // 获取商品的参数
    getProductParams: {
      page: 1,
      per_page: 10
    },
    //排序的参数
    sortParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
      min_price: '', //Number	可选	 	价格区间： 最小价格
      max_price: '', //Number	可选	 	价格区间： 最大价格
      sort_type: 0, //Number	可选	0	排序: 0= 不限, 1= 价格由低至高, 2= 价格由高至低
      is_free_postage: 0, //Number	可选	0	是否包邮: 0 = 全部, 1= 包邮
      is_preferential: '', //Number	可选	0	是否特惠: 0 = 全部, 1= 特惠
    }
  },

  // 添加关注---
  handleAddWatch(e) {
    console.log(e)
    let rid = e.currentTarget.dataset.rid
    let index = e.currentTarget.dataset.index

    http.fxPost(api.add_watch, {
      rid: rid
    }, (result) => {
      if (result.success) {
        this.setData({
          ['watchStoreList.stores' + index + '.watch']: false
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  
  // 取消关注---
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
          ['watchStoreList.stores' + index +'.watch']:true
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 筛选
  handlePick(e){
    console.log(e)
    this.setData({
      ['sortParams.is_free_postage']: e.detail.logisticsPrice
    })
    this.getPick()
  },
  // 获取排序的产品

  handleSort(e) {
    console.log(e.detail.rid)
    this.setData({
      ['sortParams.sort_type']: e.detail.rid
    })
    console.log(this.data.pickParmas)
    this.getPick()
  },

  //获取筛选和排序的公用接口
  getPick(){
    http.fxGet(api.products_index, this.data.sortParams, (result) => {
      console.log(result)
      if (result.success) {
        this.setData({
          likeProduct: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },


  //获取喜欢 收藏 设计管
  getCategoryQuantity() {
    http.fxGet(api.users_user_center, {}, (result) => {
      console.log(result)
      let category = this.data.classList
      category.forEach((v) => {
        console.log(v)
        if (v.rid == 1) {
          v.num = result.data.user_like_counts
        }
        if (v.rid == 2) {
          v.num = result.data.wish_list_counts
        }
        if (v.rid == 3) {
          v.num = result.data.followed_stores_counts
        }
      })
      this.setData({
        classList: category,
        followerAddWatch: result.data
      })
    })
  },

  // 获取用户信息---
  getUserInfo() {
    http.fxGet(api.users_profile, {}, (result) => {
      if (result.success) {
        console.log(result, '用户的信息')
        // 格式化时间
        result.data.profile.created_at = utils.timestamp2string(result.data.profile.created_at, 'cn')
        // 设置全局变量
        app.globalData.userInfo.profile = result.data.profile
        this.setData({
          userInfo: app.globalData.userInfo
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
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

  // 获取商品
  getProduct(e = 1) {
    switch (e) {
      case 1:
        http.fxGet(api.userlike, this.data.getProductParams, (result) => {
          console.log(result)
          if (result.success) {
            this.setData({
              likeProduct: result.data
            })
          } else {
            utils.fxShowToast(result.status.message)
          }
        })
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
        http.fxGet(api.users_followed_stores, this.data.getProductParams, (result) => {
          console.log(result)
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
  onLoad: function(options) {
    // 注册呼出框
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return false
    }
    this.getUserInfo() // 获取用户的信息
    this.getCategoryQuantity() // 获取用户的喜欢收藏
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
  redBagTap() {
    wx.navigateTo({
      url: '../redBag/redBag',
    })
  },

  // 跳转到订单页面 
  handleToOrderTap() {
    wx.navigateTo({
      url: '../order/order',
    })
  },

  // 跳转到商品详情---
  handleToProductInfoTap(e) {
    console.log(e.currentTarget.dataset.rid)
    wx.navigateTo({
      url: '../product/product?rid=' + e.currentTarget.dataset.rid
    })
  },

  // 跳转到商品详情---
  handleInfomation(e) {
    console.log(e)
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
  handleWatchTap() {
    wx.navigateTo({
      url: '../watch/watch',
    })
  },
  //粉丝页面的跳转
  handleFollowerTap() {
    wx.navigateTo({
      url: '../myFollower/myFollower',
    })
  },
  // 查看全部
  handleAllProduct(e) {
    console.log(e.currentTarget.dataset.from)
    wx.navigateTo({
      url: '../allProduct/allProduct?from=' + e.currentTarget.dataset.from,
    })
  },
  // 排序的盒子
  handleSortShow() {
    this.setData({
      isSortShow: true
    })
  },
  // 排序的盒子关闭
  handleSortOff() {
    this.setData({
      isSortShow: false
    })
  },
  //关闭筛选的盒子
  handelOffPick() {
    this.setData({
      handelOffPick: false
    })
  },
  // 打开筛选的盒子
  hanlePickS() {
    this.setData({
      handelOffPick: true
    })
  },

})