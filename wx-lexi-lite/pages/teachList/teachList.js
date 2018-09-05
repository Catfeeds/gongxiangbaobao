// pages/designerAffair/designerAffair.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isNext: false, // 是否有下一页
    dataList: [], // 创作人故事列表
    params: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
    }
  },
  
  //跳转到详情
  handleToInfo(e) {
    console.log(e.currentTarget.dataset.type)
    let rid = e.currentTarget.dataset.rid
    if (e.currentTarget.dataset.type == 1) {
      wx.navigateTo({
        url: '../findInfo/findInfo?rid=' + rid
      })
    }
    if (e.currentTarget.dataset.type == 2) {
      wx.navigateTo({
        url: '../plantNoteInfo/plantNoteInfo?rid=' + rid
      })
    }
  },

  getData() {
    http.fxGet(api.life_records_hand_teach, this.data.params, (result) => {
      console.log(result, "手做教学")
      if (result.success) {
        this.setData({
          dataList: result.data.life_records,
          isNext: result.data.next
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
    this.getData()
  },
  /**
 * 页面上拉触底事件的处理函数
 */
  onReachBottom: function () {
    if (!this.data.isNext) {
      utils.fxShowToast("没有更多商品了")
      return
    }

    this.setData({
      ['params.page']: this.data.params.page + 1
    })

    this.data.getData()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.shareLeXi()
  }
})