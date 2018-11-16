// pages/findInfo/findInfo.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

let wxparse = require("../../wxParse/wxParse.js")
const emojiFn = require('./../../template/emoj.js')
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
    // 获取评论的参数
    params: {
      page: 1, // Number	可选	1	当前页码
      per_page: 10, // Number	可选	10	每页数量
      sort_type: '', // Number	可选	0	排序方式： 0= 默认， 1= 按点赞数， 2= 按回复数
      rid: '' // Number	必须	 	橱窗编号
    }
  },

  // 点击相关推荐
  handlesAgainLoading(e) {
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


  // 关闭
  hanleOffLoginBox(e) {
    utils.logger(e)
    this.setData({
      is_mobile: false
    })
  },

  // 添加关注 -- 关注人 uid
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
      utils.logger(result, '添加关注')
      if (result.success) {
        this.setData({
          ['liveInfo.is_follow']: true
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 取消关注关注 -- 关注人
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
      utils.logger(result, '取消关注')
      if (result.success) {
        this.setData({
          ['liveInfo.is_follow']: false
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 跳转到商品详情---
  handleGoProduct(e) {
    let rid = e.currentTarget.dataset.rid
    wx.navigateTo({
      url: '/pages/product/product?rid=' + rid + "&storeRid=" + e.currentTarget.dataset.storeRid
    })
  },

  // 跳转到商品详情---
  handleInfomation(e) {
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

  // 添加关注---
  handleAddWatch(e) {
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
   * 打开评论
   */
  handleGoComment(e) {
    utils.logger(e)
    console.log(e, '种草笔记详情')
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

  // 推荐的产品
  getRecommendProduct() {
    http.fxGet(api.life_records_recommend_products, this.data.params, (result) => {
      utils.logger(result, '商品推荐')
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
      utils.logger(result, '生活志的评论')
      console.log(result, '生活志的评论')
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
      utils.logger(result, '种草笔记详情')
      console.log(result, '种草笔记详情')
      if (result.success) {
        result.data.published_at = utils.timestamp2string(result.data.published_at, 'date')

        let newData = this._rebuildArticleContent(result.data.deal_content)

        // 处理html数据---
        wxparse.wxParse('dkcontent', 'html', newData, this, 5)

        this.setData({
          liveInfo: result.data
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 重建文章内容
   */
  _rebuildArticleContent(deal_content) {
    let htmlAry = []

    deal_content.map(item => {
      if (item.type == 'text') {
        htmlAry.push('<p>' + item.content + '</p>')
      } else if (item.type == 'image') {
        htmlAry.push('<p><img src="' + item.content + '" /></p>')
      } else if (item.type == 'product') {

        let show_price = item.content.min_price
        if (item.content.min_sale_price > 0) {
          show_price = item.content.min_sale_price
        }

        let isLogisticsPrice = ''
        if (!item.content.is_free_postage) {
          isLogisticsPrice = "<div class='logistics-price__icon'></div>"
        }

        let productHtml = ''
        if (item.big_picture) {
          productHtml = '<div class="product-max__box">' +
            '<div class="product-max__photo" style="background-image:url(' + item.content.cover + ')"></div>' +
            '<div class="product-max__title ">' + isLogisticsPrice + item.content.name + '</div>' +
            '<div class="product-max__price">' +
            '<span class="now-price">￥' + show_price + '</span>' +
            '<a class="product-max__btn" href="/pages/product/product?rid=' + item.rid + '">查看详情</a>' +
            '</div>' +
            '</div>'
        } else {
          utils.logger(item, "每一个商品is_free_postage")
          productHtml = '<div class="product-min__box">' +
            '<div class="product-min__photo" style="background-image:url(' + item.content.cover + ')"></div>' +
            '<div class="product-min__content">' +
            '<div class="product-min__title">' + isLogisticsPrice + item.content.name + '</div>' +
            '<div class="product-min__price"><span class="now-price">￥' + show_price + '</span></div>' +
            '<a class="product-min__btn" href="/pages/product/product?rid=' + item.rid + '&&storeRid=' + item.content.store_rid + '">查看详情</a>' +
            '</div>' +
            '</div>'
        }

        htmlAry.push(productHtml)
      }
    })

    return htmlAry.join('')
  },

  /**
   * 查看商品详情
   */
  wxParseTagATap(e) {
    utils.logger(e)
    wx.navigateTo({
      url: e.currentTarget.dataset.src,
    })
  },

  // 相关故事推荐
  getRecommend() {
    http.fxGet(api.life_records_similar, this.data.params, (result) => {
      utils.logger(result, '相关故事推荐')
      if (result.success) {
        result.data.life_records.forEach((v) => {
          v.description = v.description.replace(/<\s*\/?\s*[a-zA-z_]([^>]*?["][^"]*["])*[^>"]*>/g, "")
        })

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
    let category = options.category || ''
    this.setData({
      rid: options.rid,
      'params.rid': options.rid,
      category: category,
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
        readyOver: true,
        isLoading: false
      })
    }, 350)
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
    return app.shareLeXi()
  }

})