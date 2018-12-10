// pages/pickSuccess/pickSuccess.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    currentActivity: {}, // 当前活动

    rid: '',
    showShareModal: false, // 分享模态框
    shareProduct: '', // 分享某个商品
    cardUrl: '', // 卡片图rul
    posterUrl: '', // 海报图url
    posterSaving: false, // 是否正在保存
    posterBtnText: '保存分享',

    btnGiveText: '我要送礼'
  },

  /**
   * 获取formid, 继续送礼
   */
  handleFormNotice(e) {
    utils.logger(e.detail.formId, '通知模板')
    if (e.detail.formId != 'the formId is a mock one') {
      app.handleSendNews(e.detail.formId)
    }

    // 我要送礼
    wx.switchTab({
      url: '../index/index',
    })
  },

  /**
   * 显示分享链接
   */
  handShowShare (e) {
    this.setData({
      showShareModal: true
    })

    this.getWxaCard()
    this.getWxaPoster()
  },

  /**
   * 取消分享-销售
   */
  handleCancelShare(e) {
    this.setData({
      showShareModal: false,
      cardUrl: '',
      posterUrl: '',
      shareProduct: {}
    })
  },

  /**
   * 生成推广卡片
   */
  getWxaCard() {
    let rid = this.data.currentActivity.product.product_rid

    let params = {
      rid: rid,
      type: 2
    }
    http.fxPost(api.market_gift_share_card, params, (result) => {
      utils.logger(result, '生成卡片')
      if (result.success) {
        this.setData({
          cardUrl: result.data.image_url
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 生成推广海报图
   */
  getWxaPoster() {
    let rid = this.data.currentActivity.product.product_rid

    let activity_rid = this.data.rid

    // scene格式：rid
    let scene = activity_rid

    let path = 'pages/lottery/lottery'
    // 根据发起者类型，打开不同的路径
    if (this.data.currentActivity.user_kind == 3) {
      path = 'pages/myLottery/myLottery'
    }

    let params = {
      rid: rid,
      activity_rid: activity_rid,
      type: 2,
      path: path,
      scene: scene,
      auth_app_id: app.globalData.appId
    }

    http.fxPost(api.market_gift_share_poster, params, (result) => {
      utils.logger(result, '生成海报图')
      if (result.success) {
        this.setData({
          posterUrl: result.data.image_url
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 保存当前海报到相册
   */
  handleSaveShare() {
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
                utils.logger('下载海报失败：' + err.errMsg)
                that.setData({
                  posterSaving: false,
                  posterBtnText: '保存分享'
                })

                if (err.errMsg == 'saveImageToPhotosAlbum:fail:auth denied') {
                  wx.openSetting({
                    success(settingdata) {
                      utils.logger(settingdata)
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

  /**
   * 获取当前活动
   */
  getActivity() {
    http.fxGet(api.gift_activity_detail.replace(/:rid/, this.data.rid), {}, (res) => {
      utils.logger(res.data, '获取当前活动')
      if (res.success) {
        this.setData({
          currentActivity: res.data
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      rid: options.rid || ''
    })

    // 验证是否登录
    if (!app.globalData.isLogin) {
      wx.switchTab({
        url: '../index/index',
      })
    }

    const jwt = app.globalData.jwt
    let _btnText = this.data.btnGiveText
    if (!jwt.is_small_b) {
      _btnText = '我要拿礼物'
    }

    this.setData({
      btnGiveText: _btnText
    })

    this.getActivity()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this
    setTimeout(() => {
      that.setData({
        isLoading: false
      })
    }, 350)
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
  onShareAppMessage: function () {
    // scene格式：rid
    let scene = this.data.rid
    
    let title = '我刚刚在乐喜成功领取了一份礼物，你也来拿一个。'

    let path = 'pages/lottery/lottery'
    // 根据发起者类型，打开不同的路径
    if (this.data.currentActivity.user_kind == 3) {
      path = 'pages/myLottery/myLottery'
    }

    return {
      title: title,
      path: path + '?scene=' + scene,
      imageUrl: this.data.cardUrl,
      success: (res) => {
        utils.logger(res, '分享成功!')
      }
    }
  }

})