// 发起送礼
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
    showLoginModal: false, // 注册的呼出框

    // 当前登录用户信息
    userInfo: {},
    // 当前活动
    currentActivity: {},
    // 输入表单
    form: {
      people_num: null,
      blessing: ''
    },
    // 曾参与活动的人数
    hasNext: true,
    page: 1,
    perPage: 10,
    partakePeople: [],
    partakePeopleCount: 0
    
  },

  // 关闭登录框
  hanleOffLoginBox(e) {
    this.setData({
      showLoginModal: false
    })

    if (app.globalData.isLogin) {
      this.setData({
        isLogin: app.globalData.isLogin
      })
    }

    wx.showTabBar()
  },

  /**
   * 验证登录
   */
  handleValidateLogin (e) {
    this._validateLoginStatus(e)
  },

  /**
   * 参与人数
   */
  handlePeopleNum (e) {
    let n = parseInt(e.detail.value)
    this.setData({
      'form.people_num': n
    })
  },

  /**
   * 祝福语
   */
  handleBlessing (e) {
    this.setData({
      'form.blessing': e.detail.value
    })
  },

  /**
   * 发起活动
   */
  handleSubmitActivity (e) {
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        showLoginModal: true
      })

      return
    }

    console.log(this.data.form)

    // 验证人数
    if (this.data.form.people_num > 20) {
      utils.fxShowToast('参与人数不能低于20人')
      return
    }
    
    // 祝福语
    if (this.data.form.blessing == '' || this.data.form.blessing.length > 12) {
      utils.fxShowToast('心愿祝福语限定12个字符')
      return
    }

    http.fxPost(api.gift_submit, {
      openid: app.globalData.jwt.openid,
      people_num: this.data.form.people_num,
      product_rid: this.data.currentActivity.product_rid,
      blessing: this.data.form.blessing
    }, (res) => {
      utils.logger(res, '发起活动')
      if (res.success) {
        // 开始支付
        app.wxpayOrder(res.data.activity_rid, res.data.pay_params, (result) => {
          if (result) {
            // 跳转至详情
            wx.navigateTo({
              url: '../lottery/lottery?rid=' + rid,
            })
          }
        })
      } else {
        utils.fxShowToast('发起失败,请重试！')
      }
    })
  },

  /**
   * 获取当前活动
   */
  getCurrentActivity () {
    http.fxGet(api.gift_current, {}, (res) => {
      utils.logger(res.data, '获取当前活动')
      if (res.success) {
        this.setData({
          currentActivity: res.data
        })
      } else {
        utils.logger(res.status.message, '获取当前活动出错')
      }
    })
  },

  /**
   * 获取曾经获奖的用户
   */
  getMyActivityPeople () {
    // 未登录用户跳过
    if (!app.globalData.isLogin) {
      return
    }
    http.fxGet(api.gift_receive_people, {
      page: this.data.page,
      per_page: this.data.perPage
    }, (res) => {
      utils.logger(res.data, '获奖的用户')
      if (res.success) {
        let _peoples = this.data.partakePeople

        res.data.friend_list.map(item => {
          item.receive_at = utils.timestamp2string(item.receive_at)
          return item
        })

        if (this.data.page > 1) {
          _peoples = _peoples.push.apply(_peoples, res.data.friend_list)
        } else {
          _peoples = res.data.friend_list
        }
        
        this.setData({
          partakePeopleCount: res.data.count,
          partakePeople: _peoples,
          hasNext: res.data.next
        })
      } else {
        utils.logger(res.status.message, '获奖的用户')
      }
    })
  },

  /**
   * 验证登录状态
   */
  _validateLoginStatus() {
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        showLoginModal: true
      })

      return
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCurrentActivity()
    
    // 给app.js 定义一个方法。
    app.userInfoReadyCallback = res => {
      utils.logger('用户信息请求完毕')
      if (res) {
        this.getMyActivityPeople()
      } else {
        utils.fxShowToast('授权失败，请稍后重试')
      }
    }
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
    this.getCurrentActivity()
    this.getMyActivityPeople()

    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.hasNext) {
      return
    }
    this.setData({
      page: this.data.page + 1
    })
    this.getMyActivityPeople()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})