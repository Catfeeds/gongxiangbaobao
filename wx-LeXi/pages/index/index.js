//index.js
//获取应用实例
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    announcement:false, //获取店铺的公告---
    shopInfo:[], //店铺信息--- 
    //是否对这个店铺有关注
    is_with: false,

    is_share: false,
    url: "../../images/timg.jpg",
    coupon_show: false,
    //购物车
    shoppingCart: [
      {
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
      {
        id: 5,
        title: "	图像加载被中断",
        currentPrice: 500,
        originPrice: 321,
        logisticsExpenses: 9,//运费信息：0为没有运费用，包邮，其他为运费的价格
        is_like: true,//是否喜欢
        is_likeNumber: 66,//喜欢的人数
        shopName: "bbq_BBQ_123亲",//店铺名称
        shopingNumber: 1,//购买的数量
        img: "http://www.hzxznjs.com/uploads/160728/1-160HQ64603a7.jpg",
        repertoryNumber: 10
      },
      {
        id: 4,
        title: "	图像加载被中断",
        currentPrice: 500.99,
        // originPrice: 666,
        logisticsExpenses: 0,//运费信息：0为没有运费用，包邮，其他为运费的价格
        is_like: true,//是否喜欢
        is_likeNumber: 66,//喜欢的人数
        shopName: "bbq_BBQ_123亲",//店铺名称
        shopingNumber: 1,//购买的数量
        img: "http://www.hzxznjs.com/uploads/160728/1-160HQ64603a7.jpg",
        color: "绿色",
        repertoryNumber: 13
      }
    ],
    // 主打设计
    Theme_goods: [
      {},
      {},
      {},
      {},
      {}
    ],

    logo: "../../images/timg.jpg",
    tabPisition: false,//tab是否定位
    catgory: [
      { name: "精品", rid: 1 },
      { name: "作品", rid: 2 },
      { name: "人气", rid: 3 }
    ],//分类
    catgoryActive: 1//分类的选项
  },
  // 添加访问者
  addBrowse () {
    http.fxPost(api.add_browse,)
  },
  // 浏览浏览人数---
  getBrowseQuantity (page = 1, per_page = 12) {
    console.log(this.data.shopInfo.rid)
    var params = {
      rid: this.data.shopInfo.rid,
      page: page,
      per_page: per_page
    }
    http.fxGet(api.BrowseQuantityNumber.replace(/:rid/g, this.data.shopInfo.rid), params,(result) => {
      if (result.success) {
        console.log(result)
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  // 获取店铺公告
  getAnnouncement () {
    http.fxGet(api.store_announcement, { rid: this.data.shopInfo.rid},(result) =>{
      if(result.success){
        console.log(result)
        this.setData({
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  // 添加关注---
  handleAddWatch()  {
    http.fxPost(api.add_watch, {rid: this.data.shopInfo.rid},(result) => {
      if (result.success) {
        console.log(result)
        this.getIndexData()
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  // 取消关注---
  handleDeleteWatch()  {
    http.fxPost(api.delete_watch, {rid: this.data.shopInfo.rid},(result) => {
      if (result.success) {
        console.log(result)
        this.getIndexData()
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  
  // 获取店铺信息---
  getIndexData () {
    const that = this
    const params = {
      spot: "wx_index_slide",
      per_page: 5
    };
    http.fxGet(api.shop_info, params, function (result) {
      console.log(result)
      if (result.success) {
        that.setData({
          shopInfo: result.data
        })
      } else {
        
      }
    })
  },
  //分类选项的函数
  catgoryActiveTap(e) {
    console.log(e.currentTarget.dataset.rid)
    this.setData({
      catgoryActive: e.currentTarget.dataset.rid
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getIndexData() //过去店铺信息---
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    setTimeout(() => {
      this.getBrowseQuantity() // 浏览浏览人数---
    },1500)
  },
  //监听页面的滚动
  onPageScroll: function (e) {
    // console.log(e)
    if (e.scrollTop >= 464) {
      this.setData({
        tabPisition: true
      })
    } else if (e.scrollTop < 464) {
      this.setData({
        tabPisition: false
      })
    }
  },
  shareTap(e) {
    var sign
    if (e.currentTarget.dataset.is_share == "1") {
      sign = true
    } else {
      sign = false
    }
    this.setData({
      is_share: sign
    })
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
  onShareAppMessage: function (res) {

    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '自定义转发标题',
      path: '/page/user?id=123'
    }
  },

  //跳转到关于品牌页面
  brandInformationTap() {
    console.log(11)
    wx.navigateTo({
      url: '../brandInformation/brandInformation'
    })
  },

  //跳转到商品详情
  prodctTap() {
    wx.navigateTo({
      url: '../product/product',
    })
  }
  ,
  //跳转到关注页面
  wacthTap() {
    wx.navigateTo({
      url: '../watch/watch',
    })
  },
  //优惠卷隐藏和显示
  coupon_show() {
    this.setData({
      coupon_show: true
    })
  },
  //进入主题页面
  themeTap() {
    wx.navigateTo({
      url: '../theme/theme',
    })
  }
})