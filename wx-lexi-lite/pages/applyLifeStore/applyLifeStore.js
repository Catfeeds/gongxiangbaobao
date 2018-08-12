// pages/applyLifeStore/applyLifeStore.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activePage: 'apply-form', // apply-result
    form: {
      name: '',
      profession: '',
      areacode: '+86',
      mobile: '',
      verify_code: ''
    },
    sending: false,
    counter: 0, // 计数器
    timer: '', // 间隔事务
    verifyCode: '', // 后端发送后，返回的验证码，用于前端验证
  },

  /**
   * 跳转至生活馆
   */
  handGoLifeStore () {
    wx.redirectTo({
      url: '/pages/lifeStore/lifeStore'
    })
  },

  /**
   * 提交申请
   */
  handleSubmitApply (e) {
    http.fxPost(api.life_store_apply, e.detail.value, (res) => {
      console.log(res, '开通生活馆')
      if (res.success) {
        this.setData({
          activePage: 'apply-result'
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 输入手机号
   */
  handleChangeMobile (e) {
    this.setData({
      'form.mobile': e.detail.value
    })
  },

  /**
   * 获取验证码
   */
  handleGotCode () {
    if (!this.data.form.mobile) {
      utils.fxShowToast('请先输入你的手机号')
      return
    }

    this.setData({
      sending: true
    })
    http.fxPost(api.auth_sms_code, {
      mobile: this.data.form.mobile,
      area_code: this.data.form.areacode
    }, (res) => {
      console.log(res, '发送验证码')
      if (res.success) {
        
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 从本地缓存中获取数据
    const lifeStore = wx.getStorageSync('lifeStore')

    // 已经申请过则不能重复申请
    if (lifeStore.isSmallB) {
      wx.redirectTo({
        url: '/pages/lifeStore/lifeStore'
      })
    }
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