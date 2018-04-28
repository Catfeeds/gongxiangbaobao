const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const util = require('./../../utils/util.js')

// 获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navList: [
      { status: 'N01', name: '未使用' },
      { status: 'N02', name: '已使用' },
      { status: 'N03', name: '已过期' }
    ],
    currentStatus: 'N01',
    page: 1,
    per_page: 10,
    couponList_zgs: [1],
    loadingMoreHidden: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCouponList()
  },

  /**
   * 获取红包列表
   */
  getCouponList () {
    const that = this
    let params = {
      page: this.data.page,
      per_page: this.data.per_page,
      status: this.data.currentStatus
    }

    http.fxPost(api.user_coupons, params, function (res) {
      if (res.success) {
        // 没有下一页了
        if (!res.data.next) {
          that.setData({
            loadingMoreHidden: false
          })
        }
        // 修改时间格式
        if (res.data.coupons.length) {
          let tmpBonus = res.data.coupons.map(function (item, key, ary) {
            if (item.coupon.start_date) {
              item.coupon.start_date = util.timestamp2string(item.coupon.start_date, 'date')
            }
            if (item.coupon.end_date) {
              item.coupon.end_date = util.timestamp2string(item.coupon.end_date, 'date')
            }
            return item
          })
          res.data.coupons = tmpBonus
        }

        that.setData({
          couponList: res.data.coupons
        })
      }
    })
  },

  /**
   * 菜单变化
   */
  handleNavStatus (e) {
    let status = e.currentTarget.dataset.status
    this.setData({
      currentStatus: status
    })

    this.getCouponList()
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
    if (this.data.loadingMoreHidden) {
      let page = this.data.page + 1
      this.setData({
        page: page
      })
      this.getCouponList()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})