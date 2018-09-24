// pages/logisticsWatch/logisticsWatch.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //物品的位置信息
    location: [{

    }],
    expressName: '', // 物流公司的名字

    parmas: {
      logistic_code: '', // String	必需	 	运单编号
      kdn_company_code: '' // String	必需	 	快递鸟物流公司编码
    }
  },

  // 获取物流信息
  getDetail() {
    http.fxPost(api.logistics_information, this.data.parmas, (result) => {
      console.log(result, '物流的信息')
      if (result.success) {
        result.data.Traces = result.data.Traces.reverse()
        this.setData({
          location: result.data
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
    console.log(options.logisticsNumber, options.code)

    this.setData({
      'parmas.logistic_code': options.logisticsNumber,
      'parmas.kdn_company_code': options.code,
      expressName: options.expressName
    })

    this.getDetail()
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
  }
  
})