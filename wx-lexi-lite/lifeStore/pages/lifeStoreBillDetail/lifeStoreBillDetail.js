/**
 * 生活馆管理
 */
const app = getApp()

const http = require('./../../../utils/http.js')
const api = require('./../../../utils/api.js')
const utils = require('./../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    sid: '',
    record_id: '', // 对账单id
    showModal: false,
    lifeStore: {}, // 生活馆信息
    cashRecord: {
      actual_amount: 0, // 提现金额
      created_at: '', // 提现时间
      order_info: {},
      receive_target: 1, // 提现到 1、微信零钱包
      record_id: 1, // 记录id
      service_fee: 0, // 服务费
      status: 1 // 提现状态 1、审核中 2、成功 3、失败
    },
    dateKeys: [],
    ordersList: {},

    // 收益详情
    currentOrder: {},
    incomeDetail: {}
  },

  /**
   * 查看收益详情
   */
  handleIncomeDetail (e) {
    let rid = e.currentTarget.dataset.rid
    let idx = e.currentTarget.dataset.idx
    let dkey = e.currentTarget.dataset.dkey
    utils.logger(dkey)
    utils.logger(this.data.ordersList)
    this.setData({
      showModal: true,
      currentOrder: this.data.ordersList[dkey][idx]
    })

    http.fxGet(api.life_store_income_detail.replace(/:rid/, rid), {
      store_rid: this.data.sid
    }, (res) => {
      utils.logger(res, '收益详情')
      if (res.success) {

        let _items = res.data.items.map(item => {
          item.product_name = utils.truncate(item.product_name, 12)
          return item
        })
        res.data.items = _items
        this.setData({
          incomeDetail: res.data
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },
  
  /**
   * 获取对账单详情
   */
  getStoreBillDetail() {
    http.fxGet(api.life_store_statement_detail, { store_rid: this.data.sid, record_id: this.data.record_id }, (res) => {
      utils.logger(res, '对账单详情')
      if (!res.success) {
        utils.fxShowToast(res.status.message)
        return
      }
      let record = res.data.life_cash_record_dict
      let dateKeys = []
      let _orderList = {}
      if (record) {
        record['created_at'] = utils.timestamp2string(record['created_at'])
        record['actual_account_amount'] = record['actual_account_amount'].toFixed(2)
        record['service_fee'] = record['service_fee'].toFixed(2)

        dateKeys = Object.keys(record.order_info)

        Object.keys(record.order_info).map(month => {
          let _orders = Object.keys(record.order_info[month]).map(o => {
            let _order = {
              rid: o,
              commission_price: record.order_info[month][o].commission_price, // 收益
              created_at: utils.timestamp2string(record.order_info[month][o].created_at, 'second') // 创建时间
            }
            return _order
          })
          _orderList[month] = _orders
        })
      }
      utils.logger(_orderList)

      this.setData({
        'dateKeys': dateKeys,
        'cashRecord': record,
        'ordersList': _orderList
      })
    })
  },

  /**
   * 获取生活馆信息
   */
  getStoreInfo() {
    http.fxGet(api.life_store, {
      rid: this.data.sid
    }, (res) => {
      utils.logger(res, '生活馆信息')
      if (res.success) {
        this.setData({
          lifeStore: res.data
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 对账单id
    let record_id = options.record_id
    this.setData({
      record_id: record_id
    })

    const lifeStore = wx.getStorageSync('lifeStore')
    // 小B商家获取自己生活馆
    if (lifeStore.isSmallB) {
      this.setData({
        sid: lifeStore.lifeStoreRid
      })

      this.getStoreInfo()
      this.getStoreBillDetail()
    } else {
      // 如不是小B商家，则跳转至首页
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this
    setTimeout(() => {
      that.setData({
        isLoading: false
      })
    }, 350)
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
  }
})