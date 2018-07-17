// pages/paymentAddress/paymentAddress.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
const common = require('./../../utils/common.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    path:true,// 页面来源
    addresList: [], //地址列表---
  },
  //在没有选择的时候去设置订单参数
  pickAdress(){
    var rid
    this.data.addresList.forEach((v,i)=>{
      if(v.is_default){
        rid = v.rid
      }
    })
    console.log(rid)
    var objct = { detail: { value: rid}}
    this.radioChange(objct)
  },
  //选择的地址
  radioChange (e) {
    // this.setData({
    //   ['orderParams.address_rid']: e.detail.value
    // })
    
    console.log(e.detail.value)
     var addresId = wx.getStorageSync('orderParams')
     addresId.address_rid = e.detail.value
     wx.setStorageSync('orderParams', addresId)
  },
  // 获取地址列表
  getAdressList() {
    http.fxGet(api.addresses, {}, (result) => {
      console.log(result)
      if (result.success) {
        this.setData({
          addresList:result.data
        })
        this.pickAdress()
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var router=getCurrentPages()
    console.log(router[router.length - 2].route)
    if (router[router.length - 2].route=='pages/settings/settings'){
      this.setData({
        path:false
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.getStorageSync('adress') || common.getReceiveAddress() // 加载收货地址
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
      this.getAdressList() // 获取地址列表
    
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

  },
  //选择地址
  addAddressTap() {
    wx.navigateTo({
      url: '../address/address',

    })
  },
  //继续提交订单
  submitOrderTap() {
    wx.navigateTo({
      url: '../orderInfo/orderInfo',
    })
  }
})