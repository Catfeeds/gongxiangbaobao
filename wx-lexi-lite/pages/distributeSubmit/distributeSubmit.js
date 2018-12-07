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
    isLoading: true,
    rid: '',
    sid: '',
    form: {
      stick_text: ''
    },
    product: {},
    index: ''
  },

  /**
   * 推荐语变化
   */
  handleChangeStickText(e) {
    this.setData({
      'form.stick_text': e.detail.value
    })
  },

  /**
   * 确认上架分销
   */
  handleSubmitDistribute() {
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
      utils.logger(res, '上架分销')
      if (res.success) {
        wx.navigateBack({
          delta: 1
        })

        let pagePath = getCurrentPages()
        let parentPath = pagePath[pagePath.length - 2]
        let grandsire = pagePath[pagePath.length - 3]

        if (parentPath.route == 'pages/product/product') {
          // 设置详情页面的已上架按钮
          parentPath.setData({
            'productTop.have_distributed': true
          })
        }

        if (parentPath.route == 'pages/distributes/distributes') {
          this._handleUpdateMyDistributed()
          this._handleParentBtn()
          
          // 通知选品中心页面变动
          app.globalData.agent.distributeChange = true
          app.globalData.agent.distributeValue.rid = rid
          app.globalData.agent.distributeValue.value = true
        }

        if (grandsire.route == 'pages/distributes/distributes') {
          this._handleGrandsire()
        }

      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 处理祖父级别页面按钮
   */
  _handleGrandsire() {
    let pagePath = getCurrentPages()
    let grandsire = pagePath[pagePath.length - 3]

    let recommendProduct = grandsire.data.stickedProducts
    let allProduct = grandsire.data.allProducts

    if (recommendProduct.constructor == Array) {
      recommendProduct.forEach((v, i) => {
        if (this.data.rid == v.rid) {
          grandsire.setData({
            ['stickedProducts[' + i + '].have_distributed']: true
          })
        }
      })
    }

    if (allProduct.constructor == Array) {
      allProduct.forEach((v, i) => {
        if (this.data.rid == v.rid) {
          grandsire.setData({
            ['allProducts[' + i + '].have_distributed']: true
          })
        }
      })
    }

  },
  /**
   * 处理上一页的按钮样式
   */
  _handleParentBtn() {
    let pagePath = getCurrentPages()
    let parentPage = pagePath[pagePath.length - 2]
    let index = this.data.index
    if (parentPage.data.pageActiveTab == 'all') {
      parentPage.setData({
        ['allProducts[' + index + '].have_distributed']: true
      })
    }

    if (parentPage.data.pageActiveTab == 'stick') {
      parentPage.setData({
        ['stickedProducts[' + index + '].have_distributed']: true
      })
    }
  },

  /**
   * 处理首页的分销
   */
  _handleUpdateMyDistributed() {
    let pagePath = getCurrentPages()
    let indexPage = pagePath[pagePath.length - 3]
    indexPage.getStoreProducts()
  },

  /**
   * 获取商品信息
   */
  getProduct() {
    wx.showLoading({
      title: '加载中',
    })

    http.fxGet(api.product_info.replace(/:rid/, this.data.rid), {}, (res) => {
      utils.logger(res, '分销商品')
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
  onLoad: function(options) {
    utils.logger(options.rid)
    this.setData({
      rid: options.rid,
      index: options.index || ''
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