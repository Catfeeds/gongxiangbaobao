/**
 * 生活馆管理
 */
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    posterUrl:'', // 生成海报的url
    cardPhoto:'', // 开馆的卡片

    sid: '', // 当前生活馆rid
    activeSubMenu: 'lifeStore',
    lifeStore: { // 生活馆信息
      phases: 1
    },
    createdAt: 0, // 生活馆创建日期
    timer: null,
    expired: false, // 是否已过实习期
    leftTimer: { // 剩余时间
      days: 0,
      hours: 0, 
      minutes: 0,
      seconds: 0,
    },
    collect: {
      all_count: 0, // 总计成交订单
      today_count: 0, // 今日成交数
      pending_commission_price: 0, // 待结算金额
      today_commission_price: 0, // 今日收益
      total_commission_price: 0, // 累计收益
      cash_price: 0, // 可提现金额
      total_cash_price: 0 // 累计已提现
    },
    showModal: false,
    showQrcodeModal: false,
    setIncomeStar: false,
    setWithdrawStar: false,
    showShareModal:false
  },

  /**
   * 切换个人中心
   */
  handleGoUser() {
    wx.switchTab({
      url: '../user/user',
    })
  },

  /**
   * 跳转至交易记录
   */
  handleGoTrade () {
    wx.navigateTo({
      url: '../lifeStoreTransaction/lifeStoreTransaction'
    })
  },

  /**
   * 跳转至提现
   */
  handleGoWithdraw () {
    wx.navigateTo({
      url: '../lifeStoreWithdraw/lifeStoreWithdraw'
    })
  },

  /**
   * 显示公众号二维码图片
   */
  handleShowQrcodeModal () {
    this.setData({
      showQrcodeModal: true
    })
  },

  /**
   * 提示弹出框
   */
  handleShowModal () {
    console.log('d')
    this.setData({
      showModal: true
    })
  },

  // 邀请好友弹出框
  handleShareShow(e) {
    this.setData({
      showShareModal: true,
    })

   
    this.getOpenStorePhoto() // 开馆的卡片
    this.getWxaPoster(this.data.uid) // 开馆的海报
  },

  // 邀请好友开馆的卡片
  getOpenStorePhoto(){
    http.fxPost(api.market_share_invite_carde, {}, (result) => {
      console.log(result, '邀请好友开馆的卡片')
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
  getWxaPoster(rid) {
    let lastVisitLifeStoreRid = app.getDistributeLifeStoreRid()

    // scene格式：rid + '#' + sid
    let scene = rid
    if (lastVisitLifeStoreRid) {
      scene += '-' + lastVisitLifeStoreRid
    }

    let params = {
      scene: scene,
      path: 'pages/index/index',
      auth_app_id: app.globalData.app_id
    }
    console.log(params,"海报参数")
    http.fxPost(api.market_share_invite_poster, params, (result) => {
      console.log(result, '生成海报图')
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
              utils.fxShowToast('海报保存成功',"success")
            },
            fail(res) {

              if (res.errMsg === "saveImageToPhotosAlbum:fail:auth denied") {
                wx.openSetting({
                  success(settingdata) {
                    console.log(settingdata)
                    if (settingdata.authSetting["scope.writePhotosAlbum"]) {
                      console.log("获取权限成功，再次点击图片保存到相册")
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
   * 保存二维码图片
   */
  handleSaveQrcode (e) {
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
            },
            fail(res) {
              if (res.errMsg === "saveImageToPhotosAlbum:fail:auth denied") {
                wx.openSetting({
                  success(settingdata) {
                    console.log(settingdata)
                    if (settingdata.authSetting["scope.writePhotosAlbum"]) {
                      console.log("获取权限成功，再次点击图片保存到相册")
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
   * 加密
   */
  handleSecretIncome () {
    wx.setStorageSync('setIncomeStar', !this.data.setIncomeStar)
    this.setData({
      setIncomeStar: !this.data.setIncomeStar
    })
  },

  /**
   * 加密
   */
  handleSecretWithdraw () {
    wx.setStorageSync('setWithdrawStar', !this.data.setWithdrawStar)
    this.setData({
      setWithdrawStar: !this.data.setWithdrawStar
    })
  },

  /**
   * 计算剩余时间
   */
  practiceLeftTimer () {
    let endTs = this.data.createdAt + 30 * 24 * 60 * 60 // 30天内
    let leftTime = endTs - utils.timestamp() // 计算剩余的毫秒数 
    // console.log('Left time: ' + leftTime)
    if (leftTime < 0) {
      clearInterval(this.data.timer)
      this.setData({
        expired: true,
        timer: null
      })
      return
    }
    let days = parseInt(leftTime / 60 / 60 / 24, 10) // 计算剩余的天数 
    let hours = parseInt(leftTime / 60 / 60 % 24, 10) // 计算剩余的小时 
    let minutes = parseInt(leftTime / 60 % 60, 10) // 计算剩余的分钟 
    let seconds = parseInt(leftTime % 60, 10) // 计算剩余的秒数 

    this.setData({
      leftTimer: {
        days: utils.checkTimeNumber(days),
        hours: utils.checkTimeNumber(hours),
        minutes: utils.checkTimeNumber(minutes),
        seconds: utils.checkTimeNumber(seconds),
      }
    })

    // console.log(this.data.leftTimer)
  },

  /**
   * 获取生活馆提现汇总
   */
  getStoreCashCollect () {
    http.fxGet(api.life_store_cash_collect, { store_rid: this.data.sid }, (res) => {
      console.log(res, '提现汇总')
      if (!res.success) {
        utils.fxShowToast(res.status.message)
      }
      this.setData({
        'collect.cash_price': res.data.cash_price.toFixed(2),
        'collect.total_cash_price': res.data.total_cash_price.toFixed(2)
      })
    })
  },

  /**
   * 获取生活馆收益汇总
   */
  getStoreIncomeCollect () {
    http.fxGet(api.life_store_income_collect, { store_rid: this.data.sid }, (res) => {
      console.log(res, '收益汇总')
      if (!res.success) {
        utils.fxShowToast(res.status.message)
      }
      this.setData({
        'collect.pending_commission_price': res.data.pending_commission_price.toFixed(2),
        'collect.today_commission_price': res.data.today_commission_price.toFixed(2),
        'collect.total_commission_price': res.data.total_commission_price.toFixed(2)
      })
    })
  },

  /**
   * 获取生活馆订单汇总
   */
  getStoreOrdersCollect () {
    http.fxGet(api.life_store_orders_collect, { store_rid: this.data.sid }, (res) => {
      console.log(res, '订单汇总')
      if (!res.success) {
        utils.fxShowToast(res.status.message)
      }
      this.setData({
        'collect.all_count': res.data.all_count,
        'collect.today_count': res.data.today_count
      })
    })
  },

  /**
   * 获取生活馆信息
   */
  getStoreInfo () {
    http.fxGet(api.life_store, {
      rid: this.data.sid
    }, (res) => {
      console.log(res, '生活馆信息')
      if (res.success) {
        this.setData({
          lifeStore: res.data,
          createdAt: res.data.created_at
        })
        this.practiceLeftTimer()
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const lifeStore = wx.getStorageSync('lifeStore')
    const userInfo = wx.getStorageSync('jwt')
    // 小B商家获取自己生活馆
    if (lifeStore.isSmallB) {
      this.setData({
        uid: userInfo.uid,
        userName: userInfo.username,
        sid: lifeStore.lifeStoreRid,
        setIncomeStar: wx.getStorageSync('setIncomeStar') || false,
        setWithdrawStar: wx.getStorageSync('setWithdrawStar') || false,
      })

      this.getStoreInfo()
      this.getStoreOrdersCollect()
      this.getStoreIncomeCollect()
      this.getStoreCashCollect()
    } else {
      // 如不是小B商家，则跳转至首页
      wx.switchTab({
        url: '../index/index'
      })
    }
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
    let timer = setInterval(() => {
      this.practiceLeftTimer()
    }, 1000)

    this.setData({
      timer: timer
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(this.data.timer)
    this.setData({
      timer: null
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.timer)
    this.setData({
      timer: null
    })
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
    // console.log(e.target.dataset.card)
    console.log(e)
    console.log(e.from)
    if (e.from == "menu" || e.target.dataset.card == 1 ){
      let lastVisitLifeStoreRid = app.getDistributeLifeStoreRid()

      // scene格式：rid + '-' + sid
      let scene = this.data.uid
      if (lastVisitLifeStoreRid) {
        scene += '-' + lastVisitLifeStoreRid
      }
      console.log('pages/index/index?scene=' + scene,"分享的参数")
      
      return {
        title: this.data.userName + '邀请你一起来来乐喜开个',
        path: 'pages/index/index?scene=' + scene,
        imageUrl: this.data.cardPhoto,
        success: (res) => {
          console.log(res, '分享商品成功!')
        }
      }

    }
  }
})