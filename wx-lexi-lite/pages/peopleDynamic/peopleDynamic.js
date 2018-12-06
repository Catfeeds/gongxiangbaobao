// pages/dynamic/dynamic.js
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
    isLoadingUserIcon:true,

    isLoading: true,
    dynamicList: {
      count: 0,
      lines: []
    },

    //动态信息的参数
    dynamicParams: {
      uid: "", //String	必须	 	被查看用户编号
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
    }

  },

  // 跳转到拼接拼接橱窗 
  handleGoWindowDetail(e) {
    let rid = e.currentTarget.dataset.windowRid
    wx.navigateTo({
      url: '../windowDetail/windowDetail?windowRid=' + rid,
    })
  },

  // 处理关注
  _handleFollow(value) {
    this.setData({
      'dynamicList.followed_status': value
    })
  },

  // 添加关注
  handleAddFollow() {
    let uid = this.data.dynamicParams.uid
    http.fxPost(api.follow_user, {
      uid: uid
    }, result => {
      // console.log(result, "添加关注")
      if (!result.status.message) {
        utils.fxShowToast(result.status.message)
        return
      }

      this._handleFollow(result.data.followed_status)
    })
  },

  // 取消关注
  handleDeleteFollow() {
    let uid = this.data.dynamicParams.uid
    http.fxPost(api.unfollow_user, {
      uid: uid
    }, result => {
      // console.log(result, "取消关注")
      if (!result.status.message) {
        utils.fxShowToast(result.status.message)
        return
      }

      this._handleFollow(result.data.followed_status)
    })
  },

  // 处理喜欢
  _handleLikeWindow(rid, value) {
    let list = this.data.dynamicList.lines
    list.forEach(v => {
      if (v.rid == rid) {
        v.is_like = value
        v.like_count = value ? v.like_count + 1 : v.like_count - 1
      }
    })

    this.setData({
      'dynamicList.lines': list
    })
  },

  // 添加喜欢
  handleAddLike(e) {
    let index = e.currentTarget.dataset.index
    let rid = e.currentTarget.dataset.rid
    utils.logger(index, rid)

    this.setData({
      ['dynamicList.lines[' + index + '].is_like']: true,
      ['dynamicList.lines[' + index + '].like_count']: this.data.dynamicList.lines[index].like_count + 1
    })

    http.fxPost(api.shop_windows_user_likes, {
      rid: rid
    }, result => {
      utils.logger(result, "添加喜欢橱窗")
    })
  },

  // 删除喜欢
  handleDeleteLike(e) {
    let index = e.currentTarget.dataset.index
    let rid = e.currentTarget.dataset.rid
    utils.logger(index, rid)

    this.setData({
      ['dynamicList.lines[' + index + '].is_like']: false,
      ['dynamicList.lines[' + index + '].like_count']: this.data.dynamicList.lines[index].like_count - 1
    })

    http.fxDelete(api.shop_windows_user_likes, {
      rid: rid
    }, result => {
      utils.logger(result, "删除喜欢橱窗")
    })
  },

  // 获取其他人的动态
  getOtherDynamic(e) {
    http.fxGet(api.users_other_user_dynamic, this.data.dynamicParams, (result) => {
      if (result.success) {
        result.data.lines.forEach((v, i) => {
          v.created_time = utils.timestamp2string(v.updated_at, "cn")
        })

        let data = this.data.dynamicList.lines
        if (this.data.dynamicParams.page == 1) {
          data = result.data.lines
        } else {
          data = data.concat(result.data.lines)
        }

        this.setData({
          'dynamicList.lines': data,
          'dynamicList.bg_cover': result.data.bg_cover,
          'dynamicList.count': result.data.count,
          'dynamicList.followed_status': result.data.followed_status,
          'dynamicList.next': result.data.next,
          'dynamicList.username': result.data.username,
          'dynamicList.user_avatar': result.data.user_avatar,
          isLoadingUserIcon:false,
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    });
  },


  /**
   * 生命周期函数--监听页面加载 
   */
  onLoad: function(options) {
    // 检测网络
    app.ckeckNetwork()

    this.setData({
      'dynamicParams.uid': options.uid,
    })
    this.getOtherDynamic() // 获取其他人的动态

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
    }, 500)
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
    if (!this.data.dynamicList.next) {
      utils.fxShowToast("没有跟多了")
      return
    }

    this.setData({
      'dynamicParams.page': this.data.dynamicParams.page + 1,
      isLoadingUserIcon:true
    })

    this.getOtherDynamic()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return app.shareLeXi()
  }
})