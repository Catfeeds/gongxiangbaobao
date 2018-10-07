/**
 * 猜图游戏跳转h5入口
 */
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lxToken: '',
    gameUrl: ''
  },
  
  /**
   * 监听H5返回的信息
   */
  getH5Message (data) {
    console.log(data, 'H5游戏返回信息')
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let gameUrl = 'https://h5.lexivip.com/guess_game?lx_token=' + app.globalData.token
    console.log(gameUrl, '跳转至游戏')
    this.setData({
      lxToken: app.globalData.token,
      gameUrl: gameUrl
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