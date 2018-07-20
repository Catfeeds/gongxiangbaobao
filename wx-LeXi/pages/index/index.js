//index.js
//获取应用实例
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
Page({
  /**
   * 页面的初始数据xiaoyi.tian@taihuoniao.com
   */
  data: {
    isAuthentication:'', // 是否经过官方认证的店铺
    couponList: '', // 优惠券列表---couponList
    fullSubtractionList: '', // 满减---
    rid: [], // 店铺的rid---
    shareWhat: '', //分享什么东西---
    ShopOwner: [], // 店铺主人的信息---
    currentNewProduct: [], // 人气里面最新---
    highQualityProduct: [], // 优质精品---
    popularProductTheme: [], // 人气里面的主题---
    myProduct: [], //作品列表---
    recommendProductList: [], // 推荐好物品---
    themeProduct: [], //主打设计---
    openid: '', // openid---
    BrowseQuantityInfo: [], // 浏览人数---
    announcement: false, //获取店铺的公告---
    shopInfo: [], //店铺信息--- 
    is_with: false, // 是否对这个店铺有关注---
    is_share: false, //分享 ---
    coupon_show: false, //优惠券是否显示
    catgoryActive: 1, //分类的选项-切换---
    // 优惠券的请求参数
    couponParams: {
      page: 1,
      per_page: 10,
      status: 1, // 优惠券状态 -1: 禁用；1：正常；2：已结束
      'type': '' // 是否满减活动 3、满减
    },
    // 精品 作品 人气里面的请求参数---
    productCategoryParams: {
      page: 1, // 当前页码
      per_page: 10, // 每页数量
      start_date: '', // 发布日期的开始日期
      end_date: '', // 发布日期的结束日期
      cid: '', // 分类Id 
      status: '', // 商品状态 0:仓库中; 1:出售中; 2:下架中; 3:已售罄
      is_distributed: '', // 商品类别 0: 全部; 1：自营商品；2：分销商品
      qk: '', // 搜索关键字
      out_of_stock: '', // 商品库存 0: 全部; 1: 数量不足
      user_record: true //用户是否喜欢
    },
    //分类 精品 作品 人气---
    catgory: [{
        name: "精品",
        rid: 1
      },
      {
        name: "作品",
        rid: 2
      },
      {
        name: "人气",
        rid: 3
      }
    ],
    url: "../../images/timg.jpg",
    tabPisition: false, //tab是否定位
    // 推荐好物里面的参数---
    recommendProductParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
    },
    // 人气里面的最新作品参数
    currentNewParams: {
      page: 1,
      per_page: 10
    },
    // 创造订单参数,待写入---
    createdOrder: {
      address_rid: '', //String	必需	 	收货地址ID
      outside_target_id: '', //String	可选	 	 
      invoice_type: 1, //Integer	可选	1	发票类型
      invoice_info: '', //String	可选	{}	 
      buyer_remark: '', //String	可选	 	买家备注
      blessing_utterance: '', // 买家语录
      from_client: '1', //String	可选	 	来源客户端，1、小程序；2、H5 3、App 4、TV 5、POS 6、PAD
      affiliate_code: '', //String	可选	 	推广码
      bonus_code: '', //String	可选	 	官方红包码
      customer_code: '', //String	可选	 	分销商代码
      sync_pay: 1, //Integer	可选	 	是否同步返回支付参数
      //Array	必需	 	店铺商品信息
      store_items: [{
        store_rid: '', //String	必需	 	店铺rid
        coupon_codes: [], //Array	可选	 	优惠券码列表
        //Array	必需	 	订单明细参数
        items: [{
          rid: '', //String	必需	 	sku
          quantity: 1, //Number	必需	1	购买数量
          express_id: '', //Integer	必需	 	物流公司ID
          warehouse_id: '', //Number	可选	 	发货的仓库ID
        }]
      }]
    }
  },
  // 领取优惠券
  getReceiveCoupon(e){
    http.fxPost(api.coupon_grant, { rid: e.currentTarget.dataset.rid},(result)=>{
      if(result.success){
        utils.fxShowToast('领取成功', 'success')
        this.coupon()
      }else{
        utils.fxShowToast(result.status.message)
      }
    })
  },
  // 分享模板弹出
  handleShareBox(e) {
    this.setData({
      is_share: true,
      shareWhat: e.currentTarget.dataset
    })
  },
  // 获取店铺的rid
  getStoreId() {
    var storeId = wx.getStorageSync('storeId')
    this.setData({
      rid: storeId
    })
  },
  // 获取优惠券列表
  coupon() {
    http.fxGet(api.coupons, this.data.couponParams, (result) => {
      if (result.success) {
        if (this.data.couponParams.type != 3) {
          this.setData({
            couponList: result.data,
            ['couponParams.type']: 3
          })
          app.globalData.couponList = result.data
          this.coupon()
        } else {
          this.setData({
            fullSubtractionList: result.data,
            ['couponParams.type']: ''
          })
          app.globalData.fullSubtractionList = result.data
        }
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  // 获取店铺主人的信息
  getShopOwner() {
    http.fxGet(api.store_owner_info, {}, (result) => {
      if (result.success) {
        this.setData({
          ShopOwner: result.data
        })
        wx.setStorageSync('storeOwnerInfo', result.data)
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  // 主打商品和优质精选---
  getThemeProduct(e = 1) {
    http.fxGet(api.theme_product, {
      "type": e
    }, (result) => {
      if (result.success) {
        if (e == 1) {
          this.setData({
            themeProduct: result.data
          })
        } else {
          this.setData({
            highQualityProduct: result.data
          })
        }
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  //推荐好物---
  recommendProduct() {
    this.setData({
      ['productCategoryParams.is_distributed']: 1,
    })
    http.fxGet(api.sticked_products, this.data.productCategoryParams, (result) => {
      if (result.success) {
        this.setData({
          recommendProductList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  // 人气里面的主题
  getTheme() {
    http.fxGet(api.theme, {}, (result) => {
      if (result.success) {
        this.setData({
          popularProductTheme: result.data.collections
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  // 人气最新商品
  newProdct() {
    http.fxGet(api.latest_products, this.data.currentNewParams, (result) => {
      if (result.success) {
        this.setData({
          currentNewProduct: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 添加访问者---
  addBrowse() {
    var params = {
      openid: '', //String	必须	 	用户唯一标识
      rid: '', //String	必须	 	店铺编号
      ip_addr: '', //String	可选	 	访问时IP
      agent: '', //String	可选	 	访问时代理
    }

    params.openid = wx.getStorageSync('jwt').openid
    params.rid = this.data.rid
    http.fxPost(api.add_browse, params, (result) => {
      if (result.success) {
        this.getBrowseQuantity() // 浏览浏览人数---
      } else {
        // utils.fxShowToast(result.status.message)
        this.getBrowseQuantity() // 浏览浏览人数---
      }
    })
  },
  // 获取浏览浏览人数---
  getBrowseQuantity(page = 1, per_page = 12) {
    var params = {
      rid: this.data.rid,
      page: page,
      per_page: per_page,
      openid: wx.getStorageSync('jwt').openid
    }
    http.fxGet(api.BrowseQuantityNumber.replace(/:rid/g, this.data.rid), params, (result) => {
      console.log(result)
      if (result.success) {
        this.setData({
          BrowseQuantityInfo: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  // 获取店铺公告---
  getAnnouncement() {
    http.fxGet(api.store_announcement, {}, (result) => {
      if (result.data.content !== undefined) {
        this.setData({
          announcement: result.data.content
        })
      }
    })
  },
  // 添加关注---
  handleAddWatch() {
    http.fxPost(api.add_watch, {
      rid: this.data.rid
    }, (result) => {
      if (result.success) {
        app.globalData.isWatchstore = true
        this.getIndexData()
        this.getIsWatch()

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  // 取消关注---
  handleDeleteWatch() {
    http.fxPost(api.delete_watch, {
      rid: this.data.rid
    }, (result) => {
      if (result.success) {
        app.globalData.isWatchstore = false
        this.getIndexData()
        this.getIsWatch()

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  // 查看是否关注
  getIsWatch() {
    http.fxGet(api.examine_watch, {
      rid: this.data.rid
    }, (result) => {
      if (result.success) {
        this.setData({
          is_with: result.data.status
        })
        app.globalData.isWatchstore = result.data.status
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  // 获取店铺信息---
  getIndexData() {
    const that = this
    const params = {};
    http.fxGet(api.shop_info, params, function(result) {
      if (result.success) {
        app.globalData.storeInfo = result.data
        that.setData({
          shopInfo: result.data
        })
        wx.setStorageSync('storeInfo', result.data)
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  //分类选项的函数---
  handleGoryActiveTap(e = 1) {
    if (e.currentTarget == undefined) {
      this.setData({
        catgoryActive: e
      })
    } else {
      this.setData({
        catgoryActive: e.currentTarget.dataset.rid
      })
    }
    //精选里面的
    if (this.data.catgoryActive === 1) {

    }
    // 作品里面的
    if (this.data.catgoryActive === 2) {
      http.fxGet(api.products, this.data.productCategoryParams, (result) => {
        if (result.success) {
          this.setData({
            myProduct: result.data
          })
        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    }
    // 人气里面的
    if (this.data.catgoryActive === 3) {
      this.getTheme() // 人气里面的主题
      this.newProdct() // 人气里面的最新作品
    }
  },
  // 创建订单参数 并且设置店铺的id
  createdOrderParams() {
    this.setData({
      ['createdOrder.store_items[0].store_rid']: this.data.rid
    })
    wx.setStorageSync('orderParams', this.data.createdOrder)
  },
  // 点击喜欢
  handleBindLike(e) {
    var rid = e.currentTarget.dataset.id
    var fx = wx.getStorageSync('fx')
    var isLike = e.currentTarget.dataset.islike
    if (!fx.isLogin) {
      if (isLike) {
        //喜欢就删除
        http.fxDelete(api.userlike, {
          rid: rid
        }, (result) => {
          if (result.success) {
            this.recommendProduct()
          } else {
            utils.fxShowToast(result.status.message)
          }
        })
      } else {
        // 不喜欢就添加
        http.fxPost(api.userlike, {
          rid: rid
        }, (result) => {
          if (result.success) {
            this.recommendProduct()
          } else {
            utils.fxShowToast(result.status.message)
          }
        })
      }
    } else {
      //有没有在自己服务器登陆
    }
  },
  //  是否经过认证 4 是已经认证，其他为没有认证
  getAuthentication(){
    http.fxGet(api.is_authentication,{},(result)=>{
      console.log(result)
      if(result.success){
        this.setData({
          isAuthentication:result.data
        })
        app.globalData.isAuthenticationStore = result.data.status
      }else{
        utils.fxShowToast(result.status.message)
      }
    })
  },


  // onGotUserInfo: function(e) {
  //   console.log(e.detail.errMsg)
  //   console.log(e.detail.userInfo)
  //   console.log(e.detail.rawData)
  // },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      openid: wx.getStorageSync('jwt').openid
    })
    console.log(this.data.openid)
    this.getStoreId() // 获取店铺的rid---
    this.getIndexData() //获取店铺信息---
    this.coupon() // 获取优惠券---
    this.handleGoryActiveTap() //获取产品 例如作品（首先获取的） 作品 人气
    
    this.createdOrderParams() //创建订单的参数---
    this.getAnnouncement() // 获取店铺公告---
    this.getIsWatch() // 查看是否关注---
    this.getThemeProduct() //主打的设计1,主打设计 2,优质精选---
    this.getThemeProduct(2) //主打的设计1,主打设计 2,优质精选---
    this.recommendProduct() // 推荐好物---
    this.getShopOwner() // 获取店铺主人的信息---
    this.getAuthentication()// 查看是否认证---
    this.addBrowse() // 添加访问者---
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  //监听页面的滚动
  onPageScroll: function(e) {
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
  onShareAppMessage: function(res) {
    //***注意！ this.data.shareWhat.from==2 为分享商品
    //***注意！ this.data.shareWhat.from==1 为分享店铺
    //***注意！ target.dataset.from==3 为分优惠券
    console.log(this.data.shareWhat)
    console.log(res)
    if (res.target.dataset.from == 3) {
      return {
        title: "转发的标题",
        path: '/pages/share/share',
        success:function(e) {
          console.log(e)
        },
        fail:function(e){
          console.log(e)
        }
      }
    }
    if (res.from === 'button' && this.data.shareWhat.from == 2) {
      console.log(res.target)
      return {
        title: this.data.shareWhat.sharestore.name,
        imageUrl: this.data.shareWhat.sharestore.cover,
        path: '/page/product/product?rid=' + this.data.shareWhat.sharestore.rid
      }
    }
    if (res.from === 'button' && this.data.shareWhat.from == 1) {
      console.log(res.target, this.shopInfo)
      return {
        title: this.shopInfo.name,
        path: '/page/index/index'
      }
    }
  },

  //跳转到关于品牌页面
  brandInformationTap() {
    console.log(11)
    wx.navigateTo({
      url: '../brandInformation/brandInformation'
    })
  },

  //跳转到商品详情---
  handleInfomation(e) {
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&product=' + this.data.myProduct
    })
  },
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
  //优惠券完成按钮
  handleOffCouponTap() {
    this.setData({
      coupon_show: false
    })
  },
  //进入主题页面
  handlethemeTap(e) {

    console.log(e.currentTarget.dataset.id)
    console.log(this.data.popularProductTheme)
    app.globalData.themeProdct = this.data.popularProductTheme[e.currentTarget.dataset.index]
    wx.navigateTo({
      url: '../theme/theme?id=' + e.currentTarget.dataset.id,
    })
  }
})