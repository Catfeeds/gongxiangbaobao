// pages/lifeStoreManage/lifeStoreManage.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sid: '', // 当前生活馆rid
    activeSubMenu: 'lifeStore',
  },

  /**
   * 切换个人中心
   */
  handleGoUser() {
    wx.switchTab({
      url: '../user/user',
    })
  },

  /**
   * 跳转至交易记录
   */
  handleGoTrade () {
    wx.navigateTo({
      url: '../lifeStoreTransaction/lifeStoreTransaction'
    })
  },

  /**
   * 跳转至提现
   */
  handleGoWithdraw () {
    wx.navigateTo({
      url: '../lifeStoreWithdraw/lifeStoreWithdraw'
    })
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const lifeStore = wx.getStorageSync('lifeStore')
    // 小B商家获取自己生活馆
    if (lifeStore.isSmallB) {
      this.setData({
        sid: lifeStore.lifeStoreRid
      })
    }
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