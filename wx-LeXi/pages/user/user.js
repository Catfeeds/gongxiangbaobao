// pages/user/user.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classInfo:1,
    sotrF: false,
    product: [
      {
        title: "手作精品款牛皮手提黑包",
        img: "../../images/timg.jpg",
        price: 99,
        like: 123
      },
      {
        title: "手作精品款牛皮手提黑包",
        img: "../../images/timg.jpg",
        price: 99,
        like: 123
      },
      {
        title: "手作精品款牛皮手提黑包",
        img: " ../../images / timg.jpg",
        price: 99,
        like: 123
      },
      {
        title: "手作精品款牛皮手提黑包",
        img: " ../../images / timg.jpg",
        price: 99,
        like: 123
      },
      {
        title: "手作精品款牛皮手提黑包",
        img: " ../../images / timg.jpg",
        price: 99,
        like: 123
      },
      {
        title: "手作精品款牛皮手提黑包",
        img: " ../../images / timg.jpg",
        price: 99,
        like: 123
      },
      {
        title: "手作精品款牛皮手提黑包",
        img: "../../images/timg.jpg",
        price: 99,
        like: 123
      },
      {
        title: "手作精品款牛皮手提黑包",
        img: "../../images/timg.jpg",
        price: 99,
        like: 123
      },
      {
        title: "手作精品款牛皮手提黑包",
        img: " ../../images / timg.jpg",
        price: 99,
        like: 123
      },
      {
        title: "手作精品款牛皮手提黑包",
        img: " ../../images / timg.jpg",
        price: 99,
        like: 123
      },
    ],
    classList:[
      {rid:1,num:123,name:"喜欢"},
      {rid:2,num:13,name:"收藏"},
      {rid:3,num:123,name:"设计馆"}
    ],
    Theme_goods: [
      {img:"../../images/timg.jpg"},
      {img:"../../images/timg.jpg"},
      {img:"../../images/timg.jpg"},
      {img:"../../images/timg.jpg"},
      {img:"../../images/timg.jpg"}
    ],

  },
  //切换类别
  classTap(e){
    console.log(e.currentTarget.dataset.rid)
    this.setData({
      classInfo: e.currentTarget.dataset.rid
    })
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
  /**
   * 监听页面的滑动
   */
  onPageScroll(e) {

    console.log(e.scrollTop)
    if (e.scrollTop > 245) {
      this.setData({
        sotrF: true
      })
    } else if (e.scrollTop <= 245) {
      this.setData({
        sotrF: false
      })
    }

  },
  //跳转到设置页面
  setTap() {
    wx.navigateTo({
      url: '../settings/settings',
    })
  },
  //跳转到优惠券
  couponTap() {
    wx.navigateTo({
      url: '../coupon/coupon',
    })
  }
})