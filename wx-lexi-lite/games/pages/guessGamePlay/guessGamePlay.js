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
    rpx: '',
    clientHeight: '',
    isLoading: true,
    // 我的账户
    myAccount: {
      amount: 0,
      bonus_amount: 0,
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
    step: 1, // 计数动画次数
    num: 0, // 计数倒计时秒数（n - num）
    end: 1.5 * Math.PI, // 开始的弧度
    start: -0.5 * Math.PI, // 结束的弧度
    timer: null, // 计时器容器
    animationTime: 100, // 每1秒运行一次计时器
    n: 100 // 当前倒计时为10秒
  },

  // 选定答案
  handleChooseAnswer(e) {
    if (this.data.currentAnswerIdx == -1) {
      this.setData({
        currentAnswerIdx: e.currentTarget.dataset.idx,
        currentAnswer: this.data.currentQuestion.answers[e.currentTarget.dataset.idx]
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
      console.log(res, '答案结果')
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
        step: 1,
        num: 0,
        end: 1.5 * Math.PI,
        start: -0.5 * Math.PI,
        timer: null
      })

      // 倒计时前先绘制整圆的圆环
      this.drawRingMove(this.data.start, this.data.end)
      // 创建倒计时
      this.setData({
        timer: setInterval(this.startAnimation, this.data.animationTime)
      })

    } else { // 已完毕
      this.gameOver()
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
    this.setData({
      currentQuestion: this.data.testQuestions[this.data.currentIndex]
    })
  },

  // 开启动画
  startAnimation() {
    if (this.data.step <= this.data.n) {
      let end = this.data.end - 2 * Math.PI / this.data.n
      let step = this.data.step + 1
      this.drawRingMove(this.data.start, end)
      this.setData({
        end: end,
        step: step
      })
    } else {
      clearInterval(this.data.timer)

      // 开始验证结果
      this.validateSubmitAnswer()
    }
  },

  drawProgressbg() {
    // 使用 wx.createContext 获取绘图上下文 context
    let ctx = wx.createCanvasContext('canvasProgressbg')
    ctx.setLineWidth(5) // 设置圆环的宽度
    ctx.setStrokeStyle('#FFCF00') // 设置圆环的颜色
    ctx.setLineCap('round') // 设置圆环端点的形状
    ctx.beginPath() // 开始一个新的路径
    ctx.arc(25, 25, 20, 0, 2 * Math.PI, false)
    ctx.stroke() // 对当前路径进行描边
    ctx.draw()
  },

  // 画布绘画函数
  drawRingMove(s, e) {
    let context = wx.createCanvasContext('canvasProgress')

    // 绘制圆环
    context.setStrokeStyle('#6A378D')
    context.beginPath()
    context.setLineWidth(5)
    context.arc(25, 25, 20, s, e, true)
    context.stroke()
    context.closePath()

    context.draw()

    let leftTime = Math.round((this.data.n - this.data.num) / 10)
    let showText = '乐喜'
    if (leftTime > 0) {
      showText = leftTime + ''
    }

    // 每完成一次全程绘制就+1
    this.setData({
      num: this.data.num + 1,
      showText: showText
    })
  },

  // 获取最近的玩家
  getLastPlayers() {
    let params = {
      page: 1,
      per_page: 10
    }
    http.fxGet(api.question_stats, params, (res) => {
      console.log(res, '最近的玩家')
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
    }, 1500)
  },

  // 弹幕：奖励消息
  getDoommList() {
    let that = this
    http.fxGet(api.question_reward_message, {}, (res) => {
      console.log(res, '弹幕列表')
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
      offsetTimer: null,
      offsetDommTimer: null
    })
  },

  // 答对问题，增加一个优惠券
  _increaseBonusCount(prize) {
    console.log('回答正确奖励')
    let cnt = this.data.myAccount.bonus_amount
    let money = parseFloat(this.data.myAccount.amount)
    cnt += 1
    money += parseFloat(prize.amount)
    console.log(money)
    this.setData({
      haveMoney: prize.amount > 0 ? true : false,
      haveCoupon: prize.bonus_amount > 0 ? true : false,
      'myAccount.bonus_amount': cnt,
      'myAccount.amount': parseFloat(money).toFixed(2)
    })
  },

  // 验证对象是否为空
  _isEmpty(obj) {
    console.log(obj, '对象是否为空')
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
          clientHeight: res.windowHeight,
          rpx: res.windowWidth / 375
        })
      }
    })

    // 获取本次试题
    const testQuestion = wx.getStorageSync('testQuestion')
    if (!testQuestion) {
      // 返回开始页
      wx.navigateBack({
        delta: 1
      })
    }

    this.setData({
      userInfo: wx.getStorageSync('userInfo'),
      myAccount: wx.getStorageSync('userGameAccount'),
      testId: testQuestion.test_id,
      prizePool: testQuestion.prize_pool,
      testQuestions: testQuestion.question
    })

    this.getLastPlayers()

    // 参与的人数
    this.startPlay()

    // 倒计时前先绘制整圆的圆环
    this.drawRingMove(this.data.start, this.data.end)
    // 创建倒计时
    this.setData({
      timer: setInterval(this.startAnimation, this.data.animationTime)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.drawProgressbg()

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
    let that = this
    // 获取弹幕
    that.getDoommList()

    this.setData({
      offsetDommTimer: setInterval(() => {
        that.getDoommList()
      }, 10000)
    })
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
    console.log(options, '分享游戏')
    let randomList = [1, 2, 3]
    let _random = Math.floor(Math.random() * randomList.length)
    return {
      title: '猜图赢现金随时提现，20万人玩到心脏骤停',
      path: '/games/pages/guessGame/guessGame',
      imageUrl: 'https://static.moebeast.com/static/img/share-game-0' + _random + '.jpg',
      success: function (res) {
        console.log('转发成功')

        app.updateGameShare()

        // 返回游戏首页
        wx.navigateTo({
          url: '../guessGame/guessGame',
        })
      },
      fail: function (res) {
        console.log('转发失败')
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