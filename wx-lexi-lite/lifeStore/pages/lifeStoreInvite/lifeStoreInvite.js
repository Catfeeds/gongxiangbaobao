const app = getApp()

const http = require('./../../../utils/http.js')
const api = require('./../../../utils/api.js')
const utils = require('./../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,

    sid: '', // 当前生活馆rid
    uid: '',
    posterUrl: '', // 生成海报的url
    cardPhoto: '', // 开馆的卡片
    lifeStore: {}, // 生活馆信息
    showShareModal: false
  },

  // 邀请好友弹出框
  handleShareShow(e) {
    this.setData({
      showShareModal: true,
    })

    this.getOpenStorePhoto() // 开馆的卡片
    this.getWxaPoster() // 开馆的海报
  },

  // 邀请好友开馆的卡片
  getOpenStorePhoto() {
    http.fxPost(api.market_share_invite_carde, {}, (result) => {
      utils.logger(result, '邀请好友开馆的卡片')
      if (result.success) {
        this.setData({
          cardPhoto: result.data.image_url
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
    // scene格式：sid + '-' + uid
    let scene = this.data.sid
    let params = {
      scene: scene,
      path: 'lifeStore/pages/lifeStoreGuide/lifeStoreGuide',
      auth_app_id: app.globalData.app_id
    }

    utils.logger(params, '海报参数')
    http.fxPost(api.market_share_invite_poster, params, (result) => {
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
    // 下载网络文件至本地
    wx.downloadFile({
      url: this.data.posterUrl,
      success: function (res) {
        if (res.statusCode === 200) {
          // 保存文件至相册
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(res) {
              utils.fxShowToast('保存成功', 'success')
            },
            fail(res) {
              if (res.errMsg === "saveImageToPhotosAlbum:fail:auth denied") {
                wx.openSetting({
                  success(settingdata) {
                    utils.logger(settingdata)
                    if (settingdata.authSetting["scope.writePhotosAlbum"]) {
                      utils.logger("获取权限成功，再次点击图片保存到相册")
                      utils.fxShowToast("保存成功")
                    } else {
                      utils.fxShowToast("保存失败")
                    }
                  }
                })
              } else {
                utils.fxShowToast("保存失败")
              }
            }
          })
        }
      }
    })
  },

  /**
   * 取消分享-销售
   */
  handleCancelShare(e) {
    this.setData({
      showShareModal: false,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.lifeStore.isSmallB) {
      this.setData({
        uid: app.globalData.jwt.uid,
        sid: app.globalData.lifeStore.lifeStoreRid
      })
    } else {
      wx.navigateBack({
        delta: 1
      })
    }
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
  onShareAppMessage: function (e) {
    if (e.from == 'menu' || e.target.dataset.card == 1) {
      // scene格式：sid + '-' + uid
      let scene = this.data.sid
      utils.logger('lifeStore/pages/lifeStoreGuide/lifeStoreGuide?scene=' + scene, '分享的参数')

      return {
        title: app.globalData.userInfo.username + '邀请你一起来来乐喜开个',
        path: 'lifeStore/pages/lifeStoreGuide/lifeStoreGuide?scene=' + scene,
        imageUrl: this.data.cardPhoto,
        success: (res) => {
          utils.logger(res, '分享成功!')
        }
      }
    }
  }

})