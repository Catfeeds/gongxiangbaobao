const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')

// 获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wishlist: [],
    page: 1,
    per_page: 10,
    loadingMoreHidden: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getWishlist()
  },

  /**
   * 获取收藏列表
   */
  getWishlist () {
    const that = this
    let params = {
      page: this.data.page,
      per_page: this.data.per_page
    }

    http.fxGet(api.wishlist, params, function (res) {
      if (res.success) {
        // 没有下一页了
        if (!res.data.next) {
          that.setData({
            loadingMoreHidden: false
          })
        }

        let products = that.data.products
        if (that.data.page > 1) {
          // 合并数组
          products.push.apply(products, res.data.products)
        } else {
          products = res.data.products
        }

        that.setData({
          wishlist: products
        })
      }
    })
  },

  /**
   * 移除收藏
   */
  handleRemoveFavorite (e) {
    const that = this
    let rid = e.currentTarget.dataset.rid
    let params = {
      rid: rid
    }
    http.fxPost(api.wishlist_remove, params, function (res) {
      if (res.success) {
        wx.showToast({
          title: '移除成功',
          icon: 'success',
          duration: 2000
        })
        let newWishlist = that.data.wishlist.filter(function (item) {
          if (item.rid != rid) {
            return item
          }
        })
        that.setData({
          wishlist: newWishlist
        })
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
    if (this.data.loadingMoreHidden) {
      let page = this.data.page + 1
      this.setData({
        page: page
      })
      this.getWishlist()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})