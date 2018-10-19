// pages/likeThisProduct/likeThisProduct.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    uid:'', // user id
    isLoading: true,
    peopleList: [], //喜欢商品的人列表
    parmas: {
      page: 1, // Number	可选	1	当前页码
      per_page: 10, // Number	可选	10	每页数量
      rid: '' // 必须	 	商品编号
    }
  },

  // 喜欢该商品的人
  getinfo(e) {
    http.fxGet(api.product_userlike, this.data.parmas, (result) => {
      utils.logger(result, '喜欢该商品的人')
      if (result.success) {
        this.setData({
          peopleList: result.data
        })
      } else {
        utils.logger(result.status.message)
      }
    })
  },

  // 添加关注
  hanleAddWatch(e) {
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return false
    }

    let index = e.currentTarget.dataset.index
    http.fxPost(api.follow_user, {
      uid: e.currentTarget.dataset.uid
    }, (result) => {
      utils.logger(result)
      if (result.success) {
        this.setData({
          ['peopleList.product_like_users[' + index + '].followed_status']: result.data.followed_status
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 取消关注
  hanleDeleteWatch(e) {
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return false
    }

    let index = e.currentTarget.dataset.index
    http.fxPost(api.unfollow_user, {
      uid: e.currentTarget.dataset.uid
    }, (result) => {
      utils.logger(e)
      if (result.success) {
        this.setData({
          ['peopleList.product_like_users[' + index + '].followed_status']: 0
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 关闭登陆框
  handelOffTap() {
    utils.handleShowTabBar()
    this.setData({
      is_mobile: false
    })
  },

  // 跳转到其他人的主页
  handleToPeopleTap(e) {
    utils.logger(e.currentTarget.dataset.uid)
      wx.navigateTo({
        url: '../people/people?uid=' + e.currentTarget.dataset.uid,
      })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      ['parmas.rid']: options.rid,
      uid: app.globalData.jwt.uid || ''
    })

    this.getinfo()
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
  }

})