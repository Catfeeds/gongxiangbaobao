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
    orderSum: 0, // 有没有订单
    couponSum: 0, // 有没有优惠券

    pickQuantity: '', // 商品的数量
    isDisabled: false, // 是否禁用
    leftTimer: null, // 延迟句柄
    rightTimer: null, // 延迟句柄
    categoryList: [], // 分类列表
    checkedCids: [], // 选择的分类
    showFilterModal: false, // 筛选
    openPickBox: false, // 筛选的模态框
    sortBox: false, // 筛选的模态框
    // 推荐
    recommendList: [{
        name: '包邮',
        id: '1',
        isActive: false
      },
      {
        name: '特惠',
        id: '2',
        isActive: false
      },
      {
        name: '可定制',
        id: '3',
        isActive: false
      }
    ],

    watchStoreList: { // 关注店铺的列表
      stores: []
    },
    followerAddWatch: [], // 关注和粉丝的数量
    is_mobile: false, // 注册的呼出框
    userBrowsesProduct: [], //用户浏览记录---
    userInfo: [], // 用户的信息
    classInfo: 1, // 切换---
    sotrF: false,

    isLikeProductNext: true, // 喜欢是否有下一页
    likeProduct: [], // 喜欢的的商品---

    recentlyLookProduct: [], // 最近查看的商品---
    desireOrderProduct: [], //心愿单商品---
    product: [{}],
    // 切换类型---
    classList: [{
        rid: 1,
        num: 0,
        name: '喜欢'
      },
      {
        rid: 2,
        num: 0,
        name: '收藏'
      },
      {
        rid: 3,
        num: 0,
        name: '设计馆'
      }
    ],
    // 获取商品的参数
    getProductParams: {
      page: 1,
      per_page: 10
    },
    //排序的参数
    sortParams: {
      page: 1, // Number	可选	1	当前页码
      per_page: 10, // Number	可选	10	每页数量
      min_price: '', // Number	可选	 	价格区间： 最小价格
      max_price: '', // Number	可选	 	价格区间： 最大价格
      sort_type: 0, // Number	可选	0	排序: 0= 不限, 1= 价格由低至高, 2= 价格由高至低
      is_free_postage: 0, // Number	可选	0	是否包邮: 0 = 全部, 1= 包邮
      is_preferential: '' // Number	可选	0	是否特惠: 0 = 全部, 1= 特惠
    }
  },

  // 添加关注---
  handleAddWatch(e) {
    let rid = e.currentTarget.dataset.rid
    let index = e.currentTarget.dataset.index

    http.fxPost(api.add_watch, {
      rid: rid
    }, (result) => {
      if (result.success) {
        this.setData({
          ['watchStoreList.stores[' + index + '].watch']: false
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 取消关注---
  handleDeleteWatch(e) {
    let rid = e.currentTarget.dataset.rid
    let index = e.currentTarget.dataset.index

    http.fxPost(api.delete_watch, {
      rid: rid
    }, (result) => {
      if (result.success) {
        this.setData({
          'classList[2].num': this.data.classList[2].num - 1,
          ['watchStoreList.stores[' + index + '].watch']: true
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 改变分类
   */
  handleToggleCategory(e) {
    let cid = e.currentTarget.dataset.cid

    let _checkedCids = this.data.checkedCids
    if (_checkedCids.indexOf(cid) == -1) { // 不存在，则增加
      _checkedCids.push(cid)
    } else { // 存在，则删除
      let idx = _checkedCids.indexOf(cid)
      _checkedCids.splice(idx, 1)
    }

    let _categories = this.data.categoryList
    _categories = _categories.map((cate) => {
      if (_checkedCids.indexOf(cate.id) != -1) {
        cate.checked = true
      } else {
        cate.checked = false
      }
      return cate
    })

    this.setData({
      categoryList: _categories,
      likeProduct: [],
      'sortParams.cids': _checkedCids.join(','),
      'sortParams.page': 1
    })

    this.getProduct()
  },

  /**
   * 分类列表
   */
  getCategories() {
    console.log(app.globalData)
    console.log(app.globalData.storeInfo.rid)
    http.fxGet(api.store_categories, {
      sid: app.globalData.storeInfo.rid
    }, (result) => {
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
   * 滑块最低价格
   */
  handleChangeMinPrice(e) {
    let minPrice = e.detail.lowValue
    if (this.data.sortParams.max_price == -1) {
      if (minPrice == '不限') {
        minPrice = 800
      }
    }
    this.setData({
      ['sortParams.min_price']: minPrice
    })

    if (this.data.leftTimer) {
      clearTimeout(this.data.leftTimer)
    }

    let _t = setTimeout(() => {
      this.getProduct()
      this.setData({
        likeProduct: []
      })
    }, 2000)

    this.setData({
      leftTimer: _t
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
      'sortParams.min_price': 0,
      'sortParams.max_price': -1,
      'sortParams.cids': ''
    })
  },

  /**
   * 关闭弹窗回调
   */
  handleCloseFilterModal(e) {
    this.setData({
      handelOffPick: false
    })

    wx.showTabBar()
  },

  /**
   * 选择推荐
   */
  handleToggleRecommendList(e) {
    console.log(e.currentTarget.dataset.index)
    let index = e.currentTarget.dataset.index
    let id = e.currentTarget.dataset.cid
    console.log(id)

    if (this.data.recommendList[index].isActive) {
      this.setData({
        ['recommendList[' + index + '].isActive']: false
      })
    } else {
      this.setData({
        ['recommendList[' + index + '].isActive']: true
      })
    }

    if (id == 1) {
      this.setData({
        likeProduct: [], // 商品列表
        ['sortParams.is_free_postage']: this.data.sortParams.is_free_postage == 0 ? 1 : 0
      })
    }

    if (id == 2) {
      this.setData({
        likeProduct: [], // 商品列表
        ['sortParams.is_preferential']: this.data.sortParams.is_preferential == 0 ? 1 : 0
      })
    }

    if (id == 3) {
      this.setData({
        likeProduct: [], // 商品列表
        ['sortParams.is_custom_made']: this.data.sortParams.is_custom_made == 0 ? 1 : 0
      })
    }

    this.getProduct()
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
      ['sortParams.max_price']: maxPrice
    })

    if (this.data.rightTimer) {
      clearTimeout(this.data.rightTimer)
    }

    let _t = setTimeout(() => {
      this.getProduct()
      this.setData({
        likeProduct: []
      })
    }, 2000)

    this.setData({
      rightTimer: _t
    })
  },

  // 获取筛选
  handlePickProduct(e) {
    console.log(e.detail.category)
    let rids = e.detail.category
    let minPrice = e.detail.minPrice
    let maxPrice = e.detail.maxPrice
    this.setData({
      likeProduct: [],
      ['sortParams.page']: e.detail.page ? e.detail.page : this.data.page,
      ['sortParams.cids']: rids == undefined ? "" : rids.join(','),
      ['sortParams.min_price']: minPrice,
      ['sortParams.max_price']: maxPrice
    })
    this.getProduct()
  },

  // 获取排序的产品
  handleSort(e = 0) {
    console.log(e.currentTarget.dataset.rid)
    if (e.currentTarget.dataset.rid != undefined) {
      this.setData({
        isSortShow: false,
        likeProduct: [],
        ['sortParams.page']: 1,
        ['sortParams.sort_type']: e.currentTarget.dataset.rid
      })
    }

    wx.showTabBar()
    this.getProduct()
  },

  //获取喜欢 收藏 设计管 数量
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
        console.log(result.data.profile, '用户的信息')
        // 格式化时间
        result.data.profile.created_at = utils.timestamp2string(result.data.profile.created_at, 'cn')
        // 设置全局变量
        app.globalData.userDetail = result.data.profile
        this.setData({
          userInfo: app.globalData.userDetail
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 切换类别
  classTap(e) {
    console.log(e.currentTarget.dataset.rid)
    if (this.data.classInfo == e.currentTarget.dataset.rid) {
      return
    }

    this.setData({
      likeProduct: [],
      'sortParams.page': 1,
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
        http.fxGet(api.userlike, this.data.sortParams, (result) => {
          console.log(result, '喜欢')
          if (result.success) {

            let data = this.data.likeProduct

            this.setData({
              likeProduct: result.data.products.concat(data),
              pickQuantity: result.data.count,
              isLoadProductShow: false,
              isLikeProductNext: result.data.next,
              totalCount: result.data.count
            })

          } else {
            utils.fxShowToast(result.status.message)
          }
        })
        break;
      case 2:
        this.getBrowss() // 浏览记录
        this.getDesireOrderProduct()
        break;
      default:
        // 设计管 users/followed_life_stores
        http.fxGet(api.users_followed_stores, this.data.getProductParams, (result) => {
          console.log(result, '设计馆')
          if (result.success) {
            this.setData({
              watchStoreList: result.data
            })
          } else {
            utils.fxShowToast(result.status.message)
          }
        })
    }
  },

  // 浏览记录
  getBrowss() {
    //最近查看
    http.fxGet(api.user_browses, {}, (result) => {
      if (result.success) {
        console.log(result, '最近查看')
        this.setData({
          userBrowsesProduct: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 心愿单列表
  getDesireOrderProduct() {
    http.fxGet(api.wishlist, this.data.getProductParams, (result) => {
      if (result.success) {
        console.log(result, '心愿单')
        this.setData({
          desireOrderProduct: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取是否有未使用的优惠券和订单
  getCouponAddOrder() {
    // 是否登陆
    if (!app.globalData.isLogin) {
      return
    }
    http.fxGet(api.orders_order_coupon_count, {}, (result) => {
      if (result.success) {
        console.log(result, '订单，优惠券的数量')
        this.setData({
          orderSum: result.data.order_count, // 有没有订单
          couponSum: result.data.coupon_count, // 有没有优惠券
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

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    wx.hideLoading()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getUserInfo() // 获取用户的信息

    this.getProduct() // 获取商品---
    this.getCategoryQuantity() // 获取用户的喜欢收藏---
    this.getCouponAddOrder() // 是否有订单和优惠券
  },

  // 触底加载
  onReachBottom: function() {
    // 是否登陆
    if (!app.globalData.isLogin) {
      return
    }

    if (this.data.classInfo == 1) {
      //判断是否有下一页
      if (!this.data.isLikeProductNext) {
        utils.fxShowToast('没有更多了')
        return
      }

      this.setData({
        ['sortParams.page']: this.data.sortParams.page - 0 + 1
      })

      // 加载
      this.getProduct()
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this.setData({
      'sortParams.page': 1,
      likeProduct: []
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return common.shareLexi(app.globalData.storeInfo.name, app.globalData.shareBrandUrl)
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
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }

    wx.navigateTo({
      url: '../settings/settings'
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

  /**
   * 获取用户授权手机号
   */
  handleGotPhoneNumber(e) {
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
<<<<<<< HEAD

=======
              app.globalData.jwt = res.data
>>>>>>> origin/zhaogaoshang
              //更新用户信息
              app.updateUserInfo(res.data)
              
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
    console.log(e.currentTarget.dataset.rid)
    wx.navigateTo({
      url: '../product/product?rid=' + e.currentTarget.dataset.rid
    })
  },

  // 跳转到商品详情---
  handleInfomation(e) {
    console.log(e)
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&product=' + this.data.likeProduct
    })
  },

  // 关闭
  hanleOffLoginBox(e) {
    this.setData({
      is_mobile: false
    })
    wx.showTabBar()
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
    wx.hideTabBar()
  },

  // 排序的盒子关闭
  handleSortOff() {
    var params = this.data.isSortShow
    if (params) {
      params = false
      wx.showTabBar()
    } else {
      params = true
      wx.hideTabBar()
    }
    this.setData({
      isSortShow: params
    })
  },

  // 关闭筛选的盒子
  handelOffPick() {
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }

    this.setData({
      handelOffPick: true
    })
    wx.hideTabBar()
    this.getCategories()
  },

  handelOffTap() {
    utils.handleShowTabBar()
    this.setData({
      is_mobile: false
    })
  }
  
})