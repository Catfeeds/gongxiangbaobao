// pages/editInfo/editInfo.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gender: ['女', '男'], //性别选择器
    region: ['北京市', '北京市', '朝阳区'],// 地址的pick
    customItem: '全部',//地址的pick
    date:'2016-09-01',//pick的日期
    userInfo: {}, // 用户的信息
    // 修改过的信息
    editUserInfo: {
      username :'',//String  昵称 - 必须保持唯一
      avatar_id :'',//Integer 可选 用户头像ID
      about_me :'',//String 可选 个人介绍
      gender :1,//Integer 可选 0 性别
      country_id :'',//Integer 可选 国家ID
      province_id :'',//Integer 可选 省ID
      city_id :'',//Integer 可选 市ID
      email :'',//String 可选 邮箱
      date :'',//String 可选 出生日期
    }
  },
  // 获取用户信息 ---
  getUserInfo() {
    
    this.setData({
      userInfo: wx.getStorageSync('userInfo')
    })
    console.log(this.data.userInfo)
    var time = utils.timestamp2string(this.data.userInfo.profile.created_at, 'cn')
    setTimeout(()=>{
      this.setData({
        ['editUserInfo.username']: this.data.userInfo.profile.name,//String  昵称 - 必须保持唯一
        ['editUserInfo.avatar_id']: this.data.userInfo.profile.avatar_id,//Integer 可选 用户头像ID
        ['editUserInfo.about_me']: this.data.userInfo.profile.about_me,//String 可选 个人介绍
        ['editUserInfo.gender']: this.data.userInfo.profile.gender,//Integer 可选 0 性别
        ['editUserInfo.country_id']: this.data.userInfo.profile.country_id,//Integer 可选 国家ID
        ['editUserInfo.province_id']: this.data.userInfo.profile.province_id,//Integer 可选 省ID
        ['editUserInfo.city_id']: this.data.userInfo.profile.city_id,//Integer 可选 市ID
        ['editUserInfo.email']: this.data.userInfo.profile.email,//String 可选 邮箱
        ['editUserInfo.date']: this.data.userInfo.profile.date,//String 可选 出生日期
        ['userInfo.profile.created_at']: time//注册日期
      })
    },100)
  },
  //name 输入时候
  handleNameInput(e){
    console.log(e.detail.value)
    this.setData({
      ['editUserInfo.username']: e.detail.value
    })
  },
  // 省市区选择
  bindRegionChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region: e.detail.value
    })
  },
  //  时间选择
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },
  // 性别选择
  bindGenderChange(e){
    
    this.setData({
      ['userInfo.profile.gender']: e.detail.value
    })
    console.log(this.data.userInfo.profile.gender)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getUserInfo() // 获取用户信息
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
    console.log(5)

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function(e) {

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