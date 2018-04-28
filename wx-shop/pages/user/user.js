// pages/user/user.js.js
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')

//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    order_items: [
      { rid:'r001', name: '待付款', status: 1, icon: 'wait-pay' },
      { rid: 'r002', name: '待发货', status: 5, icon: 'wait-send' },
      { rid: 'r003', name: '待收货', status: 10, icon: 'wait-confirm' },
      { rid: 'r004', name: '售后服务', status: 15, icon: 'after-market' }
    ],
    service_items: [
      { rid: 's001', name: '优惠券', icon: 'red-packets', color: 'fx-primary' },
      { rid: 's002', name: '收藏', icon: 'like' },
      { rid: 's003', name: '地址', icon: 'address' },
      { rid: 's006', name: '关于我们', icon: 'mation-prompt' }
    ],
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  // 查看订单列表
  handleViewOrder (e) {
    const status = e.currentTarget.dataset.status;
    wx.navigateTo({
      url: '../order/order?status=' + status,
    })
  },

  // 查看服务
  handViewService (e) {
    const rid = e.currentTarget.dataset.rid;
    let _url = '';
    if (rid == 's003') { // 地址
      _url = '../address/address'
    } else if (rid == 's001') {
      _url = '../coupon/coupon'
    } else if (rid == 's002') {
      _url = '../wishlist/wishlist'
    } else if (rid == 's006') {  // 关于我们
      _url = '../aboutus/aboutus'
    }
    
    wx.navigateTo({
      url: _url,
    })
  },

  /**
   * 获取用户信息
   */
  getUserInfo (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
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
  
  }
})