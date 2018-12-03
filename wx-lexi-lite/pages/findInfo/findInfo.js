// pages/findInfo/findInfo.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

let wxparse = require('../../wxParse/wxParse.js')
const emojiFn = require('./../../template/emoj.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    backBtnIsShow: false, // 回到顶部按钮
    showHomeBtn: false, // 回到首页的按钮

    isLoading: true,
    rid: '', // rid
    category: '', // 频道的名字
    liveInfo: '', // 详情
    recommend: '', // 相关故事推荐
    recommendProduct: '', // 相关故事推荐
    dkcontent: '', // 故事详情
    commentList: '', //评论的列表
    is_mobile: false, // 登录模态框

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
    wx.redirectTo({
      url: './../findInfo/findInfo?rid=' + e.currentTarget.dataset.rid,
    })
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
      utils.logger(result, "添加关注")
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
      utils.logger(result, "取消关注")
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
    utils.logger(e)
    this.setData({
      is_mobile: false
    })
  },

  // 添加关注---
  handleAddWatch(e) {
    utils.logger(e)
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
    utils.logger(e.currentTarget.dataset.rid)
    utils.logger(e.currentTarget.dataset.index)
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
  handleInfomation(e) {
    utils.logger(e)
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&product=' + this.data.myProduct + "&storeRid=" + e.detail.storeRid
    })
  },

  // 点击去推荐品牌馆
  handleGoBrandStore(e) {
    utils.logger(e)
    wx.navigateTo({
      url: '../branderStore/branderStore?rid=' + e.currentTarget.dataset.rid,
    })
  },


  // 去生活记事
  handleGoLiveNoteList() {
    wx.navigateTo({
      url: '../liveNoteList/liveNoteList'
    })
  },

  // 创作人故事
  handleGoDesignerAffair() {
    wx.navigateTo({
      url: '../designerAffair/designerAffair',
    })
  },

  //手作教学
  handleGoTeachList() {
    wx.navigateTo({
      url: '../teachList/teachList',
    })
  },

  // 种草笔记
  handleGoPlantNoteList() {
    wx.navigateTo({
      url: '../plantNoteList/plantNoteList',
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

  /**
   * 打开评论
   */
  handleGoComment(e) {
    utils.logger(e)
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }

    wx.navigateTo({
      url: '../findComment/findComment?from=window&rid=' + this.data.rid + '&submitTarget=' + e.currentTarget.dataset.submitTarget + '&isInput=' + e.currentTarget.dataset.isInput + '&pid=' + e.currentTarget.dataset.pid + '&index=' + e.currentTarget.dataset.index + '&isPraise=' + this.data.liveInfo.is_praise + '&praiseCount=' + this.data.liveInfo.praise_count + '&userName=' + e.currentTarget.dataset.userName
    })
  },

  /**
   * 删除生活志点赞
   */
  handleDeletePraise() {
    this.setData({
      'liveInfo.is_praise': false,
      'liveInfo.praise_count': this.data.liveInfo.praise_count - 1,
    })

    http.fxDelete(api.life_records_praises, {
      rid: this.data.rid
    }, result => {
      if (result.success) {

      } else utils.fxShowToast(result.status.message)
    })
  },


  /**
   * 添加生活志点赞
   */
  handleAddPraise() {
    this.setData({
      'liveInfo.is_praise': true,
      'liveInfo.praise_count': this.data.liveInfo.praise_count + 1,
    })

    http.fxPost(api.life_records_praises, {
      rid: this.data.rid
    }, result => {
      if (result.success) {

      } else utils.fxShowToast(result.status.message)
    })
  },

  /**
   * 对评论点赞 
   */
  handleAddCommentPraise(e) {
    let index = e.currentTarget.dataset.index
    let rid = this.data.commentList.comments[index].comment_id
    this.setData({
      ['commentList.comments[' + index + '].is_praise']: true,
      ['commentList.comments[' + index + '].praise_count']: this.data.commentList.comments[index].praise_count + 1,
    })
    http.fxPost(api.life_records_comments_praises, {
      comment_id: rid
    }, result => {
      if (result.success) {

      } else utils.logger(result, '添加喜欢橱窗')
    })
  },

  /**
   * 删除评论点赞
   */
  handleDeleteCommentPraise(e) {
    let index = e.currentTarget.dataset.index
    let rid = this.data.commentList.comments[index].comment_id
    this.setData({
      ['commentList.comments[' + index + '].is_praise']: false,
      ['commentList.comments[' + index + '].praise_count']: this.data.commentList.comments[index].praise_count - 1,
    })
    http.fxDelete(api.life_records_comments_praises, {
      comment_id: rid
    }, result => {
      if (result.success) {

      } else utils.logger(result, '添加喜欢橱窗')
    })
  },

  // 回到首页
  handleBackHome() {
    wx.switchTab({
      url: '../index/index',
    })
  },

  // 推荐的产品
  getRecommendProduct() {
    http.fxGet(api.life_records_recommend_products, this.data.params, (result) => {
      utils.logger(result, "商品推荐")
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
      utils.logger(result, "生活志的评论")
      if (result.success) {
        result.data.comments.forEach((v, i) => {
          v.content_list = emojiFn.emojiAnalysis([v.content])
          v.created_at_cn = utils.commentTime(v.created_at)
          v.sub_comments.forEach((item, idx) => {
            item.content_list = emojiFn.emojiAnalysis([item.content])
            item.current_page = 0
            item.created_at_cn = utils.commentTime(item.created_at)
          })
        })

        this.setData({
          commentList: result.data
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })

  },

  // 获取生活志详情
  getLiveInfo() {
    http.fxGet(api.life_records_detail, {
      rid: this.data.rid
    }, (result) => {
      utils.logger(result, "生活志详情")
      if (result.success) {
        result.data.published_at = utils.timestamp2string(result.data.published_at, "date")

        let recommendStore = result.data.recommend_store
        if (recommendStore && recommendStore.store_name.length > 8) {
          result.data.recommend_store.store_name = recommendStore.store_name.slice(0, 8) + '...'
        }

        // 处理html数据---
        wxparse.wxParse('dkcontent', 'html', result.data.content, this, 5)

        this.setData({
          liveInfo: result.data
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 相关故事推荐
  getRecommend() {

    http.fxGet(api.life_records_similar, this.data.params, (result) => {
      utils.logger(result, "相关故事推荐")
      if (result.success) {

        this.setData({
          recommend: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 是否显示回到首页
   */
  getIsBackHome() {
    let route = getCurrentPages()
    if (route.length == 1) {
      this.setData({
        showHomeBtn: true
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    utils.logger(options)
    // 检测网络
    app.ckeckNetwork()

    this.setData({
      rid: options.rid,
      'params.rid': options.rid,
      category: options.category || '',
    })

    this.getLiveInfo() // 生活志详情
    this.getRecommend() // 相关故事推荐
    this.getRecommendProduct() // 推荐商品
    this.getIsBackHome() // 是否有回到首页的按钮
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
   * 监听页面滚动
   */
  onPageScroll(e) {

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
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getComment() // 获取生活志评论
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
    return {
      title: this.data.liveInfo.title,
      path: '/pages/findInfo/findInfo?rid=' + this.data.rid,
      imageUrl: this.data.liveInfo.cover + '-pwxa',
    }
  }
})