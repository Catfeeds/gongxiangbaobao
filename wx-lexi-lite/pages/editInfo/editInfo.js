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
    // isPicker: false,// 地址呼出框是否显示
    joinTime:'', // 注册时间
   
    rid: '',
    isEditing: true, // 是否为编辑状态
    currentAddress: {}, // 地址详情信息
    from_ref: '', // 来源
    countryList: [], // 所有的国家的--
    countryIndex: 0, // 所有的国家的index--

    loaded: false, // 地点数据是否加载完毕
    regions: [ // 三列数组，省，市，区
      [],
      [],
      []
    ],
    multiIndex: [0, 0, 0], // 三列数组对应的索引
    allPlaces: {}, // 全部地点

    gender: ['女', '男'], // 性别选择器---
    region: ['北京市', '北京市', '朝阳区'], // 地址的pick---
    date:'',// pick的日期---

    userInfo: { // 用户的信息---
      profile:{
        avatar:''
      }
    }, 
    avatar: '', // 用户头像
    isUploading: false,
    uploadStatus: 0,

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
      town_id:'', // 镇
      mail: '', // String 可选 邮箱
      date: 2018, // String 可选 出生日期
      street_address: '' // 地址
    }
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

  handleAddressInput (e) {
    this.setData({
      isEdited: true,
      ['editUserInfo.street_address']: e.detail.value
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
    http.fxPut(api.user, this.data.editUserInfo, (result)=>{
      console.log(result, '修改的信息')
      console.log(app.globalData.userInfo,'globao user info')
      if (result.success) {

        // 同步global-userInfo
        app.globalData.userInfo.username = result.data.username
        app.globalData.userInfo.profile.username = result.data.username
        app.globalData.userInfo.avatar = result.data.avatar
        app.globalData.userInfo.profile.avatar = result.data.avatar

        // 同步storage-userInfo
        let userInfo = wx.getStorageSync('userInfo')
        userInfo.username = result.data.username
        userInfo.avatar = result.data.avatar
        wx.setStorageSync('userInfo', userInfo)

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
        const uploadTask = http.fxUpload(api.asset_upload, tempFilePaths[0], {}, (result) => {
          console.log(result)
          if (result.data.length > 0) {
            this.setData({
              isUploading: false,
              uploadStatus: 100
            })

            this.getAssetInfo(result.data[0])
          }
        })

        uploadTask.onProgressUpdate((res) => {
          console.log('上传进度', res.progress)

          let percent = res.progress
          this.setData({
            isUploading: percent == 100 ? false : true,
            uploadStatus: percent
          })
        })
      }
    })
  },

  // 获取单个附件信息
  getAssetInfo (asset) {
    if (asset) {
      let userInfo = wx.getStorageSync('userInfo')
      userInfo.avatar = asset.view_url
      wx.setStorageSync('userInfo', userInfo)

      let jwt = wx.getStorageSync('jwt')
      jwt.avatar = asset.view_url
      wx.setStorageSync('jwt', jwt)

      this.setData({
        isEdited: true,
        'userInfo.profile.avatar': userInfo.avatar,
        ['editUserInfo.avatar_id']: asset.id
      })

      app.globalData.userInfo.profile.avatar = userInfo.avatar
    }
  },

  // 获取用户信息 ---
  getUserInfo() {
    http.fxGet(api.users_profile,{},(result)=>{
      console.log(result, '用户个人资料')
      if (result.success) {
        this.setData({
          userInfo: result.data
        })

        let userProfile = this.data.userInfo.profile
        console.log(this.data.userInfo.profile, userProfile.date, '用户的资料')

        let time = utils.timestamp2string(userProfile.created_at, 'cn')

        this.setData({
          ['editUserInfo.avatar_id']: userProfile.avatar_id, // Integer 可选 用户头像ID
          ['editUserInfo.username']: userProfile.username, // String  昵称 - 必须保持唯一
          ['editUserInfo.mail']: userProfile.mail, // String 可选 邮箱
          ['editUserInfo.country_id']: userProfile.country_id,
          ['editUserInfo.province_id']: userProfile.province_id,
          ['editUserInfo.city_id']: userProfile.city_id,
          ['editUserInfo.about_me']: userProfile.about_me, // String 可选 个人介绍
          ['editUserInfo.date']: userProfile.date,
          ['editUserInfo.street_address']: userProfile.street_address,
          joinTime: time,

          // 'editUserInfo.first_name': userProfile.first_name,
          'editUserInfo.mobile': userProfile.mobile,
          'editUserInfo.town_id': userProfile.town_id,
          'editUserInfo.street_address': userProfile.street_address,
          'editUserInfo.zipcode': userProfile.zipcode || '',
          'editUserInfo.is_default': userProfile.is_default || ''
        })

        console.log(this.data.editUserInfo, '初始信息')
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let rid = options.rid || ''
    this.setData({
      rid: rid,
    })

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
    return app.shareLeXi()
  }
  
})