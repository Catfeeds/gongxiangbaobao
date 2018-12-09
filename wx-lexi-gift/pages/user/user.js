// pages/user/user.js
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
    isLogin: false,
    showLoginModal: false, // 注册的呼出框
    userInfo: {},
    isSmallB: false, // 是否为生活馆主
    storeRid: '', // 生活馆rid
    lifeStore: {}, // 生活馆信息
    storePath: 'lifeStore/pages/lifeStoreGuide/lifeStoreGuide',
    showQrcodeModal: false,
    collectCount: {
      join_activity: 0,
      my_activity: 0,
      receive_activity: 0
    }
  },

  /**
   * 地址管理
   */
  handleGoAddress (e) {
    this._validateLoginStatus()

    if (app.globalData.isLogin) {
      wx.navigateTo({
        url: '../addressList/addressList',
      })
    }
  },

  /**
   * 我参与的
   */
  handleGoLottery () {
    this._validateLoginStatus()

    if (app.globalData.isLogin) {
      wx.navigateTo({
        url: '../userLottery/userLottery',
      })
    }
  },

  /**
   * 我送出的
   */
  handleGoSended () {
    this._validateLoginStatus()

    if (app.globalData.isLogin) {
      wx.navigateTo({
        url: '../userSend/userSend',
      })
    }
  },

  /**
   * 我接收的
   */
  handleGoReceive () {
    this._validateLoginStatus()

    if (app.globalData.isLogin) {
      wx.navigateTo({
        url: '../userReceive/userReceive',
      })
    }
  },

  /**
   * 更多抽奖
   */
  handleGoActivityList () {
    this._validateLoginStatus()

    if (app.globalData.isLogin) {
      wx.navigateTo({
        url: '../lotteryList/lotteryList',
      })
    }
  },

  /**
   * 显示公众号二维码图片
   */
  handleShowQrcodeModal() {
    this.setData({
      showQrcodeModal: true
    })
  },

  /**
   * 保存二维码图片
   */
  handleSaveQrcode(e) {
    let that = this
    let qrcodeUrl = e.currentTarget.dataset.url
    // 下载网络文件至本地
    wx.downloadFile({
      url: qrcodeUrl,
      success: function (res) {
        if (res.statusCode === 200) {
          // 保存文件至相册
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(res) {
              wx.showToast({
                title: '图片保存成功',
              })
              that.setData({
                showQrcodeModal: false
              })
            },
            fail(res) {
              if (res.errMsg === "saveImageToPhotosAlbum:fail:auth denied") {
                wx.openSetting({
                  success(settingdata) {
                    utils.logger(settingdata)
                    if (settingdata.authSetting["scope.writePhotosAlbum"]) {
                      utils.logger("获取权限成功，再次点击图片保存到相册")
                      utils.fxShowToast("保存成功")
                      that.setData({
                        showQrcodeModal: false
                      })
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

  // 加入关注群
  handleJoinStoreGather() {
    wx.navigateTo({
      url: '../joinStoreGather/joinStoreGather'
    })
  },

  /**
   * 显示登录框
   */
  handleGoLogin (e) {
    this._validateLoginStatus()
  },

  // 关闭登录框
  hanleOffLoginBox(e) {
    this.setData({
      showLoginModal: false
    })

    if (app.globalData.isLogin) {
      this._refreshUserLogin()
    }
  },

  /**
   * 获取用户汇总数
   */
  getActivityCollect() {
    http.fxGet(api.gift_activity_count, {}, (res) => {
      utils.logger(res.data, '获取用户汇总')
      if (res.success) {
        this.setData({
          collectCount: res.data
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   *  获取生活馆信息
   */
  getLifeStore(storeRid) {
    http.fxGet(api.life_store, { rid: storeRid }, (res) => {
      utils.logger(res.data, '获取生活馆')
      if (res.success) {
        let store = res.data
        store.name += '的生活馆'
        if (store.name.length > 5) {
          store.name = utils.truncate(store.name, 5)
        }
        this.setData({
          lifeStore: store
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 验证登录状态
   */
  _validateLoginStatus () {
    // 是否登陆
    if (!app.globalData.isLogin) {
      this.setData({
        showLoginModal: true
      })

      return
    }
  },

  /**
   * 刷新用户登录信息
   */
  _refreshUserLogin () {
    const jwt = app.globalData.jwt
    let isSmallB = false
    let storeRid = ''
    let storePath = this.data.storePath
    if (jwt.is_small_b) {
      isSmallB = true
      storeRid = jwt.store_rid
      storePath = 'pages/index/index?sid=' + jwt.store_rid 

      this.getLifeStore(storeRid)
    }

    this.setData({
      isLogin: app.globalData.isLogin,
      userInfo: app.globalData.userInfo,
      isSmallB: isSmallB,
      storeRid: storeRid,
      storePath: storePath
    })

    this.getActivityCollect()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    this.setData({
      isLogin: app.globalData.isLogin,
      userInfo: app.globalData.userInfo
    })

    // 用户登录信息
    if (app.globalData.isLogin) {
      this._refreshUserLogin()
    }
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
    if (app.globalData.isLogin) {
      this._refreshUserLogin()
    }
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
    return app.shareWxaGift()
  }
  
})