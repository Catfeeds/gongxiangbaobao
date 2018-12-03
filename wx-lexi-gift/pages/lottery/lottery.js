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
    products: [], // 热门商品

    showShareModal: false, // 分享模态框
    shareProduct: '', // 分享某个商品
    cardUrl: '', // 卡片图rul
    posterUrl: '', // 海报图url
    posterSaving: false, // 是否正在保存
    posterBtnText: '保存分享'
  },

  /**
   * 获取formid, 查看规则
   */
  handleFormLogin (e) {
    this.setData({
      showLoginModal: true
    })

    utils.logger(e.detail.formId, '通知模板')
    if (e.detail.formId != 'the formId is a mock one') {
      app.handleSendNews(e.detail.formId)
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
      app.handleSendNews(e.detail.formId)
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

    wx.showTabBar()
  },

  /**
   * 领取礼物
   */
  handleGoGot () {
    wx.navigateTo({
      url: '../pickGift/pickGift?rid=' + this.data.rid,
    })
  },

  /**
   * 显示分享弹窗
   */
  handleShowShare () {
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
  partakeLottery () {
    http.fxPost(api.gift_activity_join, { rid: this.data.rid }, (res) => {
      utils.logger(res, '参与抽奖')
      if (res.success) {
        let _users = res.data.user_list
        this.setData({
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
    let endTs = this.data.currentActivity.start_time + d * 24 * 60 * 60 // 30天内
    let leftTime = endTs - utils.timestamp() // 计算剩余的毫秒数 
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
  getWxaCard () {
    let rid = this.data.rid

    let scene = rid

    let params = {
      rid: rid,
      type: 1,
      path: 'pages/index/index',
      scene: scene,
      auth_app_id: app.globalData.appId
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
    let rid = this.data.rid

    // scene格式：rid + '-' + sid
    let scene = rid

    let params = {
      rid: rid,
      type: 4,
      path: 'pages/index/index',
      scene: scene,
      auth_app_id: app.globalData.appId
    }
    http.fxPost(api.wxa_poster, params, (result) => {
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
  getUserActivityStatus () {
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
  getActivity () {
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

        // 品牌馆，获取更多商品
        if (res.data.user_kind == 1) {
          this.getStoreProducts()
        }
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 获取店铺热门商品
   */
  getStoreProducts () {
    http.fxGet(api.gift_store_products, {
      store_rid: this.currentActivity.owner_store.store_rid
    }, (res) => {
      utils.logger(res.data, '获取热门商品')
      if (res.success) {
        this.setData({
          products: res.data.product_list
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 活动完成百分比
   */
  _remathPercent () {
    let _precent = 1
    let people_count = this.data.currentActivity.people_count
    
    if (people_count < this.data.currentActivity.total_people_count) {
      _precent = people_count / this.data.currentActivity.total_people_count
    }

    utils.logger(people_count + ',' + _precent, '完成度')

    this.setData({
      percent: (_precent*100).toFixed(2)
    })
  },

  /**
   * 验证用户身份
   */
  _validateUserType () {
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
  _updateUserInfo () {
    this.setData({
      isLogin: app.globalData.isLogin,
      userInfo: app.globalData.userInfo
    })

    this._validateUserType()

    // 获取当前用户活动状态
    this.getUserActivityStatus()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let rid = options.rid

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
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(this.data.timer)
    this.setData({
      timer: null
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.timer)
    this.setData({
      timer: null
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

  }
})