const app = getApp()
const http = require('./../../../utils/http.js')
const api = require('./../../../utils/api.js')
const utils = require('./../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_mobile:false,
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
      url: '/pages/applyLifeStore/applyLifeStore',
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
      this.setData({
        barrageAnimation: result.data.headlines
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getGlideInfo()
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
  onShareAppMessage: function() {
    return app.shareLeXi()
  }
})