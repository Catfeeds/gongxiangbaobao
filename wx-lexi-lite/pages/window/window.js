// pages/window/window.js
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
    myUid: '', // 我的uid

    // 切换关注推荐
    categoryActive: 'recommend',
    category: [{
      name: '关注',
      code: 'follow'
    }, {
      name: '推荐',
      code: 'recommend'
    }],

    recommendWindow: { // 推荐橱窗的列表
      count: 0,
      shop_windows: []
    },
    recommendWindowParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
    },

    followWindow: { // 关注橱窗的列表
      count: 0,
      shop_windows: []
    },
    followWindowParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
    },
  },

  // 关闭登陆框
  hanleOffLoginBox(e) {
    this.setData({
      is_mobile: false
    })
  },

  // 切换橱窗
  handleToggleCategory(e) {
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
      categoryActive: e.currentTarget.dataset.code
    })
  },

  // 添加关注人
  handleAddFollow(e) {
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }

    console.log(e.currentTarget.dataset.uid)
    let uid = e.currentTarget.dataset.uid
    this._handleFollow(uid, true)

    http.fxPost(api.follow_user, {
      uid: uid
    }, result => {
      console.log(result, "添加关注")
      this.getFollowWindow()
    })
  },

  // 取消关注人
  handleDeleteFollow(e) {
    let uid = e.currentTarget.dataset.uid
    this._handleFollow(uid, false)

    http.fxPost(api.unfollow_user, {
      uid: uid
    }, result => {
      console.log(result, "取消关注")
    })
  },

  // 处理关注
  _handleFollow(uid, option) {

    let recommendData = this.data.recommendWindow.shop_windows
    recommendData.forEach((v, i) => {
      if (v.uid == uid) {
        v.is_follow = option
      }
    })

    let followData = this.data.followWindow.shop_windows
    followData.forEach((v, i) => {
      if (v.uid == uid) {
        v.is_follow = option
      }
    })

    this.setData({
      'followWindow.shop_windows': followData,
      'recommendWindow.shop_windows': recommendData
    })

  },

  // 取消喜欢橱窗
  handleDeleteLike(e) {
    console.log(e.currentTarget.dataset.rid)
    let rid = e.currentTarget.dataset.rid
    http.fxDelete(api.shop_windows_user_likes, {
      rid: rid
    }, result => {
      console.log(result, "添加喜欢橱窗")
    })

    this._handleLikeWindow(rid, false)
  },

  // 添加喜欢橱窗
  handleAddLike(e) {
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }

    console.log(e.currentTarget.dataset.rid)
    let rid = e.currentTarget.dataset.rid
    http.fxPost(api.shop_windows_user_likes, {
      rid: rid
    }, result => {
      console.log(result, "添加喜欢橱窗")
    })

    this._handleLikeWindow(rid, true)
  },

  // 处理添加或者删除喜欢橱窗
  _handleLikeWindow(rid, value) {
    let recommend = this.data.recommendWindow.shop_windows
    let follow = this.data.followWindow.shop_windows

    recommend.forEach(v => {
      if (v.rid == rid) {
        v.is_like = value
        v.like_count = value ? v.like_count + 1 : v.like_count - 1
      }
    })

    follow.forEach(v => {
      if (v.rid == rid) {
        v.is_like = value
        v.like_count = value ? v.like_count + 1 : v.like_count - 1
      }
    })

    this.setData({
      'recommendWindow.shop_windows': recommend,
      'followWindow.shop_windows': follow
    })

  },


  // 去橱窗详情
  handleGoWindowDetail(e) {
    let windowRid = e.currentTarget.dataset.windowRid
    wx.navigateTo({
      url: '../windowDetail/windowDetail?windowRid=' + windowRid,
    })
  },

  // 去拼接橱窗
  handleGoAddWindow() {
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }
    wx.navigateTo({
      url: '../addWindow/addWindow',
    })
  },

  // 获取关注橱窗
  getFollowWindow() {
    http.fxGet(api.shop_windows_follow, this.data.followWindowParams, result => {
      console.log(result, "关注人发布的橱窗")
      if (result.success) {
        let windowList = this.data.followWindow.shop_windows
        this.setData({
          'followWindow.count': result.data.count,
          'followWindow.next': result.data.next,
          'followWindow.shop_windows': windowList.concat(result.data.shop_windows)
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取推荐橱窗列表
  getRecommendWindow() {
    http.fxGet(api.shop_windows_recommend, this.data.recommendWindowParams, result => {
      console.log(result, "获取橱窗列表")
      let windowList = this.data.recommendWindow.shop_windows
      if (result.success) {
        this.setData({
          'recommendWindow.count': result.data.count,
          'recommendWindow.next': result.data.next,
          'recommendWindow.shop_windows': windowList.concat(result.data.shop_windows)
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
    this.getRecommendWindow() // 推荐的橱窗
    this.getFollowWindow() // 关注的橱窗

    this.setData({
      myUid: app.globalData.jwt.uid
    })
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
    //加载橱窗
    if (this.data.categoryActive == 'recommend') {
      if (!this.data.recommendWindow.next) {
        utils.fxShowToast("没有更多了")
        return
      }
      this.setData({
        'recommendWindowParams.page': this.data.recommendWindowParams.page + 1
      })
      this.getRecommendWindow()
    }

    // 加载关注
    if (this.data.categoryActive == 'follow') {
      if (!this.data.followWindow.next) {
        utils.fxShowToast("没有更多了")
        return
      }
      this.setData({
        'followWindowParams.page': this.data.followWindowParams.page + 1
      })
    }
    this.getFollowWindow()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return app.shareLeXi()
  }

})