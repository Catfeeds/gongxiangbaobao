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
    orderList:[],
    // navbar
    navList: [
      {
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
      status: 0, // Number	订单状态 0、全部 1、待发货 2、待收货 3、待评价 4、待付款
      page: 1, // Number	可选	1	当前页码
      per_page: 10 // Number	可选	10	每页数量
    }
  },

  // 选择
  handleStatus(e) {
    let status = e.currentTarget.dataset.status
    this.setData({
      currentStatus: status
    })
  },

  // 查看订单详情
  handleViewDetail (e) {
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
        result.data.orders.forEach((v,i)=>{
          //时间格式化
          v.created_item = utils.timestamp2string(v.created_at,"cn")
          
          if (result.data.orders.length-1==i){
            let newData = this.data.orderList

            result.data.orders.forEach((v)=>{
              newData.push(v)
            })

            this.setData({
              orderList: newData,
              isNext: result.data.next
            })

          }
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 付款
  paymentBtn(e){
    console.log(e.currentTarget.dataset.order)
    let order = this.data.orderList.orders[e.currentTarget.dataset.order]
    console.log(order)

    // 补充参数
    app.globalData.orderParams.rid = order.rid
    app.globalData.orderParams.authAppid = app.globalData.configInfo.authAppid
    app.globalData.orderParams.openid = app.globalData.jwt.openid
    
    // 获取订单签名
    http.fxPost(api.order_prepay_sign, app.globalData.orderParams, (result) => {
      console.log(result)
      if(result.success){
        app.wxpayOrder(order.rid, result.data)
        this.getOrderList()
      }else{
        utils.fxShowToast(result.status.message)
      }
    })
  },

  handleReceive(e){
    let rid = e.currentTarget.dataset.rid
    let idx = e.currentTarget.dataset.index
    console.log(idx, rid)

    http.fxPost(api.order_signed,{rid:rid}, (result)=>{
      console.log(result,"确认收货")

      if(result.success){
        
        this.setData({
          // ['orderList[' + idx + '].user_order_status']: 3
          orderList:[],
        })

        this.getOrderList()

      }else{

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
              this.setData({
                orderList: [],
              })

              this.getOrderList()
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
    this.setData({
      'getOrderListParams.page':1,
      orderList: [],
    })
    this.getOrderList() // 获取订单列表---
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
    if(this.data.isNext==null){
      utils.fxShowToast('没有更多了')
      return
    }
    this.setData({
      ['getOrderListParams.page']: this.data.getOrderListParams.page + 1
    })

    this.getOrderList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

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