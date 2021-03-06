// pages/settings/settings.js
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
    isLoading: true,
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

  // 选择国家的id
  pickCountryTap(e) {
    this.setData({
      country_code: e.currentTarget.dataset.code
    })
  },

  // 清空手机号码的按钮
  mobileNumberNullTap() {
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
      utils.logger(result)
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
  inputText(e) {
    utils.logger(e.detail.cursor)
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
  serveNumber(e) {
    this.setData({
      verification_code: e.detail.value
    })
    this.verification()
  },

  // 手机号码绑定是否弹出
  bindMobileTap() {
    // 已绑定，则跳过
    if (this.data.userInfo.profile.mobile) {
      return
    }
    this.setData({
      is_mobile: true
    })
  },

  // 点击关闭呼出框---
  countryHidTap() {
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
  verification() {
    utils.logger(this.data.verification_code)
    utils.logger(this.data.mobaile_number)
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
  handleVerifyOverTap() {
    var params = {
      auth_app_id: app.globalData.app_id, //	 	小程序ID
      openid: wx.getStorageSync('jwt').openid, //	用户标识
      mobile: this.data.mobaile_number, // 	手机号
      verify_code: this.data.testCode, //	手机验证码
    }
    if (!this.data.over_button || this.data.verification_code != this.data.testCode) {
      utils.fxShowToast('手机号码或验证码错误')
      return
    }
    http.fxPost(api.bind_mobile, params, (result) => {
      utils.logger(result)
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
    this.setData({
      userInfo: app.globalData.userDetail
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let that = this
    setTimeout(() => {
      that.setData({
        isLoading: false
      })
    }, 350)
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
    return common.shareLexi(app.globalData.storeInfo.name, app.globalData.shareBrandUrl)
  },

  // 跳转到编辑信息页面
  editInfoTap() {
    wx.navigateTo({
      url: '../editInfo/editInfo',
    })
  },

  // orderTap 我的订单
  orderTap() {
    wx.navigateTo({
      url: '../order/order',
    })
  },

  // 阻止返回，防止点击穿透
  returnTap() {
    return
  },

  // 关闭按钮
  offBtnTap() {
    this.setData({
      is_country: false
    })
  },

  // 跳转到我的额收获地址
  handleToAddressTap() {
    wx.navigateTo({
      url: '../receiveAddress/receiveAddress',
    })
  }
  
})