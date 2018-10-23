// pages/find/find.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    readyOver: false, // 渲染是否完成
    isLoading: true,
    swiperMark: 0, // 轮播图的标记
    advertisement: { // 广告
      banner_images: [
        { image: '' }
      ]
    },
    wonderfulStories: { // 精彩故事
      life_records: [
        { cover: '', description: '', user_avator: '', user_name: '' },
        { cover: '', description: '', user_avator: '', user_name: '' },
        { cover: '', description: '', user_avator: '', user_name: '' },
        { cover: '', description: '', user_avator: '', user_name: '' }
      ]
    },
    youLike: {// 猜你喜欢
      life_records:[ 
        { cover: '', description: '', user_avator: '', user_name:'' },
        { cover: '', description: '', user_avator: '', user_name:'' },
        { cover: '', description: '', user_avator: '', user_name:'' },
        { cover: '', description: '', user_avator: '', user_name:'' }
    ]}, 
    liveTheme:[
      { name: '创作人故事', target: 1, img:"https://static.moebeast.com/static/img/designer_routine.jpg"},
      { name: '种草笔记', target: 2, img:"https://static.moebeast.com/static/img/teach.jpg"},
      { name: '生活记事', target: 3, img:"https://static.moebeast.com/static/img/plant_note.jpg"},
      { name: '手作教学', target: 4, img:"https://static.moebeast.com/static/img/live_note.jpg"}
    ]
  },

  handleToListPage(e) {
    let data = ''
    switch (e.currentTarget.dataset.target) {
      case 1:
        data = 'designerAffair';
        break;
      case 2:
        data = 'plantNoteList';
        break;
      case 3:
        data = 'liveNoteList';
        break;
      case 4:
        data = 'teachList';
        break;
    }

    wx.navigateTo({
      url: '../' + data + '/' + data,
    })
  },

  // swiper 变化触发
  handleSwiperChange(e) {
    this.setData({
      swiperMark: e.detail.current
    })
  },

  // 生活志详情
  handleLiveInfo(e) {
    let targetType = e.currentTarget.dataset.type
    let link = e.currentTarget.dataset.link

    if (targetType == 1) {

    }

    if (targetType == 2) {
      wx.navigateTo({
        url: '../product/product?rid=' + link
      })
    }

    if (targetType == 3) {
      wx.navigateTo({
        url: '../categoryList/categoryList?categryId=' + link
      })
    }

    if (targetType == 4) {
      wx.navigateTo({
        url: '../branderStore/branderStore?rid=' + link
      })
    }

    if (targetType == 6) {
      wx.navigateTo({
        url: '../findInfo/findInfo?rid=' + link
      })
    }

  },

  // 猜你喜欢
  getYouLike() {
    http.fxGet(api.life_records_guess_likes, {}, (result) => {
      utils.logger(result, '猜你喜欢')
      
      this.setData({
        isLoadPageShow: false
      })

      if (result.success) {
        // 去除标签
        result.data.life_records.forEach((v) => {
          v.description = v.description.replace(/<\s*\/?\s*[a-zA-z_]([^>]*?["][^"]*["])*[^>"]*>/g, '')
        })

        this.setData({
          youLike: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 精彩故事和猜你喜欢跳转
  handleToliveNote(e) {
    let targetType = e.currentTarget.dataset.type
    let rid = e.currentTarget.dataset.rid

    // 1: 文章
    if (targetType == 1) {
      wx.navigateTo({
        url: '../findInfo/findInfo?rid=' + rid,
      })
    }

    // 2: 种草笔记
    if (targetType == 2) {
      wx.navigateTo({
        url: '../plantNoteInfo/plantNoteInfo?rid=' + rid,
      })
    }

    // 跳转视频
    if (targetType == 3) {

    }
  },

  // 精彩故事
  getWonderfulStories() {
    http.fxGet(api.life_records_wonderful_stories, {}, (result) => {
      utils.logger(result, '精彩故事')
      if (result.success) {
        // 去除标签
        result.data.life_records.forEach((v) => {
          v.description = v.description.replace(/<\s*\/?\s*[a-zA-z_]([^>]*?["][^"]*["])*[^>"]*>/g, '')
        })

        this.setData({
          wonderfulStories: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 头部广告
  getAdvertisement() {
    http.fxGet(api.marketBanners.replace(/:rid/g, 'discover_ad'), {}, (result) => {
      utils.logger(result, '发现-头部广告')
      if (result.success) {
        this.setData({
          advertisement: result.data
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
    this.getAdvertisement() // 头部广告
    this.getYouLike() // 猜你喜欢
    this.getWonderfulStories() // 精彩故事
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
  }
  
})