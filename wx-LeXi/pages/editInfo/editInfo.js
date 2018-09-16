// pages/editInfo/editInfo.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
const adressData = wx.getStorageSync('allPlaces')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPicker: false,// 地址呼出框是否显示

    provinceList: [], // 省地址列表---
    cityList: [], // 市地址列表---
    countyList: [], // 县地址列表---
    provinceOid: [], // 省地址列表oid---
    cityOid: [], // 市地址列表oid---
    countyOid: [], // 县地址列表oid---
    addressIndex: [0, 0, 0],// 地址的下表

    gender: ['女', '男'], // 性别选择器---
    region: ['北京市', '北京市', '朝阳区'], // 地址的pick---
    date:'',// pick的日期---

    userInfo: {}, // 用户的信息---
    uploadParams: {}, // 上传所需参数
    avatar: '', // 用户头像

    // 修改过的信息
    isEdited: false, // 是否编辑过信息
    editUserInfo: {
      username: '', // String  昵称 - 必须保持唯一
      avatar_id: '', // Integer 可选 用户头像ID
      about_me: '', // String 可选 个人介绍
      gender: 1, // Integer 可选 0 性别
      country_id: '', // Integer 可选 国家ID
      province_id: '', // Integer 可选 省ID
      city_id: '', // Integer 可选 市ID
      mail: '', // String 可选 邮箱
      date: '', // String 可选 出生日期
      street_address:'', // 地址
    }
  },

  //地址
  handleEditAddress(e){
    console.log(e.detail.value)
    this.setData({
      street_address: e.detail.value
    })

  },

  // name 输入时候
  handleNameInput(e){
    console.log(e.detail.value)
    this.setData({
      isEdited: true,
      ['editUserInfo.username']: e.detail.value
    })
  },

  // 个人介绍
  handleOwnerIntroduce(e) {
    console.log(e.detail.value, '个人介绍')
    this.setData({
      isEdited: true,
      ['editUserInfo.about_me']: e.detail.value
    })
  },

  // 邮箱
  hanleOwnerMail(e) {
    console.log(e)
    this.setData({
      isEdited: true,
      ['editUserInfo.mail']: e.detail.value
    })
  },

  // 时间选择
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      isEdited: true,
      ['editUserInfo.date']: e.detail.value
    })
  },

  // 性别选择
  bindGenderChange(e) {
    this.setData({
      isEdited: true,
      ['editUserInfo.gender']: parseInt(e.detail.value)
    })
  },

  // 保存按钮
  handlePreserveTap() {
    console.log(this.data.editUserInfo)
    http.fxPut(api.user, this.data.editUserInfo, (result)=>{
      console.log(result)
      if (result.success) {
        wx.showToast({
          title: '已保存',
          icon: 'success',
          duration: 1200,
          success: () => {
            // 返回上一页
            wx.navigateBack({
              delta: 1
            })
          }
        })
        this.setData({
          isEdited: false
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 上传头像
  handleUploadAvatar () {
    wx.chooseImage({
      success: (res) => {
        let tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: this.data.uploadParams.up_endpoint,
          filePath: tempFilePaths[0],
          name: 'file',
          formData: {
            'x:directory_id': this.data.uploadParams.directory_id,
            'x:user_id': this.data.uploadParams.user_id,
            'token': this.data.uploadParams.up_token
          },
          success: (res) => {
            let data = JSON.parse(res.data)
            if (data.ids.length > 0) {
              this.getAssetInfo(data.ids[0])
            }
          }
        })
      }
    })
  },

  // 获取单个附件信息
  getAssetInfo (rid) {
    http.fxGet(api.asset_detail, { rid: rid }, (result) => {
      if (result.success) {
        console.log(result, '附件信息')
        app.globalData.userInfo.profile.avatar = result.data.view_url
        this.setData({
          isEdited: true,
          userInfo: app.globalData.userInfo,
          ['editUserInfo.avatar_id']: rid
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取上传所需Token
  getUploadToken () {
    http.fxGet(api.user_upload_token, {}, (result) => {
      if (result.success) {
        console.log(result, '上传Token')
        this.setData({
          uploadParams: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },


  // 获取用户信息 ---
  getUserInfo() {
    this.setData({
      userInfo: app.globalData.userInfo
    })

    console.log(app.globalData.userInfo,"用户信息")

    let userProfile = app.globalData.userInfo.profile
    let time = utils.timestamp2string(userProfile.created_at, 'cn')
    this.setData({
      ['editUserInfo.username']: userProfile.username, // String  昵称 - 必须保持唯一
      ['editUserInfo.avatar_id']: userProfile.avatar_id, // Integer 可选 用户头像ID
      ['editUserInfo.about_me']: userProfile.about_me, // String 可选 个人介绍
      ['editUserInfo.gender']: userProfile.gender, // Integer 可选 0 性别
      ['editUserInfo.country_id']: userProfile.country_id, //Integer 可选 国家ID
      ['editUserInfo.province_id']: userProfile.province_id, // Integer 可选 省ID
      ['editUserInfo.city_id']: userProfile.city_id, // Integer 可选 市ID
      ['editUserInfo.mail']: userProfile.mail, // String 可选 邮箱
      ['editUserInfo.date']: userProfile.date, // String 可选 出生日期
      ['editUserInfo.street_address']: userProfile.street_address // 地址
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getUserInfo() // 获取用户信息
    this.getUploadToken()
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
    return common.shareLexi(app.globalData.storeInfo.name, app.globalData.shareBrandUrl)
  },
  //呼出框取消
  handledeletePick(){
    this.setData({
      isPicker:false
    })
  },
  //呼出框显示
  handleShowPick(){
    this.setData({
      isPicker: true
    })
  }
})