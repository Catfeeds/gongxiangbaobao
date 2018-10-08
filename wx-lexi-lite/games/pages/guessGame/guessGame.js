/**
 * 猜图游戏
 */
const app = getApp()

const http = require('./../../../utils/http.js')
const api = require('./../../../utils/api.js')
const utils = require('./../../../utils/util.js')

let page = undefined
let doommList = []
// 用做唯一的wx:key
let k = 0

Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_mobile: false,
    showLoginModal: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showBindForm: false,

    clientHeight: '',

    showRuleModal: false,
    showInviteSuccessModal: true,
    showStealResultModal: false,
    stealBonusPeopleCount: 0, // 偷我红包的人数
    stealBonusPeopleList: [], // 偷我红包人列表

    showWithDrawModal: false,
    showInviteModal: false,
    showStealModal: false,
    showTopModal: false,
    showStealBonusModal: false,
    showStealCouponModal: false,
    // 我的账户
    myAccount: {
      amount: 0,
      bonus_amount: 0,
      play_times: 1, // 1小时内玩的次数
      cash_price: 0 // 可提现金额
    },
    canWithDraw: false, // 是否能够提现
    withDrawLoading: false, // 正在提现中
    peopleCount: {
      invite_count: 0,
      total_count: 0,
      invite_name: '',
      user_logo: []
    },
    isShare: 0, // 是否分享
    // 本次试题
    testQuestions: [],
    testId: '',
    prizePool: 0,
    // 偷我红包的人
    stealBonusPeople: [],
    stealPage: 1,

    friendActiveTab: 'mine', // 'guess'
    // 好友列表
    friendList: [],
    friendPage: 1,
    // 可能认识好友列表
    guessFriendList: [],
    guessFriendPage: 1,

    // 排行榜
    activeTopTab: 'world',
    currentUserTop: {
      user_amount: 0,
      user_coupon_amount: 0,
      user_coupon_quantity: 0,
      user_info: {
        user_logo: '',
        user_name: ''
      },
      user_ranking: 0
    },
    // 排行榜-世界榜
    topWorld: [],
    topWorldPage: 1,
    // 是否有下一页
    topWorldNext: false,
    // 排行榜-好友榜
    topFriend: [],
    topFriendPage: 1,
    // 是否有下一页
    topFriendNext: false,

    // 偷红包
    userStealed: {}, // 当前被偷用户
    stealBonusResult: {},
    stealFailMessage: '',
    showStealFailModal: false,
    
    // 弹幕列表
    doommData: []
  },

  // 返回到小程序的首页
  handleGoHome() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },

  // 开始游戏
  handleStartPlay() {
    this.getTestQuestion()
  },

  // 切换排行榜菜单
  handleToggleTop(e) {
    let tab = e.currentTarget.dataset.tab
    this.setData({
      activeTopTab: tab
    })
    if (tab === 'world') {
      this.setData({
        topWorldPage: 1
      })
      this.getTopWorld()
    } else {
      this.setData({
        topFriendPage: 1
      })
      this.getTopFriend()
    }
  },

  // 显示规则弹出框
  handleShowRuleModal () {
    this.setData({
      showRuleModal: true
    })
  },

  // 排行榜
  handleShowTopModal () {
    this.setData({
      showTopModal: true
    })
  },

  // 好友弹出框
  handleShowFriendModal () {
    this.setData({
      showInviteModal: true
    })
  },

  // 获取提现金额
  handleWithDraw() {
    http.fxGet(api.question_withdraw, {}, (res) => {
      console.log(res, '提现金额')
      if (res.success) {
        this.setData({
          'myAccount.cash_price': res.data.cash_price,
          canWithDraw: res.data.cash_price > 0 ? true : false,
          showWithDrawModal: true
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 提现到微信
  handleWxWithdraw() {
    if (!this.data.canWithDraw) {
      console.log('你没有提现资格')
      return
    }
    if (this.data.withDrawLoading) { // 正在提现中，禁止重复操作
      return
    }
    this.setData({
      withDrawLoading: true
    })
    // 后台获取提现支付参数
    const jwt = wx.getStorageSync('jwt')
    http.fxPost(api.question_withdraw_cash, { open_id: jwt.openid }, (res) => {
      console.log(res, '提现至微信钱包')
      if (res.success) {
        this.setData({
          withDrawLoading: false,
          showWithDrawModal: false
        })
        utils.fxShowToast('已提现，查看微信钱包')
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 去报仇，偷好友的红包
  handleGoStealBonus() {
    this.setData({
      showStealResultModal: false,
      showStealModal: true
    })
  },

  // 快跑
  handleGoRun () {
    this.setData({
      showStealBonusModal: false,
      showStealCouponModal: false
    })
  },

  // 知道了
  handleOk () {
    this.setData({
      showStealFailModal: false
    })
  },

  // 偷红包
  handleStealBonus(e) {
    let uid = e.currentTarget.dataset.uid
    http.fxPost(api.question_steal_bonus, { sn: uid }, (res) => {
      console.log(res, '偷红包')
      if (res.success) {
        this.setData({
          stealBonusResult: res.data,
          userStealed: res.data.user_info
        })
        if (res.data.status == 1) {
          if (res.data.bouns_type == 1) { // 偷到优惠券
            this.setData({
              showInviteModal: false,
              showStealCouponModal: true
            })
          } else {
            this.setData({
              showInviteModal: false,
              showStealBonusModal: true
            })
          }
        } else {
          let s = parseInt(res.data.status)
          console.log(s, '偷红包')
          let stealFailMessage = ''
          switch (s) {
            case 2:
              stealFailMessage = 'ta今天已经不能再偷了，先放过ta吧！'
              break
            case 3:
              stealFailMessage = '你刚刚已经偷过ta了，稍后再来吧！'
              break
            case 4:
              stealFailMessage = 'ta钱包已经被一群强盗偷光了，去提箱一下好友吧！'
              break
          }
          this.setData({
            showInviteModal: false,
            stealFailMessage: stealFailMessage,
            showStealFailModal: true
          })
        }
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 隐藏邀请框
  handleHideInviteModal () {
    this.setData({
      showInviteSuccessModal: false
    })
  },

  // 邀请好友
  handleInviteFriend() {
    console.log('邀请好友')

  },

  // 好友、可能认识的人
  handleFriendTab(e) {
    let tab = e.currentTarget.dataset.tab
    this.setData({
      friendActiveTab: tab
    })
    if (tab === 'mine') {
      this.setData({
        friendPage: 1
      })
      this.getFriendList()
    } else {
      this.setData({
        guessFriendPage: 1
      })
      this.getGuessFriendList()
    }
  },

  // 获取世界榜
  getTopWorld() {
    let params = {
      page: this.data.topWorldPage,
      per_page: 10
    }
    http.fxGet(api.question_ranking, params, (res) => {
      console.log(res, '世界榜')
      if (res.success) {
        let currentUserTop = {
          user_amount: res.data.user_amount,
          user_coupon_amount: res.data.user_coupon_amount,
          user_coupon_quantity: res.data.user_coupon_quantity,
          user_info: res.data.user_info,
          user_ranking: res.data.user_ranking
        }
        this.setData({
          currentUserTop: currentUserTop,
          topWorld: res.data.ranking_list,
          topWorldNext: res.data.next ? true : false
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 获取好友榜
  getTopFriend() {
    let params = {
      page: this.data.topFriendPage,
      per_page: 10
    }
    http.fxGet(api.question_friend_ranking, params, (res) => {
      console.log(res, '好友榜')
      if (res.success) {
        let currentUserTop = {
          user_amount: res.data.user_amount,
          user_coupon_amount: res.data.user_coupon_amount,
          user_coupon_quantity: res.data.user_coupon_quantity,
          user_info: res.data.user_info,
          user_ranking: res.data.user_ranking
        }
        this.setData({
          currentUserTop: currentUserTop,
          topFriend: res.data.ranking_list,
          topFriendNext: res.data.next ? true : false
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 好友列表
  getFriendList() {
    let params = {
      page: this.data.friendPage,
      per_page: 10
    }
    http.fxGet(api.question_friend_list, params, (res) => {
      console.log(res, '好友列表')
      if (res.success) {
        this.setData({
          friendList: res.data.friend_list
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 可能认识的好友列表
  getGuessFriendList() {
    let params = {
      page: this.data.guessFriendPage,
      per_page: 10
    }
    http.fxGet(api.question_guess_friend, params, (res) => {
      console.log(res, '认识的好友列表')
      if (res.success) {
        this.setData({
          guessFriendList: res.data.friend_list
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 获取偷红包的人
  getStealBonusPeople() {
    let params = {
      page: this.data.stealPage,
      per_page: 10
    }
    http.fxGet(api.question_steal_list, params, (res) => {
      console.log(res, '偷红包的人')
      if (res.success) {
        this.setData({
          stealBonusPeople: res.data.friend_list,
          showStealResultModal: res.data.count > 0 ? true : false
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 获取本次试题
  getTestQuestion() {
    let params = { 
      is_share: this.data.isShare 
    }
    http.fxGet(api.question, params, (res) => {
      console.log(res, '获取试题')
      if (res.success) {
        this.setData({
          testQuestions: res.data.question,
          testId: res.data.test_id,
          prizePool: res.data.prize_pool,
          showStealResultModal: res.data.count > 0 ? true : false
        })

        wx.setStorageSync('testQuestion', res.data)

        wx.navigateTo({
          url: '../guessGamePlay/guessGamePlay',
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 获取用户所有奖励
  getAllRewards() {
    http.fxGet(api.question_all_rewards, {}, (res) => {
      console.log(res, '用户所有奖励')
      if (res.success) {
        this.setData({
          myAccount: res.data
        })
        wx.setStorageSync('userGameAccount', res.data)
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 获取偷我红包的提醒
  getStealBonusNotice() {
    http.fxGet(api.question_steal_record, {}, (res) => {
      console.log(res, '偷我红包的提醒')
      if (res.success) {
        this.setData({
          stealBonusPeopleList: res.data.steal_bouns_record,
          stealBonusPeopleCount: res.data.steal_bouns_count
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 获取统计人数
  getPeopleStats() {
    http.fxGet(api.question_stats, {}, (res) => {
      console.log(res, '统计人数')
      if (res.success) {
        this.setData({
          peopleCount: res.data,
          showInviteSuccessModal: res.data.invite_count > 0 ? true : false
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 弹幕：奖励消息
  getDoommList() {
    http.fxGet(api.question_reward_message, {}, (res) => {
      console.log(res, '弹幕列表')
      if (res.success) {
        res.data.reward_message.map(d => {
          doommList.push(new Doomm(d.user_name, d.user_logo, d.amount, Math.ceil(Math.random() * 100), Math.ceil(Math.random() * 10), this._getRandomColor()))
        })
        
        this.setData({
          doommData: doommList
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 随机获取弹幕的背景颜色
  _getRandomColor() {
    let rgb = ['red', 'purple', 'blue']
    
    return rgb[Math.floor(Math.random() * rgb.length)]
  },

  // 获取游戏初始数据
  getInitData() {
    this.getPeopleStats()
    this.getStealBonusNotice()
    this.getAllRewards()
    this.getDoommList()

    this.getStealBonusPeople()
    this.getTopWorld()
    this.getFriendList()
  },

  /**
   * 登录完成回调
   */
  handleCloseLogin() {
    this.setData({
      is_mobile: true,
      showBindForm: false
    })
  },

  /**
   * 微信一键授权回调
   */
  handleGotPhoneNumber (e) {
    app.handleGotPhoneNumber(e, (success) => {
      if (success) {
        if (app.globalData.isLogin) {
          this.setData({
            is_mobile: true,
            showLoginModal: false
          })

          // 开始游戏
          wx.redirectTo({
            url: '../guessGamePlay/guessGamePlay',
          })
        }
      } else {
        utils.fxShowToast('登录失败，稍后重试！')
        wx.navigateTo({
          url: '/pages/index/index',
        })
      }
    })
  },

  /**
   * 获取用户授权信息
   */
  bindGetUserInfo (e) {
    console.log(e.detail.userInfo, '获取用户授权信息')
    if (e.detail.userInfo) {
      // 用户点击允许按钮
      this.setData({
        showBindForm: true
      })
    } else {
      // 用户点击拒绝按钮
      utils.fxShowToast('拒绝授权，你可以选择微信一键快捷授权')
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    page = this
    // scene格式：uid + '-' + code
    let scene = decodeURIComponent(options.scene)
    // 场景参数优先级高
    if (scene && scene != 'undefined') {
      let uid = ''
      let scene_ary = scene.split('-')
      uid = scene_ary[0]
      // 来源编码
      if (scene_ary.length == 2) {
        let code = scene_ary[1]
        wx.setStorageSync('game_inviter', {
          uid: uid,
          code: code
        })
      }
    }

    wx.getSystemInfo({
      success: (res) => {
        // 可使用窗口宽度、高度
        console.log('height=' + res.windowHeight)
        console.log('width=' + res.windowWidth)
        // 计算主体部分高度,单位为px
        this.setData({
          clientHeight: res.windowHeight
        })
      }
    })

    // 给app.js 定义一个方法。
    app.userInfoReadyCallback = res => {
      console.log('用户信息请求完毕')
      if (!res) { // 用户未注册或登录失败
        this.setData({
          showLoginModal: true
        })
      }
    }

    this.getInitData()
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
    if (!app.globalData.isLogin) {
      this.setData({
        showLoginModal: true
      })
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
    // scene格式：uid + '-' + code
    const jwt = wx.getStorageInfoSync('jwt')
    let scene = jwt.uid + '-1'
    return {
      title: '20万人猜图玩到心脏骤停，赢百万现金池，更享原创设计暖心好物现金券',
      path: '/games/pages/guessGame/guessGame?scene=' + scene,
      imageUrl: 'https://static.moebeast.com/static/img/guess-invite-img.jpg',
      success: function (res) {
        console.log('转发成功')
      },
      fail: function (res) {
        console.log('转发失败')
      }
    }
  }
  
})

class Doomm {
  constructor (name, avatar, amount, top, time, color) {
    this.name = name
    this.avatar = avatar
    this.amount = amount
    this.top = top
    this.time = time
    this.color = color
    this.display = true

    let that = this
    this.id = k++
    setTimeout(function () {
      doommList.splice(doommList.indexOf(that), 1) // 动画完成，从列表中移除这项
      page.setData({
        doommData: doommList
      })
    }, this.time * 1000) // 定时器动画完成后执行。
  }
}