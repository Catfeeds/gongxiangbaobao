// 我参与的抽奖

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    activeTab: 's0',
    tabs: [
      { rid: 's0', name: '全部', status: 0 },
      { rid: 's1', name: '已中奖', status: 1 },
      { rid: 's2', name: '未中奖', status: 2 },
      { rid: 's3', name: '已失效', status: 3 }
    ],
    lotteryList: [],
    haveNext: true

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this
    setTimeout(() => {
      that.setData({
        isLoading: false
      })
    }, 350)
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