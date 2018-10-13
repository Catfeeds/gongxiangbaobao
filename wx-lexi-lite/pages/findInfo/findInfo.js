// pages/findInfo/findInfo.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

let wxparse = require('../../wxParse/wxParse.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    rid: '', // rid
    category: '', // 频道的名字
    liveInfo: '', // 详情
    recommend: '', // 相关故事推荐
    recommendProduct: '', // 相关故事推荐
    dkcontent: '', // 故事详情
    commentList: '', //评论的列表
    is_mobile:false, // 登录模态框
    
    // 获取评论的参数
    params: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
      sort_type: '', //Number	可选	0	排序方式： 0= 默认， 1= 按点赞数， 2= 按回复数
      rid: '', //Number	必须	 	橱窗编号
    },
    product: []
  },

  //点击相关推荐
  handlesAgainLoading(e) {
    console.log(e)
    console.log(e.currentTarget.dataset.rid)
    wx.pageScrollTo({
      scrollTop: 0,
    })

    this.setData({
      rid: e.currentTarget.dataset.rid,
      ['params.page']: 1,
      ['params.per_page']: 10,
      ['params.rid']: e.currentTarget.dataset.rid
    })

    this.getLiveInfo() // 生活志详情
    this.getRecommend() // 相关故事推荐
  },


  //添加关注 -- 关注人 uid
  handleAddFollow(e) {

    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return false
    }

    http.fxPost(api.follow_user, {
      uid: e.currentTarget.dataset.uid
    }, (result) => {
      console.log(result, "添加关注")
      if (result.success) {
        this.setData({
          ['liveInfo.is_follow']: true
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  //取消关注关注 -- 关注人
  handleDeleteFollow(e) {

    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return false
    }

    http.fxPost(api.unfollow_user, {
      uid: e.currentTarget.dataset.uid
    }, (result) => {
      console.log(result, "取消关注")
      if (result.success) {
        this.setData({
          ['liveInfo.is_follow']: false
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 关闭
  hanleOffLoginBox(e) {
    console.log(e)
    this.setData({
      is_mobile: false
    })
  },

  // 添加关注---
  handleAddWatch(e) {
    console.log(e)
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return false
    }
    let rid = e.currentTarget.dataset.rid
    let index = e.currentTarget.dataset.index

    http.fxPost(api.add_watch, {
      rid: rid
    }, (result) => {
      if (result.success) {
        this.setData({
          ['liveInfo.recommend_store.is_follow_store']: true
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 取消关注---
  handleDeleteWatch(e) {
    console.log(e.currentTarget.dataset.rid)
    console.log(e.currentTarget.dataset.index)
    let rid = e.currentTarget.dataset.rid
    let index = e.currentTarget.dataset.index

    http.fxPost(api.delete_watch, {
      rid: rid
    }, (result) => {
      if (result.success) {
        this.setData({
          ['liveInfo.recommend_store.is_follow_store']: false
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 跳转到商品详情---
  handleInfomation (e) {
    console.log(e)
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&product=' + this.data.myProduct + "&storeRid=" + e.detail.storeRid
    })
  },

  // 点击去推荐品牌馆
  handleGoBrandStore(e) {
    console.log(e)
    wx.navigateTo({
      url: '../branderStore/branderStore?rid=' + e.currentTarget.dataset.rid,
    })
  },

  // 推荐的产品
  getRecommendProduct() {
    http.fxGet(api.life_records_recommend_products, this.data.params, (result) => {
      console.log(result, "商品推荐")
      if (result.success) {

        this.setData({
          recommendProduct: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取生活志的评论
  getComment() {
    http.fxGet(api.life_records_comments, this.data.params, (result) => {
      console.log(result, "生活志的评论")
      if (result.success) {
        // result.data.published_at = utils.timestamp2string(result.data.published_at, "date")

        this.setData({
          commentList: result.data
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })

  },

  // 获取生活志详情
  getLiveInfo () {
    http.fxGet(api.life_records_detail, {
      rid: this.data.rid
    }, (result) => {
      console.log(result, "生活志详情")
      if (result.success) {
        result.data.published_at = utils.timestamp2string(result.data.published_at, "date")

        let recommendStore = result.data.recommend_store
        if (recommendStore&&recommendStore.store_name.length>8){
          result.data.recommend_store.store_name = recommendStore.store_name.slice(0,8)+'...'
        }

        // 处理html数据---
        wxparse.wxParse('dkcontent', 'html', result.data.content, this, 5)

        this.setData({
          liveInfo: result.data
        })

        this.getComment() // 获取生活志评论

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 相关故事推荐
  getRecommend () {

    http.fxGet(api.life_records_similar, this.data.params, (result) => {
      console.log(result, "相关故事推荐")
      if (result.success) {

        this.setData({
          recommend: result.data
        })
        this.getComment() // 获取生活志评论
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    this.setData({
      rid: options.rid,
      'params.rid': options.rid,
      category: options.category || '',
    })
    
    this.getLiveInfo() // 生活志详情
    this.getRecommend() // 相关故事推荐
    this.getRecommendProduct() // 推荐商品
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let that = this
    setTimeout(() => {
      that.setData({
        isLoading: false
      })
    }, 1000)
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
    return app.shareLeXi()
  }
})