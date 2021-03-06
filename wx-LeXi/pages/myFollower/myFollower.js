// pages/myFollower/myFollower.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    peopleList: [], // 粉丝的数量
    params: {
      page: 1, // Number	可选	1	当前页码
      per_page: 10 // Number	可选	10	每页数量
    }
  },

  // 获取粉丝
  getFollower() {
    http.fxGet(api.users_fans_counts, this.data.params, (result) => {
      console.log(result)
      if (result.success) {
        this.setData({
          peopleList:result.data
        })
      } else {

      }
    })
  },

  // 添加关注
  hanleAddWatch(e) {
    let index = e.currentTarget.dataset.index
    http.fxPost(api.follow_user, { uid: e.currentTarget.dataset.uid }, (result) => {
      console.log(result)
      if (result.success) {
        this.setData({
          ['peopleList.user_fans[' + index + '].followed_status']: result.data.followed_status
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 取消关注
  hanleDeleteWatch(e) {
    let index = e.currentTarget.dataset.index
    http.fxPost(api.unfollow_user, { uid: e.currentTarget.dataset.uid }, (result) => {
      console.log(result)
      if (result.success) {
        this.setData({
          ['peopleList.user_fans[' + index + '].followed_status']: result.data.followed_status
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getFollower()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
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
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return common.shareLexi(app.globalData.storeInfo.name, app.globalData.shareBrandUrl)
  }
  
})