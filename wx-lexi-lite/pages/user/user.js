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
    isLoadPageShow:true, // 加载页面的三个点
    orderSum:0, // 有没有订单
    couponSum:0,// 有没有优惠券
    is_login:false, // 是否登陆
    activeSubMenu: 'user',
    haveSmallB: false,
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
        num: 0,
        name: "已喜欢"
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

  /**
   * 切换生活馆管理
   */
  handleGoStoreManage () {
    wx.navigateTo({
      url: '../lifeStoreManage/lifeStoreManage',
    })
  },

  // 跳转到品牌管详情
  handleTobrandStore(e) {
    wx.navigateTo({
      url: '../branderStore/branderStore?rid=' + e.currentTarget.dataset.rid,
    })
  },

  /***
   * 我喜欢的商品列表 
  */
  handleUserlikeList(){
    wx.navigateTo({
      url: '../userLikeProduct/userLikeProduct'
    })
  },
  /**
   * 获取用户授权手机号
   */
  handleGotPhoneNumber (e) {
    console.log(e)
    if (e.detail.errMsg == 'getPhoneNumber:ok') {
      // 调用login获取code
      wx.login({
        success: (res) => {
          // 发送 res.code 到后台换取 openId
          const code = res.code
          console.log('Login code: ' + code)

          http.fxPost(api.wxa_authorize_bind_mobile, {
            code: code,
            auth_app_id: app.globalData.app_id,
            encrypted_data: e.detail.encryptedData,
            iv: e.detail.iv,
          }, (res) => {
            console.log(res, '微信授权手机号')
            if (res.success) {
              // 登录成功，得到jwt后存储到storage
              wx.setStorageSync('jwt', res.data)
              console.log(res.data, 'jwt信息')
              app.globalData.isLogin = true
              app.globalData.token = res.data.token
              app.globalData.uid = res.data.uid
              //更新用户信息
              app.updateUserInfo(res.data)
              // 更新小B身份
              app.updateLifeStoreInfo(res.data)
              // 回调函数
              app.hookLoginCallBack()
            } else {
              utils.fxShowToast(res.status.message)
            }
          })
        }
      })      
    } else {
      utils.fxShowToast('拒绝授权，你可以选择手机号动态登录')
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
          ['watchStoreList.stores[' + index + '].followed_status']: 1
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
          ['watchStoreList.stores[' + index + '].followed_status']: 0
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 筛选
  handlePick(e){
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }
    console.log(e)
    this.setData({
      likeProduct:[],
      ['sortParams.page']:1,
      ['sortParams.min_price']: e.detail.minPrice, // 最小价格
      ['sortParams.max_price']: e.detail.maxPrice, // 最大价格
      ['sortParams.is_free_postage']: e.detail.logisticsPrice // 是否包邮
    })
    this.getPick()
  },

  // 获取排序的产品
  handleSort(e) {
    console.log(e.detail.rid)
    this.setData({
      likeProduct: [],
      ['sortParams.page']: 1,
      ['sortParams.sort_type']: e.detail.rid
    })
    console.log(this.data.pickParmas)
    this.getPick()
  },

  // 获取是否有未使用的优惠券和订单
  getCouponAddOrder(){
    // 是否登陆
    if (!app.globalData.isLogin) {
      return
    }
    http.fxGet(api.orders_order_coupon_count, {}, (result) =>{
      if(result.success){
        console.log(result,"订单，优惠券的数量")
        this.setData({
          orderSum: result.data.order_count, // 有没有订单
          couponSum: result.data.coupon_count,// 有没有优惠券
        })
      }else{
        utils.fxShowToast(result.status.message)
      }
    })
  },

  //获取筛选和排序的公用接口
  getPick(){
    http.fxGet(api.products_index, this.data.sortParams, (result) => {
      console.log(result)
      if (result.success) {
        if (this.data.likeProduct.length==0){
          this.setData({
            likeProduct: result.data
          })
        }else{
          this.setData({
            ['likeProduct.products']: this.data.likeProduct.products.push(result.data.products)
          })
        }

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  //获取喜欢 收藏 设计管
  getCategoryQuantity() {
    // 是否登陆
    if (!app.globalData.isLogin) {
      return
    }
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
    // 是否登陆
    if (!app.globalData.isLogin) {
      return
    }
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
    // 是否登陆
    if (!app.globalData.isLogin) {
      return
    }
    switch (e) {
      case 1:
        http.fxGet(api.userlike, this.data.getProductParams, (result) => {
          console.log(result,"喜欢的商品")
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
        http.fxGet(api.user_browses, { page: 1, per_page: 10}, (result) => {
          if (result.success) {
            console.log(result,"用户最近查看")
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
          console.log(result,"设计管")
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
    this.getUserInfo() // 获取用户的信息
    // 是否登陆
    this.setData({
      is_login: app.globalData.isLogin
    })

    const lifeStore = wx.getStorageSync('lifeStore')
    // 小B商家获取自己生活馆
    if (lifeStore.isSmallB) {
      this.setData({
        haveSmallB: true
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.setData({
      isLoadPageShow: false
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getCouponAddOrder() // 获取没有使用的优惠券和订单
    this.getProduct() // 获取商品---
    this.getCategoryQuantity() // 获取用户的喜欢收藏---
  },

  // 触底加载
  onReachBottom: function () {
    // 是否登陆
    if (!app.globalData.isLogin) {
      return
    }
    console.log(123)
    if (this.data.classInfo == 1){
      //判断是否有下一页
      if (!this.data.likeProduct.next) {
        utils.fxShowToast("没有更多产品了")
        return
      }
      this.setData({
        ['sortParams.page']: this.data.sortParams.page - 0 + 1
      })
      //加载
      this.getPick()
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this.setData({
      classInfo: 1
    })

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
    return app.shareLeXi()
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
    console.log(e)
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }
    wx.navigateTo({
      url: '../settings/settings?rid=' + e.currentTarget.dataset.id
    })
  },

  // 跳转到优惠券
  couponTap() {
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }
    wx.navigateTo({
      url: '../coupon/coupon',
    })
  },

  // 跳转到红包页面
  redBagTap() {
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }
    wx.navigateTo({
      url: '../redBag/redBag',
    })
  },

  // 跳转到订单页面 
  handleToOrderTap() {
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }
    wx.navigateTo({
      url: '../order/order',
    })
  },

  // 跳转到商品详情---
  handleToProductInfoTap(e) {
    console.log(e.currentTarget.dataset)
    wx.navigateTo({
      url: '../product/product?rid=' + e.currentTarget.dataset.rid + "&&storeRid=" + e.currentTarget.dataset.storeId
    })
  },

  // 跳转到商品详情---
  handleInfomation(e) {
    console.log(e)
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&product=' + this.data.myProduct
    })
  },

  // 关闭登陆框
  hanleOffLoginBox(e) {
    console.log(e)
    wx.showTabBar()
    this.setData({
      // is_mobile: e.detail.offBox
       is_mobile: false
    })
  },
  
  // 关注页面跳转
  handleWatchTap() {
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }
    wx.navigateTo({
      url: '../watch/watch',
    })
  },
  //粉丝页面的跳转
  handleFollowerTap() {
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }
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
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }
    this.setData({
      isSortShow: true
    })
  },
  // 排序的盒子关闭
  handleSortOff() {
    var params = this.data.isSortShow
    if (params) {
      params = false
    } else {
      params = true
    }
    this.setData({
      isSortShow: params
    })
  },
  // 排序的盒子关闭
  // handleSortOff() {
  //   this.setData({
  //     isSortShow: false
  //   })
  // },
  //关闭筛选的盒子
  //关闭筛选的盒子
  handelOffPick() {
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }
    let params = this.data.handelOffPick
    if (params) {
      params = false
    } else {
      params = true
    }
    this.setData({
      handelOffPick: params
    })
  },
  // 打开筛选的盒子
  // hanlePickS() {
  //   this.setData({
  //     handelOffPick: true
  //   })
  // },

  //关闭登陆框
  handelOffTap(){
    utils.handleShowTabBar()
    this.setData({
      is_mobile:false
    })
  },

  // 去动态页面
  handleDynamicTap(){
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }
    wx.navigateTo({
      url: '../dynamic/dynamic',
    })
  }
})