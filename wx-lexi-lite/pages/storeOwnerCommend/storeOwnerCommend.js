// pages/storeOwnerCommend/storeOwnerCommend.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
const common = require('./../../utils/common.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sid: '',
    storeProducts: [],
    params: {
      page: 1,
      per_page: 10,
      sid: '',
      is_distributed: 2,
      user_record: 1
    }
  },

  // 点击喜欢或者删除喜欢
  handleBindLike(e) {
    let idx = e.currentTarget.dataset.index
    let rid = e.currentTarget.dataset.id
    let isLike = e.currentTarget.dataset.islike

    // 是否登陆
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return
    }

    if (isLike) {
      // 喜欢，则删除
      http.fxDelete(api.userlike, {
        rid: rid
      }, (result) => {
        if (result.success) {
          this.setData({
            ['storeProducts[' + idx + '].is_like']: false,
            ['storeProducts[' + idx + '].like_count']: this.data.storeProducts[idx].like_count - 1,
            ['storeProducts[' + idx + '].product_like_users[0].avatar']: '',

          })
        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    } else {
      // 未喜欢，则添加
      http.fxPost(api.userlike, {
        rid: rid
      }, (result) => {
        if (result.success) {
          this.setData({
            ['storeProducts[' + idx + '].is_like']: true,
            ['storeProducts[' + idx + '].like_count']: this.data.storeProducts[idx].like_count + 1,
            ['storeProducts[' + idx + '].product_like_users[0].avatar']: app.globalData.userInfo.avatar
          })
        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    }
  },

  /**
   * 从生活馆删除某商品
   */
  handleRemoveFromStore(e) {
    let rid = e.currentTarget.dataset.rid
    let idx = e.currentTarget.dataset.idx
    let data = {
      sid: this.data.sid,
      rid: rid
    }

    wx.showModal({
      content: '你确认要下架此商品',
      cancelText: '删除',
      cancelColor: '#666',
      confirmText: '取消',
      confirmColor: '#5fe4b1',
      success: (res) => {
        if (res.cancel) { // 取消 与 确认 互换
          utils.logger('Delete, rid: ' + rid + ', idx: ' + idx)
          let _storeProducts = this.data.storeProducts
          let isEmpty = false
          utils.logger(_storeProducts)

          if (_storeProducts.length <= 1) {
            _storeProducts = []
            isEmpty = true
          } else {
            _storeProducts.splice(idx, 1)
          }

          this.setData({
            storeProducts: _storeProducts,
            isEmpty: isEmpty
          })


          http.fxDelete(api.life_store_delete_product, data, (result) => {
            utils.logger(result, '删除商品')
            if (result.success) {

            } else {
              utils.fxShowToast(result.status.message)
            }
          })
        }
      }
    })
  },

  /**
   * 获取生活馆商品列表
   */
  getStoreProducts() {

    http.fxGet(api.life_store_products, this.data.params, (res) => {
      utils.logger(res, '全部分销商品')
      if (res.success) {
        res.data.products.forEach(v => {
          if (typeof(v.stick_text) == 'object') {
            v.stick_text = false
          }
        })

        let _products = this.data.storeProducts
        if (this.data.page > 1) {
          // 合并数组
          _products.push.apply(_products, res.data.products)
        } else {
          _products = res.data.products
        }

        let isEmpty = false
        if (_products.length == 0) {
          isEmpty = true
        }

        this.setData({
          storeProducts: _products,
          isEmpty: isEmpty,
          isNextRecommend: res.data.next // 没有下一页了
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    this.setData({
      'params.sid': options.sid,
      sid: options.sid
    })
    this.getStoreProducts()
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

  }
})