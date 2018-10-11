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
    isShowComment: false, // 输入框
    windowRid: '', // 评论的对象rid
    submitTarget: '', // 提交目标 reply comment

    comments: [], // 橱窗评论
    commentsNext: true, // 橱窗是否有下一页
    commentsCount: 0, // 橱窗的数量

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
      sort_type: 2, //Number	可选	0	排序方式0 = 默认1 = 按点赞数 2 = 按回复数
      rid: '', //Number	必须	 	橱窗编号
    },

    // 获取子评论
    childrenParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
      sort_type: 1, //Number	可选	0	排序方式： 0= 默认， 1= 按点赞数， 2= 按回复数
      pid: '', //Number	必须	 	父级评论编号
    }

  },

  /**
   * 获取子评论
   */
  handleGetChildrenComment(e) {

    let index = e.currentTarget.dataset.index
    let pid = e.currentTarget.dataset.commentId
    this.setData({
      'childrenParams.pid':pid
    })

    http.fxGet(api.shop_windows_child_comments, this.data.childrenParams, result => {
      console.log(result)
    })

  },

  /**
   * 提交子评论
   */
  handleReply(e) {
    console.log('子评论')
    http.fxPost(api.shop_windows_comments, this.data.sonCommentParams, result => {
      console.log(result, '提交评论')
      if (result.success) {
        utils.fxShowToast('评论成功')
        this.setData({
          comments: [],
          isShowComment: true
        })
        this.getComment()
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 提交主评论
   */
  handleSubmitComment() {
    console.log('主评论')
    http.fxPost(api.shop_windows_comments, this.data.commentParams, result => {
      console.log(result, '提交评论')
      if (result.success) {
        utils.fxShowToast('评论成功')
        this.setData({
          comments: [],
          isShowComment: true
        })
        this.getComment()
      } else {
        utils.fxShowToast(result.status.message)
      }
    })

  },

  /**
   * 添加评论主
   */
  handleAddCritique(e) {
    console.log(e.detail.value, '主评论')
    this.setData({
      'commentParams.content': e.detail.value
    })
  },

  /**
   * 添加子评论
   */
  handleReplyCritique(e) {
    console.log(e.detail.value, '子评论')
    this.setData({
      'sonCommentParams.content': e.detail.value
    })

  },

  /**
   * 打开评论
   * */
  handleOpenCommentBox(e) {
    console.log(e)
    console.log(e.currentTarget.dataset.submitTarget)
    this.setData({
      isShowComment: true,
      submitTarget: e.currentTarget.dataset.submitTarget, // 提交目标
      'sonCommentParams.pid': e.currentTarget.dataset.commentId || [], // 每条评论的id
    })
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
      console.log(result, '获取评论')
      if (result.success) {

        const timePromise = new Promise((resolve, reject) => {
          result.data.comments.forEach((v, i) => {
            v.current_page = 0
            v.created_at_cn = utils.commentTime(v.created_at)
          })

          resolve()
        })
        
        timePromise.then(()=>{
          let data = this.data.comments
          this.setData({
            comments: data.concat(result.data.comments), // 橱窗评论
            commentsNext: result.data.next, // 橱窗是否有下一页
            commentsCount: result.data.count, // 橱窗的数量
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
    console.log(options)
    this.setData({
      'getCommentParams.rid': options.rid,
      'commentParams.rid': options.rid,
      'sonCommentParams.rid': options.rid,
      windowRid: options.rid,
      submitTarget: options.submitTarget,
      isShowComment: options.isInput == 0 ? false : true
    })

    this.getComment() // 获取评论
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