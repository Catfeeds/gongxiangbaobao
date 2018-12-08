// pages/applyLifeStore/applyLifeStore.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

let interval

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    quhao: false,
    countryCodeList: [], // 地区编号列表

    sending: false,
    time: 60, // 时间
    activePage: 'apply-form', // apply-result
    form: {
      name: '',
      profession: '',
      area_code: '+86',
      areacode: '+86',
      mobile: '',
      verify_code: ''
    },
    mobileFocus: false, // 是否正在输入手机号
    verifyCode: '', // 后端发送后，返回的验证码，用于前端验证

    is_mobile: false,
  },

  // 打开选择国家的呼出框
  handleCountryPickOpen() {
    this.setData({
      quhao: true
    })
  },

  // 选择国家
  handlePickCountry(e) {
    utils.logger(e.currentTarget.dataset.name)
    this.setData({
      'form.area_code': e.currentTarget.dataset.name,
      'form.areacode': e.currentTarget.dataset.name,
      quhao: false
    })
  },

  // 关闭选择国家
  handleOffCountryPick() {
    this.setData({
      quhao: false
    })
  },

  // 验证码
  handleVerifyCode(e) {
    this.setData({
      verify_code: e.detail.value
    })
  },

  /**
   * 跳转至生活馆
   */
  handleGoLifeStore() {
    wx.switchTab({
      url: '../index/index'
    })
  },

  /**
   * 提交申请
   */
  handleSubmitApply(e) {
    // 获取formid 
    app.handleSendNews(e.detail.formId)

    // 未登录，需先登录
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return
    }

    wx.showLoading({
      title: '正在提交...',
    })
    console.log(app.globalData.jwt, 'jwt')
    let lastVisitLifeStoreRid = wx.getStorageSync('lastVisitLifeStoreRid') || ''

    http.fxPost(api.life_store_apply, { ...e.detail.value,
      areacode: this.data.form.area_code,
      last_store_rid: lastVisitLifeStoreRid
    }, (res) => {
      wx.hideLoading()
      utils.logger(res, '开通生活馆')
      if (res.success) {
        this.setData({
          activePage: 'apply-result'
        })

        app.globalData.jwt.is_small_b = res.data.is_small_b
        app.globalData.jwt.store_rid = res.data.store_rid

        // 更新小B身份
        app.updateLifeStoreInfo(res.data)

        // 合并小B身份到登录用户
        app.mergeLifeStoreToJwt(res.data)

      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 登录完成回调
   */
  handleCloseLogin() {
    this.setData({
      is_mobile: false
    })

    wx.showTabBar()
  },


  /**
   * 输入手机号
   */
  handleChangeMobile(e) {
    this.setData({
      'form.mobile': e.detail.value
    })
  },

  /**
   * 手机号获取焦点
   */
  handleFocusMobile() {
    this.setData({
      mobileFocus: true
    })
  },

  /**
   * 手机号失去焦点
   */
  handleBlurMobile() {
    this.setData({
      mobileFocus: false
    })
  },

  /**
   * 获取验证码
   */
  handleGotCode() {
    if (!this.data.form.mobile) {
      utils.fxShowToast('请先输入你的手机号')
      return
    }

    this.setData({
      sending: true,
      time: 60
    })

    if (this.data.sending == true) {
      let pageTime = setInterval(() => {
        this.setData({
          time: --this.data.time
        })
        if (this.data.time == 0) {
          clearInterval(pageTime)
          this.setData({
            sending: false,
            time: 60
          })
        }
      }, 1000)
    }

    http.fxPost(api.auth_sms_code, {
      mobile: this.data.form.mobile,
      area_code: this.data.form.area_code,
    }, (res) => {
      utils.logger(res, '发送验证码')
      if (!res.success) {
        utils.fxShowToast(res.status.message)

      }
    })
  },

  // 获取地区编号
  getCountryCode() {
    http.fxGet(api.countries, {}, (result) => {
      utils.logger(result, "地区编号列表")
      this.setData({
        countryCodeList: result.data
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 检测网络
    app.ckeckNetwork()

    // 从本地缓存中获取数据
    const lifeStore = wx.getStorageSync('lifeStore')

    // 已经申请过则不能重复申请
    if (lifeStore.isSmallB) {
      wx.switchTab({
        url: '../index/index'
      })
    }

    this.getCountryCode()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
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