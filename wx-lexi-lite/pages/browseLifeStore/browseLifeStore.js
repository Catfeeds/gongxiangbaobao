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
    browseLifeStore: {}, // 我浏览过的生活馆
  },

  // 浏览过的生活馆
  handleGoLiftStore(e) {
    let rid = e.currentTarget.dataset.rid
    console.log(rid)

  },

  //访问过的生活馆
  getBrowseLifeStore() {
    // 是否登陆
    if (!app.globalData.isLogin) {
      return
    }

    http.fxGet(api.users_get_visitor_life_stores, {}, res => {
      utils.logger(res, "访问过的生活馆")
      if (res.success) {
        res.data.life_stores.forEach(v => {
          v.name = v.name.length > 6 ? v.name.substr(0, 6) + '...' : v.name
        })
        this.setData({
          browseLifeStore: res.data
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
    this.getBrowseLifeStore() // 浏览过的生活馆

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

})