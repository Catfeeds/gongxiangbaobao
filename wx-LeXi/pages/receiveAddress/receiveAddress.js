// pages/paymentAddress/paymentAddress.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addres: [
      {
        name: "大白",
        PNumber: 13345670987,
        addres: "贵州省遵义市红花岗区天通银丽水元2单元501",
        addressInfo: "贵州省，遵义市",
        addressNumber: 13381319070,
        is_pick: false,
        rid: 1
      },
      {
        name: "小黑",
        PNumber: 18888888888,
        addres: "贵州省遵义市红花岗区天通银丽水元2单元501",
        addressInfo: "贵州省，遵义市",
        addressNumber: 13381319070,
        is_pick: false,
        rid: 2
      },
    ]

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

  },
  //选择地址
  addAddressTap() {
    wx.navigateTo({
      url: '../address/address',

    })
  },
  //继续提交订单
  submitOrderTap() {
    wx.navigateTo({
      url: '../orderInfo/orderInfo',
    })
  }
})