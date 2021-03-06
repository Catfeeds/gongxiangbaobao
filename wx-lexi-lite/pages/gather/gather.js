// pages/gather/gather.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
const common = require('./../../utils/common.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true, // 加载页面
    gatherList: [], // 集合列表
    loadingData: true, // 加载数据
    touchBottomLoading: true, // 触底加载
    getGatherParams: {
      page: 1, // Number	可选	1	当前页码
      per_page: 10, // Number	可选	10	每页数量
    }
  },

  // 获取集合
  getGather() {
    http.fxGet(api.column_collections, this.data.getGatherParams, (result) => {
      wx.stopPullDownRefresh()
      utils.logger(result, '集合')
      if (result.success) {

        let _collections = result.data.collections
        for (let i = 0; i < _collections.length; i++) {
          _collections[i].cover += '-bg75x40'
          for (let k = 0; k < _collections[i].products.length; k++) {
            _collections[i].products[k].cover += '-p30x2'
          }
        }

        let data = this.data.gatherList
        if (this.data.getGatherParams.page > 1) {
          data.push.apply(data, _collections)
        } else {
          data = _collections
        }

        this.setData({
          loadingData: false,
          touchBottomLoading: result.data.next,
          gatherList: data
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
    this.getGather()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
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

    this.setData({
      ['getGatherParams.page']: 1
    })

    this.getGather()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (!this.data.touchBottomLoading) {
      utils.fxShowToast('没有更多了')
      return
    }

    this.setData({
      ['getGatherParams.page']: this.data.getGatherParams.page + 1,
      loadingData: true,
    })

    this.getGather()
  },

  // 跳转到集合详情
  handleToGatherInfo(e) {
    wx.navigateTo({
      url: '../gatherInfo/gatherInfo?rid=' + e.currentTarget.dataset.rid
    })
  },

  // 跳转到商品详情
  handleProductInfo(e) {
    wx.navigateTo({
      url: '../product/product?rid=' + e.currentTarget.dataset.rid + "&storeRid=" + e.currentTarget.dataset.storeRid
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return app.shareLeXi()
  }

})