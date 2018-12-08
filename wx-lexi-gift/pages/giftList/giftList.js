// 更多礼物等待开启
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

    // 当前活动
    isExist: false,
    currentActivity: {}, // 正在进行的

    giftList: [], // 等待列表
    page: 1,
    perPage: 10,
    haveNext: true,
    moreLoading: false
  },

  /**
   * 返回发起页
   */
  handleGoIndex () {
    wx.switchTab({
      url: '../index/index',
    })
  },

  /**
   * 获取当前活动
   */
  getCurrentActivity() {
    http.fxGet(api.gift_current, {}, (res) => {
      utils.logger(res.data, '获取当前活动')
      if (res.success) {
        let _ca = Object.keys(res.data)
        this.setData({
          isExist: _ca.length > 0 ? true : false,
          currentActivity: res.data
        })
      } else {
        utils.logger(res.status.message, '获取当前活动出错')
      }
    })
  },

  /**
   * 获取礼物列表
   */
  getGiftList() {
    this._startLoading()
    http.fxGet(api.gift_more, { page: this.data.page, per_page: this.data.perPage }, (res) => {
      this._endLoading()
      utils.logger(res.data, '等待礼物列表')
      if (res.success) {
        let _list = this.data.giftList

        res.data.user_list.map(item => {
          item.product_name = utils.truncate(item.product_name, 15)
          return item
        })

        if (this.data.page > 1) {
          _list = _list.concat(res.data.user_list)
        } else {
          _list = res.data.user_list
          let _currentActivity = {}
          let _isExist = false
          if (_list.length > 0) {
            _isExist = true
            _currentActivity = _list.shift()
          }
          this.setData({
            isExist: _isExist,
            currentActivity: _currentActivity
          })
        }

        this.setData({
          giftList: _list,
          hasNext: res.data.next
        })
                
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 开启loading
   */
  _startLoading() {
    this.setData({
      moreLoading: true
    })
  },

  /**
   * 结束loading
   */
  _endLoading() {
    this.setData({
      moreLoading: false
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getGiftList()
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
    if (!this.data.hasNext) {
      return
    }
    this.setData({
      page: this.data.page + 1
    })

    this.getGiftList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.shareWxaGift()
  }

})