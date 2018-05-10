// pages/cart/cart.js.js
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')

// 获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    newestProducts:[123,1,1],
    checked_all: false,
    cartList: [],
    checkedItem: [],
    cartTotalCount: 0,
    totalAmount: 0.00.toFixed(2)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 购物车列表
   */
  getCartList: function () {
    const that = this
    const params = {}

    http.fxGet(api.cart, params, function (result) {
      if (result.success) {
        that.setData({
          cartList: result.data.items
        })
      }
    })
  },

  /**
   * 去结算
   */
  handleCheckout (e) {
    let checkedItems = []
    for (let item of this.data.cartList) {
      if (item.checked) {
        checkedItems.push(item)
      }
    }
    if (!checkedItems.length) {
      wx.showModal({
        title: '提示',
        content: '请选择要结算的商品',
        showCancel: false,
        confirmColor: '#f56c6c',
        success: function (res) {
          if (res.confirm) {
            return false
          }
        }
      })
      return false
    }
    app.globalData.checkedBuyItems = checkedItems

    wx.navigateTo({
      url: '../checkout/checkout',
    })
  },

  /**
   * 小计
   */
  recalculateSubtotal () {
    let totalAmount = 0
    for (let item of this.data.cartList) {
      if (item.checked) {
        if (item.product.sale_price > 0) {
          totalAmount += item.product.sale_price * item.quantity
        } else {
          totalAmount += item.product.price * item.quantity
        }
      }
    }
    this.setData({
      totalAmount: totalAmount.toFixed(2)
    })
  },

  /**
   * 移除明细
   */
  handleRemoveEvent (e) {
    const that = this
    let rid = e.currentTarget.dataset.rid
    let params = {}

    let cartTmpList = []
    for (let item of this.data.cartList) {
      if (item.rid != rid) {
        cartTmpList.push(item)
      }
    }

    http.fxPost(api.cart_remove.replace(/:rid/g, rid), params, function (result) {
      if (result.success) {
        that.setData({
          cartTotalCount: result.data.item_count,
          cartList: cartTmpList
        })
      } else {
        wx.showToast({
          title: '删除失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
     
  },
  
  /**
   * 是否选中
   */
  handleCheckEvent (e) {
    let rid = e.currentTarget.dataset.rid
    let idx = 0
    let checked = false
    let checked_idx = 0
    for (const item of this.data.cartList) {
      if (item.rid == rid) {
        checked = item.checked
        checked_idx = idx
      }
      idx += 1
    }

    let params = {}
    let key = 'cartList[' + checked_idx + '].checked'
    params[key] = !checked

    this.setData(params)

    // 重新小计
    this.recalculateSubtotal()

    // 检测是否全选状态
    let checked_all = false
    // 当前全选状态，验证是否取消全选
    let tmplist = this.data.cartList.filter(function (item) {
      if (item.checked) {
        return item
      }
    })
    // 设置为全选
    if (tmplist.length == this.data.cartList.length) {
      checked_all = true
    }
    this.setData({
      checked_all: checked_all
    })
  },

  /**
   * 全选 / 取消全选
   */
  handleAllCheckEvent (e) {
    const checked_all = !this.data.checked_all
    
    let cartTmpList = []
    for (let item of this.data.cartList) {
      item.checked = checked_all
      cartTmpList.push(item)
    }
    
    this.setData({
      checked_all: checked_all,
      cartList: cartTmpList
    })

    // 重新小计
    this.recalculateSubtotal()
  },

  /**
   * 改变数量
   */
  handleChangeQuantity (e) {
    let quantity = e.detail.value
    let rid = e.currentTarget.dataset.rid
    
    let cartTmpList = []
    for (let item of this.data.cartList) {
      if (item.rid == rid) {
        item.quantity = quantity
      }
      cartTmpList.push(item)
    }

    this.setData({
      cartList: cartTmpList
    })

    // 重新小计
    this.recalculateSubtotal()
  },
  /**
   * 去挑选商品
   */
  handleGoChoose () {
    console.log(234)
    wx.switchTab({
      url: '../index/index'
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
    this.getCartList()
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
  
  }
})