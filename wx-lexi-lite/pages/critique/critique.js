// pages/critique/critique.js
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
    submit_btn: false, // 提交按钮是否生效
    star_list: [1, 2, 3, 4, 5], //星星数量
    selectedStar: 0, // 选中星星的数量
    photo_url: [], // 上传的图片
    cretiqueParams: {}, // 提交评论的时候的参数

    // 商品
    product: [{}],

  },
  //改变星星选中数量---
  starTap(e) {
    console.log(e.currentTarget.dataset.skuid)
    var skuid = e.currentTarget.dataset.skuid
    console.log(this.data.cretiqueParams[skuid])

    this.setData({
      selectedStar: e.currentTarget.dataset.index,
      ['cretiqueParams.' + [skuid] + '.score']: e.currentTarget.dataset.index,

    }, () => {
      this.handleIsSubmit()
    })
  },
  // 评论内容发---
  handleCritique(e) {
    console.log(e.detail.value)
    console.log(e.target.dataset.rid)
    var skuid = e.target.dataset.rid
    this.setData({
      ['cretiqueParams.' + [skuid] + '.content']: e.detail.value,
    }, () => {
      this.handleIsSubmit()
    })
    console.log(this.data.cretiqueParams)
  },
  //判断是否可提交
  handleIsSubmit() {
    var totalOne = 0
    var totalTwo = 0
    var totalThree = 0
    Object.keys(this.data.cretiqueParams).forEach((key) => {
      totalOne = totalOne + 1
      console.log(this.data.cretiqueParams[key])
      if (this.data.cretiqueParams[key].content) {

        totalTwo = totalTwo + 1
      }
      if (this.data.cretiqueParams[key].score != 0) {
        totalThree = totalThree + 1
      }
    })
    console.log(totalOne, totalTwo, totalThree)
    if (totalOne == totalTwo && totalOne == totalThree && totalTwo == totalThree) {
      console.log(55555)
      this.setData({
        submit_btn: true
      })
    } else {
      this.setData({
        submit_btn: false
      })
    }
  },
  // 提交按钮
  hanleSubmitTap() {
    if (!this.data.submit_btn) {
      utils.fxShowToast('星星和评论内容是必填的')
      return
    }
    Object.keys(this.data.cretiqueParams).forEach((key)=>{
      console.log(this.data.cretiqueParams[key])
      http.fxPost(api.critique_product, this.data.cretiqueParams[key],(result)=>{
        console.log(result)
        if(result.success){
          utils.fxShowToast('点评已经提交','success')
          wx.navigateBack({
            delta:1
          })
        }else{
          utils.fxShowToast(result.status.message)
        }
      })
    }) 
    
  },
  //添加图片
  addPhotoTap() {
    if (this.data.photo_url.length >= 9) {
      wx.showToast({
        title: '最多9张图片',
        duration: 2000
      })
    } else {
      wx.chooseImage({
        success: (o) => {
          this.setData({
            photo_url: this.data.photo_url.concat(o.tempFilePaths),
            submit_btn: true
          })
        }
      })
    }
  },
  //删除要上传的图片
  delPhotoTap(e) {
    var newArr = this.data.photo_url.filter((v, i) => {
      return i != e.currentTarget.dataset.index
    })
    this.setData({
      photo_url: newArr
    })
  },
  // 获取商品---critique_product
  getProductInfo() {
    var objectParams = {}
    //获取
    this.setData({
      product: app.globalData.critiqueProduct
    }, () => {
      this.data.product.items.forEach((v, i) => {
        console.log(v)
        objectParams[v.rid] = {
          sku_rid: v.rid, //Integer	必需	 	商品sku_id
          order_rid: this.data.product.rid, //String	必需	 	订单编号
          content: false, //String	必需	 	评论内容
          score: 0, //Integer	必需	 	评论星级
          pid: 0, //Integer	可选	 	父级评论id
          asset_ids: [], //String	可选	 	图片id, 多个图片逗号隔开
        }
      })
      this.setData({
        cretiqueParams: objectParams
      })
      console.log(this.data.cretiqueParams)
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getProductInfo() // 获取商品详情
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
    return app.shareLeXi()
  }
})