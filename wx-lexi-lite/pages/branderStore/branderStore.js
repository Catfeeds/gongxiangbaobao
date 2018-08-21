// pages/branderStore/branderStore.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
const common = require('./../../utils/common.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeRid: "", //店铺的rid
    isNext: [], // 是否有下一页面
    storeInfo: [], // 店铺的详情
    couponList: {
      coupons:[]
    }, // 优惠券列表---couponList
    productList: [], // 店铺商品列表
    announcement: [], // 店铺的公告
    categoryId: 1, // 分类的id
    announcementShow: '', // 详细信息动画盒子
    openPickBox: false, // 筛选的模态框
    fullSubtractionList: [], // 满减
    categoryList: [{
        name: "商品",
        num: 0,
        id: 1
      },
      {
        name: "文章",
        num: 0,
        id: 2
      }
    ],
    // 请求商品的
    params: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
      sid: '', //String	必须	 	店铺编号
      cid: '', //Number	可选	 	分类Id
      status: '', //Number	可选	1	商品状态 -1: 所有 0: 仓库中; 1: 出售中; 2: 下架中; 3: 已售罄
      is_distributed: '', //Number	可选	 	商品类别 0: 全部; 1：自营商品；2：分销商品
      qk: '', //String	可选	 	搜索关键字
      min_price: '', //Number	可选	 	价格区间： 最小价格
      max_price: '', //Number	可选	 	价格区间： 最大价格
      sort_type: '', //Number	可选	0	排序: 0= 不限, 1= 综合排序, 2= 价格由低至高, 3= 价格由高至低
      is_free_postage: '', //Number	可选	0	是否包邮: 0 = 全部, 1= 包邮
      is_preferential: '', //Number	可选	0	是否特惠: 0 = 全部, 1= 特惠
      is_custom_made: '', //Number	可选	0	是否可定制: 0 = 全部, 1= 可定制
    },
    //
    // 优惠券的请求参数
    couponParams: {
      page: 1,
      per_page: 10,
      status: 1, // 优惠券状态 -1: 禁用；1：正常；2：已结束
      'type': '' // 是否满减活动 3、满减
    },
  },

  // 切换分类
  handleChangeCategory(e) {
    console.log(e.currentTarget.dataset.id)
    this.setData({
      categoryId: e.currentTarget.dataset.id
    })

    if (e.currentTarget.dataset.id == 2) {

    }
  },

  // 打开排序的盒子
  handelOffPick() {
    let animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })

    animation.top(0).step()

    this.setData({
      sortBox: animation.export()
    })

  },

  // 打开筛选的模态框
  handleSortShow() {
    let animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })

    animation.top(0).step()

    this.setData({
      openPickBox: animation.export()
    })

  },

  // 关闭排序的盒子
  handleSortOff() {
    let animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })

    animation.top(10000).step()

    this.setData({
      sortBox: animation.export()
    })
  },

  // 关闭筛选的模态框
  handelOffPickBox() {
    let animationOff = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })

    animationOff.top(10000).step()

    this.setData({
      openPickBox: animationOff.export()
    })

  },

  // 获取排序的产品
  handleSort(e = 0) {
    console.log(e.detail.rid)
    if (e.detail.rid != undefined) {
      this.setData({
        productList: [],
        ['params.page']: 1,
        ['params.sort_type']: e.detail.rid
      })
    }
    this.products()
  },

  // 获取筛选
  handlePickProduct(e) {
    console.log(e)
    let rids = e.detail.category
    let minPrice = e.detail.minPrice
    let maxPrice = e.detail.maxPrice
    this.setData({
      productList: [],
      ['params.page']: e.detail.page ? e.detail.page : this.data.page,
      ['params.cids']: rids == undefined ? "" : rids.join(','),
      ['params.min_price']: minPrice,
      ['params.max_price']: maxPrice
    })

    this.products()
  },

  // 详情的盒子显示
  handleAnnouncementShow() {
    // announcementShow
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: "ease",
      delay: 0
    })
    animation.top(0).step()

    this.setData({
      announcementShow: animation
    })
  },

  // 关注店铺
  handelAddfollow() {
    http.fxPost(api.add_watch, {
      rid: this.data.storeRid
    }, (result) => {
      if (result.success) {

        this.setData({
          ['storeInfo.is_followed']: true
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 取消关注店铺
  handeldeleteFollow() {
    http.fxPost(api.delete_watch, {
      rid: this.data.storeRid
    }, (result) => {
      if (result.success) {

        this.setData({
          ['storeInfo.is_followed']: false
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 详情的盒子隐藏
  handleAnnouncementHidden() {
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: "ease",
      delay: 0
    })
    animation.top(10000).step()

    this.setData({
      announcementShow: animation
    })
  },

  // 获取店铺的商品列表 life_store_products
  products() {
    wx.showLoading()
    http.fxGet(api.life_store_products, this.data.params, (result) => {
      wx.hideLoading()
      console.log(result, "店铺商品列表")
      if (result.success) {
        let data = this.data.productList
        result.data.products.forEach((v) => {
          data.push(v)
        })

        this.setData({
          isNext: result.data.next,
          productList: data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 领取优惠券
  getReceiveCoupon(e) {
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return false
    }
    console.log(e.currentTarget.dataset.rid)
    http.fxPost(api.coupon_grant, {
      rid: e.currentTarget.dataset.rid
    }, (result) => {
      console.log(result)
      if (result.success) {
        utils.fxShowToast('领取成功', 'success')
        // this.getCouponAndFullSubtraction()
        // let topPage = getCurrentPages()
        // let topPagePath = topPage[topPage.length - 2]

        // this.getCouponAndFullSubtraction()
        setTimeout(() => {
          this.getCouponsByUser()
        }, 200)
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取与登录用户相关的店铺优惠券 or 满减
  getCouponsByUser(type = ' ') {
    this.setData({
      ['couponParams.type']: type
    })
    // 优惠券
    http.fxGet(api.user_login_coupon, { ...this.data.couponParams,
      store_rid: this.data.storeRid
    }, (result) => {
      if (result.success) {
        if (type != 3) {
          console.log(result, '登陆的优惠券')
          let parms = result.data
          parms.coupons.forEach((v, i) => {
            v.user_coupon_start = utils.timestamp2string(v.start_date, "date")
            v.user_coupon_end = utils.timestamp2string(v.end_date, "date")
          })

          this.setData({
            couponList: result.data
          })
          app.globalData.couponList = result.data
        } else {

          // 调取满减
          this.getCoupons('loginFullSubtractionList')

        }
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 用户未登录时获取店铺优惠券 or 满减活动列表
  getCoupons(e) {
    http.fxGet(api.noCouponsList, {
      store_rid: this.data.storeRid
    }, (result) => {
      console.log(result, '没有登陆获取优惠券')
      if (result.success) {
        let coupon = [] // 优惠券
        let full = [] // 满减券
        result.data.coupons.forEach((v, i) => {
          console.log(v)
          if (v.type == 3) {
            full.push(v)
          } else {
            coupon.push(v)
          }
        })
        console.log(full, "满减")
        // 如果是登陆状态下调取直接赋值满减
        if (e == "loginFullSubtractionList") {
          this.setData({
            fullSubtractionList: full
          })
          app.globalData.fullSubtractionList = result.data
          console.log(result.data, "满减")
        } else {
          this.setData({
            ['couponList.coupons']: coupon, // 优惠券列表---couponList
            fullSubtractionList: full, // 满减---
          })
          app.globalData.fullSubtractionList.coupons = full
          app.globalData.couponList.coupons = coupon
        }
        console.log(full, '满减')
        console.log(full, '满减')
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取店铺的信息 official_store/info
  getStoreInfo() {
    http.fxGet(api.official_store_info, {
      rid: this.data.storeRid
    }, (result) => {
      console.log(result, "店铺的详情")
      if (result.success) {

        this.setData({
          ['categoryList[0].num']: result.data.product_count,
          ['categoryList[1].num']: result.data.life_record_count,
          storeInfo: result.data
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取店铺公告---official_store_announcement
  getAnnouncement() {
    http.fxGet(api.official_store_announcement, {
      rid: this.data.storeRid
    }, (result) => {
      console.log(result, "店铺的公告")
      if (result.success) {
        result.data.delivery_date = utils.timestamp2string(result.data.delivery_date, "date") //发货时间
        result.data.end_date = utils.timestamp2string(result.data.end_date, "date") // 休馆结束
        result.data.begin_date = utils.timestamp2string(result.data.begin_date, "date") // 休馆开始

        this.setData({
          announcement: result.data
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
    console.log(options)
    this.setData({
      ['params.sid']: options.rid,
      storeRid: options.rid
    })

    this.getStoreInfo() // 店铺详情
    this.getAnnouncement() // 店铺的公告
    this.products() // 获取店铺的商品列表
    this.getCouponsByUser() // 获取登陆用户地优惠券
    this.getCouponsByUser(3) // 获取满减
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

    if (!this.data.isNext) {
      utils.fxShowToast("没有更多商品了")
      return
    }

    this.setData({
      ['params.page']: this.data.params.page + 1
    })

    this.products()
  },

  // 优惠卷隐藏和显示
  coupon_show() {
    // handleGoIndex
    this.setData({
      coupon_show: true
    })
  },

  // 关闭优惠卷呼出框
  handleOffCouponTap() {
    this.setData({
      coupon_show: false
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

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
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})