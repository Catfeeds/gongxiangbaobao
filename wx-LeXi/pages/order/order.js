// pages/order/order.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
Page({

  /**17600351560
   * 页面的初始数据
   */
  data: {
    //订单
    order: [
      // 订单数量
      {
        rid: 1,
        orderTime: 1, //订单剩余时间
        status: 0, //订单状态 0为待付款 1为确认收获 2为去评价 3为删除订单 4为删除订单
        //商家数量
        shopList: [{
          shopPhoto: "http://g.search3.alicdn.com/img/i3/126254119/TB2zTt6msrI8KJjy0FhXXbfnpXa_!!0-saturn_solar.jpg_220x220.jpg",
          shopGoodsList: [{
              id: 6,
              title: "图像加载被中断",
              currentPrice: 500,
              originPrice: 999,
              logisticsExpenses: 0, //运费信息：0为没有运费用，包邮，其他为运费的价格
              is_like: true, //是否喜欢
              is_likeNumber: 66, //喜欢的人数
              shopName: "bbq_BBQ_123亲", //店铺名称
              shopingNumber: 1, //购买的数量
              img: "http://g.search3.alicdn.com/img/i3/126254119/TB2zTt6msrI8KJjy0FhXXbfnpXa_!!0-saturn_solar.jpg_220x220.jpg",
              color: "白色",
              repertoryNumber: 12, //库存数量
              size: "M",
            },
            {
              id: 6,
              title: "图像加载被中断",
              currentPrice: 500,
              originPrice: 999,
              logisticsExpenses: 0, //运费信息：0为没有运费用，包邮，其他为运费的价格
              is_like: true, //是否喜欢
              is_likeNumber: 66, //喜欢的人数
              shopName: "bbq_BBQ_123亲", //店铺名称
              shopingNumber: 1, //购买的数量
              img: "http://g.search3.alicdn.com/img/i3/25828066/TB2e0H0hb9YBuNjy0FgXXcxcXXa_!!0-saturn_solar.jpg_220x220.jpg",
              color: "白色",
              repertoryNumber: 12, //库存数量
              size: "M",
            },
          ]

        }, ]
      },
      {
        rid: 2,
        status: 1, //订单状态 0为待付款 1为确认收获 2为去评价 3为删除订单 4为删除订单
        //商家数量
        shopList: [{
            shopPhoto: "http://g.search3.alicdn.com/img/i3/126254119/TB2zTt6msrI8KJjy0FhXXbfnpXa_!!0-saturn_solar.jpg_220x220.jpg",
            shopGoodsList: [{
              id: 6,
              title: "图像加载被中断",
              currentPrice: 500,
              originPrice: 999,
              logisticsExpenses: 0, //运费信息：0为没有运费用，包邮，其他为运费的价格
              is_like: true, //是否喜欢
              is_likeNumber: 66, //喜欢的人数
              shopName: "bbq_BBQ_123亲", //店铺名称
              shopingNumber: 1, //购买的数量
              img: "http://g.search3.alicdn.com/img/i3/25828066/TB2e0H0hb9YBuNjy0FgXXcxcXXa_!!0-saturn_solar.jpg_220x220.jpg",
              color: "白色",
              repertoryNumber: 12, //库存数量
              size: "M",
            }, ]

          },
          {
            shopPhoto: "http://g.search3.alicdn.com/img/i3/126254119/TB2zTt6msrI8KJjy0FhXXbfnpXa_!!0-saturn_solar.jpg_220x220.jpg",
            shopGoodsList: [{
              id: 6,
              title: "图像加载被中断",
              currentPrice: 500,
              originPrice: 999,
              logisticsExpenses: 0, //运费信息：0为没有运费用，包邮，其他为运费的价格
              is_like: true, //是否喜欢
              is_likeNumber: 66, //喜欢的人数
              shopName: "bbq_BBQ_123亲", //店铺名称
              shopingNumber: 1, //购买的数量
              img: "http://g.search3.alicdn.com/img/i3/25828066/TB2e0H0hb9YBuNjy0FgXXcxcXXa_!!0-saturn_solar.jpg_220x220.jpg",
              color: "白色",
              repertoryNumber: 12, //库存数量
              size: "M",
            }, ]

          },

        ]
      },
      {
        rid: 3,
        status: 2, //订单状态 0为待付款 1为确认收获 2为去评价 3为删除订单 4为删除订单
        //商家数量
        shopList: [{
          shopPhoto: "http://g.search3.alicdn.com/img/i3/126254119/TB2zTt6msrI8KJjy0FhXXbfnpXa_!!0-saturn_solar.jpg_220x220.jpg",
          shopGoodsList: [{
            id: 6,
            title: "图像加载被中断",
            currentPrice: 500,
            originPrice: 999,
            logisticsExpenses: 0, //运费信息：0为没有运费用，包邮，其他为运费的价格
            is_like: true, //是否喜欢
            is_likeNumber: 66, //喜欢的人数
            shopName: "bbq_BBQ_123亲", //店铺名称
            shopingNumber: 1, //购买的数量
            img: "http://g.search3.alicdn.com/img/i3/25828066/TB2e0H0hb9YBuNjy0FgXXcxcXXa_!!0-saturn_solar.jpg_220x220.jpg",
            color: "白色",
            repertoryNumber: 12, //库存数量
            size: "M",
          }, ]

        }, ]
      },
      {
        rid: 4,
        status: 4, //订单状态 0为待付款 1为确认收获 2为去评价 3为删除订单 4为删除订单
        //商家数量
        shopList: [{
          shopPhoto: "http://g.search3.alicdn.com/img/i3/126254119/TB2zTt6msrI8KJjy0FhXXbfnpXa_!!0-saturn_solar.jpg_220x220.jpg",
          shopGoodsList: [{
            id: 6,
            title: "图像加载被中断",
            currentPrice: 500,
            originPrice: 999,
            logisticsExpenses: 0, //运费信息：0为没有运费用，包邮，其他为运费的价格
            is_like: true, //是否喜欢
            is_likeNumber: 66, //喜欢的人数
            shopName: "bbq_BBQ_123亲", //店铺名称
            shopingNumber: 1, //购买的数量
            img: "http://g.search3.alicdn.com/img/i3/25828066/TB2e0H0hb9YBuNjy0FgXXcxcXXa_!!0-saturn_solar.jpg_220x220.jpg",
            color: "白色",
            repertoryNumber: 12, //库存数量
            size: "M",
          }, ]

        }, ]
      },
      {
        rid: 5,
        status: 4, //订单状态 0为待付款 1为确认收获 2为去评价 3为删除订单 4为删除订单
        //商家数量
        shopList: [{
          shopPhoto: "http://g.search3.alicdn.com/img/i3/126254119/TB2zTt6msrI8KJjy0FhXXbfnpXa_!!0-saturn_solar.jpg_220x220.jpg",
          shopGoodsList: [{
            id: 6,
            title: "图像加载被中断",
            currentPrice: 500,
            originPrice: 999,
            logisticsExpenses: 0, //运费信息：0为没有运费用，包邮，其他为运费的价格
            is_like: true, //是否喜欢
            is_likeNumber: 66, //喜欢的人数
            shopName: "bbq_BBQ_123亲", //店铺名称
            shopingNumber: 1, //购买的数量
            img: "http://g.search3.alicdn.com/img/i3/25828066/TB2e0H0hb9YBuNjy0FgXXcxcXXa_!!0-saturn_solar.jpg_220x220.jpg",
            color: "白色",
            repertoryNumber: 12, //库存数量
            size: "M",
          }, ]

        }, ]
      },
    ],
    // navbar
    navList: [{
        title: '全部',
        status: 0
      },
      {
        title: '待付款',
        status: 4
      },
      {
        title: '待发货',
        status: 1
      },
      {
        title: '待收货',
        status: 2
      },
      {
        title: '待评价',
        status: 3
      }
    ],
    currentStatus: 0,
    // 请求订单需要的参数
    getOrderListParams: {
      status: 0, //Number	订单状态 0、全部 1、待发货 2、待收货 3、待评价 4、待付款
      page: 1, //Number	可选	1	当前页码
      per_page: 10 //Number	可选	10	每页数量
    }
  },


  //选择
  handleStatus(e) {
    let status = e.currentTarget.dataset.status;
    this.setData({
      currentStatus: status,
      ['getOrderListParams.status']: status
    }, () => {
      this.getOrderList()
    })
  },
  // 获取订单列表---
  getOrderList() {
    http.fxGet(api.orders, this.data.getOrderListParams, (result) => {
      console.log(result)
      if (result.success) {
        this.setData({
          order: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getOrderList() // 获取订单列表---

  },
  //删除订单
  celeteOrderTap(e) {
    var rid = e.currentTarget.dataset.rid
    wx.showModal({
      title: '确认删除订单？',
      content: '订单删除后将无法还原',
      confirmColor: "#007AFF",
      cancelColor: "#007AFF",
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

  },
  // 评论
  critiqueTap(e) {
    console.log(e.currentTarget.dataset.product)
    //传输要评论的东西
    app.globalData.critiqueProduct = e.currentTarget.dataset.product
    wx.navigateTo({
      url: '../critique/critique',
    })
  },
  // 物流跟踪
  logTop() {
    wx.navigateTo({
      url: '../logisticsWatch/logisticsWatch',
    })
  }
})