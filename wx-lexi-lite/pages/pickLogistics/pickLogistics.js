// pages/pickLogistics/pickLogistics.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    activeModel: '', // 默认的物流模板公司id
    isLoading: true,
    logisticsSum: 0, // 金额
    storeInfo: [], // 获取店详情
    logisticsMould: [], // 运费模板
    store_rid: '',
    sku_rid: '',
    freight: 0
  },

  // 获取店铺的详情
  getStoreInfo() {
    
    this.setData({
      storeInfo: app.globalData.storeInfo
    })
  },

  // 页面的费用计算 物流信息
  currentPagePriceSum(event) {

    let params = {
      address_rid: app.globalData.orderParams.address_rid,
      fid: app.globalData.pickLogistics[0].fid,
      items: []
    }

    let allProduct = app.globalData.pickLogistics

    allProduct.forEach((e) => {
      let skus = {
        sku: e.rid,
        quantity: e.quantity,
      }
      params.items.push(skus)
    })

    http.fxPost(api.logistics_same_template_express, params, (result) => {
      if (result.success) {
        result.data.forEach(v => {
          if (v.express_id == this.data.activeModel) {
            v.is_default = true
          } else {
            v.is_default = false
          }
        })

        this.setData({
          logisticsMould: result.data
        })

        // 计算运费
        this._logisticsSum()

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 计算运费
  _logisticsSum() {
    let agent = this.data.logisticsMould
    agent.forEach(v => {
      if (v.is_default) {
        this.setData({
          logisticsSum: v.freight
        })
      }
    })
  },

  // 选择运费模板的express_id
  radioChange(e) {
    let logisticsMould = this.data.logisticsMould
    logisticsMould.forEach((v, i) => {
      v.is_default = false
    })

    logisticsMould[e.detail.value].is_default = true

    this.setData({
      freight: logisticsMould[e.detail.value]
    })

    let pages = getCurrentPages()
    let prevPage = pages[pages.length - 2]

    let store_rid = this.data.store_rid
    let sku_rid = this.data.sku_rid

    let fid = app.globalData.pickLogistics[0].fid // 共同的模板id
    let skus = prevPage.data.logisticsCompany[store_rid]

    Object.keys(skus).forEach((v, i) => {
      if (skus[v].fid == fid) {
        prevPage.setData({
          ['logisticsCompany.' + store_rid + '.' + v + '.express']: logisticsMould // 当前选择的好的名字赋值给编辑款项中的姓名临时变量
        })
      }
    })
    prevPage.handleLogisticsSetingOrder()
    this._logisticsSum()

  },

  // 获取物流信息以及sku信息
  getSkuAndLogistcs() {

    // 设置已经选择的物流
    app.globalData.logisticsMould.forEach(v => {
      if (v.is_default) {
        this.setData({
          activeModel: v.express_id, // 默认的物流模板id
        })
      }
    })

    app.globalData.logisticsMould.forEach((v, i) => {
      if (v.is_default) {
        this.currentPagePriceSum()
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(e) {
    // 检测网络
    app.ckeckNetwork()

    this.getStoreInfo()
    this.setData({
      store_rid: e.store_rid,
      sku_rid: e.sku_rid,
    }, () => {
      this.getSkuAndLogistcs() // 获取信息渲染模板
    })
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