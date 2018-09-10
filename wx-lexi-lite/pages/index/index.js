//index.js
//获取应用实例
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
    page: 1,
    perPage: 3,
    firstTime: true,
    swiperMark:0, // 轮播图标记
    loadingMore: true, // 加载更多标记
    isLoadPageShow:true, // 加载页面的点
    gratefulSwiper:0, // 热气推荐的的轮播图的点
    exploreSwiperMark:0,// 探索轮播图的点
    readyOver:false, // 页面加载是否完成

    // 分享
    shareProduct: '', // 分享某个商品
    posterUrl: '', // 海报图url

    // 生活馆
    lifePhotoUrl:'', // 分享生活馆的图片
    sid: '', // 生活馆rid
    openId:'', // openId
    uploadParams: {}, // 上传所需参数
    lifeStore: {}, // 生活馆信息
    storeOwner: {}, // 生活馆馆长
    storeProducts: [], // 生活馆商品列表
    isNextRecommend:false, // 推荐是否有下一页
    isEmpty: false, // 是否为空
    isSmallB: false, // 当前用户是否为小B
    canAdmin: false, // 是否具备管理生活馆
    showEditModal: false, // 生活馆编辑
    showConfirmModal: false, // 删除上架商品确认
    latestDistributeProducts: [], // 最新分销商品
    isDistributed:false, // 是否属于分销
    popularProducts: [  // 本周最受欢迎
      { cover: '', name: '' },
      { cover: '', name: '' },
      { cover: '', name: '' },
      { cover: '', name: '' },
    ], 
    storeForm: {
      rid: '',
      name: '',
      description: '',
      nameLength: 0,
      descLength: 0
    },

    // 探索
    characteristicStoreList: { // 特色品牌商店
      stores:[
        { logo: '', name: '', products_cover:[{},{},{}]},
        { logo: '', name: '', products_cover: [{},{},{}] },
    ]}, 
    exploreAdvertisementList: [], // 广告位置
    categoryList: [], // 分类
    editRecommendList: [  // 编辑推荐
        { cover:'',name:''},
        { cover:'',name:''},
        { cover:'',name:''}
      ], 
    highQualityList: { // 优质新品
      products: [
        { cover: '', name: '' },
        { cover: '', name: '' },
        { cover: '', name: '' },
      ]
      }, 
    goodDesignList: { // 特惠好设计
      products: [
        { cover: '', name: '' },
        { cover: '', name: '' },
        { cover: '', name: '' },
      ]
    }, 
    oneHundredList: { // 百元好物
      products: [
        { cover: '', name: '' },
        { cover: '', name: '' },
        { cover: '', name: '' },
      ]
    }, 
    gatherList: { // 集合
      collections:[
        { cover: '', name: '' },
        { cover: '', name: '' },
        { cover: '', name: '' },
      ]
    }, 
    // 精选
    handerAdvertisementList: [], // 头部广告
    middleAdvertisementList: [], // 精选的中间广告
    swiperIndex: 0, // 旋转木马当前选中项目
    storeHeadlines: [], // 生活馆头条
    plantOrderList: { // 种草清单
      life_records: [
        { cover: '', recommend_label: '' },
        { cover: '', recommend_label: '' },
      ]
    },
    todayRecommendList: { // 今日推荐
      daily_recommends: [
        { cover: '', recommend_label: '' },
        { cover: '', recommend_label: '' },
        { cover: '', recommend_label: '' },
        { cover: '', recommend_label: '' },
      ]
    },
    gratefulList: { // 人气推荐
      products: [
        { cover: '', name: '' },
        { cover: '', name: '' },
        { cover: '', name: '' },
        { cover: '', name: '' },
        { cover: '', name: '' },
      ]
    },
    lexiPick: { // 乐喜优选
      products: [
        { cover: '', name: '' },
        { cover: '', name: '' },
        { cover: '', name: '' },
        { cover: '', name: '' },
      ]
    }, 


    isNavbarAdsorb: false, // 头部导航是否吸附
    pageActiveTab: 'featured',
    // 分类列表
    pageTabs: [{
        rid: 'p1',
        name: 'lifeStore',
        title: '生活馆',
        disabled: false
      },
      {
        rid: 'p2',
        name: 'featured',
        title: '精选',
        disabled: false
      },
      {
        rid: 'p3',
        name: 'explore',
        title: '探索',
        disabled: false
      }
    ],

    is_mobile: false, // 验证是否登陆
  },

  /**
   * 登录完成回调
   */
  handleCloseLogin () {
    this.setData({
      is_mobile: false
    })
  },

  // 加载更多的推荐
  handleLoadingRecommend(){
    this.setData({
      page: this.data.page+1
    })
    this.getStoreProducts()
  },

  /**
 * 推荐分享-销售
 */
  handleStickShareDistribute(e) {
    let isDistributed = e.currentTarget.dataset.isDistributed
    let rid = e.currentTarget.dataset.rid
    let idx = e.currentTarget.dataset.idx
    console.log(this.data.storeProducts[idx])
    this.setData({
      isDistributed: isDistributed,
      showShareModal: true,
      shareProduct: this.data.storeProducts[idx]
    })

    this.getWxaPoster()
  },

  /**
 * 生成推广海报图
 */
  getWxaPoster() {
    let lastVisitLifeStoreRid = app.getDistributeLifeStoreRid()
    let rid = this.data.shareProduct.rid

    // scene格式：rid + '#' + sid
    let scene = rid
    if (lastVisitLifeStoreRid) {
      scene += '-' + lastVisitLifeStoreRid
    }

    let params = {
      rid: rid,
      type: 4,
      path: 'pages/product/product',
      auth_app_id: app.globalData.app_id,
      scene: scene
    }
    http.fxPost(api.wxa_poster, params, (result) => {
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
              utils.fxShowToast("保存成功","success")
            },
            fail(res) {
              utils.fxShowToast("保存失败")
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
      posterUrl: '',
      shareProduct: {}
    })
  },

  // 今日推荐跳转category
  handleTodyRecommend(e){
    console.log(e)
    let targetType = e.currentTarget.dataset.type
    let rid = e.currentTarget.dataset.rid

    if (targetType==1){
      wx.navigateTo({
        url: '../findInfo/findInfo?rid=' + rid,
      })
    }

    if (targetType==2){
      wx.navigateTo({
        url: '../plantNoteInfo/plantNoteInfo?rid=' + rid,
      })
    }

    if (targetType == 3) {
      wx.navigateTo({
        url: '../gatherInfo/gatherInfo?rid=' + rid,
      })
    }


  },

  // 点击喜欢或者删除喜欢
  handleBindLike(e) {
    console.log(e,"点击心")
    console.log(e.currentTarget.dataset.index)

    let idx = e.currentTarget.dataset.index
    let rid = e.currentTarget.dataset.id
    let isLike = e.currentTarget.dataset.islike

    // 是否登陆
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return
    }

    if (isLike) {
      // 喜欢，则删除
      http.fxDelete(api.userlike, {
        rid: rid
      }, (result) => {
        if (result.success) {
          this.setData({
            ['storeProducts[' + idx +'].is_like']:false
          })
        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    } else {
      // 未喜欢，则添加
      http.fxPost(api.userlike, {
        rid: rid
      }, (result) => {
        if (result.success) {
          this.setData({
            ['storeProducts[' + idx + '].is_like']: true
          })
        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    }
  },

  //swiper 变化触发
  handleSwiperChange(e) {
    this.setData({
      swiperMark: e.detail.current
    })
  },

  //探索轮播图
  handleExploreSwiperChange(e){
    this.setData({
      exploreSwiperMark: e.detail.current
    })
  },

  /**
   * 分类的选择 
   */
  handlePickCategory(e) {
    let name = e.currentTarget.dataset.name
    this.setData({
      pageActiveTab: name
    })

    this._swtichActivePageTab(name)
  },

  /**
   * 推荐的跳转
   * */
  handleToInfo(e) {
    console.log(e)
    console.log(e.currentTarget.dataset.rid)
    console.log(e.currentTarget.dataset.type)

    
    let targetType = e.currentTarget.dataset.type
    let link = e.currentTarget.dataset.link
    let title = e.currentTarget.dataset.title

    if (targetType == 1) {
      
    }

    if (targetType == 2) {
      wx.navigateTo({
        url: '../product/product?rid=' + link
      })
    }

    if (targetType == 3) {
      wx.navigateTo({
        url: '../categoryList/categoryList?categryId=' + link + "&&titleName=" + title
      })
    }

    if (targetType == 4) {
      wx.navigateTo({
        url: '../branderStore/branderStore?rid=' + link
      })
    }

  },

  /**
   * 种草的列表页
   * **/
  handleToPlantNoteList() {
    wx.navigateTo({
      url: '../plantNoteList/plantNoteList'
    })
  },

  /**
   * 种草详情
  */
  handleToPlantNoteInfo(e){
    console.log(e)
    let rid = e.currentTarget.dataset.rid
    let targetType = e.currentTarget.dataset.type
    // wx.navigateTo({
    //   url: '../plantNoteInfo/plantNoteInfo?rid='+rid,
    // })
    // 1是文章
    if (targetType == 1) {
      wx.navigateTo({
        url: '../findInfo/findInfo?rid=' + rid,
      })
    }

    // 2是种草笔记
    if (targetType == 2) {
      wx.navigateTo({
        url: '../plantNoteInfo/plantNoteInfo?rid=' + rid,
      })
    }

    // 跳转视频
    if (targetType == 3) {

    }
  },

  /**
   * 轮换图广告
   */
  swiperChange(e) {
    console.log(e.detail.current)
    this.setData({
      swiperIndex: e.detail.current
    })
  },

  /**
   * 改变生活馆logo
   */
  handleChangeLogo() {
    wx.chooseImage({
      success: (res) => {
        let tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: this.data.uploadParams.up_endpoint,
          filePath: tempFilePaths[0],
          name: 'file',
          formData: {
            'x:directory_id': this.data.uploadParams.directory_id,
            'x:user_id': this.data.uploadParams.user_id,
            'token': this.data.uploadParams.up_token
          },
          success: (res) => {
            let data = JSON.parse(res.data)
            if (data.ids.length > 0) {
              this.getAssetInfo(data.ids[0])

              // 更新logo
              this.handleUpdateStoreLogo(data.ids[0])
            }
          }
        })
      }
    })
  },

  /**
   * 更新生活馆logo
   */
  handleUpdateStoreLogo(logo_id) {
    http.fxPut(api.life_store_update_logo, {
      rid: this.data.sid,
      logo_id: logo_id
    }, (res) => {
      console.log(res, '更新生活馆logo')
      if (!res.success) {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 编辑生活馆信息
   */
  handleEditStore() {
    let nameLength = 0
    let descLength = 0
    if (this.data.lifeStore.name) {
      nameLength = common.strLength(this.data.lifeStore.name)
    }
    if (this.data.lifeStore.description) {
      descLength = common.strLength(this.data.lifeStore.description)
    }
    this.setData({
      showEditModal: true,
      'storeForm.nameLength': nameLength,
      'storeForm.descLength': descLength
    })
  },

  /**
   * 名称获取焦点事件
   */
  handleNameChange(e) {
    console.log(e)
    let nameLength = 0
    if (e.detail.value) {
      nameLength = common.strLength(e.detail.value)
    }
    this.setData({
      'storeForm.nameLength': nameLength
    })
  },

  /**
   * 简介获取焦点事件
   */
  handleDescChange(e) {
    console.log(e)
    let descLength = 0
    if (e.detail.value) {
      descLength = common.strLength(e.detail.value)
    }
    this.setData({
      'storeForm.descLength': descLength
    })
  },


  /**
   * 提交更新生活馆信息
   */
  handleSubmitUpdateStore(e) {
    let data = e.detail.value
    data.rid = this.data.sid
    http.fxPost(api.life_store_edit, data, (res) => {
      console.log(res, '更新生活馆')
      if (res.success) {
        this.setData({
          'lifeStore.name': res.data.name,
          'lifeStore.description': res.data.description,
          showEditModal: false
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 跳转分销中心
   */
  handleGoDistribute() {
    wx.navigateTo({
      url: '/pages/distributes/distributes'
    })
  },

  // 跳转到商品详情---
  handleInfomation(e) {
    console.log(e)
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&product=' + this.data.myProduct + "&storeRid=" + e.detail.storeRid
    })
  },

  /**
   * 跳转商品详情
   */
  handleGoProduct(e) {
    console.log(e)
    let rid = e.detail.rid
    wx.navigateTo({
      url: '/pages/product/product?rid=' + rid + "&&storeRid=" + e.detail.storeRid
    })
  },

  // 设置页面标题
  handleSetNavigationTitle(name = '首页') {
    wx.setNavigationBarTitle({
      title: name
    })
  },

  /**
   * 申请开通生活馆
   */
  handleApplyLifeStore() {
    // 未登录，需先登录
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return
    }

    // 已是小B用户,则不能再申请
    if (this.data.isSmallB) {
      // return
    }

    wx.navigateTo({
      url: '../lifeStoreGuide/lifeStoreGuide',
    })
  },

  /**
   * 回到自己的生活馆
   */
  handleBackLifeStore() {
    const lifeStore = wx.getStorageSync('lifeStore')
    const userInfo = wx.getStorageSync('userInfo')

    let sid = lifeStore.lifeStoreRid
    this.setData({
      sid: sid,
      pageActiveTab: 'lifeStore',
      storeOwner: userInfo,
      canAdmin: true
    })

    this._swtichActivePageTab(this.data.pageActiveTab)

    // 更新当前用户的last_store_rid
    this.handleUpdateLastStoreRid(sid)
  },

  /**
   * 从生活馆删除某商品
   */
  handleRemoveFromStore(e) {
    let rid = e.currentTarget.dataset.rid
    let idx = e.currentTarget.dataset.idx
    let data = {
      sid: this.data.sid,
      rid: rid
    }
    console.log('Delete, rid: ' + rid + ', idx: ' + idx)

    wx.showModal({
      content: '你确认要下架此件商品',
      cancelText: '删除',
      cancelColor: '#666',
      confirmText: '取消',
      confirmColor: '#5fe4b1',
      success: (res) => {
        if (res.cancel) { // 取消 与 确认 互换
          console.log('Delete, rid: ' + rid + ', idx: ' + idx)
          http.fxDelete(api.life_store_delete_product, data, (result) => {
            console.log(result, "删除商品")
            if (result.success) {
              let _storeProducts = this.data.storeProducts
              let isEmpty = false
              console.log(_storeProducts)

              if (_storeProducts.length <= 1) {
                _storeProducts = []
                isEmpty = true
              } else {
                _storeProducts.splice(idx, 1)
              }

              this.setData({
                storeProducts: _storeProducts,
                isEmpty: isEmpty
              })

            } else {
              utils.fxShowToast(result.status.message)
            }
          })
        }
      }
    })
  },

  /** 探索页面start **/

  // 广告位置
  getExploreAdvertisement() {
    http.fxGet(api.banners_explore, {}, (result) => {
      if (result.success) {
        this.setData({
          exploreAdvertisementList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 分类列表
  getCategory() {
    http.fxGet(api.categories, {}, (result) => {
      console.log(result, "fen lei")
      if (result.success) {
        this.setData({
          categoryList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 编辑推荐
  getEditRecommend() {
    http.fxGet(api.column_explore_recommend, {}, (result) => {
      console.log(result, "编辑 推荐")
      if (result.success) {
        this.setData({
          editRecommendList: [],
        })
        
        this.setData({
          editRecommendList: result.data.products
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 特色品牌馆
  getCharacteristicBranderStore() {
    http.fxGet(api.column_feature_store, {}, (result) => {
      console.log(result, "特色品牌馆")

      if (result.success) {
        this.setData({
          isLoadPageShow: false,
          characteristicStoreList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 关注特色品牌馆
  handleAddFollowed(e) {
    console.log(e)
    let index = e.currentTarget.dataset.index
    let rid = e.currentTarget.dataset.rid

    // 检验是否登陆
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return
    }

    http.fxPost(api.add_watch, {
      rid: rid
    }, (result) => {
      console.log(result)
      if (result.success) {
        this.setData({
          ["characteristicStoreList.stores[" + index + "].is_followed"]: true
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })

  },

  // 取消关注特色品牌馆
  handleDeleteFollowed(e) {
    let index = e.currentTarget.dataset.index
    let rid = e.currentTarget.dataset.rid
    console.log(e)
    http.fxPost(api.delete_watch, {
      rid: rid
    }, (result) => {
      console.log(result)
      if (result.success) {
        this.setData({
          ["characteristicStoreList.stores[" + index + "].is_followed"]: false
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 添加浏览记录
  handleAddBrowce() {
    let openId = wx.getStorageSync("jwt").openid
    http.fxPost(api.add_browse, { openid: openId, rid: this.data.sid},(result)=>{
      console.log(result,"添加浏览者")
      this.getBrowsePeople()
    })
  },

  // 人气推荐的轮播点
  handleGratefulSwiper(e){
    console.log(e.detail.current)
    this.setData({
      gratefulSwiper: e.detail.current
    })

  },

  // 获取浏览记录
  getBrowsePeople(){
    let openId = wx.getStorageSync("jwt").openid
    http.fxGet(api.BrowseQuantityNumber.replace(/:rid/g, this.data.sid), { openid: openId},(result)=>{
      console.log(result,"获取的浏览者")
      if(result.success){
        this.setData({
          shopInfo:result.data
        })
      }else{
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 优质新品
  getHighQuality() {
    http.fxGet(api.column_explore_new, {}, (result) => {
      console.log(result, "优质新品")
      if (result.success) {

        this.setData({
          highQualityList: []
        })

        this.setData({
          highQualityList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 集合
  getGather() {
    http.fxGet(api.column_collections, {}, (result) => {
      console.log(result, "集合")
      if (result.success) {
        this.setData({
          gatherList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 特惠好设计
  getGoodDesign() {
    http.fxGet(api.column_preferential_design, {}, (result) => {
      console.log(result, "特惠好设计")
      if (result.success) {
        this.setData({
          goodDesignList: []
        })

        this.setData({
          goodDesignList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 百元好物
  getOneHundred() {
    http.fxGet(api.column_affordable_goods, {}, (result) => {
      console.log(result, "百元好物")
      if (result.success) {
        this.setData({
          oneHundredList: []
        })
        this.setData({
          oneHundredList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /** 探索页面end **/

  /** 精选里面的 start **/

  // 开馆指引
  getOpenStoreGuide() {

  },

  // 今日推荐
  getTodayRecommend() {
    http.fxGet(api.column_daily_recommends, {}, (result) => {
      console.log(result, "今日推荐")
      if (result.success) {
        this.setData({
          todayRecommendList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 人气推荐 column_handpick_recommend
  getGrateful() {
    http.fxGet(api.column_handpick_recommend, {
      page: 1,
      per_page: 15
    }, (result) => {
      console.log(result, "人气推荐")
      if (result.success) {
        this.setData({
          gratefulList: [],
          isLoadPageShow:false
        })
        this.setData({
          gratefulList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 精选的中间广告banners_handpick_content  handerAdvertisementList
  getChoiceMiddleAdvertisement() {
    http.fxGet(api.banners_handpick_content, {
      page: 1,
      per_page: 15
    }, (result) => {
      console.log(result, "精选 中间广告")
      if (result.success) {
        this.setData({
          middleAdvertisementList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 精选区域的头部广告
  getChoiceHanderAdvertisement() {
    http.fxGet(api.banners_handpick, {}, (result) => {
      console.log(result, "精选 头部广告")
      if (result.success) {
        this.setData({
          handerAdvertisementList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 乐喜优选 column/handpick_optimization
  getLitePick() {
    http.fxGet(api.column_handpick_optimization, {}, (result) => {
      console.log(result, "乐喜优选")
      if (result.success) {
        this.setData({
          lexiPick: []
        })
        this.setData({
          lexiPick: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 种草清单 life_records/recommend
  getPlantOrder() {
    http.fxGet(api.life_records_recommend, {}, (result) => {
      console.log(result, "种草清单")
      if (result.success) {
        this.setData({
          plantOrderList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /** 精选 end**/

  /**
   * 本周最受欢迎商品
   */
  getWeekPopular() {
    http.fxGet(api.distribution_week_popular, {
      page: 1,
      per_page: 4
    }, (res) => {
      console.log(res, '最受欢迎商品')
      if (res.success) {
        this.setData({
          popularProducts: []
        })
        this.setData({
          popularProducts: res.data.products
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 获取生活馆商品列表
   */
  getStoreProducts() {
    let params = {
      page: this.data.page,
      per_page: this.data.perPage,
      sid: this.data.sid,
      is_distributed: 2,
      user_record:1
    }

    http.fxGet(api.life_store_products, params, (res) => {
      console.log(res.data.products, '全部分销商品')
      console.log(res, '全部分销商品')
      if (res.success) {
        // 没有下一页了
        if (!res.data.next) {
          this.setData({
            loadingMore: false
          })
        }

        let _products = this.data.storeProducts
        if (this.data.page > 1) {
          // 合并数组
          _products.push.apply(_products, res.data.products)
        } else {
          _products = res.data.products
        }

        let isEmpty = false
        if (_products.length == 0) {
          isEmpty = true
        }

        this.setData({
          storeProducts: _products,
          isEmpty: isEmpty,
          isNextRecommend: res.data.next
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 获取生活馆信息
   */
  getLifeStore() {
    http.fxGet(api.life_store, {
      rid: this.data.sid
    }, (res) => {
      console.log(res, '生活馆信息')
      if (res.success) {
        this.setData({
          lifeStore: res.data
        })
        let lifeStoreName = res.data.name + '的生活馆'
        this.handleSetNavigationTitle(lifeStoreName)
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 获取生活馆头条
   */
  getStoreHeadlines() {
    http.fxGet(api.life_store_headlines, {
      type: 2
    }, (res) => {
      console.log(res, '生活馆头条')
      if (res.success) {
        let l = res.data.headlines.length

        let newData = []
        res.data.headlines.forEach((v,i)=>{

          if(v.time>24){
            v.time = Math.ceil(v.time%24) + "天"
          }else{
            v.time = v.time + "小时"
          }

          if (v.username - 0 != NaN && v.username.length>9){
            console.log(v)
            v.username = v.username.substr(0, 3) + "****" + v.username.substr(7,4)
          }

          let newObj = []
          if((i+1)%2==0){
            newObj.push(v)
            newObj.push(res.data.headlines[i-1])
            newData.push(newObj)
          }
        })

        // 暂时展示2条
        this.setData({
          // storeHeadlines: res.data.headlines.splice(0, 2)
          storeHeadlines: newData
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 获取最新3个分销商品
   */
  getDistributeNewest() {
    http.fxGet(api.distribute_newest, {}, (res) => {
      console.log(res, '选品中心')
      if (res.success) {
        this.setData({
          latestDistributeProducts: res.data.products
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 获取单个附件信息
   */
  getAssetInfo(rid) {
    http.fxGet(api.asset_detail, {
      rid: rid
    }, (result) => {
      if (result.success) {
        console.log(result, '附件信息')
        this.setData({
          'lifeStore.logo': result.data.view_url
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 获取上传所需Token
   */
  getUploadToken() {
    http.fxGet(api.user_upload_token, {}, (result) => {
      if (result.success) {
        console.log(result, '上传Token')
        this.setData({
          uploadParams: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 激活页面Tab
   */
  _swtichActivePageTab(name) {
    switch (name) {
      case 'lifeStore':
        this.getLifeStore() // 生活馆信息
        this.getDistributeNewest() // 选品中心入口
        this.getStoreProducts() // 生活馆商品
        this.getWeekPopular() // 本周最受欢迎商品
        this.getUploadToken()
        this.handleAddBrowce() //添加浏览者
        break;
      case 'featured': // 精选
        wx.setNavigationBarTitle({title:"精选"})
        this.handleSetNavigationTitle('精选')

        this.setData({
          swiperIndex: 0
        })

        this.getChoiceHanderAdvertisement() // 头部广告
        if (this.data.handerAdvertisementList.length!=0){
          return
        }

        this.setData({
          isLoadPageShow: true
        })

        this.getStoreHeadlines() // 开馆头条
        this.getOpenStoreGuide() // 开馆指引
        this.getTodayRecommend() // 今日推荐
        this.getGrateful() // 人气推荐
        this.getChoiceMiddleAdvertisement() // 中间广告
        this.getLitePick() // 乐喜优选
        this.getPlantOrder() // 种草清单
        break;
      case 'explore': // 探索
        wx.setNavigationBarTitle({ title: "探索" })
        if (this.data.exploreAdvertisementList.length != 0) {
          return
        }
        this.setData({
          isLoadPageShow:true
        })
        this.handleSetNavigationTitle('探索')
        this.getEditRecommend() // 编辑推荐
        this.getCharacteristicBranderStore() // 特色品牌管
        this.getExploreAdvertisement() // 广告位
        this.getCategory() // 分类
        this.getHighQuality() // 优质新品
        this.getGather() // 集合产品
        this.getGoodDesign() // 特惠好设计
        this.getOneHundred() // 百元好物

        break;
    }
  },

  // 分享的生活馆图片
  getLifePhotoUrl() {
    let rid = app.getDistributeLifeStoreRid()

    http.fxPost(api.market_share_life_store, {
      rid: rid
    }, (result) => {
      console.log(result, rid, "分享生活馆图片的地址")
      if (result.success) {

        this.setData({
          lifePhotoUrl: result.data.image_url
        })
      } else {

      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // scene格式：sid + '-' + uid
    let scene = decodeURIComponent(options.scene)
    let sid = ''
    if (scene && scene != 'undefined') {
      let scene_ary = scene.split('-')
      sid = scene_ary[0]
      // 分销商uid
      if (scene_ary.length == 2) {
        let customer_rid = scene_ary[1]
        wx.setStorageSync('customer_uid', customer_rid)
      }

      if (sid) { // 有生活馆显示
        this.setData({
          sid: sid
        })
      }
    }

    // 验证登录用户是否为小B商家
    if (this.data.sid == '') {
      app.login().then(res => {
        console.log(res, '异步请求')
        const lifeStore = wx.getStorageSync('lifeStore')
        const userInfo = wx.getStorageSync('userInfo')

        console.log(this.data.sid, '导入生活馆')
        console.log(lifeStore, '登录用户生活馆')

        if (lifeStore.isSmallB) { // 判断登录用户是否有生活馆
          let sid = lifeStore.lifeStoreRid

          this.setData({
            sid: sid,
            pageActiveTab: 'lifeStore',
            storeOwner: userInfo,
            'pageTabs[0].disabled': false,
            canAdmin: true,
            isSmallB: true
          })

          // 更新当前用户的last_store_rid
          app.updateLifeStoreLastVisit(sid)

          // 请求当前数据
          this._swtichActivePageTab(this.data.pageActiveTab)

        } else {
          this.setData({ // 无生活馆显示
            'pageTabs[0].disabled': true
          })

          // 请求当前数据
          this._swtichActivePageTab(this.data.pageActiveTab)
        }
      })
    } else {
      this.setData({
        pageActiveTab: 'lifeStore'
      })

      // 更新当前用户的last_store_rid
      app.updateLifeStoreLastVisit(this.data.sid)

      // 请求当前数据
      this._swtichActivePageTab(this.data.pageActiveTab)
    }
  },

  /**
   * 监听页面滚动
   * **/
  onPageScroll(e) {
    // console.log(e)
    if (e.scrollTop >= 50) {
      // console.log(e,"下拉")
      this.setData({
        isNavbarAdsorb: true
      })
    } 
    if (e.scrollTop <51) {
      // console.log(e, "上啦")
      this.setData({
        isNavbarAdsorb: false
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.getLifePhotoUrl()
    this.setData({
      isLoadPageShow:false,
      readyOver:true,
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
   * 用户点击右上角分享 data-from
   */
  onShareAppMessage: function(e) {
    console.log(e)
    

    if (e.from == "menu" || e.target.dataset.from == 1 ){

      let lastVisitLifeStoreRid = app.getDistributeLifeStoreRid()

      // scene格式：rid + '-' + sid
      let uid = wx.getStorageSync("jwt")
      let scene = uid.uid
      if (lastVisitLifeStoreRid) {
        scene += '-' + lastVisitLifeStoreRid
      }

      return {
        title: this.data.lifeStore.name+"的生活馆",
        path: 'pages/index/index?scene=' + scene,
        imageUrl: this.data.lifePhotoUrl,
        success: (res) => {
          console.log(res, '分享商品成功!')
        }
      }

    }else{

      // 分享产品
      let title = this.data.shareProduct.name
      return app.shareWxaProduct(this.data.shareProduct.rid, title, this.data.shareProduct.cover)
    }

  },

  // 点击分类
  handleCategoryInfoTap(e) {
    console.log(e)

  },

  //去搜索页面
  handleToSearch() {
    wx.navigateTo({
      url: '../search/search',
    })
  },

  handleToLexiPick(){
    wx.navigateTo({
      url: '../leXiHighPick/leXiHighPick',
    })
  },

  //跳转到商品列表页面
  handleToProductList(e) {
    console.log(e.currentTarget.dataset.from)
    let editRecommend = e.currentTarget.dataset.from
    wx.navigateTo({
      url: '../allProduct/allProduct?from=' + editRecommend,
    })
  },

  // 集合页面
  hanleToGatherPage() {
    wx.navigateTo({
      url: '../gather/gather'
    })
  },

  handleTocategoryList(e) {
    console.log(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '../categoryList/categoryList?categryId=' + e.currentTarget.dataset.id + "&&titleName=" + e.currentTarget.dataset.titleName,
    })
  },

  // 跳转到集合详情
  handleToGatherInfo(e) {
    wx.navigateTo({
      url: '../gatherInfo/gatherInfo?rid=' + e.currentTarget.dataset.rid
    })
  },

  // 跳转到品牌管详情
  handleTobrandStore(e) {
    wx.navigateTo({
      url: '../branderStore/branderStore?rid=' + e.currentTarget.dataset.rid,
    })
  },
  // 跳转到品牌管详情
  handelTobrandList(e) {
    wx.navigateTo({
      url: '../branderStoreList/branderStoreList?rid=' + e.currentTarget.dataset.rid,
    })
  }
})