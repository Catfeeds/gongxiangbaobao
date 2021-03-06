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
    isLoading: true,
    is_mobile: false,
    showLoginModal: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showBindForm: false,

    moneyQuantity: [1, 2, 3, 4, 5, 6, 7, 8, 9],

    clientHeight: '',

    showRuleModal: false,
    inviteTimer: null, // 刷新邀请好友间隔
    invitePeople: {}, // 邀请好友信息
    showInviteSuccessModal: false,
    showStealResultModal: false,
    showStealEmptyModal: false, // 没偷到
    stealBonusPeopleCount: 0, // 偷我红包的人数
    stealBonusPeopleList: [], // 偷我红包人列表

    showWithDrawModal: false,
    showAllCouponModal: false,
    showInviteModal: false,
    showStealModal: false,
    showTopModal: false,
    showStealBonusModal: false,
    showStealCouponModal: false,
    showShareChanceModal: false,
    // 我的账户
    myAccount: {
      amount: 0,
      bonus_amount: 0,
      bonus_quantity: 0,
      play_times: 1, // 1小时内玩的次数
      cash_price: 0 // 可提现金额
    },
    canWithDraw: false, // 是否能够提现
    withDrawLoading: false, // 正在提现中
    withDrawResult: false, // 提现是否成功
    peopleCount: {
      invite_count: 0,
      total_count: 0,
      invite_name: '',
      user_logo: []
    },
    isShare: 0, // 是否分享
    playerTotalCount: 0, // 总玩家
    // 本次试题
    testQuestions: [],
    testId: '',
    prizePool: 0,
    // 偷我红包的人
    stealBonusPeople: [],
    stealPage: 1,
    stealNext: false,

    friendActiveTab: 'mine', // 'guess'
    // 好友列表
    friendList: [],
    friendPage: 1,
    friendNext: false,
    // 可能认识好友列表
    guessFriendList: [],
    guessFriendPage: 1,
    guessFriendNext: false,

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

    showPosterModal: false, // 分享海报
    posterUrl: '', // 海报图片地址
    posterSaving: false, // 是否正在保存
    posterBtnText: '保存分享图',

    // 弹幕列表
    doommData: [],
    offsetDommTimer: null,

    // 开始游戏分享提示
    playCount: 1,
    gameErrorMessage: '',
    gameLoading: false, // 是否点击开始游戏

    // 邀请提醒
    showInviteHelpModal: false,
    newInviteFriends: [],
    lackList: [] // 不足数量
  },

  // 发通知信息
  handleSubmitInfo(e) {
    app.handleSendNews(e.detail.formId)
  },

  // 返回到小程序的首页
  handleGoHome() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },

  // 继续玩（无现金奖励）
  handleContinuePlay() {
    this._playGame()
  },

  // 开始游戏
  handleStartPlay() {
    this.getNeedInviteHelp()
  },

  // 进入游戏
  _playGame() {
    clearInterval(this.data.offsetDommTimer)
    clearInterval(this.data.inviteTimer)

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

  // 滚动加载世界榜
  handleLoadTopWorld() {
    if (this.data.topWorldNext) {
      let page = this.data.topWorldPage + 1
      this.setData({
        topWorldPage: page
      })
      this.getTopWorld()
    }
  },

  // 滚动加载偷我红包的人
  handleLoadStealPeople() {
    if (this.data.stealNext) {
      let page = this.data.stealPage + 1
      this.setData({
        stealPage: page
      })
      this.getStealBonusPeople()
    }
  },

  // 滚动加载好友榜
  handleLoadTopFriend() {
    if (this.data.topFriendNext) {
      let page = this.data.topFriendPage + 1
      this.setData({
        topFriendPage: page
      })
      this.getTopFriend()
    }
  },

  // 滚动加载我的好友
  handleLoadMyFriends() {
    if (this.data.friendNext) {
      let page = this.data.friendPage + 1
      this.setData({
        friendPage: page
      })
      this.getFriendList()
    }
  },

  // 滚动加载可能认识的好友
  handleLoadGuessFriends() {
    if (this.data.guessFriendNext) {
      let page = this.data.guessFriendPage + 1
      this.setData({
        guessFriendPage: page
      })
      this.getGuessFriendList()
    }
  },

  // 显示规则弹出框
  handleShowRuleModal() {
    this.setData({
      showRuleModal: true
    })
  },

  // 排行榜
  handleShowTopModal() {
    this.setData({
      showTopModal: true
    })
  },

  // 好友弹出框
  handleShowFriendModal() {
    this.setData({
      showInviteModal: true
    })
  },

  // 隐藏弹窗框
  handleHidePauseModal() {
    this.setData({
      showShareChanceModal: false
    })
  },

  // 分享海报
  handleSharePoster() {
    this.setData({
      showPosterModal: true
    })

    let data = {
      auth_app_id: 'wx60ed17bfd850985d',
      path: 'games/pages/guessGame/guessGame',
      scene: ''
    }
    http.fxPost(api.question_index_poster, data, (res) => {
      utils.logger(res, '生成海报')
      if (res.success) {
        this.setData({
          posterUrl: res.data.image_url
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 下载海报
  handleSavePoster() {
    let that = this
    if (this.data.posterUrl && !this.data.posterSaving) {
      this.setData({
        posterSaving: true,
        posterBtnText: '正在保存...'
      })

      // 下载网络文件至本地
      wx.downloadFile({
        url: this.data.posterUrl,
        success: function(res) {
          if (res.statusCode == 200) {
            // 保存文件至相册
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function(data) {
                that.setData({
                  showPosterModal: false,
                  posterSaving: false,
                  posterBtnText: '保存分享图'
                })
                utils.fxShowToast('保存成功', 'success')
              },
              fail: function(err) {
                utils.logger('下载海报失败：' + err.errMsg)
                that.setData({
                  posterSaving: false,
                  posterBtnText: '保存分享图'
                })

                if (err.errMsg == 'saveImageToPhotosAlbum:fail:auth denied') {
                  wx.openSetting({
                    success(settingdata) {
                      utils.logger(settingdata)
                      if (settingdata.authSetting['scope.writePhotosAlbum']) {
                        utils.fxShowToast('保存成功')
                        that.setData({
                          showPosterModal: false,
                          posterSaving: false,
                          posterBtnText: '保存分享图'
                        })
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

  // 查看优惠券
  handleLookCoupon() {
    if (this.data.myAccount.bonus_quantity > 0) {
      this.setData({
        showAllCouponModal: true
      })
    }
  },

  // 跳转到优惠券
  handleGoCoupons() {
    wx.navigateTo({
      url: '/pages/coupon/coupon',
    })
  },

  // 获取提现金额
  handleWithDraw() {
    utils.logger('点击提现')
    http.fxGet(api.question_withdraw, {}, (res) => {
      utils.logger(res, '提现金额')
      if (res.success) {
        this.setData({
          'myAccount.cash_price': utils.fixedAmount(res.data.cash_price),
          canWithDraw: res.data.cash_price > 0 ? true : false,
          showWithDrawModal: true
        })
      } else {
        this.setData({
          showStealFailModal: true,
          stealFailMessage: res.status.message
        })
      }
    })
  },

  // 提现到微信
  handleWxWithdraw() {
    if (!this.data.canWithDraw) {
      utils.logger('你没有提现资格')
      return
    }
    if (this.data.withDrawLoading) { // 正在提现中，禁止重复操作
      utils.logger('正在提现中，请勿重复操作')
      return
    }
    this.setData({
      withDrawLoading: true
    })
    // 后台获取提现支付参数
    const jwt = wx.getStorageSync('jwt')
    http.fxPost(api.question_withdraw_cash, {
      open_id: jwt.openid
    }, (res) => {
      utils.logger(res, '提现至微信钱包')
      if (res.success) {
        this.setData({
          withDrawLoading: false,
          showWithDrawModal: false,
          withDrawResult: true
        })
        utils.fxShowToast('已提现，查看微信钱包')
      } else {
        this.setData({
          withDrawLoading: false,
          showStealFailModal: true,
          stealFailMessage: res.status.message
        })
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
  handleGoRun() {
    this.setData({
      showStealBonusModal: false,
      showStealCouponModal: false,
      showStealEmptyModal: false
    })
  },

  // 知道了
  handleOk() {
    this.setData({
      showStealFailModal: false
    })
  },

  // 偷红包
  handleStealBonus(e) {
    let uid = e.currentTarget.dataset.uid
    http.fxPost(api.question_steal_bonus, {
      sn: uid
    }, (res) => {
      utils.logger(res, '偷红包')
      if (res.success) {
        this.setData({
          stealBonusResult: res.data,
          userStealed: res.data.user_info
        })
        if (res.data.status == 1) {
          let stealResult = res.data
          if (res.data.bouns_type == 1) { // 偷到优惠券
            stealResult.coupon.expired_at = utils.timestamp2string(stealResult.coupon.expired_at, 'cn')
            this.setData({
              stealBonusResult: stealResult,
              showStealCouponModal: true
            })
            // 更新优惠券信息
            this._updateUserStats(stealResult.coupon.bonus_amount, 2)
          } else if (res.data.bouns_type == 2) { // 偷到红包
            this.setData({
              showStealBonusModal: true
            })
            // 更新红包
            this._updateUserStats(stealResult.amount, 1)
          } else { // 未偷到
            this.setData({
              showStealEmptyModal: true
            })
          }
        } else {
          let s = parseInt(res.data.status)
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
            case 5:
              stealFailMessage = '偷钱差点被发现了，两手空空。邀请好友玩猜图达3人后,才能偷对方哦!'
              break
          }
          this.setData({
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
  handleHideInviteModal() {
    this.setData({
      showInviteSuccessModal: false
    })
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

  // 获取formid
  formSubmit(e) {
    utils.logger(e.detail.formId, '游戏模板')
    if (e.detail.formId != 'the formId is a mock one') {
      app.handleSendNews(e.detail.formId)
    }

    this.handleStartPlay()
  },

  // 获取世界榜
  getTopWorld() {
    let params = {
      page: this.data.topWorldPage,
      per_page: 10
    }
    http.fxGet(api.question_ranking, params, (res) => {
      utils.logger(res, '世界榜')
      if (res.success) {
        let currentUserTop = {
          user_amount: res.data.user_amount,
          user_coupon_amount: res.data.user_coupon_amount,
          user_coupon_quantity: res.data.user_coupon_quantity,
          user_info: this._rebuildUserInfo(res.data.user_info, 8),
          user_ranking: res.data.user_ranking
        }

        res.data.ranking_list.forEach((v) => {
          v.user_info = this._rebuildUserInfo(v.user_info, 8)
        })

        let _list = this.data.topWorld
        if (this.data.topWorldPage > 1) {
          _list.push.apply(_list, res.data.ranking_list)
        } else {
          _list = res.data.ranking_list
        }
        this.setData({
          currentUserTop: currentUserTop,
          topWorld: _list,
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
      utils.logger(res, '好友榜')
      if (res.success) {
        let currentUserTop = {
          user_amount: res.data.user_amount,
          user_coupon_amount: res.data.user_coupon_amount,
          user_coupon_quantity: res.data.user_coupon_quantity,
          user_info: this._rebuildUserInfo(res.data.user_info, 8),
          user_ranking: res.data.user_ranking
        }

        res.data.ranking_list.forEach((v) => {
          v.user_info = this._rebuildUserInfo(v.user_info, 8)
        })

        let _list = this.data.topFriend
        if (this.data.topFriendPage > 1) {
          _list.push.apply(_list, res.data.ranking_list)
        } else {
          _list = res.data.ranking_list
        }
        this.setData({
          currentUserTop: currentUserTop,
          topFriend: _list,
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
      utils.logger(res, '好友列表')
      if (res.success) {
        res.data.friend_list.forEach((v) => {
          v = this._rebuildUserInfo(v, 15)
        })

        let _friends = this.data.friendList
        if (this.data.friendPage > 1) {
          _friends.push.apply(_friends, res.data.friend_list)
        } else {
          _friends = res.data.friend_list
        }

        this.setData({
          friendList: _friends,
          friendNext: res.data.next ? true : false
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
      utils.logger(res, '认识的好友列表')
      if (res.success) {
        res.data.friend_list.forEach((v) => {
          v = this._rebuildUserInfo(v, 15)
        })

        let _friends = this.data.guessFriendList
        if (this.data.guessFriendPage > 1) {
          _friends.push.apply(_friends, res.data.friend_list)
        } else {
          _friends = res.data.friend_list
        }
        this.setData({
          guessFriendList: _friends,
          guessFriendNext: res.data.next ? true : false
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
      utils.logger(res, '偷红包的人')
      if (res.success) {
        res.data.friend_list.forEach((v) => {
          v = this._rebuildUserInfo(v, 8)
        })

        let _list = this.data.stealBonusPeople
        if (this.data.stealPage > 1) {
          _list.push.apply(_list, res.data.friend_list)
        } else {
          _list = res.data.friend_list
        }

        this.setData({
          stealBonusPeople: _list,
          stealNext: res.data.next ? true : false
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 是否满足好友助力
  getNeedInviteHelp() {
    http.fxGet(api.question_need_invite, {}, (res) => {
      utils.logger(res, '好友助力')
      if (res.success) {
        // 需要邀请
        if (res.data.need_invite == 1) {
          let friendList = res.data.friend_list
          let lackList = []
          if (friendList.length == 2) {
            lackList = [1]
          } else if (friendList.length == 1) {
            lackList = [1, 2]
          } else {
            lackList = [1, 2, 3]
          }
          this.setData({
            showInviteHelpModal: true,
            lackList: lackList,
            newInviteFriends: friendList
          })
        } else {
          // 直接进入游戏
          this._playGame()
        }
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 获取本次试题
  getTestQuestion() {
    // 游戏正在加载，不能再点击，防止连续点击事件
    if (this.data.gameLoading) {
      return
    }
    let params = {
      is_share: this.data.isShare
    }
    this.setData({
      gameLoading: true
    })
    http.fxGet(api.question, params, (res) => {
      utils.logger(res, '获取试题')
      if (res.success) {
        this.setData({
          testQuestions: res.data.question,
          testId: res.data.test_id,
          prizePool: res.data.prize_pool,
          gameLoading: false
        })

        let that = this
        wx.setStorage({
          key: 'testQuestion',
          data: res.data,
          success: () => {
            wx.navigateTo({
              url: '../guessGamePlay/guessGamePlay',
              success: () => {
                that.setData({
                  showInviteHelpModal: false
                })
              }
            })
          }
        })

      } else {
        this.setData({
          showShareChanceModal: true,
          gameErrorMessage: res.status.message,
          gameLoading: false
        })
      }
    })
  },

  // 获取用户所有奖励
  getAllRewards() {
    http.fxGet(api.question_all_rewards, {}, (res) => {
      utils.logger(res, '用户所有奖励')
      if (res.success) {
        let account = res.data
        account.amount = account.amount.toFixed(2)
        account.bonus_amount = account.bonus_amount.toFixed(2)
        account.max_bonus_amount = account.max_bonus_amount.toFixed(2)
        this.setData({
          myAccount: account
        })
        wx.setStorageSync('userGameAccount', account)
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 更新用户统计数据
  _updateUserStats(amount, type = 1) {
    let gameAccount = this.data.myAccount
    if (type == 1) { // 更新现金金额
      let money_amount = parseFloat(gameAccount.amount)
      utils.logger(money_amount, amount)
      money_amount += parseFloat(amount)
      gameAccount.amount = money_amount.toFixed(2)
    }

    if (type == 2) { // 更新优惠券
      let bonus_amount = parseFloat(gameAccount.bonus_amount)
      bonus_amount += parseFloat(amount)
      gameAccount.bonus_quantity += 1
    }

    this.setData({
      myAccount: gameAccount
    })

    wx.setStorageSync('userGameAccount', gameAccount)
  },

  // 修正用户数据
  _rebuildUserInfo(user, cnt = 5) {
    if (user.user_name && user.user_name.length > cnt) {
      user.user_name = utils.truncate(user.user_name, cnt)
    }
    return user
  },

  // 获取偷我红包的提醒
  getStealBonusNotice() {
    http.fxGet(api.question_steal_record, {}, (res) => {
      utils.logger(res, '偷我红包的提醒')
      if (res.success) {
        res.data.steal_bouns_record.forEach((v) => {
          v.user_info = this._rebuildUserInfo(v.user_info)
        })
        this.setData({
          stealBonusPeopleList: res.data.steal_bouns_record,
          stealBonusPeopleCount: res.data.steal_bouns_count,
          showStealResultModal: res.data.steal_bouns_count > 0 ? true : false
        })

        // 获取偷我红包的人
        if (res.data.steal_bouns_count > 0) {
          this.getStealBonusPeople()
        }
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 获取游戏统计信息
  getPeopleStats() {
    http.fxGet(api.question_stats, {}, (res) => {
      utils.logger(res, '统计信息')
      if (res.success) {
        this.setData({
          playerTotalCount: res.data.total_count
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 获取邀请信息
  getInvitePeople() {
    http.fxGet(api.question_invite_info, {}, (res) => {
      utils.logger(res, '邀请好友人数')
      if (res.success) {
        this.setData({
          peopleCount: res.data
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 获取邀请好友提醒
  getInviteNotice() {
    let that = this
    http.fxGet(api.question_friend_notice, {}, (res) => {
      utils.logger(res, '邀请好友人数')
      if (res.success) {
        if (res.data.user_info.length > 0) {
          that.setData({
            invitePeople: res.data,
            showInviteSuccessModal: true
          })
        }
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 重建弹幕
  rebuildDoomm(result) {
    let that = this
    let t = setInterval(() => {
      if (result.length > 0) {
        let firstItem = result.shift()
        doommList.push(new Doomm(firstItem.user_name, firstItem.user_logo, firstItem.amount, Math.ceil(Math.random() * 80), Math.ceil(Math.random() * 10), utils.getRandomColor()))
        that.setData({
          doommData: doommList
        })
      } else {
        clearInterval(t)
      }
    }, 1500)
  },

  // 弹幕：奖励消息
  getDoommList() {
    let that = this
    http.fxGet(api.question_reward_message, {}, (res) => {
      utils.logger(res, '弹幕列表')
      if (res.success) {
        that.rebuildDoomm(res.data.reward_message)
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
      is_mobile: true,
      showBindForm: false
    })

    if (app.globalData.isLogin) {
      this.getInitData()
    }
  },

  /**
   * 微信一键授权回调
   */
  handleGotPhoneNumber(e) {
    let gotParams = e
    if (e.detail.errMsg == 'getPhoneNumber:ok') {

      // 检测当前用户登录态是否有效
      wx.checkSession({
        success: (res) => {
          utils.logger(res, 'check session success')
          app.handleGotPhoneNumber(e, (success) => {
            if (success) {
              if (app.globalData.isLogin) {
                this.setData({
                  is_mobile: true,
                  showLoginModal: false
                })

                // 开始游戏
                this.getInitData()
              }
            } else {
              utils.fxShowToast('登录失败，稍后重试！')
              wx.navigateTo({
                url: '/pages/index/index',
              })
            }
          })
        },
        fail: (res) => {

          app.refreshUserSessionKey((e) => {
            app.handleGotPhoneNumber(gotParams, (success) => {
              if (success) {
                if (app.globalData.isLogin) {
                  this.setData({
                    is_mobile: true,
                    showLoginModal: false
                  })

                  // 开始游戏
                  this.getInitData()
                }
              } else {
                utils.fxShowToast('登录失败，稍后重试！')
                wx.navigateTo({
                  url: '/pages/index/index',
                })
              }
            })
          })
        }

      })

    } else {
      utils.fxShowToast('拒绝授权，你可以选择手机号动态登录')
    }
  },

  /**
   * 获取用户授权信息
   */
  bindGetUserInfo(e) {
    utils.logger(e.detail.userInfo, '获取用户授权信息')
    if (e.detail.userInfo) {
      // 用户点击允许按钮
      this.setData({
        showBindForm: true
      })

      let userAuth = e.detail
      // 检测当前用户登录态是否有效
      wx.checkSession({
        success: (res) => {
          utils.logger(res, 'check session success')
          this.getUserAuthInfo(userAuth)
        },
        fail: (res) => {
          utils.logger(res, 'check session fail')

          app.refreshUserSessionKey((e) => {
            this.getUserAuthInfo(userAuth)
          })
        }
      })
    } else {
      // 用户点击拒绝按钮
      utils.fxShowToast('拒绝授权，你可以选择微信一键快捷授权')
    }
  },

  /**
   * 获取用户授权信息
   */
  getUserAuthInfo(userAuth) {
    utils.logger(userAuth, '更新用户解密信息')
    const jwt = wx.getStorageSync('jwt')
    let params = {
      encrypted_data: userAuth.encryptedData,
      auth_app_id: app.globalData.app_id,
      openid: jwt.openid,
      iv: userAuth.iv
    }

    utils.logger(params, '用户授权参数')

    // 更新用户授权信息
    http.fxPost(api.auth_weixin, params, (res) => {
      utils.logger(res, '授权解密成功')
      if (!res.success) {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 获取游戏初始数据
  getInitData() {
    this.getPeopleStats()
    this.getInvitePeople()

    this.getTopWorld()
    this.getFriendList()
  },

  // 需要刷新的数据
  _refreshData() {
    // 刷新金额
    this.getAllRewards()

    // 查看是否有偷我红包的人
    this.getStealBonusNotice()

    let that = this

    // 刷新是否有最新邀请的人, 30s
    this.setData({
      inviteTimer: setInterval(() => {
        that.getInviteNotice()
      }, 15000)
    })

    // 获取弹幕, 10s
    that.getDoommList()

    this.setData({
      offsetDommTimer: setInterval(() => {
        that.getDoommList()
      }, 15000)
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
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

        // 绑定与已登录用户的好友关系
        if (app.globalData.isLogin) {
          app.bindFriend()
        }
      }
    }

    wx.getSystemInfo({
      success: (res) => {
        // 计算主体部分高度,单位为px
        this.setData({
          clientHeight: res.windowHeight
        })
      }
    })

    // 给app.js 定义一个方法。
    app.userInfoReadyCallback = (res) => {
      utils.logger(res, '用户信息请求完毕')
      if (res) { // 登录请求成功
        if (app.globalData.isLogin) { // 登录成功
          this.setData({
            is_mobile: true,
            showLoginModal: false
          })

          this.getInitData()
          this._refreshData()

        } else {
          this.setData({
            is_mobile: false,
            showLoginModal: true
          })
        }
      } else { // 登录请求失败
        this.setData({
          is_mobile: false,
          showLoginModal: true
        })
      }
    }

    if (app.globalData.isLogin) {
      this.setData({
        is_mobile: true,
        showLoginModal: false
      })

      this.getInitData()
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
    }, 2000)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: false,
        showLoginModal: true
      })
    } else {
      this._refreshData()
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    clearInterval(this.data.offsetDommTimer)
    clearInterval(this.data.inviteTimer)
    this.setData({
      offsetDommTimer: null,
      inviteTimer: null
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearInterval(this.data.offsetDommTimer)
    clearInterval(this.data.inviteTimer)
    this.setData({
      offsetDommTimer: null,
      inviteTimer: null
    })
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
   * 普通分享
   */
  _commonShare() {
    let randomList = [0, 1, 2]
    let _random = Math.floor(Math.random() * randomList.length) + 1

    return {
      title: '猜图赢现金随时提现，20万人玩到心脏骤停',
      path: 'games/pages/guessGame/guessGame',
      imageUrl: 'https://static.moebeast.com/static/img/share-game-0' + _random + '.jpg',
      success: function(res) {
        utils.logger('转发成功')

        app.updateGameShare()
      },
      fail: function(res) {
        utils.logger('转发失败')
      }
    }
  },

  /**
   * 邀请分享
   */
  _inviteShare() {
    let randomList = [0, 1, 2]
    let _random = Math.floor(Math.random() * randomList.length) + 1

    utils.logger(_random, '随机值')

    // scene格式：uid + '-' + code
    const jwt = wx.getStorageSync('jwt')
    let scene = jwt.uid + '-1'
    return {
      title: '猜图赢现金随时提现，20万人玩到心脏骤停',
      path: 'games/pages/guessGame/guessGame?scene=' + scene,
      imageUrl: 'https://static.moebeast.com/static/img/share-game-0' + _random + '.jpg',
      success: function(res) {
        utils.logger('转发成功')

        app.updateGameShare()
      },
      fail: function(res) {
        utils.logger('转发失败')
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(e) {
    // 邀请好友分享
    if (e.from == 'button') {
      if (e.target.dataset.name == 'invite') {
        return this._inviteShare()
      } else {
        // 普通转发 e.target.dataset.name = 'share'
        return this._commonShare()
      }
    }

    // 分享转发
    if (e.from == 'menu') {
      return this._commonShare()
    }
  }

})

class Doomm {
  constructor(name, avatar, amount, top, time, color) {
    this.name = name
    this.avatar = avatar
    this.amount = amount
    this.top = top
    this.time = time
    this.color = color
    this.display = true

    let that = this
    this.id = k++
      setTimeout(function() {
        doommList.splice(doommList.indexOf(that), 1) // 动画完成，从列表中移除这项
        page.setData({
          doommData: doommList
        })
      }, this.time * 1000) // 定时器动画完成后执行。
  }
}