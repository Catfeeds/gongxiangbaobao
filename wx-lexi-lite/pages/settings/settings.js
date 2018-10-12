// pages/settings/settings.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
const common= require('./../../utils/common.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: [], // 用户的资料---
    testCode: [], // 返回的验证码---
    country_code: 86, //默认国家---
    is_mobile: false, // 手机号码的验证是否弹出---
    is_country: false, // 选择国家的模态框是否弹出---
    getBtnStyle: false, // 获取验证码按钮的颜色---
    is_time: false, // 获取手机及号码的按钮和秒变按钮是否显示---
    time: 60, // 倒计时---
    mobaile_number: '', // 手机号码---
    verification_code: [], //验证码输入---
    over_button: false, // 完成按钮---
    // 选择国家
    country_pick: [
      {
        country_name: '中国大陆',
        code: 86,
        rid: 1
      },
      {
        country_name: '中国台湾',
        code: 886,
        rid: 2
      },
      {
        country_name: '中国香港',
        code: 852,
        rid: 3
      },
      {
        country_name: '中国澳门',
        code: 853,
        rid: 4
      },
      {
        country_name: '日本',
        code: 81,
        rid: 5
      },
      {
        country_name: '泰国',
        code: 66,
        rid: 6
      }
    ]
  },

  // 跳转申请开馆
  handleGoApplyStore () {
    let linkUrl = 'https://h5.lexivip.com/shop/apply_type'
    let title = '申请开馆'
    wx.navigateTo({
      url: '../fxWebView/fxWebView?linkUrl=' + linkUrl + '&title=' + title,
    })
  },

  // 选择国家的id
  pickCountryTap (e) {
    this.setData({
      country_code: e.currentTarget.dataset.code
    })
  },

  // 清空手机号码的按钮
  mobileNumberNullTap () {
    this.setData({
      mobaile_number: ''
    })
  },

  // 获取手机验证码的按钮
  getNumberTap() {
    let mobileNumber = this.data.mobaile_number - 0
    let getMobalCode = {
      mobile: '', // String	必须	 	手机号
      area_code: '+86', // String	可选	+86	区号
      page: 'phone_verify_code' // String	必须	 	接口请求地址(如注册页面就是register)
    }

    if (!(/^[1][3,4,5,7,8][0-9]{9}$/.test(mobileNumber))) {
      utils.fxShowToast('输入的手机号码错误')
      return
    }

    getMobalCode.mobile = mobileNumber.toString()
    this.setData({
      is_time: true,
      time: 60
    })
    if (this.data.is_time == true) {
      let pageTime = setInterval(() => {
        this.setData({
          time: --this.data.time
        })
        if (this.data.time == 0) {
          clearInterval(pageTime)
          this.setData({
            is_time: false
          })
        }
      }, 1000)
    }

    http.fxPost(api.auth_get_msm_code, getMobalCode, (result) => {
      console.log(result)
      if (result.success) {
        this.setData({
          testCode: result.data.phone_verify_code
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 输入手机号码时候出发users/register_verify_code
  inputText (e) {
    console.log(e.detail.cursor)
    this.setData({
      mobaile_number: e.detail.value
    })
    if (this.data.mobaile_number != '') {
      this.setData({
        getBtnStyle: true
      })
    } else {
      this.setData({
        getBtnStyle: false
      })
    }
    this.verification()
  },

  // 验证码的输入框
  serveNumber (e) {
    this.setData({
      verification_code: e.detail.value
    })
    this.verification()
  },

  // 手机号码绑定是否弹出
  bindMobileTap () {
    // 已绑定，则跳过
    if (this.data.userInfo.profile.mobile) {
      return
    }
    this.setData({
      is_mobile: true
    })
  },

  // 点击关闭呼出框---
  countryHidTap () {
    wx.navigateBack({
      delta: 1
    })
  },

  // 选择国家的模态框是否弹出
  countryTap() {
    this.setData({
      is_country: true
    })
    wx.setNavigationBarTitle({
      title: '选择国家与地区'
    })
  },

  // 校验绑定手机号码的完成按钮是否y颜色
  verification () {
    console.log(this.data.verification_code)
    console.log(this.data.mobaile_number)
    if (this.data.verification_code != false && this.data.mobaile_number != false) {
      this.setData({
        over_button: true
      })
    } else {
      this.setData({
        over_button: false
      })
    }
  },

  // 完成按钮
  handleVerifyOverTap () {
    let params = {
      auth_app_id: app.globalData.app_id, //	 	小程序ID
      openid: wx.getStorageSync('jwt').openid, //	用户标识
      mobile: this.data.mobaile_number, // 	手机号
      verify_code: this.data.testCode //	手机验证码
    }
    if (!this.data.over_button || this.data.verification_code != this.data.testCode) {
      utils.fxShowToast('手机号码或验证码错误')
      return
    }
    http.fxPost(api.bind_mobile, params, (result) => {
      console.log(result)
      utils.fxShowToast('ok', 'success')
      if (result.success) {
        wx.navigateBack({
          delta: 1,
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取用户信息
  getUserInfo() {
    let data = app.globalData.userInfo
    if (data.profile.username.length>9){
      data.profile.username = data.profile.username.substr(0, 3) + '···' + data.profile.username.substr(6,3)
    }
    console.log(data)

    this.setData({
      userInfo: data
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(app.globalData.userInfo)
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
    this.getUserInfo() // 获取用户信息
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
  },

  // 跳转到编辑信息页面
  editInfoTap () {
    wx.navigateTo({
      url: '../editInfo/editInfo',
    })
  },

  // orderTap 我的订单
  orderTap () {
    wx.navigateTo({
      url: '../order/order',
    })
  },

  // 阻止返回，防止点击穿透
  returnTap () {
    return
  },

  // 关闭按钮
  offBtnTap () {
    this.setData({
      is_country: false
    })
  },

  // 跳转到我的额收获地址
  handleToAddressTap () {
    wx.navigateTo({
      url: '../receiveAddress/receiveAddress',
    })
  }
  
})