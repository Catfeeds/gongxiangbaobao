/**
 * 上架分销
 */
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    rid: '',
    sid: '',
    form: {
      stick_text: ''
    },
    product: {}
  },

  /**
   * 推荐语变化
   */
  handleChangeStickText (e) {
    console.log(e)
    this.setData({
      'form.stick_text': e.detail.value
    })
  },

  /**
   * 确认上架分销
   */
  handleSubmitDistribute () {
    wx.showLoading({
      title: '正在提交...',
    })
    const data = {
      rid: this.data.rid,
      sid: this.data.sid,
      stick_text: this.data.form.stick_text
    }
    http.fxPost(api.distribution_sell, data, (res) => {
      wx.hideLoading()
      console.log(res, '上架分销')
      if (res.success) {
        wx.navigateBack({
          delta: 1
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 获取商品信息
   */
  getProduct () {
    wx.showLoading({
      title: '加载中',
    })

    http.fxGet(api.product_info.replace(/:rid/, this.data.rid), {}, (res) => {
      console.log(res, '分销商品')
      wx.hideLoading()
      if (res.success) {
        this.setData({
          product: res.data
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
    console.log(options.rid)
    this.setData({
      rid: options.rid
    })

    // 从本地缓存中获取数据
    const lifeStore = wx.getStorageSync('lifeStore')
    this.setData({
      sid: lifeStore.lifeStoreRid
    })

    this.getProduct()
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})