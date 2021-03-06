/**
 * 猜图游戏跳转h5入口
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
    clientHeight: '',
    isLoading: true,
    // 强制游戏终止
    stopPlay: false,
    // 我的账户
    myAccount: {
      amount: 0,
      bonus_amount: 0,
      bonus_quantity: 0,
      cash_price: 0 // 可提现金额
    },
    userInfo: {}, // 登录用户信息

    // 数量
    moneyQuantity: [1, 2, 3, 4, 5],
    couponQuantity: [1, 2, 3, 4, 5, 6],

    // 本次试题
    testQuestions: [],
    testId: '',
    prizePool: 0,

    isAnswered: false, // 是否回答过
    answerResult: false, // 回答是否正确
    haveMoney: false, // 是否有现金
    haveCoupon: false, // 是否有优惠券
    // 当前问题
    currentQuestion: {},
    currentIndex: 0,
    currentAnswer: {},
    currentAnswerIdx: -1, // 当前选择答案的索引

    // 最近玩家
    offsetTimer: null, // 时间句柄
    lastPlayers: [],

    // 弹幕列表
    offsetDommTimer: null,
    doommData: [],

    showText: '乐喜',
    timer: null, // 计时器容器
    leftTime: 10, // 计数倒计时秒数
    animationTime: 1000 // 每1秒运行一次计时器
  },

  // 选定答案
  handleChooseAnswer(e) {
    if (this.data.currentAnswerIdx == -1) {
      this.setData({
        currentAnswerIdx: e.currentTarget.dataset.idx,
        currentAnswer: this.data.currentQuestion.answers[e.currentTarget.dataset.idx]
      }, () => {
        clearInterval(this.data.timer)
        
        // 开始验证结果
        this.validateSubmitAnswer()
      })
    }
  },

  // 验证答案是否正确
  validateSubmitAnswer() {
    let data = {
      test_id: this.data.testId,
      question_id: this.data.currentQuestion.question_id,
      answer_id: this._isEmpty(this.data.currentAnswer) ? 0 : this.data.currentAnswer.answer_id
    }
    http.fxPost(api.question_check_answer, data, (res) => {
      utils.logger(res, '答案结果')
      if (res.success) {
        if (res.data.answer) {
          // 回答正确奖励优惠券
          this._increaseBonusCount(res.data)

          if (!this._isEmpty(this.data.currentAnswer)) {
            let k = 'currentQuestion.answers[' + this.data.currentAnswerIdx + '].ok'
            this.setData({
              [k]: true
            })
          }
        } else {
          if (this.data.currentAnswerIdx !== -1) {
            let k = 'currentQuestion.answers[' + this.data.currentAnswerIdx + '].error'
            this.setData({
              [k]: true
            })
          }
        }

        this.setData({
          isAnswered: true,
          answerResult: res.data.answer
        })

        // 获取结果后2s,自动下一题
        if (this.data.currentIndex + 1 < 10) {
          setTimeout(() => {
            this.playNext()
          }, 2000)
        } else {
          // 完成游戏
          this.gameOver()
        }
      } else {
        utils.fxShowToast(res.status.message)

        this._clearTimer()

        // 跳回游戏
        wx.navigateBack({
          delta: 1
        })
      }
    })
  },

  // 继续下一题
  playNext() {
    if (!this.data.stopPlay) {
      if (this.data.currentIndex + 1 < 10) {
        let newIndex = this.data.currentIndex + 1
        // 恢复默认值
        this.setData({
          isAnswered: false,
          answerResult: false,
          haveMoney: false,
          haveCoupon: false,
          currentAnswer: {},
          currentAnswerIdx: -1,
          currentIndex: newIndex,
          currentQuestion: this.data.testQuestions[newIndex],
          leftTime: 10,
          showText: '10s',
          timer: null
        })

        // 创建倒计时
        this.setData({
          timer: setInterval(this.startAnimation, this.data.animationTime)
        })

      } else { // 已完毕
        this.gameOver()
      }
    }
  },

  // 游戏结束
  gameOver() {
    this._clearTimer()

    // 跳转结果页
    wx.redirectTo({
      url: '../guessResult/guessResult?test_id=' + this.data.testId,
    })
  },

  // 开始玩
  startPlay() {
    if (!this.data.stopPlay) {
      this.setData({
        currentQuestion: this.data.testQuestions[this.data.currentIndex]
      })
    }
  },

  // 开启动画
  startAnimation() {
    let showText = '乐喜'

    if (this.data.leftTime >= 1) {
      let leftTime = this.data.leftTime - 1
      if (leftTime > 0) {
        showText = leftTime + 's'
      }
      this.setData({
        leftTime: leftTime,
        showText: showText
      })
    } else {
      clearInterval(this.data.timer)

      // 开始验证结果
      this.validateSubmitAnswer()
    }
  },

  // 获取最近的玩家
  getLastPlayers() {
    let params = {
      page: 1,
      per_page: 10
    }
    http.fxGet(api.question_stats, params, (res) => {
      utils.logger(res, '最近的玩家')
      if (res.success) {
        this.setData({
          lastPlayers: res.data.user_info
        })
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
        doommList.push(new Doomm(firstItem.user_name, firstItem.user_logo, firstItem.amount, Math.ceil(Math.random() * 60), Math.ceil(Math.random() * 10), utils.getRandomColor()))
        that.setData({
          doommData: doommList
        })
      } else {
        clearInterval(t)
      }
    }, 1800)
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

  // 清空定时器
  _clearTimer () {
    // 停止获取参与人数
    clearInterval(this.data.offsetTimer)
    clearInterval(this.data.offsetDommTimer)
    this.setData({
      stopPlay: true,
      offsetTimer: null,
      offsetDommTimer: null
    })
  },

  // 答对问题，增加一个优惠券
  _increaseBonusCount(prize) {
    let cnt = parseInt(this.data.myAccount.bonus_quantity)
    let money = parseFloat(this.data.myAccount.amount)
    cnt += 1
    money += parseFloat(prize.amount)

    utils.logger(money, '回答正确奖励')

    this.setData({
      haveMoney: prize.amount > 0 ? true : false,
      haveCoupon: prize.bonus_amount > 0 ? true : false,
      'myAccount.bonus_quantity': cnt,
      'myAccount.amount': parseFloat(money).toFixed(2)
    })
  },

  // 验证对象是否为空
  _isEmpty(obj) {
    if (obj) {
      return Object.keys(obj).length === 0
    }
    return false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    page = this

    wx.getSystemInfo({
      success: (res) => {
        // 计算主体部分高度,单位为px
        this.setData({
          clientHeight: res.windowHeight
        })
      }
    })

    // 获取本次试题
    const testQuestion = wx.getStorageSync('testQuestion')
    if (!testQuestion) {
      // 试题为空，不能玩
      this.setData({
        stopPlay: true
      })

      // 返回开始页
      wx.navigateBack({
        delta: 1
      })
    }

    let userInfo = wx.getStorageSync('userInfo')
    let gameAccount = wx.getStorageSync('userGameAccount')

    this.setData({
      userInfo: userInfo,
      myAccount: gameAccount,
      testId: testQuestion.test_id,
      prizePool: testQuestion.prize_pool,
      testQuestions: testQuestion.question
    })

    this.getLastPlayers()
    
    // 清空本次试题记录
    wx.removeStorageSync('testQuestion')
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
    }, 1000)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this

    if (!this.data.stopPlay) {
      // 开始游戏
      this.startPlay()
      // 网络请求，缓存1s
      setTimeout(() => {
        // 创建倒计时
        that.setData({
          timer: setInterval(that.startAnimation, that.data.animationTime)
        })
      }, 2000)

      // 获取弹幕
      this.getDoommList()

      this.setData({
        offsetDommTimer: setInterval(() => {
          that.getDoommList()
        }, 15000)
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this._clearTimer()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    this._clearTimer()
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
  onShareAppMessage: function(options) {
    utils.logger(options, '分享游戏')
    let randomList = [1, 2, 3]
    let _random = Math.floor(Math.random() * randomList.length)
    return {
      title: '猜图赢现金随时提现，20万人玩到心脏骤停',
      path: '/games/pages/guessGame/guessGame',
      imageUrl: 'https://static.moebeast.com/static/img/share-game-0' + _random + '.jpg',
      success: function (res) {
        utils.logger('转发成功')

        app.updateGameShare()

        // 返回游戏首页
        wx.navigateTo({
          url: '../guessGame/guessGame',
        })
      },
      fail: function (res) {
        utils.logger('转发失败')
      }
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