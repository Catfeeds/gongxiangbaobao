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
    isSubmit: false,
    isLoading: true,
    isPublish: false,

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

  // 书否可发布
  _handeICanPublish() {
    let pickPhotoAddPickCategory = this.data.toggleCode <= this.data.windowParams.product_items.length // 选择的图片和选择的3，5，7是否相等
    let title = this.data.windowParams.title // 标题
    let description = this.data.windowParams.description
    let labelLength = this.data.windowParams.keywords.length

    if (pickPhotoAddPickCategory && title && description) {
      this.setData({
        isPublish: true
      })
    } else {
      this.setData({
        isPublish: false
      })
    }
  },

  //删除标签
  handleDeleteLabel(e) {
    utils.logger(e.currentTarget.dataset.index)
    let index = e.currentTarget.dataset.index
    let labels = this.data.windowParams.keywords
    labels.splice(index, 1)

    this.setData({
      'windowParams.keywords': labels
    })

  },

  // 切换拼接橱窗
  handleWindowToggle(e) {
    utils.logger(e.currentTarget.dataset.windowCode)
    this.setData({
      toggleCode: e.currentTarget.dataset.windowCode
    })

    this._handeICanPublish() // 是否可发布
  },

  // 添加橱窗商品
  handlePickProduct(e) {
    wx.navigateTo({
      url: '../addWindowProduct/addWindowProduct?index=' + e.currentTarget.dataset.idx,
    })
  },

  // 添加标题
  handleSetWindowTitle(e) {
    utils.logger(e.detail.value)
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
    if (this.data.windowParams.keywords.length == 3) {
      utils.fxShowToast('最多添加3个标签')
      return
    }
    wx.navigateTo({
      url: '../addWindowLabel/addWindowLabel',
    })
  },

  // 发布橱窗
  handlePublishBtn() {
    if (!this.data.isPublish) {
      utils.fxShowToast("请填写完整信息")
      return
    }

    //值为发布状态
    if (this.data.isSubmit) {
      utils.fxShowToast("不能重复发布!")
      return
    }

    // 去除多余的图片
    let publishParams = this.data.windowParams.product_items
    if (this.data.toggleCode < publishParams.length) {
      this.setData({
        'windowParams.product_items': publishParams.splice(0, this.data.toggleCode)
      })
    }

    let publishParamsList = this.data.windowParams.product_items
    for (let i = 0; i < publishParamsList.length; i++) {
      if (publishParamsList[i] == undefined || !publishParamsList[i].rid) {
        utils.fxShowToast('图片不完整')
        return
      }
    }

    this.setData({
      isSubmit: true
    })

    http.fxPost(api.shop_windows, this.data.windowParams, result => {
      {
        utils.logger(result, '添加橱窗完成')
        if (result.success) {
          utils.logger(this.data.windowParams.product_items)
          utils.fxShowToast('添加成功', 'success')
          this._upParentData(result.data)

          wx.navigateBack({
            delta: 1
          })

          //值为发布状态
          this.setData({
            isSubmit: false
          })

        } else {
          utils.fxShowToast(result.status.message)
        }
      }
    })
  },

  // 刷新tabbar 的数据
  _upParentData(e) {
    let route = getCurrentPages()
    let parentPage = route[route.length - 2]
    if (parentPage.route == 'pages/windowTabBar/windowTabBar') {
      parentPage.setData({
        'followLoadMany.shop_windows': [e].concat(parentPage.data.followLoadMany.shop_windows)
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 检测网络
    app.ckeckNetwork()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
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