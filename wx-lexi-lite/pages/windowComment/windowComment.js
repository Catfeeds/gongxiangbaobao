// pages/comment/comment.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

const emojiFn = require('./../../template/emoj.js')

// 当前光标位置
let lastCursorIndex = -1

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    isFocusing: false, // 输入款是否获取焦点
    maxLength: -1, // -1 不限长度
    cursorIndex: -1, // 当前光标位置
    activeButton: 'keyboard', // 当前激活按钮，emoji,keyboard
    emojiMsg: [], // 表情
    placeholderText: '写评论',

    isLike: false,
    likeCount: 0,

    windowRid: '', // 评论的对象rid
    submitTarget: '', // 提交目标 reply comment
    currentCommentIndex: -1, // 当前回复或点赞的评论索引

    comments: [], // 橱窗评论
    haveCommentNext: true, // 橱窗是否有下一页
    totalCount: 0, // 橱窗的评论总数
    leftCount: 0, // 隐藏的回复条数

    // 评论表单
    form: {
      rid: '',
      pid: '',
      content: ''
    },

    // 获取评论参数
    params: {
      page: 1, // Number	可选	1	当前页码
      per_page: 10, // Number	可选	10	每页数量
      sort_type: 0, // Number	可选	0	排序方式0 = 默认1 = 按点赞数 2 = 按回复数
      rid: '' // Number	必须	 	橱窗编号
    },

    // 获取子评论
    childrenParams: {
      page: 0, // Number	可选	1	当前页码
      per_page: 10, // Number	可选	10	每页数量
      sort_type: 0, // Number	可选	0	排序方式： 0= 默认， 1= 按点赞数， 2= 按回复数
      pid: '' // Number	必须	 	父级评论编号
    }

  },

  /**
   * 获取输入焦点
   */
  handleFocusInput() {
    this.setData({
      isFocusing: true,
      activeButton: 'keyboard'
    })
  },

  /**
   * 失去焦点事件
   */
  handleBlurEvent(e) {
    this.setData({
      'form.content': e.detail.value
    })
  },

  /**
   * 文本输入事件
   */
  handleInputEvent(e) {
    let { value, cursor } = e.detail
    console.log(value, cursor)
    // 记录最后一次输入的光标位置
    lastCursorIndex = cursor

    this.setData({
      'form.content': value
    })
  },

  /**
   * 点击表情事件
   */
  handleClickeEmoji(e) {
    let moji = '[' + e.currentTarget.dataset.ele + ']'
    let offsetIndex = moji.length

    console.log(moji)

    let _content = this.data.form.content.slice(0, lastCursorIndex) + moji + this.data.form.content.slice(lastCursorIndex)
    lastCursorIndex += offsetIndex

    console.log(_content)

    this.setData({
      'form.content': _content
    })
  },

  /**
   * 点击非键盘区域事件
   */
  handleTouchMask (e) {
    this.setData({
      isFocusing: false
    })
  },

  /**
   * 切换键盘与表情
   */
  handleToggleButton(e) {
    let _btn = e.currentTarget.dataset.name
    this.setData({
      activeButton: _btn
    })

    if (_btn == 'keyboard') {
      this.setData({
        isFocusing: true,
        cursorIndex: lastCursorIndex
      })
    }
  },

  /**
   * 回复评论
   */
  handleReplyComment(e) {
    let idx = e.currentTarget.dataset.index
    let submitTarget = e.currentTarget.dataset.submitTarget
    let commentId = e.currentTarget.dataset.pid

    let currentComment = this.data.comments[idx]

    this.setData({
      isFocusing: true,
      submitTarget: submitTarget, // 提交目标
      placeholderText: '回复#' + currentComment.user_name,
      currentCommentIndex: idx,
      'form.pid': commentId // 每条评论的id
    })
  },

  /**
   * 提交评论或回复评论
   */
  handleSubmitComment() {
    setTimeout(() => {
      utils.logger(this.data.form, this.data.submitTarget, '提交评论或回复评论')
      this.setData({
        isFocusing: false
      })

      // 提交评论
      if (this.data.submitTarget == 'comment') {
        // 清空pid
        this.setData({
          'form.pid': 0
        })
        http.fxPost(api.shop_windows_comments, this.data.form, result => {
          utils.logger(result, '提交评论')
          if (result.success) {

            utils.fxShowToast('评论成功')

            let _totalCount = this.data.totalCount + 1
            this.setData({
              'params.page': 1,
              'form.content': '',
              totalCount: _totalCount
            })

            this._setPageTitle(_totalCount)

            // 添加新评论到第一位置
            let _comments = this.data.comments

            result.data.content_list = emojiFn.emojiAnalysis([result.data.content])
            result.data.created_at_cn = utils.commentTime(result.data.created_at)

            _comments.unshift(result.data)
            this.setData({
              comments: _comments
            })

          } else {
            this.setData({
              isFocusing: true
            })
            utils.fxShowToast(result.status.message)
          }
        })
      } else { // 回复评论
        http.fxPost(api.shop_windows_comments, this.data.form, result => {
          utils.logger(result, '提交回复评论')
          if (result.success) {

            utils.fxShowToast('回复成功')

            this.setData({
              'params.page': 1,
              'form.content': ''
            })

            // 添加回复到评论第一位置
            let _comments = this.data.comments

            result.data.content_list = emojiFn.emojiAnalysis([result.data.content])
            result.data.created_at_cn = utils.commentTime(result.data.created_at)

            if (!_comments[this.data.currentCommentIndex].sub_comments) {
              _comments[this.data.currentCommentIndex].sub_comments = []
            }
            _comments[this.data.currentCommentIndex].sub_comments.unshift(result.data)
            this.setData({
              comments: _comments
            })
          } else {
            this.setData({
              isFocusing: true
            })
            utils.fxShowToast(result.status.message)
          }
        })
      }
    }, 350)
  },

  // 删除喜欢
  handleDeleteLike() {
    http.fxDelete(api.shop_windows_user_likes, { rid: this.data.windowRid }, result => {
      if (result.success) {
        this.setData({
          isLike: false,
          likeCount: this.data.likeCount - 1
        })
      } else utils.logger(result, '取消喜欢橱窗')
    })
  },

  // 添加喜欢
  handleAddLike() {
    http.fxPost(api.shop_windows_user_likes, { rid: this.data.windowRid }, result => {
      if (result.success) {
        this.setData({
          isLike: true,
          likeCount: this.data.likeCount - 0 + 1
        })
      } else utils.logger(result, '添加喜欢橱窗')
    })
  },

  // 删除点赞
  handleDeletePraise(e) {
    let index = e.currentTarget.dataset.index
    let id = e.currentTarget.dataset.commentId
    let t = e.currentTarget.dataset.type || 'comment'
    let childIndex = e.currentTarget.dataset.childIndex

    utils.logger(index + ',' + childIndex + ',' + id + ',' + t, '删除点赞')

    http.fxDelete(api.shop_windows_comments_praises, {
      comment_id: id
    }, result => {
      if (result.success) {
        // 更新删除点赞后状态
        let _comments = this.data.comments

        if (t == 'comment') {
          let cnt = _comments[index].praise_count - 1
          _comments[index].is_praise = false
          _comments[index].praise_count = cnt < 0 ? 0 : cnt
        } else {
          let cnt = _comments[index].sub_comments[childIndex].praise_count - 1
          _comments[index].sub_comments[childIndex].is_praise = false
          _comments[index].sub_comments[childIndex].praise_count = cnt < 0 ? 0 : cnt
        }

        this.setData({
          comments: _comments
        })
      } else utils.fxShowToast(result.status.message)
    })
  },

  // 点赞
  handlePraise(e) {
    let index = e.currentTarget.dataset.index
    let id = e.currentTarget.dataset.commentId
    let t = e.currentTarget.dataset.type || 'comment'
    let childIndex = e.currentTarget.dataset.childIndex

    utils.logger(index + ',' + childIndex + ',' + id + ',' + t, '添加点赞')

    http.fxPost(api.shop_windows_comments_praises, {
      comment_id: id
    }, result => {
      if (result.success) {
        // 更新点赞后状态
        let _comments = this.data.comments

        if (t == 'comment') {
          _comments[index].is_praise = true
          _comments[index].praise_count += 1
        } else {
          _comments[index].sub_comments[childIndex].is_praise = true
          _comments[index].sub_comments[childIndex].praise_count += 1
        }
        
        this.setData({
          comments: _comments
        }) 
      } else utils.fxShowToast(result.status.message)
    })
  },

  /**
   * 获取子评论
   */
  handleGetChildrenComment(e) {
    let index = e.currentTarget.dataset.index
    let pid = e.currentTarget.dataset.commentId

    let commentList = this.data.comments[index].sub_comments

    let page = commentList[commentList.length - 1].current_page

    utils.logger(page, '当前页面')

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
   * 阻止穿透
   */
  handlePrevent(e) {
    utils.logger(e, '阻止点击事件')
    return
  },

  /**
   * 获取评论
   */
  getComments() {
    http.fxGet(api.shop_windows_comments, this.data.params, result => {
      utils.logger(result, '获取评论')
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

        let data = this.data.comments
        this.setData({
          comments: data.concat(result.data.comments), // 橱窗评论
          haveCommentNext: result.data.next, // 橱窗是否有下一页
          leftCount: result.data.remain_count, // 橱窗的剩余评论数量
          totalCount: result.data.count, // 橱窗的评论数量
        })

        this._setPageTitle(result.data.count)

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 设置页面标题
   */
  _setPageTitle (cnt) {
    wx.setNavigationBarTitle({
      title: cnt - 0 + '条评论'
    })
  },
  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    utils.logger(options, '写评论')
    // 检测网络
    app.ckeckNetwork()

    // 设置评论表情
    let list = [
      '[\u5fae\u7b11][\u6487\u5634][\u8272][\u53d1\u5446][\u5f97\u610f][\u6d41\u6cea][\u5bb3\u7f9e][\u95ed\u5634][\u7761][\u5927\u54ed][\u5c34\u5c2c][\u53d1\u6012][\u8c03\u76ae][\u5472\u7259][\u60ca\u8bb6][\u96be\u8fc7][\u9177][\u51b7\u6c57][\u6293\u72c2][\u5410][\u5077\u7b11][\u6109\u5feb][\u767d\u773c][\u50b2\u6162][\u9965\u997f][\u56f0][\u60ca\u6050][\u6d41\u6c57][\u61a8\u7b11][\u60a0\u95f2][\u594b\u6597][\u5492\u9a82]',
      '[\u7591\u95ee][\u5618][\u6655][\u75af\u4e86][\u8870][\u9ab7\u9ac5][\u6572\u6253][\u518d\u89c1][\u64e6\u6c57][\u62a0\u9f3b][\u9f13\u638c][\u7cd7\u5927\u4e86][\u574f\u7b11][\u5de6\u54fc\u54fc][\u53f3\u54fc\u54fc][\u54c8\u6b20][\u9119\u89c6][\u59d4\u5c48][\u5feb\u54ed\u4e86][\u9634\u9669][\u4eb2\u4eb2][\u5413][\u53ef\u601c][\u83dc\u5200][\u897f\u74dc][\u5564\u9152][\u7bee\u7403][\u4e52\u4e53][\u5496\u5561][\u996d][\u732a\u5934][\u73ab\u7470]',
      '[\u51cb\u8c22][\u5634\u5507][\u7231\u5fc3][\u5fc3\u788e][\u86cb\u7cd5][\u95ea\u7535][\u70b8\u5f39][\u5200][\u8db3\u7403][\u74e2\u866b][\u4fbf\u4fbf][\u6708\u4eae][\u592a\u9633][\u793c\u7269][\u62e5\u62b1][\u5f3a][\u5f31][\u63e1\u624b][\u80dc\u5229][\u62b1\u62f3][\u52fe\u5f15][\u62f3\u5934][\u5dee\u52b2][\u7231\u4f60][NO][OK][\u7231\u60c5][\u98de\u543b][\u8df3\u8df3][\u53d1\u6296][\u6004\u706b][\u8f6c\u5708]',
      '[\u78d5\u5934][\u56de\u5934][\u8df3\u7ef3][\u6295\u964d][\u6fc0\u52a8][\u4e71\u821e][\u732e\u543b][\u5de6\u592a\u6781][\u53f3\u592a\u6781]'
    ]

    let _isFocusing = false
    if (options.isInput && options.isInput == 1) {
      _isFocusing = true
    }

    let _placeholderText = this.data.placeholderText
    if (options.submitTarget == 'reply') {
      _placeholderText = '回复#' + options.userName
    }

    this.setData({
      'params.rid': options.rid,
      'form.rid': options.rid,
      'form.pid': options.pid || 0,
      windowRid: options.rid,
      submitTarget: options.submitTarget || 'comment',
      currentCommentIndex: options.index || -1,
      isFocusing: _isFocusing,
      isLike: options.isLike == 'true' ? true : false,
      likeCount: options.likeCount || 0,
      placeholderText: _placeholderText,
      emojiMsg: emojiFn.emojiAnalysis(list)
    })

    // 获取评论
    this.getComments() 
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
    if (this.data.haveCommentNext) {
      this.setData({
        'params.page': this.data.params.page + 1
      })

      this.getComments()
    } else {
      utils.fxShowToast('没有更多了')
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})