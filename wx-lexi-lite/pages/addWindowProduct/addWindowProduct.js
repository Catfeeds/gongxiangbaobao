// pages/addWindowProduct/addWindowProduct.js
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
    loadingProduct:false,
    needPhotoIndex: "", //需求图片的窗口的index
    productPhoto: [], // 商品图片
    clickHint:-1, // 点击提示

    pickProductId: '', // 选中的商品图片的id
    pickProductLink: '', // 选中的商品图片的链接
    rid: '', // 商品的id
    storeId:'',//店铺的id

    toggleCode: "like",
    category: [{
        name: "喜欢",
        code: "like"
      },
      {
        name: "心愿单",
        code: "thinkOrder"
      },
      {
        name: "最近查看",
        code: "browse"
      }
    ],

    userBrowsesProduct: [], // 浏览记录
    userBrowsesIsNext: false,
    browseParams: {
      page: 1,
      per_page: 12
    },

    desireOrderProduct: [], // 心愿单
    desireOrderIsNext: false,
    getProductParams: {
      page: 1,
      per_page: 12
    },

    likeProduct: [], // 喜欢的商品
    likeProductIsNext: false,
    likeParams: {
      page: 1,
      per_page: 12
    }
  },

  // 切换分类
  handleToggleCategory(e) {
    this.setData({
      toggleCode: e.currentTarget.dataset.code
    })
  },

  // 触底加载
  handleReachBottom() {

    // 加载喜欢
    if (this.data.toggleCode == 'like') {
      if (!this.data.likeProductIsNext) {
        return
      }
      this.setData({
        'likeParams.page': this.data.likeParams.page + 1
      })

      this.getUserLike()
    }

    // 加载心愿单
    if (this.data.toggleCode == 'thinkOrder') {
      if (!this.data.desireOrderIsNext) {
        return
      }
      this.setData({
        'getProductParams.page': this.data.getProductParams.page + 1
      })

      this.getThinkOrder()
    }

    // 加载浏览记录
    if (this.data.toggleCode == 'browse') {
      if (!this.data.userBrowsesIsNext) {
        return
      }
      this.setData({
        'browseParams.page': this.data.browseParams.page + 1
      })

      this.getBrowse()
    }
  },


  // 选择图片
  handlePickPhoto(e) {
    utils.logger(e)
    this.setData({
      pickProductId: e.currentTarget.dataset.photoId,
      pickProductLink: e.currentTarget.dataset.photoLink,
    })
  },

  //获取商品的图片
  handleGetProductPhoto(e) {
    utils.logger(e, "选择的商品参数")
    let rid = e.currentTarget.dataset.rid
    let openid = app.globalData.jwt.openid
    let storeId = e.currentTarget.dataset.storeRid
    let index = e.currentTarget.dataset.index

    this.setData({
      clickHint:index,
      loadingProduct:true,
    })

    http.fxGet(api.product_content.replace(/:rid/g, rid), {
      user_record: "1",
      openid: openid
    }, result => {
      utils.logger(result, "产品详情")
      if (result.success) {
        this.setData({
          productPhoto: result.data.images,
          pickProductId: result.data.images[0].id,
          pickProductLink: result.data.images[0].view_url,
          rid: rid,
          storeId: storeId,
          loadingProduct: false,
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 确定添加按钮
  handleAddWindowBtn() {
    let router = getCurrentPages()
    utils.logger(router, "页面路径")
    let parentData = router[router.length - 2].data.windowParams.product_items

    const promistSum = new Promise( (resolve, reject) => {
      let sum = 0
      parentData.forEach((v, i) => {
        if (v.storeId == this.data.storeId){
          sum = sum+1
        }
        if (i == parentData.length-1){
          if (sum <2) {
            resolve()
          }
          if (sum == 2) {
            reject()
          }
        }
    })
    })

    promistSum.then(()=>{
      router[router.length - 2].setData({
        ['windowParams.product_items[' + this.data.needPhotoIndex + ']']: {
          link: this.data.pickProductLink,
          cover_id: this.data.pickProductId,
          rid: this.data.rid,
          storeId: this.data.storeId
        }
      })

      wx.navigateBack({
        delta:1
      })
    }).catch(()=>{
      utils.fxShowToast("一个橱窗最多可添加同一个设计馆2件商品")
    })
  },

  // 获取心愿单
  getThinkOrder() {
    http.fxGet(api.wishlist, this.data.getProductParams, (result) => {
      if (result.success) {
        utils.logger(result, "心愿单")
        let data = this.data.desireOrderProduct
        this.setData({
          desireOrderProduct: data.concat(result.data.products),
          desireOrderIsNext: result.data.next
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 最近查看
  getBrowse() {
    let openid = app.globalData.jwt.openid
    http.fxGet(api.user_browses, { ...this.data.browseParams,
      openid: openid
    }, (result) => {
      if (result.success) {
        utils.logger(result, "用户最近查看")
        let data = this.data.userBrowsesProduct
        this.setData({
          userBrowsesProduct: data.concat(result.data.products),
          userBrowsesIsNext: result.data.next
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取喜欢
  getUserLike() {
    http.fxGet(api.userlike, this.data.likeParams, (result) => {
      utils.logger(result, "喜欢的商品")
      if (result.success) {
        let data = this.data.likeProduct
        this.setData({
          likeProduct: data.concat(result.data.products),
          likeProductIsNext: result.data.next
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
      needPhotoIndex: options.index
    })
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
    this.getUserLike() // 用户喜欢
    this.getThinkOrder() // 心愿单
    this.getBrowse() // 浏览记录
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