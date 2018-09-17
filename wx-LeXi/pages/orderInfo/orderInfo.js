
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    rid: '',
    orderInfo: {}, // 订单信息
    // 购物车
    shoppingCart: [
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

  },

  // 获取订单详情 core_orders_rid 
  getOrderDetail() {
    http.fxGet(api.orders_after_payment_rid.replace(/:rid/, this.data.rid), {}, (result) => {
      console.log(result, '订单详情')
      if (result.success) {
        result.data.created_item = utils.timestamp2string(result.data.created_at, "cn")
        this.setData({
          orderInfo: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      rid: options.rid
    })

    this.getOrderDetail()
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
    return app.shareLeXi()
  },

  // 物流跟踪
  logisticsTap(e) {

    let code = e.currentTarget.dataset.code
    let logisticsNumber = e.currentTarget.dataset.logisticsNumber
    let expressName = e.currentTarget.dataset.expressName

    wx.navigateTo({
      url: '../logisticsWatch/logisticsWatch?code=' + code + '&&logisticsNumber=' + logisticsNumber + '&&expressName=' + expressName
    })

  }
})