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
    logisticsMould: [], // 运费模板
    store_rid: '',
    sku_rid: '',
    freight:0
  },
  // 页面的费用计算
  currentPagePriceSum(event){
    var allProduct=app.globalData.pickLogistics
    console.log(allProduct)
    var params = {
      address_rid: wx.getStorageSync('orderParams').address_rid,
      items: []
    }
    allProduct.forEach((key) => {
      console.log(key)
      var productsList = {
        rid: key.store_rid,
        sku_items: []
      }

      allProduct.forEach((e) => {
        var skus = {
          sku: e.rid,
          quantity: e.quantity,
          express_id: event
        }
        productsList.sku_items.push(skus)
      })
      params.items[0]=productsList
    })

    setTimeout(() => {
      http.fxPost(api.calculate_logisitcs, params, (result) => {
        console.log(result)
        if (result.success) {
          var sum = 0
          Object.keys(result.data).forEach((key) => {
            sum = result.data[key] - 0 + sum
          })
          this.setData({
            freight: sum
          })
        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    }, 500)
  },
  // 运费模板的express_id
  radioChange(e) {
    console.log(e.detail.value)
    console.log(this.data.logisticsMould[e.detail.value])
    var logisticsMould = this.data.logisticsMould
    logisticsMould.forEach((v,i)=>{
      v.is_default = false
    })  
    logisticsMould[e.detail.value].is_default = true
    this.setData({
      freight: logisticsMould[e.detail.value]
    })
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2]
    console.log(logisticsMould)
    var store_rid = this.data.store_rid
    var sku_rid = this.data.sku_rid
    prevPage.setData({
      ['logisticsCompany.' + store_rid + "." + sku_rid +'.express']:logisticsMould //当前选择的好友名字赋值给编辑款项中的姓名临时变量
    },()=>{
      prevPage.handleLogisticsSetingOrder()
      this.currentPagePriceSum(this.data.logisticsMould[e.detail.value].express_id)
    })
    console.log(prevPage.data.logisticsCompany[store_rid][sku_rid])
  },
  //运费计算
  
  
  // 获取物流信息以及sku信息
  getSkuAndLogistcs(e) {

    console.log(app.globalData.logisticsMould, '物流 信息')
    console.log(app.globalData.orderInfoSkus, 'sku信息')

    this.setData({
      logisticsMould: app.globalData.logisticsMould, // 运费模板
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(e) {
    console.log(e)
    console.log(e.sku_rid)
    console.log(e.store_rid)
    this.setData({
      store_rid: e.store_rid,
      sku_rid: e.sku_rid,
    },()=>{
      this.getSkuAndLogistcs() // 获取信息渲染模板
    })
    
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

  }
})