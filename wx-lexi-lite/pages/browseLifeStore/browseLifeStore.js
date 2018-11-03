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

    browseLifeStore: { // 我浏览过的生活馆
      count: 0,
      life_stores: [],
      next: false
    },
    browseLifeStoreParans: {
      page: 1, // Number	可选	1	当前页码
      per_page: 10 // Number	可选	10	每页数量
    }

  },

  // 浏览过的生活馆
  handleGoLiftStore(e) {
    let rid = e.currentTarget.dataset.rid
    if (rid) {
      wx.setStorageSync('showingLifeStoreRid', rid)

      wx.switchTab({
        url: '../index/index',
      })
    }
  },

  //访问过的生活馆
  getBrowseLifeStore() {
    // 是否登陆
    if (!app.globalData.isLogin) {
      return
    }

    http.fxGet(api.users_get_visitor_life_stores, this.data.browseLifeStoreParans, res => {
      utils.logger(res, "访问过的生活馆")
      console.log(res, "访问过的生活馆")
      if (res.success) {
        res.data.life_stores.forEach(v => {
          v.name = v.name.length > 15 ? v.name.substr(0, 15) + '...' : v.name
        })

        let arrayData = this.data.browseLifeStore.life_stores
        this.setData({
          'browseLifeStore.life_stores': arrayData.concat(res.data.life_stores),
          'browseLifeStore.count': res.data.count,
          'browseLifeStore.next': res.data.next,
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
    if (!this.data.browseLifeStore.next) {
      utils.fxShowToast('没有更多了')
      return
    }

    this.setData({
      'browseLifeStoreParans.page': this.data.browseLifeStoreParans.page + 1
    })

    this.getBrowseLifeStore()

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return app.shareLeXi()
  },

})