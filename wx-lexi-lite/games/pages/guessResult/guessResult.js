const app = getApp()

const http = require('./../../../utils/http.js')
const api = require('./../../../utils/api.js')
const utils = require('./../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showInviteModal: false, // 邀请好友一起玩
    showPauseModal: false, // 休息一下
    playTimes: 1, // 玩游戏次数

    userInfo: {}, // 登录用户信息
    myAccount: {},
    testId: '',
    testQuestion: {},
    settlement: {}, // 结算结果
    productList: [],

    gameTopName: '',
    gameTopDesc: '',

    showPosterModal: false, // 分享海报
    posterUrl: '', // 海报图片地址
    posterSaving: false, // 是否正在保存
    posterBtnText: '保存分享海报'
  },

  // 查看商品
  handleViewProduct (e) {
    let rid = e.currentTarget.dataset.rid
    wx.redirectTo({
      url: '/pages/product/product?rid=' + rid,
    })
  },

  // 隐藏弹窗框
  handleHidePauseModal () {
    this.setData({
      showPauseModal: false
    })
  },

  // 再玩一次
  handlePlayAgain() {
    this.getPlayTimes()
  },

  // 炫耀成绩
  handleShowGame() {
    this.setData({
      showPosterModal: true
    })
    const jwt = wx.getStorageSync('jwt')
    // scene格式：uid + '-' + code
    let scene = jwt.uid + '-1'
    console.log(scene, '炫耀成绩')

    // 获取海报类型
    let posterType = this._weightRandom()
    console.log('Poster type: ' + posterType)

    let data = {
      type: posterType === 1 ? 11 : 12,
      auth_app_id: 'wx60ed17bfd850985d',
      path: 'pages/index/index',
      scene: scene,
      test_id: this.data.testId
    }
    http.fxPost(api.question_wxa_poster, data, (res) => {
      console.log(res, '生成海报')
      if (res.success) {
        this.setData({
          posterUrl: res.data.image_url
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 下载海报
  handleSavePoster() {
    let that = this
    if (this.data.posterUrl && !this.data.posterSaving) {
      this.setData({
        posterSaving: true,
        posterBtnText: '正在保存...'
      })

      // 下载网络文件至本地
      wx.downloadFile({
        url: this.data.posterUrl,
        success: function (res) {
          if (res.statusCode == 200) {
            // 保存文件至相册
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function (data) {
                that.setData({
                  posterSaving: false,
                  posterBtnText: '保存分享'
                })
                utils.fxShowToast('保存成功', 'success')
              },
              fail: function (err) {
                console.log('下载海报失败：' + err.errMsg)
                that.setData({
                  posterSaving: false,
                  posterBtnText: '保存分享'
                })

                if (err.errMsg == 'saveImageToPhotosAlbum:fail:auth denied') {
                  wx.openSetting({
                    success(settingdata) {
                      console.log(settingdata)
                      if (settingdata.authSetting['scope.writePhotosAlbum']) {
                        utils.fxShowToast('保存成功')
                      } else {
                        utils.fxShowToast('保存失败')
                      }
                    }
                  })
                } else {
                  utils.fxShowToast('保存失败')
                }
              }
            })
          }
        }
      })
    }
  },

  // 获取当前用户1小时内玩的次数
  getPlayTimes() {
    http.fxGet(api.question_play_count, {}, (res) => {
      console.log(res, '玩的次数')
      if (res.success) {
        this.setData({
          playTimes: res.data.play_count,
          showInviteModal: res.data.play_count < 3 ? true : false,
          showPauseModal: res.data.play_count >= 3 ? true : false
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 获取正确答案列表
  getTestResult() {
    http.fxGet(api.question_answer_list, { test_id: this.data.testId }, (res) => {
      console.log(res, '正确答案列表')
      if (res.success) {
        this.setData({
          productList: res.data.product_list
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 获取结算结果
  getSettlementResult() {
    let params = { 
      test_id: this.data.testId 
    }
    http.fxPost(api.question_settlement, params, (res) => {
      console.log(res, '结算结果')
      if (res.success) {
        let rightCount = res.data.right_count
        let gameTopName = ''
        let gameTopDesc = ''
        if (rightCount > 0 && rightCount < 5) {
          gameTopName = '丹风三角眼'
          gameTopDesc = '天空中都弥漫着硝烟味'
        } else if (rightCount >= 5 && rightCount < 10 ) {
          gameTopName = '42k黄金电眼'
          gameTopDesc = '洋溢着幸福的彩虹'
        } else if (rightCount == 10) {
          gameTopName = '绝尘钻眼'
          gameTopDesc = '不敢注视镜子太久，怕爱上自己'
        } else {
          gameTopName = '弱智宝宝'
          gameTopDesc = '痛到只剩下微笑'
        }
        this.setData({
          settlement: res.data,
          gameTopName: gameTopName,
          gameTopDesc: gameTopDesc
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  // 带有权重的随机数
  _weightRandom() {
    let randomConfig = [
      { id: 1, weight: 2 },
      { id: 2, weight: 1 }
    ]
    let randomList = []
    for (let i in randomConfig) {
      for (let j = 0; j < randomConfig[i].weight; j++) {
        randomList.push(randomConfig[i].id)
      }
    }

    return randomList[Math.floor(Math.random() * randomList.length)]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    let testId = options.test_id

    this.setData({
      testId: testId,
      userInfo: wx.getStorageSync('userInfo')
    })

    this.getSettlementResult()
    this.getTestResult()
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    console.log(options, '分享游戏')
    // scene格式：uid + '-' + code
    const jwt = wx.getStorageInfoSync('jwt')
    let scene = jwt.uid + '-1'
    return {
      title: '20万人猜图玩到心脏骤停，赢百万现金池，更享原创设计暖心好物现金券',
      path: '/games/pages/guessGame/guessGame?scene=' + scene,
      imageUrl: 'https://static.moebeast.com/static/img/guess-invite-img.jpg',
      success: function (res) {
        console.log('转发成功')
      },
      fail: function (res) {
        console.log('转发失败')
      }
    }
  }

})