// pages/addWindow/addWindow.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPublish:false,

    toggleCode: 3,
    toggleCategory: [{
        name: "拼接3张",
        code: 3
      },
      {
        name: "拼接5张",
        code: 5
      },
      {
        name: "拼接7张",
        code: 7
      },
    ],

    windowParams: {
      title: '', //String	必须	 	标题
      description: '', //String	必须	 	简介
      product_items: [ //	Array	必须	 	橱窗商品
        {
          rid: '',
          cover_id: '',
          link: '',
          storeId: ''
        },
      ],
      keywords: [], //Array	可选	 	关键词
    }
  },

  _handeICanPublish() {
    let pickPhotoAddPickCategory = this.data.toggleCode == this.data.windowParams.product_items.length // 选择的图片和选择的3，5，7是否相等
    let title = this.data.windowParams.title // 标题
    let description = this.data.windowParams.description
    let labelLength = this.data.windowParams.keywords.length
    if (pickPhotoAddPickCategory && title && description && labelLength != 0) {
      this.setData({
        isPublish:true
      })
    }else{
      this.setData({
        isPublish: false
      })
    }
  },

  // 切换拼接橱窗
  handleWindowToggle(e) {
    console.log(e.currentTarget.dataset.windowCode)
    this.setData({
      toggleCode: e.currentTarget.dataset.windowCode
    })
  },

  // 添加橱窗商品
  handlePickProduct(e) {
    wx.navigateTo({
      url: '../addWindowProduct/addWindowProduct?index=' + e.currentTarget.dataset.idx,
    })
  },

  // 添加标题
  handleSetWindowTitle(e) {
    console.log(e.detail.value)
    this.setData({
      'windowParams.title': e.detail.value
    })

    this._handeICanPublish() // 是否可发布
  },

  // 添加详情
  handleSetNarrate(e) {
    this.setData({
      'windowParams.description': e.detail.value
    })

    this._handeICanPublish() // 是否可发布
  },

  //去添标签页面
  handleToAddwindowlabel() {
    wx.navigateTo({
      url: '../addWindowLabel/addWindowLabel',
    })
  },

  handlePublishBtn(){
    if (!this.data.isPublish){
      utils.fxShowToast("请填写完整信息")
      return
    }

    http.fxPost(api.shop_windows, this.data.windowParams,result=>{{
      console.log(result)
      if(result.success){


      }else{
        utils.fxShowToast(result.status.message)
      }
    }})
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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
    this._handeICanPublish() // 是否可发布
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

  }
})