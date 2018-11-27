// 地址管理
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
    addressList: [],
    addressSelected: {},
    page: 1,
    perPage: 10
  },

  /**
   * 选中地址
   */
  handleSelectAddress (e) {
    let rid = e.currentTarget.dataset.rid
    let _list = this.data.addressList.map(item => {
      if (item.rid == rid) {
        item.selected = true
        this.setData({
          addressSelected: item
        })
      } else {
        item.selected = false
      }
      return item
    })

    this.setData({
      addressList: _list
    })
  },

  /**
   * 新增地址
   */
  handleAddAddress () {
    wx.navigateTo({
      url: '../addressEdit/addressEdit',
    })
  },

  /**
   * 编辑地址
   */
  handleEditAddress (e) {
    let rid = e.currentTarget.dataset.rid
    wx.navigateTo({
      url: '../addressEdit/addressEdit?rid=' + rid,
    })
  },

  /**
   * 地址列表
   */
  getAddresslist () {
    http.fxGet(api.addresses, {
      page: this.data.page,
      per_page: this.data.perPage
    }, (res) => {
      utils.logger(res.data, '地址列表')
      if (res.success) {
        let _list = res.data.map(item => {
          item.selected = item.is_default ? true : false
          return item
        })
        this.setData({
          addressList: _list
        })
      } else {
        utils.logger(res.status.message, '获奖的用户')
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    this.getAddresslist()
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