// pages/cart/cart.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //falseheckbox
    falseheckbox: false,
    //选中的物品
    checkboxPick: [],
    //购物车是否编辑
    changeCart: false,
    //应该支付的总金额
    payment: 0,
    //添加到购物车的内容产品内容
    shoppingCart: [
      {
        id: 6,
        title: "图像加载被中断",
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


    // 心愿单的内容
    thinkOrder: [
      {
        id: 0,
        title: "图像加载被中断",
        currentPrice: 500,
        originPrice: 999,
        logisticsExpenses: 5,//运费信息：0为没有运费用，包邮，其他为运费的价格
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
        id: 1,
        title: "	图像加载被中断",
        currentPrice: 500,
        originPrice: 321,
        logisticsExpenses: 9,//运费信息：0为没有运费用，包邮，其他为运费的价格
        is_like: true,//是否喜欢
        is_likeNumber: 66,//喜欢的人数
        shopName: "bbq_BBQ_123亲",//店铺名称
        shopingNumber: 1,//购买的数量
        img: "http://www.hzxznjs.com/uploads/160728/1-160HQ64603a7.jpg",
        repertoryNumber: 10//仓储数量
      },
      {
        id: 2,
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
        repertoryNumber: 0
      }
    ],

  },
  //编辑按钮点击后左边的选择,赋值给data
  checkboxChange(e) {
    this.setData({
      checkboxPick: e.detail.value
    })
  },

  //当点击移除按钮后

  clearCart() {
    var deleteCart = this.data.shoppingCart.filter((value, index) => {
      return this.data.checkboxPick.indexOf(String(value.id)) == -1
    })
    this.setData({
      falseheckbox: false,
      shoppingCart: deleteCart
    })
    //重新计算
    this.paymentPrice()

  },



  //购物车点击移除按钮
  cartClearTap(e) {
    var cartAllInfo = []

    var btnType = e.currentTarget.dataset.type

    if (btnType == "clear") {
      this.clearCart()

    } else if (btnType == "addThink") {
      //清楚购物车里面的
      // this.clearCart()
      var addThinkOrder = this.data.shoppingCart.filter((value, index) => {
        return this.data.checkboxPick.indexOf(String(value.id)) != -1
      })
      //添加到心愿单
      this.setData({
        thinkOrder: this.data.thinkOrder.concat(addThinkOrder)
      })
      this.clearCart()
    }
  },
  //编辑按钮购物车
  changeCartTap(e) {
    var status = e.currentTarget.dataset.change
    console.log(e.currentTarget.dataset.change)
    if (status == "start") {
      this.setData({
        changeCart: true
      })
    } else if (status == "over") {
      this.setData({
        changeCart: false
      })
    }
  },
  // 应该支付的总金额
  paymentPrice() {
    this.setData({
      payment: 0
    })
    this.data.shoppingCart.map((value, index) => {
      this.setData({
        payment: ((this.data.payment * 100 + value.shopingNumber * value.currentPrice * 100) / 100).toFixed(2)
      })
    })
  },

  //改变数量
  changeNumberTap(e) {
    // console.log(e.detail.NeedNumber)
    this.data.shoppingCart.map((value, index) => {
      if (value.id == e.detail.id) {
        if (e.detail.NeedNumber < 1) {
          this.warn("亲", "不能再少了")
        } else if (e.detail.NeedNumber > 0 && e.detail.NeedNumber <= this.data.shoppingCart[index].repertoryNumber) {
          var a = "shoppingCart" + [index] + ".shopingNumber"
          this.setData({
            ["shoppingCart[" + index + "].shopingNumber"]: e.detail.NeedNumber
          })
        } else if (e.detail.NeedNumber > this.data.shoppingCart[index].repertoryNumber) {
          this.warn("亲", "货物不充足，哦")
        }
      }
    })
    this.paymentPrice()
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
    //计算金额
    this.paymentPrice()
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
  //去首页
  indexTap() {
    wx.switchTab({
      url: '../index/index',
    })
  },
  //提示信息
  warn(title, content) {
    wx.showModal({
      title: title,
      content: content,
    })
  }
})