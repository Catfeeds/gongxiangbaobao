// 参与抽奖
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    rid: '',
    isLoading: true,
    isLogin: false,
    showRuleModal: false,
    showLoginModal: false, // 注册的呼出框
    userInfo: {},
    isSmallB: false, // 当前登录用户是否为生活馆主
    isSelf: false, // 验证用户是否为发起人
    percent: 0.01, // 完成百分比 
    timer: null,
    expired: false, // 是否已过期
    leftTimer: {  // 倒计时
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    },
    hasDays: false, // 是否剩余天数
    currentActivity: {}, // 当前活动
    users: [],
    joinStatus: false, // 是否参与活动
    userStatus: {}, // 用户的活动状态
    canJoin: false, // 是否能参与
    
    products: [], // 热门商品

    showShareModal: false, // 分享模态框
    shareProduct: '', // 分享某个商品
    cardUrl: '', // 卡片图rul
    posterUrl: '', // 海报图url
    posterSaving: false, // 是否正在保存
    posterBtnText: '保存分享',

    // 生活馆主、普通用户文案区别
    btnGiveText: '我也要送礼',

    // 最近获奖者
    winnerTimer: null,
    winner: {}, // 中奖者信息
    winnerPage: 1,
    showWinner: false // 是否显示中奖者消息
  },

  /**
   * 获取formid, 查看规则
   */
  handleFormLogin(e) {
    this.setData({
      showLoginModal: true
    })

    utils.logger(e.detail.formId, '通知模板')
    if (e.detail.formId != 'the formId is a mock one') {
      app.handleSendNews(e.detail.formId, this.data.rid)
    }
  },

  /**
   * 获取formid, 查看规则
   */
  handleFormNotice(e) {
    this.setData({
      showRuleModal: true
    })

    utils.logger(e.detail.formId, '通知模板')
    if (e.detail.formId != 'the formId is a mock one') {
      app.handleSendNews(e.detail.formId, this.data.rid)
    }
  },

  /**
   * 获取formid, 查看更多抽奖
   */
  handleFormMore(e) {
    utils.logger(e.detail.formId, '通知模板')
    if (e.detail.formId != 'the formId is a mock one') {
      app.handleSendNews(e.detail.formId)
    }

    wx.navigateTo({
      url: '../lotteryList/lotteryList',
    })
  },

  /**
   * 获取formid, 发起抽奖
   */
  handleFormLottery(e) {
    utils.logger(e.detail.formId, '通知模板')
    if (e.detail.formId != 'the formId is a mock one') {
      app.handleSendNews(e.detail.formId)
    }

    wx.switchTab({
      url: '../index/index',
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

      // 登录后更新数据
      this._updateUserInfo()
    }
  },

  /**
   * 领取礼物
   */
  handleGoGot() {
    wx.navigateTo({
      url: '../pickGift/pickGift?rid=' + this.data.rid,
    })
  },

  /**
   * 显示分享弹窗
   */
  handleShowShare() {
    this.setData({
      showShareModal: true
    })

    this.getWxaCard()
    this.getWxaPoster()
  },

  /**
   * 取消分享-销售
   */
  handleCancelShare(e) {
    this.setData({
      showShareModal: false,
      cardUrl: '',
      posterUrl: '',
      shareProduct: {}
    })
  },

  /**
   * 保存当前海报到相册
   */
  handleSaveShare() {
    let that = this
    if (this.data.posterUrl && !this.data.posterSaving) {
      this.setData({
        posterSaving: true,
        posterBtnText: '正在保存...'
      })

      // 下载网络文件至本地
      wx.downloadFile({
        url: this.data.posterUrl,
        success: function (res) {
          if (res.statusCode == 200) {
            // 保存文件至相册
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function (data) {
                that.setData({
                  posterSaving: false,
                  posterBtnText: '保存分享'
                })
                utils.fxShowToast('保存成功', 'success')
              },
              fail: function (err) {
                utils.logger('下载海报失败：' + err.errMsg)
                that.setData({
                  posterSaving: false,
                  posterBtnText: '保存分享'
                })

                if (err.errMsg == 'saveImageToPhotosAlbum:fail:auth denied') {
                  wx.openSetting({
                    success(settingdata) {
                      utils.logger(settingdata)
                      if (settingdata.authSetting['scope.writePhotosAlbum']) {
                        utils.fxShowToast('保存成功')
                      } else {
                        utils.fxShowToast('保存失败')
                      }
                    }
                  })
                } else {
                  utils.fxShowToast('保存失败')
                }
              }
            })
          }
        }
      })
    }
  },

  /**
   * 参与抽奖
   */
  partakeLottery() {
    http.fxPost(api.gift_activity_join, { rid: this.data.rid }, (res) => {
      utils.logger(res, '参与抽奖')
      if (res.success) {
        let _users = res.data.user_list
        this.setData({
          canJoin: res.data.can_join,
          joinStatus: res.data.is_join,
          userStatus: res.data,
          'currentActivity.people_count': res.data.people_count,
          'currentActivity.surplus_count': res.data.surplus_count,
          users: _users,
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 计算剩余时间
   */
  practiceLeftTimer() {
    // 不是正在进行中跳过
    if (this.data.currentActivity.status != 2) {
      return
    }

    let d = this.data.currentActivity.days || 1
    let endTs = this.data.currentActivity.end_at
    let leftTime = endTs - utils.timestamp() // 计算剩余的毫秒数 

    utils.logger('剩余时间：' + leftTime + '-' + utils.timestamp())

    if (leftTime < 0) {
      clearInterval(this.data.timer)
      this.setData({
        expired: true,
        timer: null
      })
      return
    }

    // 计算剩余的天数 
    let days = parseInt(leftTime / 60 / 60 / 24, 10)
    // 计算剩余的小时 
    let hours = parseInt(leftTime / 60 / 60 % 24, 10)
    // 计算剩余的分钟 
    let minutes = parseInt(leftTime / 60 % 60, 10)
    // 计算剩余的秒数 
    let seconds = parseInt(leftTime % 60, 10)

    this.setData({
      hasDays: days > 0 ? true : false,
      leftTimer: {
        days: utils.checkTimeNumber(days),
        hours: utils.checkTimeNumber(hours),
        minutes: utils.checkTimeNumber(minutes),
        seconds: utils.checkTimeNumber(seconds),
      }
    })
  },

  /**
   * 生成推广卡片
   */
  getWxaCard() {
    let rid = this.data.currentActivity.product.product_rid

    let params = {
      rid: rid,
      type: 1
    }
    http.fxPost(api.market_gift_share_card, params, (result) => {
      utils.logger(result, '生成卡片')
      if (result.success) {
        this.setData({
          cardUrl: result.data.image_url
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 生成推广海报图
   */
  getWxaPoster() {
    let rid = this.data.currentActivity.product.product_rid

    let activity_rid = this.data.rid

    // scene格式：rid
    let scene = activity_rid

    let params = {
      rid: rid,
      activity_rid: activity_rid,
      type: 3,
      path: 'pages/myLottery/myLottery',
      scene: scene,
      auth_app_id: app.globalData.appId
    }

    http.fxPost(api.market_gift_share_poster, params, (result) => {
      utils.logger(result, '生成海报图')
      if (result.success) {
        this.setData({
          posterUrl: result.data.image_url
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 获取用户活动的状态
   */
  getUserActivityStatus() {
    http.fxGet(api.gift_activity_user_status.replace(/:rid/, this.data.rid), {}, (res) => {
      utils.logger(res.data, '获取用户活动的状态')
      if (res.success) {
        this.setData({
          joinStatus: res.data.is_join,
          userStatus: res.data
        })

        // 如未参与，则回调参与
        if (!res.data.is_join) {
          this.partakeLottery()
        }
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 获取当前活动参与的用户
   */
  getUsers() {
    http.fxGet(api.gift_activity_users.replace(/:rid/, this.data.rid), {}, (res) => {
      utils.logger(res.data, '获取参与的用户')
      if (res.success) {
        this.setData({
          users: res.data.user_list
        })

      } else {
        utils.fxShowToast(res.status.message)
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
          currentActivity: res.data
        }, () => {
          this.practiceLeftTimer()

          this._remathPercent()

          // 验证用户身份
          this._validateUserType()
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
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
    http.fxGet(api.gift_winners, { page: _page, per_page: 1 }, (res) => {
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
   * 活动完成百分比
   */
  _remathPercent() {
    let _precent = 1
    let people_count = this.data.currentActivity.people_count

    if (people_count < this.data.currentActivity.total_people_count) {
      _precent = people_count / this.data.currentActivity.total_people_count
    }

    utils.logger(people_count + ',' + _precent, '完成度')

    this.setData({
      percent: (_precent * 100).toFixed(2)
    })
  },

  /**
   * 验证用户身份
   */
  _validateUserType() {
    if (!utils.isEmptyObject(this.data.currentActivity) && this.data.isLogin) {
      let _isSelf = false

      utils.logger(this.data.currentActivity.owner_user.user_sn + '=' + this.data.userInfo.uid, '是否为发起人')

      if (this.data.currentActivity.owner_user.user_sn == this.data.userInfo.uid) {
        _isSelf = true
      }
      this.setData({
        isSelf: _isSelf
      })
    }
  },

  /**
   * 更新当前用户信息
   */
  _updateUserInfo() {
    let isSmallB = false

    const jwt = app.globalData.jwt
    let _btnText = this.data.btnGiveText
    if (jwt.is_small_b) {
      isSmallB = true
    } else {
      _btnText = '我也要拿礼物'
    }

    this.setData({
      isLogin: app.globalData.isLogin,
      userInfo: app.globalData.userInfo,
      isSmallB: isSmallB,
      btnGiveText: _btnText
    })

    this._validateUserType()

    // 获取当前用户活动状态
    this.getUserActivityStatus()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let rid = ''

    let scene = decodeURIComponent(options.scene)
    if (scene && scene != undefined && scene != 'undefined') {
      let sceneAry = scene.split('-')
      rid = utils.trim(sceneAry[0])
    } else {
      rid = options.rid
    }

    console.log('活动rid: ' + rid)

    this.setData({
      rid: rid
    })

    this.getActivity()
    this.getUsers()

    if (app.globalData.isLogin) {
      this._updateUserInfo()
    } else {
      // 给app.js 定义一个方法。
      app.userInfoReadyCallback = res => {
        utils.logger('用户信息请求完毕')
        if (res) {
          this._updateUserInfo()
        } else {
          utils.fxShowToast('登录失败，请稍后重试')
        }
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
    }, 1000)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this

    let timer = setInterval(() => {
      that.practiceLeftTimer()
    }, 1000)

    this.setData({
      timer: timer
    })

    // 每5秒刷新数据
    this.setData({
      winnerTimer: setInterval(() => {
        that.getLastWinners()
      }, 5000)
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(this.data.timer)
    clearInterval(this.data.winnerTimer)
    this.setData({
      timer: null,
      winnerTimer: null
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.timer)
    clearInterval(this.data.winnerTimer)
    this.setData({
      timer: null,
      winnerTimer: null
    })
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
    // scene格式：rid
    let scene = this.data.rid

    let name = this.data.currentActivity.owner_user.user_name
    let title = '「有人@我」' + name + '只差你一个人帮助，就能1元拿礼物了'

    return {
      title: title,
      path: 'pages/myLottery/myLottery?scene=' + scene,
      imageUrl: this.data.cardUrl,
      success: (res) => {
        utils.logger(res, '分享成功!')
      }
    }
  }

})