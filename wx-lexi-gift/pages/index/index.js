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
    animationIndex: 0,
    animationIndexTime: 1000,

    isLoading: true,
    showLoginModal: false, // 注册的呼出框
    showRuleModal: false, // 显示规则弹框

    toView: 'G55930',

    // 当前登录用户信息
    isSmallB: false, // 是否为生活馆主
    userInfo: {},
    // 当前活动
    isExist: false,
    currentActivity: {},
    // 输入表单
    idx: -1,
    days: [1, 2, 3],
    defaultPeopleCount: 50,
    peopleFocus: false,
    blessingFocus: false,
    form: {
      people_num: null,
      days: '',
      blessing: ''
    },
    // 曾参与活动的人数
    hasNext: false,
    page: 1,
    perPage: 10,
    partakePeople: [],
    partakePeopleCount: 0,
    btnGiftText: '花一元送好友',

    // 预约提醒
    showAppointModal: false,

    // 最近获奖者
    timer: null,
    winner: {}, // 中奖者信息
    winnerPage: 1,
    showWinner: false // 是否显示中奖者消息
  },

  // 获取formid
  handleFormNotice(e) {
    utils.logger(e.detail.formId, '通知模板')
    if (e.detail.formId != 'the formId is a mock one') {
      app.handleSendNews(e.detail.formId)
    }

    this.setData({
      showRuleModal: true
    })
  },

  // 获取formid, 查看更多
  handleFormMore(e) {
    if (e.detail.formId != 'the formId is a mock one') {
      app.handleSendNews(e.detail.formId)
    }

    wx.navigateTo({
      url: '../giftList/giftList',
    })
  },

  // 获取formid, 预约提醒
  handleFormAppoint(e) {
    if (e.detail.formId != 'the formId is a mock one') {
      app.handleSendNews(e.detail.formId)
    }

    this.setData({
      showAppointModal: true
    })
  },

  // 关闭预约提醒弹窗
  handleCloseAppoint() {
    this.setData({
      showAppointModal: false
    })
  },

  // 选择天数
  handlePickerChange(e) {
    console.log(e.detail.value)
    let idx = parseInt(e.detail.value)
    this.setData({
      idx: idx,
      'form.days': this.data.days[idx]
    })
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
  },

  /**
   * 验证登录
   */
  handleValidateLogin(e) {
    console.log(e)
    this._validateLoginStatus(e)
  },

  /**
   * 参与人数
   */
  handlePeopleNum(e) {
    let n = parseInt(e.detail.value)
    this.setData({
      'form.people_num': n
    })
  },

  /**
   * 祝福语
   */
  handleBlessing(e) {
    this.setData({
      'form.blessing': e.detail.value
    })
  },

  /**
   * 发起活动
   */
  handleSubmitActivity(e) {
    if (!app.globalData.isLogin) {
      this.setData({
        showLoginModal: true
      })

      return
    }

    console.log(this.data.form)

    // 验证人数
    if (this.data.form.people_num < this.data.defaultPeopleCount) {
      utils.fxShowToast('参与人数不能低于' + this.data.defaultPeopleCount + '人')
      return
    }

    // 验证天数
    if (this.data.form.days == '' || this.data.form.days > 3) {
      utils.fxShowToast('活动天数设置不准确')
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
      days: this.data.form.days,
      blessing: this.data.form.blessing,
      sync_pay: 1,
      auth_app_id: app.globalData.appId
    }, (res) => {
      utils.logger(res, '发起活动')
      if (res.success) {
        // 开始支付
        let _rid = res.data.activity_rid
        if (this.data.isSmallB) {
          app.wxpayOrder(_rid, res.data.pay_params, (result) => {
            if (result) {
              // 跳转至详情
              wx.navigateTo({
                url: '../lottery/lottery?rid=' + _rid,
              })
            }
          })
        } else {
          // 跳转至详情
          wx.navigateTo({
            url: '../myLottery/myLottery?rid=' + _rid,
          })
        }
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 监听动画结束
   */
  handleTransitionend(e) {
    this.setData({
      animationIndex: this.data.animationIndex + 1,
      animationIndexTime: 2000
    })
    if (this.data.animationIndex == this.data.currentActivity.assets.length-3) {
      this.setData({
        animationIndex: 0,
        animationIndexTime: 0
      })
    }
  },

  /**
   * 获取最新的赢者
   */
  getLastWinners() {
    let _page = this.data.winnerPage
    if (_page > 10) { // 大于10后恢复重新循环
      _page = 1
    } else {
      _page += 1
    }
    this.setData({
      winnerPage: _page
    })
    let that = this
    http.fxGet(api.gift_winners, {
      page: _page,
      per_page: 1
    }, (res) => {
      utils.logger(res.data, '获取最新获奖者')
      if (res.success) {
        if (res.data.user_list.length > 0) {
          let winner = res.data.user_list[0]
          winner.user_name = utils.truncate(winner.user_name, 10)
          this.setData({
            winner: winner,
            showWinner: true
          })

          setTimeout(() => {
            that.setData({
              showWinner: false
            })
          }, 3000)
        } else {
          this.setData({
            winner: [],
            showWinner: false
          })
        }
      } else {
        utils.logger(res.status.message, '最新获奖者消息')
      }
    })
  },

  /**
   * 获取当前活动
   */
  getCurrentActivity() {
    http.fxGet(api.gift_current, {}, (res) => {
      utils.logger(res.data, '获取当前活动')
      if (res.success) {
        let _ca = Object.keys(res.data)
        let _isExist = false
        if (_ca.length > 0 && res.data.surplus_count > 0) {
          _isExist = true
        }

        res.data.assets[res.data.assets.length] = res.data.assets[1]
        res.data.assets[res.data.assets.length] = res.data.assets[2]
        res.data.assets[res.data.assets.length] = res.data.assets[3]

        this.setData({
          isExist: _isExist,
          currentActivity: res.data
        })
        setTimeout(() => {
          this.handleTransitionend()
        }, 3000)


      } else {
        utils.logger(res.status.message, '获取当前活动出错')
      }
    })
  },

  /**
   * 获取曾经获奖的用户
   */
  getMyActivityPeople() {
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
      this.setData({
        showLoginModal: true,
        peopleFocus: false,
        blessingFocus: false
      })

      return
    }
  },

  /**
   * 刷新用户登录信息
   */
  _refreshUserLogin() {
    if (!app.globalData.isLogin) {
      this.setData({
        showLoginModal: true
      })
    }

    const jwt = app.globalData.jwt
    let isSmallB = false
    let days = [1, 2, 3]
    let idx = -1
    let formDays = ''
    let _txt = this.data.btnGiftText

    if (jwt.is_small_b) {
      isSmallB = true
    } else { // 普通用户天数不可选
      days = [1]
      idx = 0
      formDays = this.data.days[idx]
      _txt = '我要拿礼物'
    }
    this.setData({
      isLogin: app.globalData.isLogin,
      isSmallB: isSmallB,
      days: days,
      idx: idx,
      'form.days': formDays,
      btnGiftText: _txt
    })

    this.getMyActivityPeople()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getCurrentActivity()

    if (app.globalData.isLogin) {
      this._refreshUserLogin()
    } else {
      // 给app.js 定义一个方法。
      app.userInfoReadyCallback = res => {
        utils.logger('用户信息请求完毕')
        if (res) {
          this._refreshUserLogin()
        } else {
          utils.fxShowToast('授权失败，请稍后重试')
        }
      }
    }
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
    // 恢复默认值
    this.setData({
      idx: -1,
      'form.people_num': null,
      'form.days': '',
      'form.blessing': ''
    })

    let that = this

    // 每5秒刷新数据
    this.setData({
      timer: setInterval(() => {
        that.getLastWinners()
      }, 3500)
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    clearInterval(this.data.timer)
    this.setData({
      timer: null
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearInterval(this.data.timer)
    this.setData({
      timer: null
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.getCurrentActivity()
    this.getMyActivityPeople()

    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
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
  onShareAppMessage: function() {
    app.shareWxaGift()
  }

})