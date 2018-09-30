// pages/search/search.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
const common = require('./../../utils/common.js')
let WxParse = require("../../wxParse/wxParse.js")
let searchTime

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAddOneselfLabel: false, // 是显示添加自定义标签

    hotLabel: [], // 热门标签
    searchLabelResult: '', // 搜索标签结果

    searchHistory: [], // 搜索历史
    inputText: '', // 输入框的内容

    // 关键词请求到参数
    hingeParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
      qk: "", //必须	 	关键词
    },
  },

  //清空历史
  handleClearHistory() {
    wx.setStorageSync('searchLabelHistory', [])
    this.setData({
      searchHistory: []
    })
  },

  // 输入框输入时 点击的文字
  handleSearchText(e) {
    let text = e.currentTarget.dataset.name
    this._hanleLabel(text)

    this.setData({
      inputText: text
    })
  },

  // 添加自定义的标签
  handleAddOneSelfLabel() {
    let labelText = this.data.inputText
    http.fxPost(api.shop_windows_keywords, {
      name: labelText,
      sort_order: 1
    }, (result) => {
      console.log(result, "添加标签返回的结果")
      if (result.success) {

        this._hanleLabel(labelText)

      } else {
        utils.fxShowToast(result.status.message)
      }
    })

  },

  // 输入框输入信息
  handleInput(e) {
    console.log(e.detail.value, "输入的内容")
    let inputInfo = e.detail.value.replace(/(^\s*)|(\s*$)/g, "")

    this.setData({
      inputText: e.detail.value,
      ['hingeParams.qk']: inputInfo
    })

    if (inputInfo.length == 0) {
      clearTimeout(searchTime)
      return
    }

    clearTimeout(searchTime)
    searchTime = setTimeout(() => {
      let data = []
      http.fxGet(api.shop_windows_search_keywords, this.data.hingeParams, (result) => {
        console.log(result, "搜索标签结果")
        if (result.success) {
          this.setData({
            searchLabelResult: result.data
          })

          if (result.data.count == 0 || result.data.keywords[0].name != this.data.inputText) {
            this.setData({
              isAddOneselfLabel: true
            })
          }

        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    }, 1234)
  },

  // 关闭输入框
  handleDeleteInput() {
    this.setData({
      inputText: ''
    })
  },

  // 添加热门标签
  handleAddHotLabel(e) {
    let hotLabel = e.currentTarget.dataset.name.replace(/^\s+|\s+$/g, "")
    console.log(e, "标签的名字")

    this._hanleLabel(hotLabel)
  },

  // 处理标签
  _hanleLabel(e) {
    // 设置上个页面
    let pageRoter = getCurrentPages()
    let parentPage = pageRoter[pageRoter.length - 2]
    console.log(pageRoter[pageRoter.length - 2])

    let parentPageDataLabel = parentPage.data.windowParams.keywords
    parentPageDataLabel.push(e)

    parentPage.setData({
      'windowParams.keywords': Array.from(new Set(parentPageDataLabel))
    })

    console.log(Array.from(new Set(parentPageDataLabel)))

    // 设置缓存
    let searchLabelHistory = wx.getStorageSync('searchLabelHistory') || []
    searchLabelHistory.push(e)
    wx.setStorageSync('searchLabelHistory', Array.from(new Set(searchLabelHistory)))

    wx.navigateBack({
      delta: 1
    })
  },

  // 获取搜索历史
  getSearchHistory() {
    let data = wx.getStorageSync("searchLabelHistory") || []
    this.setData({
      searchHistory: data
    })

    console.log(data, "历史标签记录")
  },

  // 获取热门标签
  getHotLabel() {
    http.fxGet(api.shop_windows_hot_keywords, {}, result => {
      console.log(result, "热门标签")
      if (result.success) {
        // 取整
        result.data.keywords.forEach((v) => {
          v.numbers = v.numbers > 10000 ? v.numbers % 10000 >= 1000 ? (v.numbers / 10000).toFixed(1) + "w" : (v.numbers / 10000).Math.floor() + "w" : v.numbers
        })

        this.setData({
          hotLabel: result.data.keywords
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
    this.getSearchHistory() // 搜索历史
    this.getHotLabel() // 热门推荐标签
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

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
  /**
   * 跳转商品详情
   */
  handleGoProduct(e) {
    let rid = e.currentTarget.dataset.rid
    wx.navigateTo({
      url: '/pages/product/product?rid=' + rid
    })
  },
})