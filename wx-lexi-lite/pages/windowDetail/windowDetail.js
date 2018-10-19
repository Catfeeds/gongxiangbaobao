// pages/windowDetail/windowDetail.js
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
    isLoading: true,
    myUid: '', // 我的uid
    isShowComment: false, // 是否显示评论
    submitTarget: '', // 提交方向

    windowRid: '', // 橱窗的id
    windowDetail: '', // 橱窗详情
    comments: [], // 橱窗评论
    commentsNext: true, // 橱窗是否有下一页
    commentsCount: 0, // 橱窗的数量

    youLike: { // 猜你喜欢
      count: 0
    },
    youLikeParams: { // 猜你喜欢的商品
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
      rid: '', //Number	必须	 	当前浏览的橱窗编号
    },

    similarWindow: { // 相似的橱窗
      count: 0
    },

    // 获取评论参数
    getCommentParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
      sort_type: 0, //Number	可选	0	排序方式0 = 默认1 = 按点赞数 2 = 按回复数
      rid: '', //Number	必须	 	橱窗编号
    }
  },

  // 关闭登陆框
  hanleOffLoginBox(e) {
    this.setData({
      is_mobile: false
    })
  },

  // 取消喜欢橱窗
  handleDeleteLike(e) {
    let rid = this.data.windowRid
    http.fxDelete(api.shop_windows_user_likes, {
      rid: rid
    }, result => {
      utils.logger(result, "取消喜欢橱窗")
    })

    this.setData({
      'windowDetail.is_like': false,
      'windowDetail.like_count': this.data.windowDetail.like_count - 1
    })
    this._handleParentLikeWindow(false)
  },

  // 点赞父级别橱窗
  handleParentPraise(e) {
    let index = e.currentTarget.dataset.index
    let commentId = this.data.comments[index].comment_id

    this.setData({
      ['comments[' + index + '].is_praise']: true,
      ['comments[' + index + '].praise_count']: this.data.comments[index].praise_count + 1
    })
    http.fxPost(api.shop_windows_comments_praises, {
      comment_id: commentId
    }, result => {
      utils.logger(result)
      if (result.success) {

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 删除父级的赞
  handleDeletePraise(e) {
    let index = e.currentTarget.dataset.index
    let commentId = this.data.comments[index].comment_id

    this.setData({
      ['comments[' + index + '].is_praise']: false,
      ['comments[' + index + '].praise_count']: this.data.comments[index].praise_count - 1
    })

    http.fxDelete(api.shop_windows_comments_praises, {
      comment_id: commentId
    }, result => {
      utils.logger(result)
      if (result.success) {

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
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

    utils.logger(this.data.windowRid)
    let rid = this.data.windowRid
    http.fxPost(api.shop_windows_user_likes, {
      rid: rid
    }, result => {
      utils.logger(result, "添加喜欢橱窗")
    })

    this.setData({
      'windowDetail.is_like': true,
      'windowDetail.like_count': this.data.windowDetail.like_count + 1
    })

    this._handleParentLikeWindow(true)
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

    utils.logger(e.currentTarget.dataset.uid)
    let uid = this.data.windowDetail.uid
    this._handleParentFollow(true)
    this.setData({
      'windowDetail.is_follow': true
    })

    http.fxPost(api.follow_user, {
      uid: uid
    }, result => {
      utils.logger(result, "添加关注")
    })
  },

  // 取消关注
  handleDeleteFollow(e) {
    this._handleParentFollow(false)
    let uid = this.data.windowDetail.uid
    this.setData({
      'windowDetail.is_follow': false
    })

    http.fxPost(api.unfollow_user, {
      uid: uid
    }, result => {
      utils.logger(result, "取消关注")
    })
  },

  // 处理父级的关注
  _handleParentFollow(option) {
    let page = getCurrentPages()
    let parentPage = page[page.length - 2]
    utils.logger(parentPage)
    if (parentPage.route == "pages/window/window") {
      parentPage._handleFollow(this.data.windowDetail.uid, option)
    }
  },

  // 处理父页面的喜欢
  _handleParentLikeWindow(option) {
    let page = getCurrentPages()
    let parentPage = page[page.length - 2]
    if (parentPage.route == "pages/window/window") {
      parentPage._handleLikeWindow(this.data.windowDetail.rid, option)
    }
  },

  // 跳转商品详情
  handleGoProduct(e) {
    let rid = e.currentTarget.dataset.rid
    wx.navigateTo({
      url: '../product/product?rid=' + rid,
    })
  },

  // 跳转到商品详情---
  handleInfomation(e) {
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&product=' + this.data.myProduct + "&storeRid=" + e.detail.storeRid
    })
  },

  // 橱窗详情
  handleGoWindowDetail(e) {
    let windowRid = e.currentTarget.dataset.windowRid
    wx.navigateTo({
      url: '../windowDetail/windowDetail?windowRid=' + windowRid,
    })
  },

  /**
   * 打开评论
   */
  handleGoComment(e) {
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
      url: '../windowComment/windowComment?from=window&rid=' + this.data.windowRid + '&submitTarget=' + e.currentTarget.dataset.submitTarget + '&isInput=' + e.currentTarget.dataset.isInput + '&pid=' + e.currentTarget.dataset.pid + '&index=' + e.currentTarget.dataset.index + '&isLike=' + this.data.windowDetail.is_like + '&likeCount=' + this.data.windowDetail.like_count
    })
  },

  /**
   * 获取评论
   */
  getComment() {
    http.fxGet(api.shop_windows_comments, this.data.getCommentParams, result => {
      utils.logger(result, '获取评论')
      if (result.success) {
        let data = this.data.comments
        const timePromise = new Promise((resolve, reject) => {
          result.data.comments.forEach((v, i) => {
            v.created_at_cn = utils.commentTime(v.created_at)
            v.sub_comments.forEach((item, idx) => {
              item.current_page = 0
              item.created_at_cn = utils.commentTime(item.created_at)
            })

            // 循环完毕
            if (result.data.comments.length - 1 == i) {
              resolve()
            }
          })
        })

        timePromise.then(() => {
          this.setData({
            comments: result.data.comments, // 橱窗评论
            commentsNext: result.data.next, // 橱窗是否有下一页
            commentsCount: result.data.count, // 橱窗的数量
          })
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取橱窗详情
  getWindowDetail() {
    http.fxGet(api.shop_windows_detail, {
      rid: this.data.windowRid
    }, result => {
      utils.logger(result, "橱窗详情")
      if (result.success) {

        let likeCount = result.data.like_count
        let commentCount = result.data.comment_count
        result.data.like_count = likeCount >= 1000 ? (likeCount / 1000).toFixed(2) + 'k' : likeCount
        result.data.comment_count = commentCount >= 1000 ? (commentCount / 1000).toFixed(2) + 'k' : commentCount

        this.setData({
          windowDetail: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 猜你喜欢
  getYouLike() {

    // 是否登陆
    if (!app.globalData.isLogin) {
      return
    }

    http.fxGet(api.shop_windows_guess_like, this.data.youLikeParams, result => {
      utils.logger(result, "猜你喜欢")
      if (result.success) {
        this.setData({
          youLike: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取相似橱窗
  getSimilarWindow() {
    http.fxGet(api.shop_windows_similar, this.data.youLikeParams, result => {
      utils.logger(result, "相似的橱窗")
      if (result.success) {
        this.setData({
          similarWindow: result.data
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
    utils.logger(options.windowRid)
    this.setData({
      windowRid: options.windowRid,
      'youLikeParams.rid': options.windowRid,
      'commentParams.rid': options.windowRid,
      'getCommentParams.rid': options.windowRid,
    })

    this.getWindowDetail() // 橱窗的详情
    this.getYouLike() // 猜你喜欢
    this.getSimilarWindow() // 相似的橱窗
    this.getComment() // 获取评论
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
    }, 1000)
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
  }

})