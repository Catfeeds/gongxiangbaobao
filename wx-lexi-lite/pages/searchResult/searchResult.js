// pages/searchResult/searchResult.js
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
    isDisabled: false, // 是否禁用
    leftTimer: null, // 延迟句柄
    rightTimer: null, // 延迟句柄
    categoryList: [], // 分类列表
    checkedCids: [], // 选择的分类
    showFilterModal: false,// 筛选
    openPickBox: false, // 筛选的模态框
    sortBox: false, // 筛选的模态框

    isLoadProductShow: true, // 加载更多产品的loading图片
    prductIsNext:true, // 商品是否有下一页
    productList:[], // 商品列表

    storeIsNext:true, // 品牌馆是否有下一页
    storeList:[], // 品牌馆列表

    userList: [], // 用户的的列表
    userIsNext: true,

    navbarCategoryId: 1,
    navbarCategory: [{
        name: "商品",
        id: 1
      },
      {
        name: "品牌馆",
        id: 2
      },
      {
        name: "用户",
        id: 3
      }
    ],

    // 品牌馆搜索
    brandStoreParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 5, //Number	可选	10	每页数量
      qk: "", //必须	 	关键词
    },
    // 用户搜索
    userParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
      qk: "", //必须	 	关键词
    },

    // 搜索商品的参数
    productParams: {
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
      cids: '', //Number	可选	 	分类Id
      status: 1, //Number	可选	1	商品状态 -1: 所有 0: 仓库中; 1: 出售中; 2: 下架中; 3: 已售罄
      qk: '', //String	可选	 	搜索关键字
      min_price: '', //Number	可选	 	价格区间： 最小价格
      max_price: '', //Number	可选	 	价格区间： 最大价格
      sort_type: '', //Number	可选	0	排序: 1= 综合排序, 2= 价格由低至高, 3= 价格由高至低
      is_free_postage: '', //Number	可选	0	是否包邮: 0 = 全部, 1= 包邮
      is_preferential: '', //Number	可选	0	是否特惠: 0 = 全部, 1= 特惠
      is_custom_made: '', //Number	可选	0	是否可定制: 0 = 全部, 1= 可定制
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
    if (this.data.productParams.max_price == -1) {
      if (minPrice == '不限') {
        minPrice = 800
      }
    }
    this.setData({
      ['productParams.min_price']: minPrice
    })

    if (this.data.leftTimer) {
      clearTimeout(this.data.leftTimer)
    }

    let _t = setTimeout(() => {
      this.getSearch()
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
      'productParams.min_price': 0,
      'productParams.max_price': -1,
      'productParams.cids': ''
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
      ['productParams.max_price']: maxPrice
    })

    if (this.data.rightTimer) {
      clearTimeout(this.data.rightTimer)
    }

    let _t = setTimeout(() => {
      this.getSearch()
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

  // 打开筛选
  handelOffPick(){
    this.setData({
      showFilterModal:true
    })
    this.getCategories()
  },

  // 打开排序的模态框
  handleSortShow() {

    this.setData({
      sortBox: true
    })
    // this.getCategories()
  },

  // 关闭排序的盒子
  handleSortOff() {
    this.setData({
      sortBox: false
    })
  },

  // 获取排序的产品
  handleSort(e = 0) {
    console.log(e.detail.rid)
    if (e.detail.rid != undefined) {
      this.setData({
        productList: [],
        ['productParams.page']: 1,
        ['productParams.sort_type']: e.detail.rid
      })
    }

    this.getSearch()
    this.handleSortOff()
  },

  /**
 * 分类列表
 */
  getCategories() {
    http.fxGet(api.categories,{}, (result) => {
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
      productList: [],
      'productParams.cids': _checkedCids.join(','),
      'productParams.page': 1
    })

    this.getSearch()
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
        ['productParams.is_free_postage']: this.data.productParams.is_free_postage == 0 ? 1 : 0
      })
    }

    if (id == 2) {
      this.setData({
        productList: [], // 商品列表
        ['productParams.is_preferential']: this.data.productParams.is_preferential == 0 ? 1 : 0
      })
    }

    if (id == 3) {
      this.setData({
        productList: [], // 商品列表
        ['productParams.is_custom_made']: this.data.productParams.is_custom_made == 0 ? 1 : 0
      })
    }

    this.getSearch()
  },


  // 切换分类
  handleCategoryChange(e) {
    console.log(e.currentTarget.dataset.id)

    this.setData({
      navbarCategoryId: e.currentTarget.dataset.id,
      isLoadProductShow:true,
      prductIsNext: true, // 商品是否有下一页
      storeIsNext: true, // 品牌馆是否有下一页
      userIsNext: true,
    })

    if (this.data.navbarCategoryId == 1) {
      this.getSearch()
    }

    if (this.data.navbarCategoryId == 2) {
      if (this.data.storeList.length==0){
        this.getBrandStore() // 获取品牌管
      }
    }

    if (this.data.navbarCategoryId == 3) {
      this.getUser()
    }
  },

  //取消关注人
  hanleDeleteWatch(e) {
    let index = e.currentTarget.dataset.index
    console.log(index)
    http.fxPost(api.unfollow_user, {
      uid: e.currentTarget.dataset.uid
    }, (result) => {
      console.log(result)
      if (result.success) {
        this.setData({
          ['userList[' + index + '].follow_status']: result.data.followed_status
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  //添加关注人
  hanleAddWatch(e) {
    let index = e.currentTarget.dataset.index
    http.fxPost(api.follow_user, {
      uid: e.currentTarget.dataset.uid
    }, (result) => {
      console.log(result)
      if (result.success) {
        this.setData({
          ['userList[' + index + '].follow_status']: result.data.followed_status
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 跳转到其他人地主页
  handleToPeopleTap(e) {
    console.log(e.currentTarget.dataset.uid)
    if (e.currentTarget.dataset.index == 0) {
      wx.switchTab({
        url: '../user/user',
      })
    } else {
      wx.navigateTo({
        url: '../people/people?uid=' + e.currentTarget.dataset.uid,
      })
    }
  },

  // 取消关注店铺---
  handleDeleteWatch(e) {
    console.log(e.currentTarget.dataset.rid)
    console.log(e.currentTarget.dataset.index)
    let rid = e.currentTarget.dataset.rid
    let index = e.currentTarget.dataset.index

    http.fxPost(api.delete_watch, {
      rid: rid
    }, (result) => {
      if (result.success) {
        this.setData({
          ['storeList[' + index +'].is_follow_store']: false
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 添加关注店铺---
  handleAddWatch(e) {
    console.log(e)
    let rid = e.currentTarget.dataset.rid
    let index = e.currentTarget.dataset.index

    http.fxPost(api.add_watch, {
      rid: rid
    }, (result) => {
      if (result.success) {
        this.setData({
          ['storeList[' + index + '].is_follow_store']: true
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 跳转到商品详情---
  handleToProductInfoTap(e) {
    console.log(e.currentTarget.dataset.rid)
    wx.navigateTo({
      url: '../product/product?rid=' + e.currentTarget.dataset.rid + "&&storeRid=" + e.currentTarget.dataset.storeRid
    })
  },

  // 跳转到搜索页面
  handleToSearch() {
    wx.navigateTo({
      url: '../search/search',
    })
  },

  // 跳转到商品详情---
  handleInfomation(e) {
    console.log(e)
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&product=' + this.data.myProduct + "&&storeRid=" + e.detail.storeRid
    })
  },

  // 跳转到品牌详情
  handleTobrandStore(e){
    let rid = e.currentTarget.dataset.storeRid
    wx.navigateTo({
      url: '../branderStore/branderStore?rid=' + rid
    })

  },

  // 搜索商品 
  getSearch() {
    http.fxGet(api.core_platforms_search_products, this.data.productParams, (result) => {
      
      console.log(result, "商品搜索结果")
      let data = this.data.productList
      result.data.products.forEach((v)=>{
        data.push(v)
      })

      if (result.success) {
        this.setData({
          productList: data,
          prductIsNext:result.data.next,
          totalCount: result.data.count,
          isLoadProductShow:false
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 搜索品牌商店 
  getBrandStore(){
    http.fxGet(api.core_platforms_search_stores, this.data.brandStoreParams, (result) => {
      
      console.log(result, "品牌店结果")
      let data = this.data.storeList
      result.data.stores.forEach((v) => {
        data.push(v)
      })

      if (result.success) {
        this.setData({
          storeList: data,
          storeIsNext: result.data.next,
          isLoadProductShow: false
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 搜索用户的列表
  getUser(){
    http.fxGet(api.core_platforms_search_users, this.data.userParams, (result) => {
    
      console.log(result, "搜获用户结果")
      let data = this.data.userList
      result.data.users.forEach((v) => {
        v.username = common.sliceString(v.username,14)
        data.push(v)
      })

      if (result.success) {
        this.setData({
          userList:data ,
          userIsNext: result.data.next,
          isLoadProductShow: false
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
      ['productParams.qk']: options.text,
      ['brandStoreParams.qk']: options.text,
      ['userParams.qk']: options.text
    })
    this.getSearch()

  },

  /**
 * 页面上拉触底事件的处理函数
 */
  onReachBottom: function () {

    // 商品的触底加载
    if (this.data.navbarCategoryId==1){
      if (!this.data.prductIsNext){
        return
      }

      this.setData({
        ['productParams.page']: this.data.productParams.page + 1,
        isLoadProductShow: true, // 加载更多产品的loading图片
      })

      this.getSearch() 
    }

    // 商品的触底加载
    if (this.data.navbarCategoryId==2){
      if (!this.data.storeIsNext){
        return
      }

      this.setData({
        ['brandStoreParams.page']: this.data.brandStoreParams.page + 1,
        isLoadProductShow: true, // 加载更多产品的loading图片
      })

      this.getBrandStore() 
    }

    // 用户列表
    if (this.data.navbarCategoryId == 3) {
      if (!this.data.userIsNext) {
        return
      }

      this.setData({
        ['userParams.page']: this.data.userParams.page + 1,
        isLoadProductShow: true, // 加载更多产品的loading图片
      })

      this.getUser()
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
  }
})