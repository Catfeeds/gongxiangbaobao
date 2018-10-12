// pages/brandInformation/brandInformation.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

let wxparse = require('../../wxParse/wxParse.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    createdTime: [], // 开馆时间---
    storeInfo: [], // 店铺的信息---
    shopOwner: [], // 店铺主人的信息---
    createdTime: '', // 开馆时间
    dkcontent: ''
  },

  getUserIdentityLabel(val) {
    switch (val) {
      case 1:
        return '独立设计师'
      case 2:
        return '艺术家'
      case 3:
        return '手作艺人'
      case 4:
        return '业余设计师'
      default:
        return '原创商户经营'
    }
  },

  // 获取店铺主人的信息
  getShopOwner() {
    http.fxGet(api.official_store_master_info, { rid: this.data.store_rid } , (result) => {
      if (result.success) {
        console.log(result.data, '店铺主人信息')
        result.data.user_label = this.getUserIdentityLabel(result.data.user_identity)
        this.setData({
          shopOwner: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 店铺的信息
  getAllInfo() {
    http.fxGet(api.shop_info,{ rid: this.data.store_rid }, (result)=>{
      console.log(result, '店铺的信息')
      if(result.success){
        result.data.created_at = utils.timestamp2string(result.data.created_at, 'date') 
        this.setData({
          storeInfo: result.data,
        })
      }else{
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 品牌故事 
  getBrandDetail() {
    http.fxGet(api.official_store_detail, { rid: this.data.store_rid }, (result) => {
      console.log(result, '品牌故事')
      if (result.success) {
        this.setData({
          dkcontent: result.data.content,
        })

        //处理数据
        wxparse.wxParse('dkcontent', 'html', this.data.dkcontent, this, 5)
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载 shop_info
   */
  onLoad: function (options) {
    console.log(options, "品牌馆")

    this.setData({
      store_rid: options.rid
    })


    this.getAllInfo() // 获取店铺信息
    this.getBrandDetail() // 品牌故事
    this.getShopOwner() // 店铺主人
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
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
    return app.shareLeXi()
  }
  
})