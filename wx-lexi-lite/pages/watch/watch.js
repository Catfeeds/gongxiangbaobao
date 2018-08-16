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
    
    // isWatch:true,//是否关注
    peopleList: [], // 关注的数量
    isNext:false,
    params: {
      uid:false, //uid
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
    }
  },

  // 获取我的关注
  getFollower() {
    http.fxGet(api.users_followed_users, this.data.params, (result) => {
      console.log(result, "我的关注")
      if (result.success) {

        let data = this.data.peopleList
        result.data.followed_users.forEach((v) => {
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

//获取别人关注
  getOtherFollower(){
    http.fxGet(api.users_other_followed_users, this.data.params, (result) => {
      console.log(result, "别人的关注")
      if (result.success) {

        let data = this.data.peopleList
        result.data.followed_users.forEach((v)=>{
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

  //取消关注
  hanleDeleteWatch(e) {
    let index = e.currentTarget.dataset.index
    console.log(index)
    console.log(this.data.peopleList)
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

  //添加关注
  hanleAddWatch(e) {
    console.log(this.data.peopleList.product_like_users)
    console.log(e.currentTarget.dataset.uid)
    console.log(e.currentTarget.dataset.index)
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options.uid)

    // 有uid是别人，没有是自己
    if (options.uid) {
      wx.setNavigationBarTitle({title: 'ta的关注'})

      this.setData({
        ['params.uid']: options.uid
      })
      this.getOtherFollower()

    } else {
      wx.setNavigationBarTitle({ title: '我的关注' })
      this.getFollower()
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
      utils.fxShowToast("没有更多了")
      return
    }

    this.setData({
      ['params.page']: this.data.params.page + 1
    })

    // 触底加载别人的关注
    if (this.data.params.uid){
      this.getOtherFollower()
    }

    // 触底加载我的关注
    if (!this.data.params.uid) {
      this.getFollower()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  // 跳转到其他人地主页
  handleToPeopleTap(e) {
    console.log(e.currentTarget.dataset.uid)
    wx.navigateTo({
      url: '../people/people?uid=' + e.currentTarget.dataset.uid,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  }
})