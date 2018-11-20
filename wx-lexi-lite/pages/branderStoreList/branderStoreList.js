// pages/branderStoreList/branderStoreList.js
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
    backBtnIsShow: false, // 回到顶部是否展现

    isLoading: true,
    readyOver: false, // 加载是否完成

    HighStoreAdvList: [], // 特色品牌管的头部广告
    seiperIndex: 0, // 轮播图选中的点
    HighStoreList: [], // 精选品牌列表
    categoryId: 1, // 分类的id
    isLoadProductShow: true, // 加载图片
    isNext: true, // 是否有下一页
    storeList: [], // 店铺的列表
    categoryList: [
      {
        name: '特色',
        num: 0,
        id: 1
      },
      {
        name: '精选',
        num: 0,
        id: 2
      }
    ],
    params: {
      page: 1, // Number	可选	1	当前页码
      per_page: 5 // Number	可选	10	每页数量
    },
    highParams: {
      page: 1, // Number	可选	1	当前页码
      per_page: 5 // Number	可选	10	每页数量
    }
  },

  // 切换分类
  handleChangeCategory(e) {
    utils.logger(e.currentTarget.dataset.id)
    this.setData({
      categoryId: e.currentTarget.dataset.id
    })
  },

  // 跳转 
  handleAdvLine(e){
    let link = e.currentTarget.dataset.link
    wx.navigateTo({
      url: '../branderStore/branderStore?rid=' + link
    })
  },

  // 轮播图发生改变
  handleChangeSwiper (e) {
    this.setData({
      seiperIndex: e.detail.current
    })
  },

  // 品牌馆 -- 特色
  getCharacteristicBranderStore() {
    http.fxGet(api.column_feature_store_all, this.data.params, (result) => {
      utils.logger(result, '特色品牌馆')
      if (result.success) {

        let data = this.data.storeList
        result.data.stores.forEach((v)=>{
          data.push(v)
        })

        this.setData({
          isNext: result.data.next,
          storeList: data,
          isLoadProductShow:false
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 品牌馆 -- 精选
  getHighStore() {
    http.fxGet(api.column_handpick_store, this.data.highParams, (result) => {
      utils.logger(result, '特色品牌馆-精选')
      if (result.success) {
        this.setData({
          HighStoreList:result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 品牌管--精选 头部
  getHanderAdv() {
    http.fxGet(api.banners_rid.replace(/:rid/g, 'store_ad'), {}, (result) => {
      utils.logger(result, '特色品牌馆-头部广告')
      if (result.success) {
        this.setData({
          HighStoreAdvList: result.data
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
    this.getCharacteristicBranderStore()
    this.getHanderAdv()
    this.getHighStore()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.categoryId == 1) {
      if (!this.data.isNext) {
        utils.fxShowToast('没有更多了')
        return
      }

      this.setData({
        ['params.page']: this.data.params.page + 1,
        isLoadProductShow: true
      })

      this.getCharacteristicBranderStore()
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let that = this
    setTimeout(() => {
      that.setData({
        readyOver: true,
        isLoading: false
      })
    }, 500)
  },

  /**
* 监听页面滚动
*/
  onPageScroll(e) {
    if (this.data.categoryId == 1){
      // 设置回到顶部按钮是否显示
      let windowHeight = app.globalData.systemInfo.windowHeight
      if (e.scrollTop >= windowHeight) {
        if (!this.data.backBtnIsShow) {
          this.setData({
            backBtnIsShow: true
          })
        }
      }
      if (e.scrollTop < windowHeight) {
        if (this.data.backBtnIsShow) {
          this.setData({
            backBtnIsShow: false
          })
        }
      }
    }


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
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return app.shareLeXi()
  },

  // 跳转到品牌馆
  handleTobrandStore(e) {
    wx.navigateTo({
      url: '../branderStore/branderStore?rid=' + e.currentTarget.dataset.rid,
    })
  },

  // 跳转到商品详情---
  handleInfomation(e) {
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&product=' + this.data.myProduct + "&storeRid=" + e.detail.storeRid
    })
  },

  /**
 * 回到顶部
 */
  handleBackTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 888
    })
  },

})