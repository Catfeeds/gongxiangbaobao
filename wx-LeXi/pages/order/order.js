// pages/order/order.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Page({
  /**
   * 页面的初始数据 orders
   */
  data: {
    // 订单列表
    // orderList:[],
    allOrderList: [], //全部订单
    isNextAll: true, //全部是否有下页

    daifu: [], //代付款
    isNextDaifu: true,

    daifa: [], //代发货
    isNextDaifa: true,

    daishou: [], //待收货
    isNextdaishou: true, //待收货

    daiping: [], //待评价
    isNextDaiping: true, //待评价

    // navbar
    currentStatus: 0,
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

    // 请求订单需要的参数
    getOrderListParams: {
      status: 0, // Number	订单状态 0、全部 1、待发货 2、待收货 3、待评价 4、待付款
      page: 1, // Number	可选	1	当前页码
      per_page: 10 // Number	可选	10	每页数量
    },

    // 待付款
    dafuParams: {
      status: 4,
      page: 1,
      per_page: 10
    },

    // 待发货
    dafaParams: {
      status: 1,
      page: 1,
      per_page: 10
    },

    // 待收货
    daishouParams: {
      status: 2,
      page: 1,
      per_page: 10
    },

    // 评价
    pingjiaParams: {
      status: 3,
      page: 1,
      per_page: 10
    }
  },

  // 选择
  handleStatus(e) {
    console.log(e)
    let status = e.currentTarget.dataset.status
    this.setData({
      currentStatus: status
    })
    console.log(this.data.daifu, this.data.daifa, this.data.daishou, this.data.daiping)
  },

  // 查看订单详情
  handleViewDetail(e) {
    let rid = e.currentTarget.dataset.rid
    wx.navigateTo({
      url: '../orderInfo/orderInfo?rid=' + rid
    })
  },

  // 获取订单列表--- 
  getOrderList() {
    http.fxGet(api.orders, this.data.getOrderListParams, (result) => {
      console.log(result, '订单列表')
      if (result.success) {
        result.data.orders.forEach((v, i) => {
          //时间格式化
          v.created_item = utils.timestamp2string(v.created_at, "cn")

        })

        let allOrderList = this.data.allOrderList

        this.setData({
          allOrderList: allOrderList.concat(result.data.orders),
          isNextAll: result.data.next
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 代付款--- 
  getDaifuList() {
    http.fxGet(api.orders, this.data.dafuParams, (result) => {
      console.log(result, '代付列表')
      if (result.success) {
        result.data.orders.forEach((v, i) => {
          //时间格式化
          v.created_item = utils.timestamp2string(v.created_at, "cn")
        })

        let daifuList = this.data.daifu

        this.setData({
          daifu: daifuList.concat(result.data.orders),
          isNextDaifu: result.data.next
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 代发货列表--- 
  getDaifaList() {
    http.fxGet(api.orders, this.data.dafaParams, (result) => {
      console.log(result, '代发列表')
      if (result.success) {
        result.data.orders.forEach((v, i) => {
          //时间格式化
          v.created_item = utils.timestamp2string(v.created_at, "cn")
        })

        let daifaList = this.data.daifa
        this.setData({
          daifa: daifaList.concat(result.data.orders),
          isNextDaifa: result.data.next
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 代收获列表--- 
  getDaishouList() {
    http.fxGet(api.orders, this.data.daishouParams, (result) => {
      console.log(result, '代收列表')
      if (result.success) {
        result.data.orders.forEach((v, i) => {
          //时间格式化
          v.created_item = utils.timestamp2string(v.created_at, "cn")
        })

        let daishouList = this.data.daishou
        this.setData({
          daishou: daishouList.concat(result.data.orders),
          isNextdaishou: result.data.next
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 代收获列表--- 
  getPingjiaList() {
    http.fxGet(api.orders, this.data.pingjiaParams, (result) => {
      console.log(result, '评价列表')
      if (result.success) {
        result.data.orders.forEach((v, i) => {
          //时间格式化
          v.created_item = utils.timestamp2string(v.created_at, "cn")
        })

        let daipingList = this.data.daiping
        this.setData({
          daiping: daipingList.concat(result.data.orders),
          isNextDaiping: result.data.next
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 付款
  paymentBtn(e) {
    console.log(e)
    console.log(e.currentTarget.dataset)
    // let order = this.data.orderList.orders[e.currentTarget.dataset.order]
    let order = e.currentTarget.dataset
    let rid = order.rid
    console.log(order.rid)

    // 补充参数
    app.globalData.orderParams.rid = order.rid
    app.globalData.orderParams.authAppid = app.globalData.configInfo.authAppid
    app.globalData.orderParams.openid = app.globalData.jwt.openid

    // 获取订单签名
    http.fxPost(api.order_prepay_sign, app.globalData.orderParams, (result) => {
      console.log(result)
      if (result.success) {
        
        app.wxpayOrder(order.rid, result.data)
        let allshouhuoData = this.data.allOrderList
        allshouhuoData.forEach((v, i) => {
          if (v.rid == rid) {
            allshouhuoData.splice(i, 1)
            this.setData({
              allOrderList: allshouhuoData
            })
          }
        })

        let daifuData = this.data.daifu
        daifuData.forEach((v, i) => {
          if (v.rid == rid) {
            daifuData.splice(i, 1)
            this.setData({
              daifu: daifuData
            })
          }
        })

        this.getDaishouList() // 获取待收货列表---
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  //确认收货
  handleReceive(e) {
    console.log(e, "确认收货的e")
    let rid = e.currentTarget.dataset.rid
    let idx = e.currentTarget.dataset.index
    console.log(idx, rid)

    http.fxPost(api.order_signed, {
      rid: rid
    }, (result) => {
      console.log(result, "确认收货")

      if (result.success) {
        let allshouhuoData = this.data.allOrderList
        allshouhuoData.forEach((v, i) => {
          if (v.rid == rid) {
            allshouhuoData.splice(i, 1)
            this.setData({
              allOrderList: allshouhuoData
            })
          }
        })

        let daishouData = this.data.daishou
        daishouData.forEach((v, i) => {
          if (v.rid == rid) {
            daishouData.splice(i, 1)
            this.setData({
              daishou: daishouData
            })
          }
        })

        this.getPingjiaList() // 评价
      } else {
        utils.fxShowToast(result.status.message)
      }
    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  // 删除订单
  deleteOrderTap(e) {
    let rid = e.currentTarget.dataset.rid
    wx.showModal({
      title: '确认删除订单？',
      content: '订单删除后将无法还原',
      confirmColor: "#007AFF",
      cancelColor: "#007AFF",
      success: (res) => {
        if (res.confirm) {
          http.fxDelete(api.orders_delete, {
            rid: rid
          }, (result) => {
            console.log(result, '删除订单')
            if (result.success) {
              let allshouhuoData = this.data.allOrderList
              allshouhuoData.forEach((v, i) => {
                if (v.rid == rid) {
                  allshouhuoData.splice(i, 1)
                  this.setData({
                    allOrderList: allshouhuoData
                  })
                }
              })

              let daipingData = this.data.daiping
              daipingData.forEach((v, i) => {
                if (v.rid == rid) {
                  daipingData.splice(i, 1)
                  this.setData({
                    daiping: daipingData
                  })
                }
              })

            } else {
              utils.fxShowToast(result.status.message)
            }
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
    // this.setData({
    //   'getOrderListParams.page': 1,
    //   orderList: [],
    // })
    this.getOrderList() // 获取订单列表---
    this.getDaifaList() // 获取待发列表---
    this.getDaishouList() // 获取待收货列表---
    this.getPingjiaList() // 评价
    this.getDaifuList() // 待付款
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
    //全部
    if (this.data.currentStatus == 0) {
      if (this.data.isNextAll == null) {
        utils.fxShowToast('没有更多了')
        return
      }
      this.setData({
        ['getOrderListParams.page']: this.data.getOrderListParams.page + 1
      })

      this.getOrderList()
    }


    if (this.data.currentStatus == 1) {
      if (this.data.isNextDaifa == null) {
        utils.fxShowToast('没有更多了')
        return
      }
      this.setData({
        ['dafaParams.page']: this.data.dafaParams.page + 1
      })

      this.getDaifaList() // 获取待发列表---
    }

    if (this.data.currentStatus == 2) {

      if (this.data.isNextdaishou == null) {
        utils.fxShowToast('没有更多了')
        return
      }
      this.setData({
        ['daishouParams.page']: this.data.daishouParams.page + 1
      })

      this.getDaishouList() // 获取待收货列表---

    }

    if (this.data.currentStatus == 3) {
      if (this.data.isNextDaiping == null) {
        utils.fxShowToast('没有更多了')
        return
      }
      this.setData({
        ['pingjiaParams.page']: this.data.pingjiaParams.page + 1
      })

      this.getPingjiaList() // 评价
    }

    if (this.data.currentStatus == 4) {

      if (this.data.isNextDaifu == null) {
        utils.fxShowToast('没有更多了')
        return
      }
      this.setData({
        ['dafuParams.page']: this.data.dafuParams.page + 1
      })
    }

    this.getDaifuList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return app.shareLeXi()
  },

  // 评论
  critiqueTap(e) {
    console.log(e.currentTarget.dataset.product)
    // 传输要评论的东西
    app.globalData.critiqueProduct = e.currentTarget.dataset.product
    wx.navigateTo({
      url: '../critique/critique',
    })
  },

  // 物流跟踪
  logTop(e) {
    console.log(e)
    let code = e.currentTarget.dataset.code
    let logisticsNumber = e.currentTarget.dataset.logisticsNumber
    let expressName = e.currentTarget.dataset.expressName

    wx.navigateTo({
      url: '../logisticsWatch/logisticsWatch?code=' + code + '&&logisticsNumber=' + logisticsNumber + '&&expressName=' + expressName
    })
  }
})