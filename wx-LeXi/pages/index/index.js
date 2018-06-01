//index.js
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    coupon_show:false,
    //购物车
    shoppingCart: [
      {
        id: 6,
        title: "图像加载被中断//运费信息：//运费信息：0为没有运费用，包邮，其他为运费的价格//运费信息：0为没有运费用，包邮，其他为运费的价格//运费信息：0为没有运费用，包邮，其他为运费的价格//运费信息：0为没有运费用，包邮，其他为运费的价格0为没有运费用，包邮，其他为运费的价格",
        currentPrice: 500,
        originPrice: 999,
        logisticsExpenses: 0,//运费信息：0为没有运费用，包邮，其他为运费的价格
        is_like: true,//是否喜欢
        is_likeNumber: 66,//喜欢的人数
        shopName: "bbq_BBQ_123亲",//店铺名称
        shopingNumber: 1,//购买的数量
        img: "http://www.hzxznjs.com/uploads/160728/1-160HQ64603a7.jpg",
        color: "白色",
        repertoryNumber: 12,
        size: "M"
      },
      {
        id: 5,
        title: "	图像加载被中断",
        currentPrice: 500,
        originPrice: 321,
        logisticsExpenses: 9,//运费信息：0为没有运费用，包邮，其他为运费的价格
        is_like: true,//是否喜欢
        is_likeNumber: 66,//喜欢的人数
        shopName: "bbq_BBQ_123亲",//店铺名称
        shopingNumber: 1,//购买的数量
        img: "http://www.hzxznjs.com/uploads/160728/1-160HQ64603a7.jpg",
        repertoryNumber: 10
      },
      {
        id: 4,
        title: "	图像加载被中断",
        currentPrice: 500.99,
        // originPrice: 666,
        logisticsExpenses: 0,//运费信息：0为没有运费用，包邮，其他为运费的价格
        is_like: true,//是否喜欢
        is_likeNumber: 66,//喜欢的人数
        shopName: "bbq_BBQ_123亲",//店铺名称
        shopingNumber: 1,//购买的数量
        img: "http://www.hzxznjs.com/uploads/160728/1-160HQ64603a7.jpg",
        color: "绿色",
        repertoryNumber: 13
      }
    ],
    // 主打设计
    Theme_goods: [
      {},
      {},
      {},
      {},
      {}
    ],

    logo: "../../images/timg.jpg",
    tabPisition: false,//tab是否定位
    catgory: [
      { name: "精品", rid: 1 },
      { name: "作品", rid: 2 },
      { name: "人气", rid: 3 }
    ],//分类
    catgoryActive: 1//分类的选项

  },

  //分类选项的函数
  catgoryActiveTap(e) {
    console.log(e.currentTarget.dataset.rid)
    this.setData({
      catgoryActive: e.currentTarget.dataset.rid
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
  //监听页面的滚动
  onPageScroll: function (e) {
    console.log(e)
    if (e.scrollTop >= 464) {
      this.setData({
        tabPisition: true
      })
    } else if (e.scrollTop < 464) {
      this.setData({
        tabPisition: false
      })
    }
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

  //跳转到关于品牌页面
  brandInformationTap() {
    console.log(11)
    wx.navigateTo({
      url: '../brandInformation/brandInformation'
    })
  },

  //跳转到商品详情
  prodctTap() {
    wx.navigateTo({
      url: '../product/product',
    })
  }
  ,
  //跳转到关注页面
  wacthTap() {
    wx.navigateTo({
      url: '../watch/watch',
    })
  },
  //优惠卷隐藏和显示
  coupon_show() {
    this.setData({
      coupon_show: true
    })
  }
})