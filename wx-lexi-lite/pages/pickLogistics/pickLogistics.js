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

  // 页面的费用计算
  currentPagePriceSum(event) {
    console.log(event)

    let params = {
      address_rid: app.globalData.orderParams.address_rid,
      items: []
    }

    let allProduct = app.globalData.pickLogistics
    console.log(allProduct,'全部的产品信息')
    allProduct.forEach((key) => {
      utils.logger(key)
      let productsList = {
        rid: key.store_rid,
        sku_items: []
      }

      allProduct.forEach((e) => {
        let skus = {
          sku: e.rid,
          quantity: e.quantity,
          express_id: event
        }
        productsList.sku_items.push(skus)
      })

      params.items[0] = productsList
    })
    console.log(params)

    http.fxPost(api.calculate_logisitcs, params, (result) => {
      console.log(result, '物流运费')
      if (result.success) {
        let sum = 0
        Object.keys(result.data).forEach((key) => {
          sum = result.data[key] - 0 + sum
        })
        this.setData({
          logisticsSum: sum
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 选择运费模板的express_id
  radioChange(e) {
    let logisticsMould = this.data.logisticsMould
    logisticsMould.forEach((v,i)=>{
      v.is_default = false
    })

    logisticsMould[e.detail.value].is_default = true

    utils.logger(logisticsMould[e.detail.value], '运费模板')

    this.setData({
      freight: logisticsMould[e.detail.value]
    })

    let pages = getCurrentPages()
    let prevPage = pages[pages.length - 2]

    utils.logger(logisticsMould)
    let store_rid = this.data.store_rid
    let sku_rid = this.data.sku_rid
    prevPage.setData({
      ['logisticsCompany.' + store_rid + '.' + sku_rid +'.express']:logisticsMould // 当前选择的好的名字赋值给编辑款项中的姓名临时变量
    },() => {
      prevPage.handleLogisticsSetingOrder()
      this.currentPagePriceSum(this.data.logisticsMould[e.detail.value].express_id)
    })
  },

  // 获取物流信息以及sku信息
  getSkuAndLogistcs() {
    this.setData({
      logisticsMould: app.globalData.logisticsMould, // 运费模板
    })
    
    console.log(this.data.logisticsMould)
    app.globalData.logisticsMould.forEach((v,i)=>{
      if (v.is_default){
        this.currentPagePriceSum(v.express_id)
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
    },() => {
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