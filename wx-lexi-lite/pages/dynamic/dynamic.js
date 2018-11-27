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

    runEnv: 1,
    windowModal: false, // 删除动态的模态框
    deleteWindowRid: '', // 删除橱窗的id
    deleteWindowIdx: '', // 删除橱窗的index
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

  // 操作橱窗
  handleOpenWindow(e) {
    this.setData({
      windowModal: true,
      deleteWindowRid: e.currentTarget.dataset.rid,
      deleteWindowIdx: e.currentTarget.dataset.index
    })
  },

  // 删除橱窗
  handleDeleteWindow() {
    http.fxDelete(api.shop_windows, {
      rid: this.data.deleteWindowRid
    }, result => {
      if (result.success) {

        utils.fxShowToast('删除成功')
        let arrayData = this.data.dynamicList
        arrayData.lines.splice(this.data.deleteWindowIdx, 1)
        arrayData.count = arrayData.count - 1

        this.setData({
          dynamicList: arrayData
        })

        this.handleOffWindow()
      } else {
        utils.fxShowToast(result.status.message)
      }
    })

  },

  // 关闭操作橱窗
  handleOffWindow() {
    this.setData({
      windowModal: false,
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
    // 检测网络
    app.ckeckNetwork()
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
    // 获取当前环境
    this.getRunEnv()

    this.setData({
      'dynamicList.count': 0,
      'dynamicList.lines': [],
      'dynamicParams.page': 1
    })

    this.getMyDynamic()
  },

  /**
   * 获取运行环境
   */
  getRunEnv() {
    http.fxGet(api.run_env, {}, (res) => {
      if (res.success) {
        utils.logger(res, '环境变量')
        this.setData({
          runEnv: res.data.status
        })
      }
    })
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