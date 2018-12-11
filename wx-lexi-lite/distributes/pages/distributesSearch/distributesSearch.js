// pages/search/search.js
const app = getApp()

const http = require('./../../../utils/http.js')
const api = require('./../../../utils/api.js')
const utils = require('./../../../utils/util.js')
const common = require('./../../../utils/common.js')
let WxParse = require('./../../../wxParse/wxParse.js')

let distributeSearchTime

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    readyOver: false, // 页面加载是否完成
    searchHistory: [], // 搜索历史
    inputText: '', // 输入框的内容
    recommendText: [], // 搜索时候推荐的词汇
    replyTemArray: [],
    // 关键词请求到参数
    hingeParams: {
      page: 1, // Number	可选	1	当前页码
      per_page: 10, // Number	可选	10	每页数量
      qk: '' // 必须	 	关键词
    },
  },

  // 搜索热词
  handleSearchWord(e) {
    let text = e.currentTarget.dataset.text
    wx.navigateTo({
      url: '../distributesSearchRes/distributesSearchRes?text=' + text,
    })
  },

  // 记录历史 跳转页面
  handleRecordLast() {
    utils.logger(this.data.inputText, '保存历史')
    let inputDetail = this.data.inputText.replace(/\s/g, '').length
    utils.logger(inputDetail)
    if (inputDetail == 0) {
      utils.fxShowToast('不能为空')

      this.setData({
        inputText: ''
      })

      clearTimeout(distributeSearchTime)
      return
    }

    clearTimeout(distributeSearchTime)

    let data = this.data.searchHistory
    data.unshift(this.data.inputText)
    let newData = Array.from(new Set(data)) // 去重后转为数组 .replace(/\s/g,"")

    if (this.data.inputText.length != 0) {
      wx.setStorageSync('distributeSearchHistory', newData)
    }

    this.setData({
      searchHistory: newData
    })

    wx.navigateTo({
      url: '../distributesSearchRes/distributesSearchRes?text=' + this.data.inputText,
    })
  },

  // 清空历史
  handleClearHistory() {
    wx.setStorageSync('distributeSearchHistory', [])
    this.setData({
      searchHistory: []
    })
  },

  // 输入框输入时 点击的文字
  handleSearchText(e) {
    let index = e.currentTarget.dataset.index
    let replaceData = this.data.data[index]
    replaceData = replaceData.replace('<text style=color:#5FE4B1>', '')
    replaceData = replaceData.replace("</text>", '')

    this.setData({
      inputText: replaceData
    })

    this.handleRecordLast()
  },

  // 输入框输入信息
  handleInput(e) {
    this.setData({
      inputText: e.detail.value,
      ['hingeParams.qk']: e.detail.value.replace(/(^\s*)|(\s*$)/g, '')
    })

    if (!this.data.hingeParams.qk) {
      return
    }

    clearTimeout(distributeSearchTime)

    distributeSearchTime = setTimeout(() => {
      let data = []
      http.fxGet(api.core_platforms_search, this.data.hingeParams, (result) => {
        utils.logger(result, '搜索结果')
        if (result.success) {
          result.data.search_items.forEach((v, n) => {
            v.matches.forEach((o, n) => {
              v.name = v.name.replace(o, `<text style=color:#5FE4B1>` + o + `</text>`)
              data.push(v.name)
            })

            // 处理html数据---
            if (result.data.search_items.length - 1 == n) {
              utils.logger(data, '拼接的')
              for (let i = 0; i < data.length; i++) {
                WxParse.wxParse('data' + i, 'html', data[i], this);
                if (i == data.length - 1) {
                  WxParse.wxParseTemArray("replyTemArray", 'data', data.length, this)
                }
              }

              utils.logger(this.data.replyTemArray)
              this.setData({
                data: data,
                recommendText: result.data
              })
            }
          })
        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    }, 1800)
  },

  // 关闭输入框
  handleDeleteInput() {
    this.setData({
      inputText: ''
    })
  },

  // 获取搜索历史
  getSearchHistory() {
    let data = wx.getStorageSync('distributeSearchHistory') || []
    this.setData({
      searchHistory: data
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 检测网络
    app.ckeckNetwork()
    wx.setNavigationBarTitle({
      title: '选品搜索',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.setData({
      readyOver: true
    })
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
    this.getSearchHistory() // 搜索历史
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
  }

})