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
    hotLabel:[], // 热门标签


    searchHistory: [], // 搜索历史
    inputText: '', // 输入框的内容

    recommendText: [], // 搜索时候推荐的词汇
    replyTemArray: [],
    // 关键词请求到参数
    hingeParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
      qk: "", //必须	 	关键词
    },
  },

  // 记录历时 跳转页面
  handleRecordLast() {

    console.log(this.data.inputText, "保存历史")
    let inputDetail = this.data.inputText.replace(/\s/g, "").length
    console.log(inputDetail)

    if (inputDetail == 0) {
      utils.fxShowToast("不能为空")

      this.setData({
        inputText: ''
      })

      clearTimeout(searchTime)
      return
    }

    clearTimeout(searchTime)
    let data = this.data.searchHistory
    data.unshift(this.data.inputText)
    let newData = Array.from(new Set(data)) // 去重后转为数组 .replace(/\s/g,"")

    if (this.data.inputText.length != 0) {
      wx.setStorageSync('searchHistory', newData)
    }

    this.setData({
      searchHistory: newData
    })



    wx.navigateTo({
      url: '../searchResult/searchResult?text=' + this.data.inputText,
    })
  },

  //清空历史
  handleClearHistory() {
    wx.setStorageSync('searchHistory', [])
    this.setData({
      searchHistory: []
    })
  },

  // 输入框输入时 点击的文字
  handleSearchText(e) {
    let index = e.currentTarget.dataset.index

    console.log(this.data.data[index], "选中的")
    console.log(typeof(this.data.data[index]), "选中的")
    let replaceData = this.data.data[index]
    console.log(replaceData)
    replaceData = replaceData.replace('<text style=color:#5FE4B1>', '')
    replaceData = replaceData.replace("</text>", '')
    console.log(replaceData)

    this.setData({
      inputText: replaceData
    })

    this.handleRecordLast()
  },

  // 输入框输入信息
  handleInput(e) {
    console.log(e.detail.value, "输入的内容")

    this.setData({
      inputText: e.detail.value,
      ['hingeParams.qk']: e.detail.value.replace(/(^\s*)|(\s*$)/g, "")
    })

    clearTimeout(searchTime)
    searchTime = setTimeout(() => {
      let data = []
      http.fxGet(api.shop_windows_search_keywords, this.data.hingeParams, (result) => {
        console.log(result, "搜索标签结果")
        if (result.success) {
          result.data.search_items.forEach((v, n) => {
            v.matches.forEach((o, n) => {
              v.name = v.name.replace(o, `<text style=color:#5FE4B1>` + o + `</text>`)
              data.push(v.name)
            })

            // 处理html数据---
            if (result.data.search_items.length - 1 == n) {
              console.log(data, "拼接的")
              for (let i = 0; i < data.length; i++) {
                WxParse.wxParse('data' + i, 'html', data[i], this);
                if (i == data.length - 1) {
                  WxParse.wxParseTemArray("replyTemArray", 'data', data.length, this)
                }
              }

              console.log(this.data.replyTemArray)
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
    }, 1500)

  },

  // 关闭输入框
  handleDeleteInput() {
    this.setData({
      inputText: ''
    })
  },

// 添加热门标签
  handleAddHotLabel(e){
    let hotLabel = e.currentTarget.dataset.name.replace(/^\s+|\s+$/g, "")
    console.log(hotLabel,"标签的名字")
    
    this._hanleLabel(hotLabel)
  },

// 处理标签
  _hanleLabel(e){
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
    wx.setStorageSync('searchLabelHistory', Array.from(new Set(searchLabelHistory)) )

    wx.navigateBack({
      delta:1
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
      console.log(result,"热门标签")
      if (result.success) {
        // 取整
        result.data.keywords.forEach((v)=>{
          v.numbers = v.numbers > 10000 ? v.numbers % 10000 >= 1000 ? (v.numbers / 10000).toFixed(1) +"w": (v.numbers / 10000).Math.floor() +"w" : v.numbers
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