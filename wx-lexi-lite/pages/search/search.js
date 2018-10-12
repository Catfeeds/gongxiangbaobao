// pages/search/search.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
const common = require('./../../utils/common.js')
let WxParse = require('../../wxParse/wxParse.js')

let searchTime

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    readyOver: false, // 页面加载是否完成
    hotSearchList: [], // 热门搜索的
    recommendList: [], // 热门推荐的其他三个
    searchHistory: [], // 搜索历史
    inputText: '', // 输入框的内容
    highQualityList: [], // 最近查看
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
      url: '../searchResult/searchResult?text=' + text,
    })
  },

  // 记录历史 跳转页面
  handleRecordLast() {
    console.log(this.data.inputText, '保存历史')
    let inputDetail = this.data.inputText.replace(/\s/g, '').length
    console.log(inputDetail)
    if (inputDetail == 0) {
      utils.fxShowToast('不能为空')

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

  // 清空历史
  handleClearHistory() {
    wx.setStorageSync('searchHistory', [])
    this.setData({
      searchHistory: []
    })
  },

  // 浏览记录
  getHighQuality() {
    // 是否登陆
    let jwt = wx.getStorageSync('jwt')
    let openid = jwt.openid
    http.fxGet(api.user_browses, {
      openid: openid
    }, (result) => {
      console.log(result, '最近浏览记录')
      if (result.success) {
        this.setData({
          highQualityList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
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

    clearTimeout(searchTime)

    searchTime = setTimeout(() => {
      let data = []
      http.fxGet(api.core_platforms_search, this.data.hingeParams, (result) => {
        console.log(result, '搜索结果')
        if (result.success) {
          result.data.search_items.forEach((v, n) => {
            v.matches.forEach((o, n) => {
              v.name = v.name.replace(o, `<text style=color:#5FE4B1>` + o + `</text>`)
              data.push(v.name)
            })

            // 处理html数据---
            if (result.data.search_items.length - 1 == n) {
              console.log(data, '拼接的')
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
    }, 3000)
  },

  // 关闭输入框
  handleDeleteInput() {
    this.setData({
      inputText: ''
    })
  },

  // 跳转
  handleToSkip(e) {
    console.log(e.currentTarget.dataset.targetType)
    let target = e.currentTarget.dataset.targetType
    let rid = e.currentTarget.dataset.rid

    if (target == 1) {
      wx.navigateTo({
        url: '../product/product?rid=' + rid
      })
    }

    if (target == 2) {
      wx.navigateTo({
        url: '../branderStore/branderStore?rid=' + rid
      })
    }
  },

  // 跳转接单定做
  handleToCustomized() {
    wx.navigateTo({
      url: '../customized/customized',
    })
  },

  // 跳转到商品详情---
  handleInfomation(e) {
    console.log(e)
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&product=' + this.data.myProduct + "&storeRid=" + e.detail.storeRid
    })
  },

  // 搜索热门搜索 core_platforms/search/week_hot
  getHotSearch() {
    http.fxGet(api.core_platforms_search_week_hot, {}, (result) => {
      console.log(result, '热门搜索')
      if (result.success) {
        this.setData({
          hotSearchList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 搜索热门推荐 其他的3个
  getHotRecommend() {
    http.fxGet(api.core_platforms_search_hot_recommend, {}, (result) => {
      console.log(result, '热门推荐3个')
      if (result.success) {
        result.data.hot_recommends.forEach((v, i) => {
          v.recommend_title = common.sliceString(v.recommend_title, 4)
        })

        this.setData({
          recommendList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 热门推荐 -- 接单定制  
  getCustomMade() {
    // http.fxGet(api.,(result)=>{

    // })
  },

  // 获取搜索历史
  getSearchHistory() {
    let data = wx.getStorageSync('searchHistory') || []
    this.setData({
      searchHistory: data
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getHighQuality() // 优质新品
    this.getSearchHistory() // 搜索历史
    this.getHotRecommend() // 热门推荐 其他三个
    this.getCustomMade() // 热门推荐的第一个
    this.getHotSearch() // 热门搜索
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