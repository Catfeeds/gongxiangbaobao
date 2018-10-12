// pages/myFollower/myFollower.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    isNext: false, // 是否有下一页
    peopleList: [], // 粉丝的数量
    params: {
      uid: false, // 别人的uid
      page: 1, // Number	可选	1	当前页码
      per_page: 10 // Number	可选	10	每页数量
    }
  },

  // 获取自己的粉丝
  getFollower() {
    http.fxGet(api.users_fans_counts, this.data.params, (result) => {
      console.log(result, '自己的粉丝')
      if (result.success) {
        let data = this.data.peopleList
        result.data.user_fans.forEach((v)=>{
          data.push(v)
        })

        this.setData({
          isNext: result.data.next,
          peopleList: data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取别人的粉丝 users/other_user_fans
  getOtherFollower(){
    http.fxGet(api.users_other_user_fans, this.data.params, (result) => {
      console.log(result, '别人的粉丝')
      if (result.success) {
        let data = this.data.peopleList
        result.data.user_fans.forEach((v) => {
          data.push(v)
        })

        this.setData({
          isNext: result.data.next,
          peopleList: data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 添加关注
  hanleAddWatch(e) {
    let index = e.currentTarget.dataset.index
    http.fxPost(api.follow_user, {
      uid: e.currentTarget.dataset.uid
    }, (result) => {
      console.log(result)
      if (result.success) {
        this.setData({
          ['peopleList[' + index + '].followed_status']: result.data.followed_status
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 取消关注
  hanleDeleteWatch(e) {
    let index = e.currentTarget.dataset.index
    http.fxPost(api.unfollow_user, {
      uid: e.currentTarget.dataset.uid
    }, (result) => {
      console.log(result)
      if (result.success) {
        this.setData({
          ['peopleList[' + index + '].followed_status']: result.data.followed_status
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
    // 没有uid是获取自己的
    if (!options.uid) {
      wx.setNavigationBarTitle({ title: '我的粉丝' })
      this.getFollower()
    } else {
      wx.setNavigationBarTitle({ title: 'ta的粉丝' })
      this.setData({
        ['params.uid']: options.uid
      })
      this.getOtherFollower()
    }
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
    if (!this.data.isNext){
      utils.fxShowToast('没有更多了')
      return
    }

    this.setData({
      ['params.page']: this.data.params.page+1
    })

    // 触底加载自己的粉丝
    if (!this.data.params.uid) {
      this.getFollower()
    }

    // 触底加载别人粉丝
    if (this.data.params.uid){
      this.getOtherFollower()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return app.shareLeXi()
  }
  
})