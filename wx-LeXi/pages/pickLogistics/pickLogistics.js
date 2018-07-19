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
    logisticsMould:[],// 运费模板
    orderInfoSkus:[],// sku信息
    ProductIndex:[]
  },
  // 运费模板的express_id
  radioChange(e){
    console.log(this.data.logisticsMould.express_info[e.detail.value])
    var item = this.data.logisticsMould.express_info[e.detail.value]
    var index = this.data.ProductIndex
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    prevPage.setData({
      ['order' + [index] + "[0].firstLogisticsCompanyName"]: item.express.express_name,
      ['order' + [index] + "[0].firstLogisticsCompanyExpress_id"]: item.express.express_id,
      ['order' + [index] + "[0].firstLogisticsCompanyFreight"]: item.freight,
      ['order' + [index] + "[0].firstLogisticsCompanyMax_days"]:item.max_days,
      ['order' + [index] + "[0].firstLogisticsCompanyMin_days"]:item.min_days
    })
    this.setData({
      freight: this.data.logisticsMould.express_info[e.detail.value].freight
    })
    
  },
  // 获取物流信息以及sku信息
  getSkuAndLogistcs(e){

    console.log(app.globalData.logisticsMould,'物流 信息')
    console.log(app.globalData.orderInfoSkus,'sku信息')
    this.setData({
      logisticsMould: app.globalData.logisticsMould,// 运费模板
      orderInfoSkus: app.globalData.orderInfoSkus,// sku信息
      ProductIndex:e
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    console.log(e.index)
    this.getSkuAndLogistcs(e.index)// 获取物流信息以及sku信息
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})