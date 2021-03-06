// 领取礼物
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    rid: '',
    
    isSending: false,
    btnText: '领取礼物',
    userBtnText: '支付1元领取礼物',

    currentActivity: {},
    isUser: false, // 是否为普通用户

    hasAddress: false,
    currentAddress: {},
    pay_params: {},
    order_rid: '',
    form: {
      rid: '',
      openid: '',
      address_rid: '',
    },

    showChangeModal: false
  },

  /**
   * 选择地址
   */
  handleChooseAddress () {
    let _url = '../addressList/addressList?activity_rid=' + this.data.rid
    if (this.data.form.address_rid) {
      _url += '&rid=' + this.data.form.address_rid

      // 更新全局变量
      app.globalData.addressRef = 'checkout'
      app.globalData.addressRid = this.data.form.address_rid
    }

    wx.navigateTo({
      url: _url
    })
  },

  /**
   * 放弃领奖
   */
  handleGiveUpGot () {
    let params = {
      rid: this.data.rid
    }
    http.fxPost(api.gift_quit, params, (res) => {
      utils.logger(res.data, '放弃领取')

      if (res.success) {
        wx.redirectTo({
          url: '../userLottery/userLottery',
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 继续支付
   */
  handleFormPay (e) {
    if (e.detail.formId != 'the formId is a mock one') {
      app.handleSendNews(e.detail.formId, this.data.rid)
    }

    this._continuePay(this.data.rid, this.data.pay_params)
  },

  /**
   * 领取礼物
   */
  handleSubmitGot () {
    if (!this.data.form.address_rid) {
      utils.fxShowToast('请选定收货地址')
      return
    }

    if (this.data.isSending) {
      return
    }

    this.setData({
      isSending: true,
      btnText: '正在提交...',
      userBtnText: '正在提交...'
    })

    let params = this.data.form

    // 普通用户领取，生成支付参数
    if (this.data.isUser) {
      params.sync_pay = 1
      params.auth_app_id = app.globalData.appId
    }
    
    http.fxPost(api.gift_activity_grant, params, (res) => {
      utils.logger(res, '领取礼物')
      this.setData({
        isSending: false,
        btnText: '领取礼物',
        userBtnText: '支付1元领取礼物'
      })
      
      utils.logger(res.data, '领取')

      if (res.success) {
        let _rid = this.data.rid

        if (this.data.isUser) {
          this.setData({
            order_rid: res.data.order_rid
          })

          // 没库存
          if (res.data.no_stock) {
            this.setData({
              showChangeModal: true,
              pay_params: res.data.pay_params
            })
          } else {
            this._continuePay(_rid, res.data.pay_params)
          }
        } else {
          // 领取成功，跳转成功页面
          wx.redirectTo({
            url: '../pickSuccess/pickSuccess?rid=' + _rid,
          })
        }
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 支付订单
   */
  _continuePay (rid, pay_params) {
    app.wxpayOrder(rid, pay_params, (result) => {
      if (result) {
        // 领取成功，跳转成功页面
        wx.redirectTo({
          url: '../pickSuccess/pickSuccess?rid=' + rid,
        })
      } else {
        // 支付失败或取消支付，直接删除
        app.deleteInvalidOrder(this.data.order_rid)
      }
    })
  },

  /**
   * 获取默认地址
   */
  getCurrentAddress () {
    let _url = api.address_default
    if (this.data.form.address_rid) {
      _url = api.address_info.replace(/:rid/, this.data.form.address_rid)  
    }

    http.fxGet(_url, {}, (res) => {
      utils.logger(res.data, '获取默认地址')
      if (res.success) {
        this.setData({
          hasAddress: true,
          'form.address_rid': res.data.rid,
          currentAddress: res.data
        })
      }
    })
    
  },

  /**
   * 获取当前活动
   */
  getActivity() {
    http.fxGet(api.gift_activity_detail.replace(/:rid/, this.data.rid), {}, (res) => {
      utils.logger(res.data, '获取当前活动')
      if (res.success) {
        this.setData({
          currentActivity: res.data,
          isUser: res.data.user_kind == 3 ? true : false 
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let rid = options.rid
    this.setData({
      rid: rid,
      'form.rid': rid,
      'form.openid': app.globalData.jwt.openid
    })
    
    // 如未登录，则返回上一页
    if (!app.globalData.isLogin) {
      wx.navigateBack({
        delta: 1
      })
      return
    }
    
    this.getActivity()
    this.getCurrentAddress()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
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
  onShow: function () {
    if (app.globalData.addressRid) {
      this.setData({
        'form.address_rid': app.globalData.addressRid
      })
      // 清空来源
      app.globalData.addressRef = ''
      
      // 更新地址
      this.getCurrentAddress()
    }
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
    return app.shareWxaGift()
  }

})