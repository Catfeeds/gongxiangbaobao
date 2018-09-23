// pages/receiveCoupon/receiveCoupon.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    categoryCode: "recommend",
    category: [{
        name: "配件饰品",
        rid: 2
      },
      {
        name: "箱包&包袋",
        rid: 3
      },
      {
        name: "生活良品",
        rid: 4
      },
      {
        name: "文具书籍",
        rid: 5
      },
    ]
  },

  // 切换分类
  handleChangeCtaegory(e) {
    console.log(e)
    this.setData({
      categoryCode:e.currentTarget.dataset.code
    })


  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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

  }
})