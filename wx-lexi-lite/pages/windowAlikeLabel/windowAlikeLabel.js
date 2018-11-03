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
    isLoading: true,
    myUid: '', // 我的uid

    recommendWindow: { // 推荐橱窗的列表
      count: 0,
      shop_windows: []
    },
    recommendWindowParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
      keyword: '' // 关键字
    },

    showPosterModal: false, // 分享海报
    windowPosterUrl: '', // 海报图片地址
    posterSaving: false, // 是否正在保存
    posterBtnText: '保存分享图'
  },

  /**
   * 显示海报弹出框
   */
  handleWindowShareModal(e) {
    let rid = e.currentTarget.dataset.windowRid
    this.getWindowWxaPoster(rid)

    this.setData({
      showPosterModal: true
    })
  },

  /**
   * 海报弹出框关闭后，清空记录
   */
  handleClearPosterUrl() {
    this.setData({
      windowPosterUrl: ''
    })
  },

  /**
   * 生成橱窗推广海报图
   */
  getWindowWxaPoster(rid) {
    // scene格式：rid
    let scene = rid
    let params = {
      scene: scene,
      rid: rid,
      path: 'pages/windowDetail/windowDetail',
      auth_app_id: app.globalData.app_id
    }

    utils.logger(params, '橱窗海报参数')

    http.fxPost(api.market_share_window_poster, params, (result) => {
      utils.logger(result, '生成海报图')
      if (result.success) {
        this.setData({
          windowPosterUrl: result.data.image_url
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 下载海报
  handleSaveWindowPoster() {
    let that = this
    if (this.data.windowPosterUrl && !this.data.posterSaving) {
      this.setData({
        posterSaving: true,
        posterBtnText: '正在保存...'
      })

      // 下载网络文件至本地
      wx.downloadFile({
        url: this.data.windowPosterUrl,
        success: function(res) {
          if (res.statusCode == 200) {
            // 保存文件至相册
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function(data) {
                that.setData({
                  showPosterModal: false,
                  posterSaving: false,
                  windowPosterUrl: '',
                  posterBtnText: '保存橱窗海报'
                })
                utils.fxShowToast('保存成功', 'success')
              },
              fail: function(err) {
                utils.logger('下载海报失败：' + err.errMsg)
                that.setData({
                  posterSaving: false,
                  posterBtnText: '保存橱窗海报'
                })

                if (err.errMsg == 'saveImageToPhotosAlbum:fail:auth denied') {
                  wx.openSetting({
                    success(settingdata) {
                      utils.logger(settingdata)
                      if (settingdata.authSetting['scope.writePhotosAlbum']) {
                        utils.fxShowToast('保存成功')
                        that.setData({
                          showPosterModal: false,
                          posterSaving: false,
                          windowPosterUrl: '',
                          posterBtnText: '保存橱窗海报'
                        })
                      } else {
                        utils.fxShowToast('保存失败')
                      }
                    }
                  })
                } else {
                  utils.fxShowToast('保存失败')
                }
              }
            })
          }
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
    let uid = e.currentTarget.dataset.uid
    this._handleFollow(uid, true)

    http.fxPost(api.follow_user, {
      uid: uid
    }, result => {
      utils.logger(result, "添加关注")
    })
  },

  // 取消关注人
  handleDeleteFollow(e) {
    let uid = e.currentTarget.dataset.uid
    this._handleFollow(uid, false)

    http.fxPost(api.unfollow_user, {
      uid: uid
    }, result => {
      utils.logger(result, "取消关注")
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


    this.setData({
      'recommendWindow.shop_windows': recommendData
    })

  },

  // 取消喜欢橱窗
  handleDeleteLike(e) {
    utils.logger(e.currentTarget.dataset.rid)
    let rid = e.currentTarget.dataset.rid
    http.fxDelete(api.shop_windows_user_likes, {
      rid: rid
    }, result => {
      utils.logger(result, "添加喜欢橱窗")
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

    utils.logger(e.currentTarget.dataset.rid)
    let rid = e.currentTarget.dataset.rid
    http.fxPost(api.shop_windows_user_likes, {
      rid: rid
    }, result => {
      utils.logger(result, "添加喜欢橱窗")
    })

    this._handleLikeWindow(rid, true)
  },

  // 处理添加或者删除喜欢橱窗
  _handleLikeWindow(rid, value) {
    let recommend = this.data.recommendWindow.shop_windows

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

  // 相似的橱窗
  handleGowindowAlike(e) {
    let text = e.currentTarget.dataset.text
    wx.redirectTo({
      url: '../windowAlikeLabel/windowAlikeLabel?text=' + text,
    })
  },

  //  相似的橱窗
  getRecommendWindow() {
    http.fxGet(api.shop_windows_keyword, this.data.recommendWindowParams, result => {
      utils.logger(result, "获取橱窗列表")
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
    console.log(options.text)

    this.setData({
      'recommendWindowParams.keyword': options.text,
      myUid: app.globalData.jwt.uid
    })

    this.getRecommendWindow() // 推荐的橱窗

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
    //加载橱窗
    if (!this.data.recommendWindow.next) {
      utils.fxShowToast("没有更多了")
      return
    }
    this.setData({
      'recommendWindowParams.page': this.data.recommendWindowParams.page + 1
    })
    this.getRecommendWindow()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return app.shareLeXi()
  }

})