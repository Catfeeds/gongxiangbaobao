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
    showHomeBtn: false, // 是否回到首页的按钮

    isLoading: true,
    otherPeopleUid: [], // 其他人的uid
    otherPeopleInfo: [], // 其他人地个人中心
    otherWatchStoreList: [], //获取其他人关注地店铺列表
    otherLikeList: [], //获取其他人的喜欢商品列表
    userBrowsesProduct: [], // 其他人的最近浏览
    desireOrderProduct: [], // 其他人的心愿单
    watchStoreList: [], // 其他人设计管

    classInfo: 1, // 切换---
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

    // 翻页参数
    nextPageParmas: {
      page: 1, // Number	可选	1	当前页码
      per_page: 10 // Number	可选	10	每页数量
    }
  },

  /**
   * 是否显示回到首页
   */
  getIsBackHome() {
    let route = getCurrentPages()
    if (route.length == 1) {
      this.setData({
        showHomeBtn: true
      })
    }
  },

  // 获取其他人个人中心 get_other_user_center
  getOtherPeopleInfo(e) {
    http.fxGet(api.users_other_user_center, {
      uid: e
    }, (result) => {
      utils.logger(result, '获取其他人个人中心')
      if (result.success) {
        let params = this.data.classList
        params.forEach((v, i) => {
          if (v.rid == 1) {
            v.num = result.data.user_like_counts

          }
          if (v.rid == 2) {
            v.num = result.data.wish_list_counts
          }
          if (v.rid == 3) {
            v.num = result.data.followed_stores_counts
          }
          if (result.data.username != null) {
            wx.setNavigationBarTitle({
              title: result.data.username
            })
          } else {
            wx.setNavigationBarTitle({
              title: '乐喜'
            })
          }
        })

        if (typeof(result.data.about_me) == 'object') {
          result.data.about_me = ''
        }

        this.setData({
          classList: params,
          otherPeopleInfo: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取别人关注地店铺列表 users/other_followed_stores
  getOtherWatchStore(e) {
    http.fxGet(api.users_other_followed_stores, { ...this.data.nextPageParmas,
      uid: e
    }, (result) => {
      utils.logger(result, '获取其他人关注地店铺列表')
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
  getOtherLikeQuantity(e) {
    utils.logger()
    http.fxGet(api.other_userlike, {
      uid: e
    }, (result) => {
      utils.logger(result, '获取其他人喜欢列表')
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
        // 最近查看
        http.fxGet(api.other_user_browses, {
          uid: this.data.otherPeopleUid
        }, (result) => {
          utils.logger(result, this.data.otherPeopleUid, '其他人最查看')
          if (result.success) {
            this.setData({
              userBrowsesProduct: result.data
            })
          } else {
            utils.fxShowToast(result.status.message)
          }
        })

        // 心愿单
        http.fxGet(api.other_wishlist, {
          uid: this.data.otherPeopleUid
        }, (result) => {
          utils.logger(this.data.otherPeopleUid)
          utils.logger(result, '其他人心愿单')
          if (result.success) {
            this.setData({
              desireOrderProduct: result.data
            })
          } else {
            utils.fxShowToast(result.status.message)
          }
        })
        break;
      default:
        // 设计馆
        http.fxGet(api.users_other_followed_life_stores, {
          uid: this.data.otherPeopleUid
        }, (result) => {
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

  // 关闭登陆框
  hanleOffLoginBox(e) {
    this.setData({
      is_mobile: false
    })
  },

  // 添加关注店铺---
  handleAddWatch(e) {
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }

    let rid = e.currentTarget.dataset.rid
    let index = e.currentTarget.dataset.index

    http.fxPost(api.add_watch, {
      rid: rid
    }, (result) => {
      utils.logger(result, '关注结果')
      if (result.success) {
        if (index) {
          this.setData({
            ['watchStoreList.stores[' + index + '].followed_status']: 1
          })
        } else {
          this.setData({
            ['otherPeopleInfo.followed_status']: 1
          })
        }
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 取消关注店铺---
  handleDeleteWatch(e) {
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }

    let rid = e.currentTarget.dataset.rid
    let index = e.currentTarget.dataset.index

    http.fxPost(api.delete_watch, {
      rid: rid
    }, (result) => {
      if (result.success) {
        //有index是关注她关注的店铺, 没有index 是关注她本人的店铺
        if (index) {
          this.setData({
            ['watchStoreList.stores[' + index + '].followed_status']: 0
          })
        } else {
          utils.logger("bieren")
          this.setData({
            ['otherPeopleInfo.followed_status']: 0
          })
        }
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 添加关注 人!
  hanleAddWatch(e) {
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }

    http.fxPost(api.follow_user, {
      uid: e.currentTarget.dataset.uid
    }, (result) => {
      utils.logger(result)
      if (result.success) {
        this.setData({
          ['otherPeopleInfo.followed_status']: 1
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 取消关注 人!
  hanleDeleteWatch(e) {
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }

    http.fxPost(api.unfollow_user, {
      uid: e.currentTarget.dataset.uid
    }, (result) => {
      utils.logger(result)
      if (result.success) {
        this.setData({
          ['otherPeopleInfo.followed_status']: 0
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
    // 检测网络
    app.ckeckNetwork()

    this.setData({
      otherPeopleUid: options.uid
    })

    this.getOtherPeopleInfo(options.uid) // 获取其他人个人中心
    this.getOtherLikeQuantity(options.uid) // 获取其他人的喜欢
    this.getIsBackHome()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let that = this
    setTimeout(() => {
      that.setData({
        readyOver: true,
        isLoading: false
      })
    }, 350)
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
    return app.shareLeXi()
  },

  // 关闭登陆
  handelOffTap() {
    utils.handleShowTabBar()
    this.setData({
      is_mobile: false
    })
  },

  handleDynamicTap(e) {
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }

    wx.navigateTo({
      url: '../peopleDynamic/peopleDynamic?from=people&uid=' + this.data.otherPeopleUid
    })
  },

  // 切换类别
  classTap(e) {
    this.setData({
      classInfo: e.currentTarget.dataset.rid
    })
    this.getProduct(e.currentTarget.dataset.rid)
  },

  // 关注页面跳转
  handleWatchTap(e) {
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }

    wx.navigateTo({
      url: '../watch/watch?uid=' + e.currentTarget.dataset.uid,
    })
  },

  //粉丝页面的跳转
  handleFollowerTap(e) {
    utils.logger(e.currentTarget.dataset.uid)
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }

    wx.navigateTo({
      url: '../myFollower/myFollower?uid=' + e.currentTarget.dataset.uid,
    })
  },

  // 查看全部
  handleAllProduct(e) {
    wx.navigateTo({
      url: '../allProduct/allProduct?from=' + e.currentTarget.dataset.from + "&uid=" + e.currentTarget.dataset.uid,
    })
  },

  // 跳转到商品详情---
  handleToProductInfoTap(e) {
    wx.navigateTo({
      url: '../product/product?rid=' + e.currentTarget.dataset.rid + "&storeRid=" + e.currentTarget.dataset.storeRid
    })
  },

  // 回到首页
  handleBackHome() {
    wx.switchTab({
      url: '../index/index',
    })
  },

})