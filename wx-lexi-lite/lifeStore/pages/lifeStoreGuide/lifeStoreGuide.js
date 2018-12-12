const app = getApp()

const http = require('./../../../utils/http.js')
const api = require('./../../../utils/api.js')
const utils = require('./../../../utils/util.js')

let guideInteval

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sid: '', // 来源生活馆
    animationIndex: 0, // 控制动画index
    is_mobile: false,
    barrageAnimation: [], // 滑动的信息
    listData: [{
        rid: 's01',
        name: '杜夏夏',
        professional: '网络博主',
        dayHighest: '359',
        monthlyIncome: '8000＋',
        img: 'https://static.moebeast.com/static/img/avatar/duxiaxia.jpg'
      },
      {
        rid: 's02',
        name: '马童',
        professional: '学生',
        dayHighest: '327',
        monthlyIncome: '5000+',
        img: 'https://static.moebeast.com/static/img/avatar/matong.jpg'
      },
      {
        rid: 's03',
        name: '杨惠涵',
        professional: '企业职员',
        dayHighest: '586',
        monthlyIncome: '7000+',
        img: 'https://static.moebeast.com/static/img/avatar/yhh.jpg'
      },
      {
        rid: 's04',
        name: '文青',
        professional: '美术老师',
        dayHighest: '257  ',
        monthlyIncome: '4000+',
        img: 'https://static.moebeast.com/static/img/avatar/wenqing.jpg'
      },
      {
        rid: 's05',
        name: '张小莉',
        professional: '宝妈',
        dayHighest: '418',
        monthlyIncome: '9000+',
        img: 'https://static.moebeast.com/static/img/girl-008.jpeg'
      },
      {
        rid: 's06',
        name: 'Amanda',
        professional: '设计师',
        dayHighest: '368',
        monthlyIncome: '5000+',
        img: 'https://static.moebeast.com/static/img/avatar/amanda.jpg'
      }
    ],
  },

  // 跳转到小程序申请生活馆
  handleGoApply() {
    // 未登录，需先登录
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return
    }

    wx.navigateTo({
      url: '/lifeStore/pages/applyLifeStore/applyLifeStore',
    })
  },

  /**
   * 登录完成回调
   */
  handleCloseLogin() {
    this.setData({
      is_mobile: false
    })
  },

  // 轮播图
  getGlideInfo() {
    http.fxGet(api.shop_animation, {}, result => {
      console.log(result, '滑动的信息')
      if (!result.success) {
        return
      }

      result.data.headlines.forEach((v, i) => {
        if (v.event == 1) {
          v.text = v.time + v.time_info + '开了生活馆' // v.username + 
        }
        if (v.event == 2) {
          v.text = v.time + v.time_info + '售出' + v.quantity + '单' // v.username + 
        }
        if (v.event == 3) {
          v.text = v.time + v.time_info + '售出' + v.quantity + '单' // v.username + 
        }
        if (v.event == 4) {
          v.text = '售出' + v.quantity + '单' // v.username + 
        }
        // 随机颜色
        let num = Math.ceil(Math.random() * 5)
        if (i % num == 0) {
          v.color = true
        }

      })

      this.setData({
        barrageAnimation: result.data.headlines
      })
      guideInteval = setInterval(() => {
        this.setData({
          animationIndex: this.data.animationIndex + 1
        })
        if (this.data.animationIndex == 28) {
          this.setData({
            animationIndex: 0
          })
        }
      }, 1000)
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let sid = ''
    // scene格式：sid
    let scene = decodeURIComponent(options.scene)
    utils.logger(scene, '场景参数')
    if (scene && scene != 'undefined') {
      sid = utils.trim(scene)

      if (sid) { // 有生活馆
        this.setData({
          sid: sid
        })

        utils.logger(sid, '场景生活馆')

        // 更新最近访问的生活馆
        app.updateLifeStoreLastVisit(sid)
        app.globalData.showingLifeStoreRid = sid
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getGlideInfo()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    clearInterval(guideInteval)
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
  onShareAppMessage: function() {
    return app.shareLeXi()
  }

})