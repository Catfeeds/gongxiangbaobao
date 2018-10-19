// pages/redBag/redBag.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
const common = require('./../../utils/common.js')

let scrollInterval

Page({

  /**
   * 页面的初始数据
   */
  data: {
    topKey: 0,
    isLoading: true,
    
    bonusCount: [], // 奖金计数
    rule_show: [], // 活动内容呼出框
    get_bonus: false, // 获取红包的呼出框
    rule_text: [
      {
        text: '红包的使用期限为7天，一周内未使用则失效， 仅授权微信和绑定手机用户才有参与资格领取。'
      },
      {
        text: '每人每日限领一次，分享到群与微信好友即可 获得10元红包。'
      },
      {
        text: '系统根据根据注册用户进行核查，同一个手机 号，微信号，设备 支付账户示为同一个用户情 况均视为同一个用户。'
      },
      {
        text: '通过不正当手段，恶意刷卷，批量注册，机器 模拟获得奖励，官方有权封号和收回全部所获得 优惠奖励'
      }
    ]
  },

  // 处理获得红包box卷曲
  handleTimeScroll() {
    clearInterval(scrollInterval)

    scrollInterval = setInterval(() => {
      if (this.data.topKey == -384) {
        this.setData({
          topKey: 0
        })
      } else {
        this.setData({
          topKey: this.data.topKey - 1
        })
      }

    }, 80)
  },

  // 活动规则内容呼出
  ruleShowTap() {
    this.animation.bottom(0).step()
    this.setData({
      rule_show: this.animation.export()
    })
  },

  // 活动规则内容关闭
  ruleHidTap() {
    this.animation.bottom(-2000 + 'rpx').step()
    this.setData({
      rule_show: this.animation.export()
    })
  },

  // 获得红包 呼出框
  getBonusShow() {
    this.animation.bottom(0).step()
    this.setData({
      get_bonus: this.animation.export()
    })
  },

  // 获得红包 关闭
  getHidShow() {
    this.animation.bottom(-2000 + 'rpx').step()
    this.setData({
      get_bonus: this.animation.export()
    })
  },

  // 获取获奖的人
  getAward() {
    http.fxGet(api.market_bonus_lines, {}, (result) => {
      utils.logger(result, '领取红包的人数')
      if (result.success) {
        result.data.bonus_lines.forEach((v) => {
          utils.logger(v.user_name - 0 != NaN)
          if (v.user_name - 0 != NaN) {
            v.user_name = v.user_name.substr(0, 3) + '***' + v.user_name.substr(7, 4)
          } else {
            v.user_name = v.user_name.length > 3 ? v.user_name.substr(0, 3) + '···' : v.user_name
          }
          this.setData({
            bonusLines: result.data.bonus_lines,
            'bonusLines[10]': result.data.bonus_lines[0],
            'bonusLines[11]': result.data.bonus_lines[1],
            'bonusLines[12]': result.data.bonus_lines[2],
            bonusCount: result.data.bonus_count
          })
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getAward()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let that = this
    setTimeout(() => {
      that.setData({
        readyOver: true,
        isLoading: false
      })
    }, 350)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.animation = wx.createAnimation({
      transformOrigin: '50% 50%',
      duration: 500,
      timingFunction: 'ease',
      delay: 0
    })

    this.handleTimeScroll()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

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
  onShareAppMessage: function(e) {
    return {
      title: '分享领取红包',
      path: '/pages/index/index',
      imageUrl: "https://static.moebeast.com/vimage/share-lexi.png",
      success: (res) => {
        if (!this.data.get_bonus) {
          this.getBonusShow()
        }

        http.fxPost(api.market_bonus_grant, {}, (result) => {
          utils.logger(result, '分享后领取红包')
          if (result.success) {
            utils.logger(app.globalData)
            let addObject = {
              user_name: app.globalData.jwt.username
            }

            this.setData({
              bonusCount: this.data.bonusCount + 1
            })

          } else {
            utils.fxShowToast(result.status.message)
          }
        })
      },
      fail: (res) => {
        utils.logger(res, '转发失败')
      }
    }
  },

  // 跳转到首页
  handleToIndexTap() {
    wx.switchTab({
      url: '../index/index',
    })
  }

})