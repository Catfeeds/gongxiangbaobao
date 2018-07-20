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
    // 提交按钮是否生效
    submit_btn:false,
    //星星数量
    star_list:[1,2,3,4,5],
    //选中星星的数量
    selectedStar:0,
    //商品
    product: {
      id: 6,
      title: "图像加载被中断//运费信息：//运费信息：0为没有运费用，包邮，其他为运费的价格//运费信息：0为没有运费用，包邮，其他为运费的价格//运费信息：0为没有运费用，包邮，其他为运费的价格//运费信息：0为没有运费用，包邮，其他为运费的价格0为没有运费用，包邮，其他为运费的价格",
      currentPrice: 500,
      originPrice: 999,
      logisticsExpenses: 0,//运费信息：0为没有运费用，包邮，其他为运费的价格
      is_like: true,//是否喜欢
      is_likeNumber: 66,//喜欢的人数
      shopName: "bbq_BBQ_123亲",//店铺名称
      shopingNumber: 1,//购买的数量
      img: "http://www.hzxznjs.com/uploads/160728/1-160HQ64603a7.jpg",
      color: "白色",
      repertoryNumber: 12,
      size: "M"
    },
    //上传的图片
    photo_url: []

  },
  //改变星星选中数量
  starTap(e){
    console.log(e)
    
    this.setData({
      selectedStar: e.currentTarget.dataset.index,
      submit_btn:true
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
  getProductInfo(){
    this.setData({
      product: app.globalData.critiqueProduct.items
    })
    console.log(this.data.product)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getProductInfo() // 获取商品详情
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
  onShareAppMessage: function () {

  }
})