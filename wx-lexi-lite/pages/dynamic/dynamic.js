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
    isLoading: true,
    dynamicList: {
      count: 0,
      lines: []
    },

    //动态信息的参数
    dynamicParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
    },
    
    runEnv: 2
  },

  // 跳转到拼接拼接橱窗 
  handleGoAddwindow() {
    wx.navigateTo({
      url: '../addWindow/addWindow',
    })
  },

  // 去橱窗详情
  handleGoWindowDetail(e) {
    let rid = e.currentTarget.dataset.windowRid
    utils.logger(e)
    wx.navigateTo({
      url: '../windowDetail/windowDetail?windowRid=' + rid,
    })
  },

  // 获取自己的动态
  getMyDynamic() {
    http.fxGet(api.users_user_dynamic, this.data.dynamicParams, (result) => {
      utils.logger(result, "自己的动态")
      if (result.success) {
        let data = this.data.dynamicList.lines
        this.setData({
          'dynamicList.bg_cover': result.data.bg_cover,
          'dynamicList.count': result.data.count,
          'dynamicList.followed_status': result.data.followed_status,
          'dynamicList.lines': data.concat(result.data.lines),
          'dynamicList.next': result.data.next,
          'dynamicList.username': result.data.username,
          'dynamicList.user_avatar': result.data.user_avatar,
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
    this.getMyDynamic()
    
    utils.logger(app.globalData.runEnv)

    this.setData({
      runEnv: app.globalData.runEnv
    })
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
    if (!this.data.dynamicList.next) {
      utils.fxShowToast('没有更多了')
      return
    }

    this.setData({
      'dynamicParams.page': this.data.dynamicParams.page + 1
    })

    this.getMyDynamic()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return app.shareLeXi()
  }
})