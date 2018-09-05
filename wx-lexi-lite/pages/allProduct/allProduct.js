// pages/allProduct/allProduct.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isDisabled: false, // 是否禁用
    leftTimer: null, // 延迟句柄
    rightTimer: null, // 延迟句柄
    categoryList: [], // 分类列表
    checkedCids: [], // 选择的分类
    showFilterModal: false,// 筛选
    openPickBox: false, // 筛选的模态框
    sortBox: false, // 筛选的模态框

    isLoadPageShow:true, // 加载数据的Loadig图片
    shim:true, // 垫片是否显示
    topBGPhoto:'', // 头部背景图片
    topPhotoText:"", // 背景文字
    pickQuantity:"", // 商品的数量
    openPickBox:false, // 筛选的模态框
    sortBox:false, // 排序的模态框
    browseRecordOfThis:[], // 浏览过本栏目的记录
    otherUid:'', // 别人的uid
    isPersonal: false, // 是不是从个人中心进入
    productList: [], // 商品列表
    touchBottomInfo: "", // 触底加载需要的信息,
    isLoadingNextPage: true, // 触底是否加载,
    editRecommendRequestParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
      view_more:	1,//Number	可选	0	是否查看更多: 0 = 否, 1= 是
      cids: '',//String	可选 分类Id  编辑推荐=e_recommend, 优质精品=e_new, 特惠好设计=preferential_design, 百元好物=affordable_goods
      min_price:	'',//Number	可选	 	价格区间： 最小价格
      max_price:	'',//Number	可选	 	价格区间： 最大价格
      sort_type:	1,//Number	可选	0	排序: 0= 不限, 1= 综合排序, 2= 价格由低至高, 3= 价格由高至低
      is_free_postage:	0,//Number	可选	0	是否包邮: 0 = 全部, 1= 包邮
      is_preferential:	0,//Number	可选	0	是否特惠: 0 = 全部, 1= 特惠
      is_custom_made:	0,//Number	可选	0	是否可定制: 0 = 全部, 1= 可定制
    },

    // 推荐
    recommendList: [
      { name: "包邮", id: '1', isActive: false },
      { name: "特惠", id: "2", isActive: false },
      { name: "可定制", id: "3", isActive: false },
    ]
  },

  /**
* 滑块最低价格
*/
  handleChangeMinPrice(e) {
    let minPrice = e.detail.lowValue
    if (this.data.editRecommendRequestParams.max_price == -1) {
      if (minPrice == '不限') {
        minPrice = 800
      }
    }
    this.setData({
      ['editRecommendRequestParams.min_price']: minPrice
    })

    if (this.data.leftTimer) {
      clearTimeout(this.data.leftTimer)
    }

    let _t = setTimeout(() => {
      // 加载编辑推荐
      if (this.data.touchBottomInfo == "editRecommend") {
        this.editRecommend()
      }

      //加载百元好物
      if (this.data.touchBottomInfo == "oneHundred") {
        this.getOneHundred()
      }

      //加载优质新品
      if (this.data.touchBottomInfo == "highQualityList") {
        this.getHighQuality()
      }

      //加载特惠好设计 
      if (this.data.touchBottomInfo == "goodDesign") {
        this.getGoodDesign()
      }
      this.setData({
        productList: []
      })
    }, 2000)

    this.setData({
      leftTimer: _t
    })

  },

  /**
 * 重置回调事件
 */
  handleResetFilterCondition(e) {
    this.selectComponent('#fx-slider').reset()
    let _categories = this.data.categoryList
    _categories = _categories.map((cate) => {
      cate.checked = false
      return cate
    })

    this.setData({
      'categoryList': _categories,
      'editRecommendRequestParams.min_price': 0,
      'editRecommendRequestParams.max_price': -1,
      'editRecommendRequestParams.cids': ''
    })
  },

  /**
   * 滑块最高价格
   */
  handleChangeMaxPrice(e) {
    console.log(e.detail.highValue)
    let maxPrice = e.detail.highValue
    if (maxPrice == '不限') {
      maxPrice = -1
    }
    this.setData({
      ['editRecommendRequestParams.max_price']: maxPrice
    })

    if (this.data.rightTimer) {
      clearTimeout(this.data.rightTimer)
    }

    let _t = setTimeout(() => {
      // 加载编辑推荐
      if (this.data.touchBottomInfo == "editRecommend") {
        this.editRecommend()
      }

      //加载百元好物
      if (this.data.touchBottomInfo == "oneHundred") {
        this.getOneHundred()
      }

      //加载优质新品
      if (this.data.touchBottomInfo == "highQualityList") {
        this.getHighQuality()
      }

      //加载特惠好设计 
      if (this.data.touchBottomInfo == "goodDesign") {
        this.getGoodDesign()
      }
      this.setData({
        productList: []
      })
    }, 2000)

    this.setData({
      rightTimer: _t
    })
  },

  /**
* 关闭弹窗回调
*/
  handleCloseFilterModal(e) {
    this.setData({
      showFilterModal: false
    })
  },

  /**
 * 分类列表
 */
  getCategories() {
    http.fxGet(api.categories, {}, (result) => {
      console.log(result, '分类列表')
      if (result.success) {
        this.setData({
          categoryList: result.data.categories
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
 * 改变分类
 */
  handleToggleCategory(e) {
    let cid = e.currentTarget.dataset.cid

    let _checkedCids = this.data.checkedCids
    if (_checkedCids.indexOf(cid) == -1) { // 不存在，则增加
      _checkedCids.push(cid)
    } else { // 存在，则删除
      let idx = _checkedCids.indexOf(cid)
      _checkedCids.splice(idx, 1)
    }

    let _categories = this.data.categoryList
    _categories = _categories.map((cate) => {
      if (_checkedCids.indexOf(cate.id) != -1) {
        cate.checked = true
      } else {
        cate.checked = false
      }
      return cate
    })

    this.setData({
      categoryList: _categories,
      productList:[],
      'editRecommendRequestParams.cids': _checkedCids.join(','),
      'editRecommendRequestParams.page': 1
    })

    // 加载编辑推荐
    if (this.data.touchBottomInfo == "editRecommend") {
      this.editRecommend()
    }

    //加载百元好物
    if (this.data.touchBottomInfo == "oneHundred") {
      this.getOneHundred()
    }

    //加载优质新品
    if (this.data.touchBottomInfo == "highQualityList") {
      this.getHighQuality()
    }

    //加载特惠好设计 
    if (this.data.touchBottomInfo == "goodDesign") {
      this.getGoodDesign()
    }

  },

  /**
* 选择推荐
*/
  handleToggleRecommendList(e) {
    console.log(e.currentTarget.dataset.index)
    let index = e.currentTarget.dataset.index
    let id = e.currentTarget.dataset.cid
    console.log(id)

    if (this.data.recommendList[index].isActive) {
      this.setData({
        ['recommendList[' + index + '].isActive']: false
      })
    } else {
      this.setData({
        ['recommendList[' + index + '].isActive']: true
      })
    }

    if (id == 1) {
      this.setData({
        productList: [], // 商品列表
        ['editRecommendRequestParams.is_free_postage']: this.data.editRecommendRequestParams.is_free_postage == 0 ? 1 : 0
      })
    } 

    if (id == 2) {
      this.setData({
        productList: [], // 商品列表
        ['editRecommendRequestParams.is_preferential']: this.data.editRecommendRequestParams.is_preferential == 0 ? 1 : 0
      })
    }

    if (id == 3) {
      this.setData({
        productList: [], // 商品列表
        ['editRecommendRequestParams.is_custom_made']: this.data.editRecommendRequestParams.is_custom_made== 0 ? 1 : 0
      })
    }

    // 加载编辑推荐
    if (this.data.touchBottomInfo == "editRecommend") {
      this.editRecommend()
    }

    //加载百元好物
    if (this.data.touchBottomInfo == "oneHundred") {
      this.getOneHundred()
    }

    //加载优质新品
    if (this.data.touchBottomInfo == "highQualityList") {
      this.getHighQuality()
    }

    //加载特惠好设计 
    if (this.data.touchBottomInfo == "goodDesign") {
      this.getGoodDesign()
    }
  },

  /**来自首页探索页面里面的 start**/

  // 获取浏览人数的接口
  getBrowsePeopleOne(code, page = 1, per_page=12){
    http.fxGet(api.column_browse_records, { code: code, page : 1, per_page:12},(result)=>{
      console.log(result,"浏览过本栏目的记录")
      if(result.success){

        this.setData({
          browseRecordOfThis:result.data
        })

      }else{
        utils.fxShowToast(result.status.message)
      }
    })
  },

  //编辑推荐
  editRecommend() {


    http.fxGet(api.column_explore_recommend, this.data.editRecommendRequestParams, (result) => {
      console.log(result, "编辑 推荐")


      if (result.success) {
        let data = this.data.productList
        result.data.products.forEach((v) => {
          data.push(v)
        })

        this.setData({
          productList: data,
          isLoadingNextPage: result.data.next,
          pickQuantity: result.data.count,
          totalCount: result.data.count,
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 百元好物
  getOneHundred() {

    http.fxGet(api.column_affordable_goods, this.data.editRecommendRequestParams, (result) => {
      console.log(result, "百元好物")

      if (result.success) {
        let data = this.data.productList
        result.data.products.forEach((v) => {
          data.push(v)
        })

        this.setData({
          productList: data,
          isLoadingNextPage: result.data.next,
          pickQuantity: result.data.count,
          totalCount: result.data.count,
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 优质新品
  getHighQuality() {

    http.fxGet(api.column_explore_new, this.data.editRecommendRequestParams, (result) => {
      console.log(result, "优质新品")

      if (result.success) {
        let data = this.data.productList
        result.data.products.forEach((v) => {
          data.push(v)
        })

        this.setData({
          productList: data,
          isLoadingNextPage: result.data.next,
          pickQuantity: result.data.count,
          totalCount: result.data.count,
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 特惠好设计 
  getGoodDesign() {

    http.fxGet(api.column_preferential_design, this.data.editRecommendRequestParams, (result) => {
      console.log(result, "特惠好设计")
      this.getBrowsePeopleOne("preferential_design")

      if (result.success) {
        let data = this.data.productList
        result.data.products.forEach((v) => {
          data.push(v)
        })

        this.setData({
          productList: data,
          isLoadingNextPage: result.data.next,
          pickQuantity: result.data.count,
          totalCount: result.data.count,
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  /**来自编辑推荐页面里面的 end**/

  /** 我的个人中心 start**/
  //我的浏览记录
  getBrowse() {

    http.fxGet(api.user_browses, this.data.editRecommendRequestParams, (result) => {
      console.log(result, "我的浏览记录")

      if (result.success) {
        let data = this.data.productList
        result.data.products.forEach((v) => {
          data.push(v)
        })

        this.setData({
          productList: data,
          isLoadingNextPage: result.data.next,
          totalCount: result.data.count,
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })

  },

  // 我的心愿单
  getXinYuanOrder() {
    http.fxGet(api.wishlist, this.data.editRecommendRequestParams, (result) => {
      if (result.success) {
        let data = this.data.productList
        result.data.products.forEach((v) => {
          data.push(v)
        })

        this.setData({
          productList: data,
          isLoadingNextPage: result.data.next,
          totalCount: result.data.count,
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /** 我的 个人中心 end**/

/** 他的个人中心  start **/

  //他的浏览记录
  getOtherBrowses(e){

    http.fxGet(api.other_user_browses, { ...this.data.editRecommendRequestParams, uid: this.data.otherUid} , (result) => {
      console.log(result, "他的浏览记录")

      if (result.success) {
        let data = this.data.productList
        result.data.products.forEach((v) => {
          data.push(v)
        })

        this.setData({
          productList: data,
          isLoadingNextPage: result.data.next,
          totalCount: result.data.count,
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 他的喜欢
  getOtherLike(){

    http.fxGet(api.other_userlike, { ...this.data.editRecommendRequestParams, uid: this.data.otherUid }, (result) => {
      console.log(result, "他的喜欢")

      if (result.success) {
        let data = this.data.productList
        result.data.products.forEach((v) => {
          data.push(v)
        })

        this.setData({
          productList: data,
          isLoadingNextPage: result.data.next,
          totalCount: result.data.count,
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  //他的心愿单
  getOtherXinYuan(){

    http.fxGet(api.other_wishlist, { ...this.data.editRecommendRequestParams, uid: this.data.otherUid }, (result) => {
      console.log(result, "他的心愿单")

      if (result.success) {
        let data = this.data.productList
        result.data.products.forEach((v) => {
          data.push(v)
        })

        this.setData({
          productList: data,
          isLoadingNextPage: result.data.next,
          totalCount: result.data.count,
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },


/** 他的个人中心 end **/


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)

    //编辑推荐 首页的探索
    if (options.from == "editRecommend") {
      wx.setNavigationBarTitle({
        
        title: "编辑推荐"
      })

      this.getBrowsePeopleOne("e_recommend") // 获取浏览记录
      this.editRecommend() // 获取商品

      this.setData({
        topPhotoText: "编辑推荐",
        touchBottomInfo: options.from,
        topBGPhoto:"https://kg.erp.taihuoniao.com/static/img/editor-feature.png"
      })
    }

    // 百元好物
    if (options.from == "oneHundred") {
      wx.setNavigationBarTitle({
        title: "百元好物"
      })
      this.getOneHundred()

      this.getBrowsePeopleOne("affordable_goods")

      this.setData({
        topPhotoText: "百元好物",
        touchBottomInfo: options.from,
        topBGPhoto:"https://kg.erp.taihuoniao.com/static/img/yuan-100.png"
      })
    }

    //优质新品 首页的探索
    if (options.from == "highQualityList") {
      wx.setNavigationBarTitle({
        title: "优质新品"
      })

      this.getBrowsePeopleOne("e_new") // 获取浏览记录
      this.getHighQuality() // 获取商品

      this.setData({
        topPhotoText: "优质新品",
        touchBottomInfo: options.from,
        topBGPhoto:"https://kg.erp.taihuoniao.com/static/img/newest-products.png"
      })
    }

    // 特惠好设计 首页的探索
    if (options.from == "goodDesign") {
      wx.setNavigationBarTitle({
        title: "特惠好设计"
      })
      this.getGoodDesign()

      this.setData({
        topPhotoText: "特惠好设计",
        touchBottomInfo: options.from,
        topBGPhoto:"https://kg.erp.taihuoniao.com/static/img/good-design.png"
      })
    }

    // 最近查看 我的个人中心
    if (options.from == "userBrowses") {
      wx.setNavigationBarTitle({
        title: "我的浏览记录"
      })
      this.getBrowse()

      this.setData({
        shim:false,
        topPhotoText: "我的浏览记录",
        touchBottomInfo: options.from,
        isPersonal: true
      })
    }

    // 心愿单 我的个人中心
    if (options.from == "xinYuanOrder") {
      wx.setNavigationBarTitle({
        title: "我的心愿单"
      })
      this.getXinYuanOrder()

      this.setData({
        shim: false,
        topPhotoText: "我的心愿单",
        touchBottomInfo: options.from,
        isPersonal: true
      })
    }

    // 浏览记录 他的个人中心
    if (options.from == "otherBrowses") {

      this.setData({
        otherUid: options.uid
      })

      wx.setNavigationBarTitle({
        title: "Ta的浏览记录"
      })
      this.getOtherBrowses(options.uid)

      this.setData({
        shim: false,
        topPhotoText: "Ta的浏览记录",
        touchBottomInfo: options.from,
        isPersonal: true
      })
    }
    
    // 最近查看 他的喜欢
    if (options.from == "otherLike") {

      this.setData({
        otherUid: options.uid
      })

      wx.setNavigationBarTitle({
        title: "Ta的喜欢"
      })
      this.getOtherLike(options.uid)

      this.setData({
        shim:false,
        topPhotoText: "Ta的喜欢",
        touchBottomInfo: options.from,
        isPersonal: true
      })
    }
    
    // 心愿单 他的个人中中心
    if (options.from == "otherXinYuan") {

      this.setData({
        otherUid: options.uid
      })

      wx.setNavigationBarTitle({
        title: "Ta的心愿单"
      })
      this.getOtherXinYuan(options.uid)

      this.setData({
        topPhotoText: "Ta的心愿单",
        touchBottomInfo: options.from,
        isPersonal: true
      })
    }
  },

  // 获取筛选
  handlePickProduct(e) {
    console.log(e)
    let rids = e.detail.category
    let minPrice = e.detail.minPrice
    let maxPrice = e.detail.maxPrice
    this.setData({
      productList: [],
      ['editRecommendRequestParams.page']: e.detail.page ? e.detail.page : this.data.page,
      ['editRecommendRequestParams.cids']: rids == undefined ? "" : rids.join(','),
      ['editRecommendRequestParams.min_price']: minPrice,
      ['editRecommendRequestParams.max_price']: maxPrice
    })

    // 加载编辑推荐
    if (this.data.touchBottomInfo == "editRecommend") {
      this.editRecommend()
    }

    //加载百元好物
    if (this.data.touchBottomInfo == "oneHundred") {
      this.getOneHundred()
    }

    //加载优质新品
    if (this.data.touchBottomInfo == "highQualityList") {
      this.getHighQuality()
    }

    //加载特惠好设计 
    if (this.data.touchBottomInfo == "goodDesign") {
      this.getGoodDesign()
    }

  },

  // 获取排序的产品
  handleSort(e) {
    console.log(e.currentTarget.dataset.rid)
    console.log(e.detail.rid)
   
      this.setData({
        productList: [],
        ['editRecommendRequestParams.page']: 1,
        ['editRecommendRequestParams.sort_type']: e.currentTarget.dataset.rid
      })
    
    this.handleSortOff()

    console.log(this.data.editRecommendRequestParams.sort_type)
    // 加载编辑推荐
    if (this.data.touchBottomInfo == "editRecommend") {
      this.editRecommend()
    }

    //加载百元好物
    if (this.data.touchBottomInfo == "oneHundred") {
      this.getOneHundred()
    }

    //加载优质新品
    if (this.data.touchBottomInfo == "highQualityList") {
      this.getHighQuality()
    }

    //加载特惠好设计 
    if (this.data.touchBottomInfo == "goodDesign") {
      this.getGoodDesign()
    }
    
  },
  // 


  /**
   * onReachBottom 触底加载
   * **/

  onReachBottom() {
    console.log(this.data.touchBottomInfo)

    this.setData({
      ['editRecommendRequestParams.page']: this.data.editRecommendRequestParams.page - 0 + 1
    })

    if (!this.data.isLoadingNextPage) {
      utils.fxShowToast("没有更多了")
      return
    }

    // 触底加载编辑推荐
    if (this.data.touchBottomInfo == "editRecommend") {
      this.editRecommend()
    }

    //触底加载百元好物
    if (this.data.touchBottomInfo == "oneHundred") {
      this.getOneHundred()
    }

    //触底加载优质新品
    if (this.data.touchBottomInfo == "highQualityList") {
      this.getHighQuality()
    }

    //触底加载特惠好设计 
    if (this.data.touchBottomInfo == "goodDesign") {
      this.getGoodDesign()
    }

    // 触底加载我的最近查看
    if (this.data.touchBottomInfo == "userBrowses") {
      this.getBrowse()
    }

    // 触底加载我的 心愿单
    if (this.data.touchBottomInfo == "xinYuanOrder") {
      console.log("触底加载 心愿单")
      this.getXinYuanOrder()
    }

    // 触底加载 他的 浏览记录 other_user_browses
    if (this.data.touchBottomInfo == "otherBrowses") {
      this.getOtherBrowses()
    }


    // 触底加载 他的 喜欢
    if (this.data.touchBottomInfo == "otherLike") {
      this.getOtherLike()
    }


    // 触底加载他的 心愿单
    if (this.data.touchBottomInfo == "otherXinYuan") {
      console.log("触底加载他的 心愿单")
      this.getOtherXinYuan()
    }

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
    this.setData({
      isLoadPageShow: false
    })
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
    return app.shareLeXi()
  },

  // 打开筛选的模态框
  handleSortShow(){
    let animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })

    animation.top(0).step()

    this.setData({
      openPickBox: animation.export(),
      showFilterModal:true
    })

    this.getCategories()
  },

  // 关闭筛选的模态框
  handelOffPickBox(){
    let animationOff = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })

    animationOff.top(10000).step()

    this.setData({
      openPickBox: animationOff.export()
    })

  },

  // 打开排序的盒子
  handelOffPick(){
 
    this.setData({
      sortBox: true
    })

  },

  // 关闭排序的盒子
  handleSortOff(){

    this.setData({
      sortBox: false
    })
  },

  // 跳转到商品详情---
  handleInfomation(e) {
    console.log(e)
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&product=' + this.data.myProduct + "&&storeRid=" + e.detail.storeRid
    })
  },

})