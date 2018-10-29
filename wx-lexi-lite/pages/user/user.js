// pages/user/user.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Page({
  /**
   * 页面的初始数
   */
  data: {
    // 用于在商品详情删除本页的下架产品
    deletePageProductAtProduct: '',

    isLoading: true,
    readyOver: false, // 页面加载是否完成
    orderSum: 0, // 有没有订单
    couponSum: 0, // 有没有优惠券
    is_login: false, // 是否登陆
    activeSubMenu: 'user',
    haveSmallB: false,
    watchStoreList: [], // 关注店铺的列表
    followerAddWatch: [], // 关注和粉丝的数量
    is_mobile: false, // 注册的呼出框
    userBrowsesProduct: [], //用户浏览记录---
    userInfoDescription: '', // 用户的自我自我介绍
    userInfo: { // 用户的信息
      profile: {
        avatar: 'https://s3.lexivip.com/static/img/default-logo.png'
      }
    },
    classInfo: 1, // 切换---
    sotrF: false,
    likeProduct: [], // 喜欢的的商品---
    recentlyLookProduct: [], // 最近查看的商品---
    desireOrderProduct: [], //心愿单商品---
    product: [{}],
    userWindow: { // 喜欢的橱窗
      count: 0
    },
    // 切换类型---
    classList: [{
        rid: 1,
        num: 0,
        name: '已喜欢'
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

  /**
   * 切换生活馆管理
   */
  handleGoStoreManage() {
    wx.navigateTo({
      url: '/lifeStore/pages/lifeStoreManage/lifeStoreManage',
    })
  },

  // 跳转到品牌管详情
  handleTobrandStore(e) {
    wx.navigateTo({
      url: '../branderStore/branderStore?rid=' + e.currentTarget.dataset.rid,
    })
  },

  /**
   * 我喜欢的商品列表 
   */
  handleUserlikeList() {
    wx.navigateTo({
      url: '../userLikeProduct/userLikeProduct'
    })
  },

  /**
   * 微信一键授权回调
   */
  handleGotPhoneNumber(e) {
    if (e.detail.errMsg == 'getPhoneNumber:ok') {

      // 检测当前用户登录态是否有效
      wx.checkSession({
        success: (res) => {
          utils.logger(res, 'check session success')
          app.handleGotPhoneNumber(e, (success) => {
            if (success) {
              // 是否登陆
              this.setData({
                is_login: app.globalData.isLogin
              })
              // 授权成功，刷新用户数据

              // 获取用户的信息
              this.getUserInfo()

              this.getCouponAddOrder() // 获取没有使用的优惠券和订单
              this.getProduct() // 获取商品---
              this.getCategoryQuantity() // 获取用户的喜欢收藏---
              this.getLikeWindow() // 喜欢的橱窗
            } else {
              utils.fxShowToast('登录失败，稍后重试！')
              wx.navigateTo({
                url: '../index/index',
              })
            }
          })
        },
        fail: (res) => {
          utils.logger(res, 'check session fail')

          app.refreshUserSessionKey((e) => {
            app.handleGotPhoneNumber(e, (success) => {
              if (success) {
                // 是否登陆
                this.setData({
                  is_login: app.globalData.isLogin
                })
                // 授权成功，刷新用户数据

                // 获取用户的信息
                this.getUserInfo()

                this.getCouponAddOrder() // 获取没有使用的优惠券和订单
                this.getProduct() // 获取商品---
                this.getCategoryQuantity() // 获取用户的喜欢收藏---
                this.getLikeWindow() // 喜欢的橱窗
              } else {
                utils.fxShowToast('登录失败，稍后重试！')
                wx.navigateTo({
                  url: '../index/index',
                })
              }
            })
          })
        }
      })

    } else {
      utils.fxShowToast('拒绝授权，你可以选择手机号动态登录')
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
          ['watchStoreList.stores[' + index + '].followed_status']: 1,
          ['classList[' + 2 + '].num']: this.data.classList[2].num + 1
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
          ['watchStoreList.stores[' + index + '].followed_status']: 0,
          ['classList[' + 2 + '].num']: this.data.classList[2].num - 1
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 跳转修改详情
  handleGoEditInfo() {
    wx.navigateTo({
      url: '../editInfo/editInfo'
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
        utils.logger(result, '订单，优惠券的数量')
        this.setData({
          orderSum: result.data.order_count, // 有没有订单
          couponSum: result.data.coupon_count // 有没有优惠券
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取筛选和排序的公用接口
  getPick() {
    http.fxGet(api.products_index, this.data.sortParams, (result) => {
      utils.logger(result)
      if (result.success) {
        if (this.data.likeProduct.length == 0) {
          this.setData({
            likeProduct: result.data
          })
        } else {
          this.setData({
            ['likeProduct.products']: this.data.likeProduct.products.push(result.data.products)
          })
        }
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取用户信息---
  getUserInfo() {
    // 是否登陆
    if (!app.globalData.isLogin) {
      return
    }
    utils.logger(app.globalData.userInfo, 'app.global数据')

    this.setData({
      userInfo: app.globalData.userInfo
    })

    http.fxGet(api.users_profile, {}, (result) => {
      utils.logger(result, '用户个人资料')
      this.setData({
        userInfoDescription: result.data.profile.about_me
      })
    })

  },

  // 获取喜欢 收藏 设计馆
  getCategoryQuantity() {
    // 是否登陆
    if (!app.globalData.isLogin) {
      return
    }
    http.fxGet(api.users_user_center, {}, (result) => {
      utils.logger(result, "获取喜欢 收藏 设计馆")
      let category = this.data.classList
      category.forEach((v) => {
        utils.logger(v)
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

  // 切换类别
  classTap(e) {
    utils.logger(e.currentTarget.dataset.rid)
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
          utils.logger(result, '喜欢的商品')
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
        let jwt = wx.getStorageSync('jwt')
        let openid = jwt.openid

        // 最近查看
        http.fxGet(api.user_browses, {
          page: 1,
          per_page: 10,
          openid: openid
        }, (result) => {
          if (result.success) {
            utils.logger(result, '用户最近查看')
            this.setData({
              userBrowsesProduct: result.data
            })
          } else {
            utils.fxShowToast(result.status.message)
          }
        })

        // 心愿单
        http.fxGet(api.wishlist, this.data.getProductParams, (result) => {
          if (result.success) {
            utils.logger(result)
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
          utils.logger(result, '设计馆')
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


  /**
   * 喜欢的橱窗
   * **/
  getLikeWindow() {
    // 是否登陆
    if (!app.globalData.isLogin) {
      return
    }

    http.fxGet(api.shop_windows_user_likes, {}, res => {
      utils.logger(res, "用户喜欢的橱窗")
      if (res.success) {
        this.setData({
          userWindow: res.data
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 是否登陆
    this.setData({
      is_login: app.globalData.isLogin
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.setData({
      readyOver: true
    })
    let that = this
    setTimeout(() => {
      that.setData({
        isLoading: false
      })
    }, 350)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    const lifeStore = wx.getStorageSync('lifeStore')
    // 小B商家获取自己生活馆
    if (lifeStore.isSmallB) {
      this.setData({
        haveSmallB: true
      })
    }

    // 本地存储
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        'userInfo.profile.avatar': userInfo.avatar,
        'userInfo.profile.username': userInfo.username,
        'userInfo.profile.mobile': userInfo.mobile
      })
    }

    this.getCouponAddOrder() // 获取没有使用的优惠券和订单
    this.getProduct() // 获取商品---
    this.getCategoryQuantity() // 获取用户的喜欢收藏---
    this.getLikeWindow() // 喜欢的橱窗

    this.getUserInfo() // 获取用户的信息
  },

  // 触底加载
  onReachBottom: function() {
    // 是否登陆
    if (!app.globalData.isLogin) {
      return
    }

    if (this.data.classInfo == 1) {
      // 判断是否有下一页
      if (!this.data.likeProduct.next) {
        utils.fxShowToast('没有更多了')
        return
      }

      this.setData({
        ['sortParams.page']: this.data.sortParams.page - 0 + 1
      })

      // 加载
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
    utils.logger(e)
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
    this.setData({
      deletePageProductAtProduct: e.currentTarget.dataset.deleteMark || ''
    })
    wx.navigateTo({
      url: '../product/product?rid=' + e.currentTarget.dataset.rid + "&storeRid=" + e.currentTarget.dataset.storeId
    })
  },

  // 跳转到橱窗列表
  handleGoWindow() {
    wx.navigateTo({
      url: '../window/window'
    })
  },

  // 跳转到橱窗详情
  handleGoWindowDetail(e) {
    utils.logger(e)
    let windowRid = e.currentTarget.dataset.rid
    wx.navigateTo({
      url: '../windowDetail/windowDetail?windowRid=' + windowRid,
    })
  },

  // 跳转到商品详情---
  handleInfomation(e) {
    utils.logger(e)
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&product=' + this.data.myProduct
    })
  },

  // 关闭登陆框
  hanleOffLoginBox(e) {
    this.setData({
      is_mobile: false
    })

    if (app.globalData.isLogin) {
      this.setData({
        is_login: app.globalData.isLogin
      })
    }

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

  // 粉丝页面的跳转
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
    wx.navigateTo({
      url: '../allProduct/allProduct?from=' + e.currentTarget.dataset.from,
    })
  },

  // 关闭登陆框
  handelOffTap() {
    wx.showTabBar()
    this.setData({
      is_mobile: false
    })
  },

  // 去动态页面
  handleDynamicTap() {
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