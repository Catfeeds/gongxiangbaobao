// 我参与的抽奖
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
    activeStatus: 0,
    tabs: [
      { rid: 's0', name: '全部', status: 0 },
      { rid: 's1', name: '已中奖', status: 1 },
      { rid: 's2', name: '未中奖', status: 2 },
      { rid: 's3', name: '已失效', status: 3 }
    ],
    page: 1,
    perPage: 10,
    lotteryList: [],
    hasNext: true

  },

  /**
   * 改变状态
   */
  handleChangeStatus (e) {
    let status = e.currentTarget.dataset.status
    this.setData({
      page: 1,
      activeStatus: parseInt(status)
    })

    this.getActivityList()
  },

  /**
   * 获取参与的活动列表
   */
  getActivityList() {
    http.fxGet(api.gift_activity_partake, {
      page: this.data.page,
      per_page: this.data.perPage,
      s: this.data.activeStatus
    }, (res) => {
      utils.logger(res.data, '参与的活动列表')
      if (res.success) {
        let _list = this.data.lotteryList

        res.data.activity_list.map(item => {
          item.created_at = utils.timestamp2string(item.created_at)
          return item
        })

        if (this.data.page > 1) {
          _list = _list.push.apply(_list, res.data.activity_list)
        } else {
          _list = res.data.activity_list
        }

        this.setData({
          lotteryList: _list,
          hasNext: res.data.next
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getActivityList()
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

    this.getActivityList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    app.shareWxaGift()
  }

})