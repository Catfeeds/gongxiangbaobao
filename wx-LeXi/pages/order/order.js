// pages/order/order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //订单
    order: [
      // 订单数量
      {
        rid: 1,
        orderTime: 1,//订单剩余时间
        status: 0,//订单状态 0为待付款 1为确认收获 2为去评价 3为删除订单 4为删除订单
        //商家数量
        shopList: [
          {
            shopPhoto: "http://g.search3.alicdn.com/img/i3/126254119/TB2zTt6msrI8KJjy0FhXXbfnpXa_!!0-saturn_solar.jpg_220x220.jpg",
            shopGoodsList: [
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
                img: "http://g.search3.alicdn.com/img/i3/126254119/TB2zTt6msrI8KJjy0FhXXbfnpXa_!!0-saturn_solar.jpg_220x220.jpg",
                color: "白色",
                repertoryNumber: 12,//库存数量
                size: "M",
              },
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
                img: "http://g.search3.alicdn.com/img/i3/25828066/TB2e0H0hb9YBuNjy0FgXXcxcXXa_!!0-saturn_solar.jpg_220x220.jpg",
                color: "白色",
                repertoryNumber: 12,//库存数量
                size: "M",
              },
            ]

          },
        ]
      },
      {
        rid: 2,
        status: 1,//订单状态 0为待付款 1为确认收获 2为去评价 3为删除订单 4为删除订单
        //商家数量
        shopList: [
          {
            shopPhoto: "http://g.search3.alicdn.com/img/i3/126254119/TB2zTt6msrI8KJjy0FhXXbfnpXa_!!0-saturn_solar.jpg_220x220.jpg",
            shopGoodsList: [
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
                img: "http://g.search3.alicdn.com/img/i3/25828066/TB2e0H0hb9YBuNjy0FgXXcxcXXa_!!0-saturn_solar.jpg_220x220.jpg",
                color: "白色",
                repertoryNumber: 12,//库存数量
                size: "M",
              },
            ]

          },
          {
            shopPhoto: "http://g.search3.alicdn.com/img/i3/126254119/TB2zTt6msrI8KJjy0FhXXbfnpXa_!!0-saturn_solar.jpg_220x220.jpg",
            shopGoodsList: [
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
                img: "http://g.search3.alicdn.com/img/i3/25828066/TB2e0H0hb9YBuNjy0FgXXcxcXXa_!!0-saturn_solar.jpg_220x220.jpg",
                color: "白色",
                repertoryNumber: 12,//库存数量
                size: "M",
              },
            ]

          },

        ]
      },
      {
        rid: 3,
        status: 2,//订单状态 0为待付款 1为确认收获 2为去评价 3为删除订单 4为删除订单
        //商家数量
        shopList: [
          {
            shopPhoto: "http://g.search3.alicdn.com/img/i3/126254119/TB2zTt6msrI8KJjy0FhXXbfnpXa_!!0-saturn_solar.jpg_220x220.jpg",
            shopGoodsList: [
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
                img: "http://g.search3.alicdn.com/img/i3/25828066/TB2e0H0hb9YBuNjy0FgXXcxcXXa_!!0-saturn_solar.jpg_220x220.jpg",
                color: "白色",
                repertoryNumber: 12,//库存数量
                size: "M",
              },
            ]

          },
        ]
      },
      {
        rid: 4,
        status: 4,//订单状态 0为待付款 1为确认收获 2为去评价 3为删除订单 4为删除订单
        //商家数量
        shopList: [
          {
            shopPhoto: "http://g.search3.alicdn.com/img/i3/126254119/TB2zTt6msrI8KJjy0FhXXbfnpXa_!!0-saturn_solar.jpg_220x220.jpg",
            shopGoodsList: [
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
                img: "http://g.search3.alicdn.com/img/i3/25828066/TB2e0H0hb9YBuNjy0FgXXcxcXXa_!!0-saturn_solar.jpg_220x220.jpg",
                color: "白色",
                repertoryNumber: 12,//库存数量
                size: "M",
              },
            ]

          },
        ]
      },
      {
        rid: 5,
        status: 4,//订单状态 0为待付款 1为确认收获 2为去评价 3为删除订单 4为删除订单
        //商家数量
        shopList: [
          {
            shopPhoto: "http://g.search3.alicdn.com/img/i3/126254119/TB2zTt6msrI8KJjy0FhXXbfnpXa_!!0-saturn_solar.jpg_220x220.jpg",
            shopGoodsList: [
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
                img: "http://g.search3.alicdn.com/img/i3/25828066/TB2e0H0hb9YBuNjy0FgXXcxcXXa_!!0-saturn_solar.jpg_220x220.jpg",
                color: "白色",
                repertoryNumber: 12,//库存数量
                size: "M",
              },
            ]

          },
        ]
      },
    ],
    navList: [
      { title: '全部', status: 0 },
      { title: '待付款', status: 1 },
      { title: '待发货', status: 5 },
      { title: '待收货', status: 10 },
      { title: '待评价', status: 20 }
    ],
    currentStatus: 0

  },
  //时间处理函数
  timeFn(e, fn) {
    var cureentTime = e - new Date().getTime()
    // console.log(e, new Date().getTime(),45)
    if (cureentTime >= 600000) {
      var date = new Date(cureentTime)
      let m = date.getMinutes() >= 10 ? date.getMinutes() : "0" + date.getMinutes()
      let s = date.getSeconds() >= 10 ? date.getSeconds() : "0" + date.getSeconds()
      let _time = m + ":" + s
      fn(_time)
    } else (
      fn(0)
    )
  },
  //选择
  handleStatus(e) {
    let status = e.currentTarget.dataset.status;

    let currentTab = this.data.navList.filter(function (item) {
      return item.status == status
    })

    this.setData({
      page: 1,
      loadingMoreHidden: true,
      currentStatus: status,
      statusTitle: currentTab[0].title
    })

    // this.getOrderList()
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var timeContainer = setInterval(() => {
      this.timeFn(536988758595, (e) => {
        if (e <= 0) {
          clearInterval(timeContainer)
          return
        }
        // 赋值给页面时间
        this.data.order.forEach((v, i, a) => {
          if (v.orderTime) {
            var pageTime = "order[" + i + "].orderTime"
            console.log(pageTime)
            this.setData({
              [pageTime]: e
            })
          }
        })
      })
    }, 1000)
  },
  //删除订单
  celeteOrderTap(e) {
    var rid = e.currentTarget.dataset.rid
    wx.showModal({
      title: '确认删除订单？',
      content: '订单删除后将无法还原',
      confirmColor:"#007AFF",
      cancelColor:"#007AFF",
      success: (res) => {
        if (res.confirm) {
          var newOrder = this.data.order.filter((v, i) => {
            return v.rid != rid
          })
          this.setData({
            order: newOrder
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
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

  },
  critiqueTap(){
    wx.navigateTo({
      url: '../critique/critique',
    })
  }
})