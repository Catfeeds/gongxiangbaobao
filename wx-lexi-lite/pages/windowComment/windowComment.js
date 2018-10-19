// pages/comment/comment.js
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
    isLoading: true,
    isShowComment: false, // 输入框
    windowRid: '', // 评论的对象rid
    submitTarget: '', // 提交目标 reply comment

    isLike: false,
    likeCount: 0,

    comments: [], // 橱窗评论
    commentsNext: true, // 橱窗是否有下一页
    commentsCount: 0, // 橱窗的剩余评论数量
    countSum: 1, // 橱窗的评论总数
    // 提交主评论
    commentParams: {
      rid: '', //Number	必须	 	橱窗编号
      pid: '', //Number	可选	0	上级评论编号
      content: '', //String	必须	 	评论内容
    },

    // 提交子评论
    sonCommentParams: {
      rid: '', //Number	必须	 	橱窗编号
      pid: '', //Number	可选	0	上级评论编号
      content: '', //String	必须	 	评论内容
    },

    // 获取评论参数
    getCommentParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
      sort_type: 0, //Number	可选	0	排序方式0 = 默认1 = 按点赞数 2 = 按回复数
      rid: '', //Number	必须	 	橱窗编号
    },

    // 获取子评论
    childrenParams: {
      page: 0, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
      sort_type: 0, //Number	可选	0	排序方式： 0= 默认， 1= 按点赞数， 2= 按回复数
      pid: '', //Number	必须	 	父级评论编号
    }

  },

  // 删除喜欢
  handleDeleteLike() {
    this.setData({
      isLike: false,
      likeCount: this.data.likeCount - 1,
    })

    let parentPage = getCurrentPages()
    parentPage[parentPage.length - 2].handleDeleteLike()
  },

  // 添加喜欢
  handleAddLike() {
    this.setData({
      isLike: true,
      likeCount: this.data.likeCount - 0 + 1,
    })

    let parentPage = getCurrentPages()
    parentPage[parentPage.length - 2].handleAddLike()

  },

  // 删除点赞
  handleDeletePraise(e) {
    utils.logger(e.currentTarget.dataset.index, '删除点赞')
    let index = e.currentTarget.dataset.index
    let id = e.currentTarget.dataset.commentId
    this._handlePraise(id, index) // 处理页面效果

    http.fxDelete(api.shop_windows_comments_praises, {
      comment_id: id
    }, result => {
      utils.logger(result)
      if (result.success) {} else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 点赞
  handlePraise(e) {
    utils.logger(e.currentTarget.dataset.index, '添加点赞')
    let index = e.currentTarget.dataset.index
    let id = e.currentTarget.dataset.commentId
    this._handlePraise(id, index) // 处理页面效果

    http.fxPost(api.shop_windows_comments_praises, {
      comment_id: id
    }, result => {
      utils.logger(result)
      if (result.success) {} else {
        utils.fxShowToast(result.status.message)
      }
    })

  },

  // 处理点赞后的页面效果
  _handlePraise(e, i) {
    let id = e
    let comments = this.data.comments

    comments.forEach((item, idx) => {

      // 本页父级评论点赞
      if (item.comment_id == id) {
        item.praise_count = item.is_praise ? item.praise_count - 1 : item.praise_count + 1,
          item.is_praise = !item.is_praise

        // 更改上一页的 点赞
        this._handleParentPagePraise(i)
      }

      // 本页 子级评论点赞
      item.sub_comments.forEach((v, i) => {
        if (v.comment_id == id) {
          v.praise_count = v.is_praise ? v.is_praise - 1 : v.praise_count + 1,
            v.is_praise = !v.is_praise
        }
      })
    })

    this.setData({
      comments: comments
    })
  },

  // 处理上一页的点赞
  _handleParentPagePraise(e) {
    utils.logger(e)

    // 因为上级页面只有3个评论显示，所以只改变上一页的3个就可以
    if (e < 3) {
      let page = getCurrentPages()
      let parentPage = page[page.length - 2]
      let parentComments = parentPage.data.comments

      let isPraise = parentComments[e].is_praise
      let praiseCount = parentComments[e].praise_count

      parentComments[e].praise_count = isPraise ? praiseCount - 1 : praiseCount + 1
      parentComments[e].is_praise = !isPraise

      parentPage.setData({
        comments: parentComments
      })
    }
  },

  /**
   * 获取子评论
   */
  handleGetChildrenComment(e) {

    let index = e.currentTarget.dataset.index
    let pid = e.currentTarget.dataset.commentId
    let commentList = this.data.comments[index].sub_comments

    let page = commentList[commentList.length - 1].current_page
    utils.logger(page, "当前页面")

    this.setData({
      'childrenParams.pid': pid,
      'childrenParams.page': page + 1
    })

    http.fxGet(api.shop_windows_child_comments, this.data.childrenParams, result => {
      utils.logger(result)
      if (page == 0) {
        commentList = []
      }

      result.data.comments.forEach((v, i) => {
        v.current_page = result.data.comments.current_page
        v.created_at_cn = utils.commentTime(v.created_at)
      })

      this.setData({
        ['comments[' + index + '].sub_comments']: commentList.concat(result.data.comments),
        ['comments[' + index + '].remain_count']: result.data.remain_count
      })

    })

  },

  /**
   * 提交子评论
   */
  handleReply(e) {
    utils.logger('子评论')
    this.setData({
      isShowComment: false,
    })

    http.fxPost(api.shop_windows_comments, this.data.sonCommentParams, result => {
      utils.logger(result, '提交评论')
      if (result.success) {
        utils.fxShowToast('评论成功')
        this.setData({
          comments: [],
          'sonCommentParams.content': ''
        })
        this.getComment()
        this._handleParentUpdata()
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 提交主评论
   */
  handleSubmitComment() {
    utils.logger('主评论')
    this.setData({
      isShowComment: false,
    })

    http.fxPost(api.shop_windows_comments, this.data.commentParams, result => {
      utils.logger(result, '提交评论')
      if (result.success) {
        utils.fxShowToast('评论成功')
        this.setData({
          comments: [],
          'commentParams.content': '',
          countSum: this.data.countSum + 1
        })

        wx.setNavigationBarTitle({
          title: result.data.count - 0 + 1 + '条评论',
        })

        this.getComment()
        this._handleParentUpdata()
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 添加评论主
   */
  handleAddCritique(e) {
    utils.logger(e.detail.value, '主评论')
    this.setData({
      'commentParams.content': e.detail.value
    })
  },

  /**
   * 添加子评论
   */
  handleReplyCritique(e) {
    utils.logger(e.detail.value, '子评论')
    this.setData({
      'sonCommentParams.content': e.detail.value
    })

  },

  /**
   * 打开评论
   * */
  handleOpenCommentBox(e) {
    utils.logger(e)
    utils.logger(e.currentTarget.dataset.submitTarget)
    this.setData({
      isShowComment: true,
      submitTarget: e.currentTarget.dataset.submitTarget, // 提交目标
      'sonCommentParams.pid': e.currentTarget.dataset.commentId || [], // 每条评论的id
    })
  },

  /**
   * 查看更多的主评论
   */
  handleAllComment() {
    this.setData({
      'getCommentParams.page': this.data.getCommentParams.page + 1
    })

    this.getComment()
  },

  // 更新父级评论
  _handleParentUpdata() {
    let page = getCurrentPages()
    page[page.length - 2].getComment()
    utils.logger(page[page.length - 2], 'fujiyemain')
  },

  /**
   * 关闭评论
   */
  handleOffCommentBox() {
    this.setData({
      isShowComment: false
    })
  },

  /**
   * 阻止穿透
   */
  handlePrevent() {
    return
  },

  /**
   * 获取评论
   */
  getComment() {
    http.fxGet(api.shop_windows_comments, this.data.getCommentParams, result => {
      utils.logger(result, '获取评论')
      if (result.success) {

        const timePromise = new Promise((resolve, reject) => {
          result.data.comments.forEach((v, i) => {
            v.created_at_cn = utils.commentTime(v.created_at)
            v.sub_comments.forEach((item, idx) => {
              item.current_page = 0
              item.created_at_cn = utils.commentTime(item.created_at)
            })

            // 循环完毕
            if (result.data.comments.length - 1 == i) {
              resolve()
            }
          })
        })

        timePromise.then(() => {
          let data = this.data.comments
          this.setData({
            comments: data.concat(result.data.comments), // 橱窗评论
            commentsNext: result.data.next, // 橱窗是否有下一页
            commentsCount: result.data.remain_count, // 橱窗的剩余评论数量
            countSum: result.data.count, // 橱窗的评论数量
          })

          wx.setNavigationBarTitle({
            title: result.data.count + '条评论',
          })
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
    utils.logger(options)
    this.setData({
      'getCommentParams.rid': options.rid,
      'commentParams.rid': options.rid,
      'sonCommentParams.rid': options.rid,
      'sonCommentParams.pid': options.pid,
      windowRid: options.rid,
      submitTarget: options.submitTarget,
      isShowComment: options.isInput == 0 ? false : true,
      isLike: options.isLike == 'true' ? true : false,
      likeCount: options.likeCount,
    })

    this.getComment() // 获取评论
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