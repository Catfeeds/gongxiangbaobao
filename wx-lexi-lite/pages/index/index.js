// 获取应用实例
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
const common = require('./../../utils/common.js')

let animationInterval

Page({

  /**
   * 页面的初始数据
   */
  data: {
    animationNum: 0, // 首页选品中心的动画
    aplayStoreAnimationIndex: 0, // 开馆指引的动画

    page: 1,
    perPage: 10,
    firstTime: true,
    isCadet: true,
    isLoading: true,

    swiperMark: 0, // 轮播图标记
    loadingMore: true, // 加载更多标记
    isLoadPageShow: true, // 加载页面的点
    gratefulSwiper: 0, // 人气推荐的的轮播图的点
    exploreSwiperMark: 0, // 探索轮播图的点
    readyOver: false, // 页面加载是否完成
    isShowShareLifeBrand: false, // 分享生活馆的是否显示

    // 分享产品
    shareProduct: '', // 分享某个商品
    posterUrl: '', // 海报图url

    lifeStorePosterUrl: '', // 生活馆的url

    newUserCouponSuccess: false, // 新人领取是否成功
    newUserCoupon: false, // 新人是否领取过红包
    newUserCouponInfo: [{
        money: 10,
        condition: 10,
        use_position: '全平台',
        created_at: 0,
        end_at: 0
      },
      {
        money: 15,
        condition: 159,
        use_position: '生活良品',
        created_at: 0,
        end_at: 0
      },
      {
        money: 25,
        condition: 259,
        use_position: '好感衣装',
        created_at: 0,
        end_at: 0
      },
      {
        money: 35,
        condition: 359,
        use_position: '箱包&包装',
        created_at: 0,
        end_at: 0
      },
      {
        money: 15,
        condition: 159,
        use_position: '全平台',
        created_at: 0,
        end_at: 0
      },
      {
        money: 5,
        condition: 54,
        use_position: '全平台',
        created_at: 0,
        end_at: 0
      }
    ],

    // 生活馆
    isSmallB: false, // 自己是否有生活馆
    showBack: false, // 显示回到自己生活馆
    isUploading: false,
    uploadStatus: 0,
    shopInfo: '', // 生活馆信息
    lifePhotoUrl: '', // 分享生活馆的图片
    sid: '', // 生活馆sid
    isExistLifeStore: false, // 是否存在生活馆
    openId: '', // openId
    shopInfo: '', // 生活馆信息
    lifeStore: {
      logo: 'https://static.moebeast.com/image/static/null-product.png'
    }, // 编辑生活馆信息
    lifePhotoUrl: '', // 分享生活馆的图片
    storeOwner: {}, // 生活馆馆长
    storeProducts: [], // 生活馆商品列表
    isNextRecommend: false, // 推荐是否有下一页
    isEmpty: false, // 是否为空
    showEditModal: false, // 生活馆编辑
    showConfirmModal: false, // 删除上架商品确认
    latestDistributeProducts: [], // 最新分销商品
    isDistributed: false, // 是否属于分销
    topAdvPhoto: {
      image: ''
    }, // 生活馆的头部广告位置
    aplayStoreBGAdv: {
      image: ''
    }, //开馆指引的背景广告位
    handpickNewExpress: {
      products: [],
      count: 0
    }, // 新品速递
    popularProducts: [ // 本周最受欢迎
      {
        cover: '',
        name: ''
      },
      {
        cover: '',
        name: ''
      },
      {
        cover: '',
        name: ''
      },
      {
        cover: '',
        name: ''
      },
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
      stores: [{
          logo: '',
          name: '',
          products_cover: ['', '', '']
        },
        {
          logo: '',
          name: '',
          products_cover: ['', '', '']
        },
      ]
    },
    exploreAdvertisementList: [], // 广告位置
    categoryList: [], // 分类
    editRecommendList: [ // 编辑推荐
      {
        cover: '',
        name: ''
      },
      {
        cover: '',
        name: ''
      },
      {
        cover: '',
        name: ''
      }
    ],
    highQualityList: { // 优质新品
      products: [{
          cover: '',
          name: ''
        },
        {
          cover: '',
          name: ''
        },
        {
          cover: '',
          name: ''
        },
      ]
    },
    goodDesignList: { // 特惠好设计
      products: [{
          cover: '',
          name: ''
        },
        {
          cover: '',
          name: ''
        },
        {
          cover: '',
          name: ''
        },
      ]
    },
    oneHundredList: { // 百元好物
      products: [{
          cover: '',
          name: ''
        },
        {
          cover: '',
          name: ''
        },
        {
          cover: '',
          name: ''
        },
      ]
    },
    gatherList: { // 集合
      collections: [{
          cover: '',
          name: ''
        },
        {
          cover: '',
          name: ''
        },
        {
          cover: '',
          name: ''
        },
      ]
    },

    // 精选
    handerAdvertisementList: [], // 头部广告
    middleAdvertisementList: [], // 精选的中间广告
    swiperIndex: 0, // 旋转木马当前选中项目
    storeHeadlines: [], // 生活馆头条
    plantOrderList: { // 种草清单
      life_records: [{
          cover: '',
          recommend_label: ''
        },
        {
          cover: '',
          recommend_label: ''
        },
      ]
    },
    todayRecommendList: { // 今日推荐
      daily_recommends: [{
          cover: '',
          recommend_label: ''
        },
        {
          cover: '',
          recommend_label: ''
        },
        {
          cover: '',
          recommend_label: ''
        },
        {
          cover: '',
          recommend_label: ''
        },
      ]
    },
    gratefulList: { // 人气推荐
      products: [{
          cover: '',
          name: ''
        },
        {
          cover: '',
          name: ''
        },
        {
          cover: '',
          name: ''
        },
        {
          cover: '',
          name: ''
        },
        {
          cover: '',
          name: ''
        },
      ]
    },
    lexiPick: { // 乐喜优选
      products: [{
          cover: '',
          name: ''
        },
        {
          cover: '',
          name: ''
        },
        {
          cover: '',
          name: ''
        },
        {
          cover: '',
          name: ''
        },
      ]
    },
    lifeWindow: { // 发现生活美学
      count: 0,
      shop_windows: []
    },

    isNavbarAdsorb: false, // 头部导航是否吸附
    pageActiveTab: 'featured',
    // 分类列表
    pageTabs: [{
        rid: 'p1',
        name: 'lifeStore',
        title: '生活馆',
        disabled: false,
        pageScroll: 0
      },
      {
        rid: 'p2',
        name: 'featured',
        title: '精选',
        disabled: false,
        pageScroll: 0
      },
      {
        rid: 'p3',
        name: 'explore',
        title: '探索',
        disabled: false,
        pageScroll: 0
      }
    ],

    runEnv: 1,
    is_mobile: false // 验证是否登陆
  },

  /**
   * 显示分享生活馆的
   */
  handleShareLifeBrand() {
    this.setData({
      isShowShareLifeBrand: true
    })

    this.getLifePhotoUrl()
    this.getLifeBrandPoster()
  },

  /**
   * 类别页的切换 
   */
  handlePickCategory(e) {
    let name = e.currentTarget.dataset.name
    this.setData({
      pageActiveTab: name
    })

    let currentPage = this.data.pageActiveTab // 现在处于的哪个页面
    let pageScroll = 0 // 当前页面需要卷曲的位置
    // 生活馆
    if (currentPage == 'lifeStore') {
      pageScroll = this.data.pageTabs[0].pageScroll
    }
    // 精选
    if (currentPage == 'featured') {
      pageScroll = this.data.pageTabs[1].pageScroll
    }
    // 探索
    if (currentPage == 'explore') {
      pageScroll = this.data.pageTabs[2].pageScroll
    }
    // 橱窗
    if (currentPage == 'window') {
      pageScroll = this.data.pageTabs[3].pageScroll
    }

    wx.pageScrollTo({
      scrollTop: pageScroll,
      duration: 0
    })

    this._swtichActivePageTab(name)
  },

  /**
   * 申请开馆
   */
  handleGoApply() {
    wx.navigateTo({
      url: '../applyLifeStore/applyLifeStore',
    })
  },

  /**
   * 登录完成回调
   */
  handleCloseLogin() {
    this.setData({
      is_mobile: false
    })

    wx.showTabBar()
  },

  // 生活馆加载更多的推荐
  handleLoadingRecommend() {
    this.setData({
      page: this.data.page + 1
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

    this.setData({
      isDistributed: isDistributed,
      showShareModal: true,
      shareProduct: this.data.storeProducts[idx]
    })

    this.getWxaPoster()
  },

  /**
   * 生成生活馆的海报
   */
  getLifeBrandPoster() {
    let lastVisitLifeStoreRid = app.getDistributeLifeStoreRid()
    let jwt = wx.getStorageSync('jwt')
    let rid = this.data.sid

    // scene格式：sid + '-' + uid
    let scene = ''
    if (lastVisitLifeStoreRid) {
      scene += lastVisitLifeStoreRid
    }
    if (jwt.uid) {
      scene += '-' + jwt.uid
    }

    let params = {
      rid: rid,
      type: 2,
      path: 'pages/index/index',
      auth_app_id: app.globalData.app_id,
      scene: scene
    }
    http.fxPost(api.wxa_poster, params, (result) => {
      utils.logger(result, '生成分享生活馆报图')
      if (result.success) {
        this.setData({
          lifeStorePosterUrl: result.data.image_url
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })

  },

  /**
   * 生成产品推广海报图
   */
  getWxaPoster() {
    let lastVisitLifeStoreRid = app.getDistributeLifeStoreRid()
    let rid = this.data.shareProduct.rid

    // scene格式：rid + '-' + sid
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
      utils.logger(result, '生成海报图')
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
   * 保存当前产品海报到相册
   */
  handleSaveShare() {
    // 下载网络文件至本地
    wx.downloadFile({
      url: this.data.posterUrl,
      success: function(res) {
        if (res.statusCode === 200) {
          // 保存文件至相册
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(res) {
              utils.fxShowToast('保存成功', 'success')
            },
            fail(res) {
              if (res.errMsg === 'saveImageToPhotosAlbum:fail:auth denied') {
                wx.openSetting({
                  success(settingdata) {
                    if (settingdata.authSetting['scope.writePhotosAlbum']) {
                      utils.logger('获取权限成功，再次点击图片保存到相册')
                      utils.fxShowToast('保存成功')
                    } else {
                      utils.fxShowToast('保存失败')
                    }
                  }
                })
              } else {
                utils.fxShowToast('保存失败')
              }
            }
          })
        }
      }
    })
  },

  /**
   * 保存当前生活馆海报到相册
   */
  handleSaveLifeStorePhoto() {
    // 下载网络文件至本地
    wx.downloadFile({
      url: this.data.lifeStorePosterUrl,
      success: function(res) {
        utils.logger(res, '保存文件的路径')
        if (res.statusCode === 200) {
          // 保存文件至相册
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(res) {
              utils.fxShowToast('保存成功', 'success')
            },
            fail(res) {
              if (res.errMsg === 'saveImageToPhotosAlbum:fail:auth denied') {
                wx.openSetting({
                  success(settingdata) {
                    if (settingdata.authSetting['scope.writePhotosAlbum']) {
                      utils.logger('获取权限成功，再次点击图片保存到相册')
                      utils.fxShowToast('保存成功')
                    } else {
                      utils.fxShowToast('保存失败')
                    }
                  }
                })
              } else {
                utils.fxShowToast('保存失败')
              }
            }
          })
        }
      }
    })
  },

  /**
   * 回到自己的生活馆
   */
  handleBackLifeStore() {
    const lifeStore = wx.getStorageSync('lifeStore')

    this.setData({
      sid: lifeStore.lifeStoreRid,
    })

    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    })

    this._swtichActivePageTab('lifeStore')

    // 加载选品中心的动画
    this.getDistributeNewest()
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

  /**
   * 取消分享-生活馆
   */
  handleOffLifeStore() {
    this.setData({
      isShowShareLifeBrand: false
    })
  },

  // 今日推荐跳转category
  handleTodyRecommend(e) {
    let targetType = e.currentTarget.dataset.type
    let rid = e.currentTarget.dataset.rid

    if (targetType == 1) {
      wx.navigateTo({
        url: '../findInfo/findInfo?rid=' + rid,
      })
    }

    if (targetType == 2) {
      wx.navigateTo({
        url: '../plantNoteInfo/plantNoteInfo?rid=' + rid,
      })
    }

    if (targetType == 3) {
      wx.navigateTo({
        url: '../gatherInfo/gatherInfo?rid=' + rid,
      })
    }

    if (targetType == 4) {
      wx.navigateTo({
        url: '../product/product?rid=' + rid,
      })
    }
  },

  // 去别人的主页
  handleToPeople(e) {
    let uid = e.currentTarget.dataset.uid
    wx.navigateTo({
      url: '../people/people?uid=' + uid
    })
  },

  // 点击喜欢或者删除喜欢
  handleBindLike(e) {
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
            ['storeProducts[' + idx + '].is_like']: false,
            ['storeProducts[' + idx + '].like_count']: this.data.storeProducts[idx].like_count - 1,
            ['storeProducts[' + idx + '].product_like_users[0].avatar']: '',

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
            ['storeProducts[' + idx + '].is_like']: true,
            ['storeProducts[' + idx + '].like_count']: this.data.storeProducts[idx].like_count + 1,
            ['storeProducts[' + idx + '].product_like_users[0].avatar']: app.globalData.userInfo.avatar
          })
        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    }
  },

  // swiper 变化触发
  handleSwiperChange(e) {
    this.setData({
      swiperMark: e.detail.current
    })
  },

  // 关闭实习生
  handleOffCadet() {
    this.setData({
      isCadet: false
    })
  },

  // 探索轮播图
  handleExploreSwiperChange(e) {
    this.setData({
      exploreSwiperMark: e.detail.current
    })
  },

  /**
   * 推荐的跳转
   */
  handleToInfo(e) {
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
        url: '../categoryList/categoryList?categryId=' + link + "&titleName=" + title
      })
    }

    if (targetType == 4) {
      wx.navigateTo({
        url: '../branderStore/branderStore?rid=' + link
      })
    }

    if (targetType == 8) {
      wx.navigateTo({
        url: link
      })
    }

  },

  /**
   * 种草的列表页
   */
  handleToPlantNoteList() {
    wx.navigateTo({
      url: '../plantNoteList/plantNoteList'
    })
  },

  /**
   * 种草详情
   */
  handleToPlantNoteInfo(e) {
    let rid = e.currentTarget.dataset.rid
    let targetType = e.currentTarget.dataset.type

    // 1: 文章
    if (targetType == 1) {
      wx.navigateTo({
        url: '../findInfo/findInfo?rid=' + rid,
      })
    }

    // 2: 种草笔记
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
    this.setData({
      swiperIndex: e.detail.current
    })
  },

  /**
   * 改变生活馆logo
   */
  handleChangeLogo() {
    wx.chooseImage({
      count: 1,
      success: (res) => {
        let tempFilePaths = res.tempFilePaths
        const uploadTask = http.fxUpload(api.asset_upload, tempFilePaths[0], {}, (result) => {
          utils.logger(result, '上传的图片')
          if (result.data.length > 0) {
            this.setData({
              isUploading: false,
              uploadStatus: 100
            })

            this.getAssetInfo(result.data[0])

            // 更新logo
            this.handleUpdateStoreLogo(result.data[0].id)
          }
        })

        uploadTask.onProgressUpdate((res) => {
          utils.logger('上传进度', res.progress)

          let percent = res.progress
          this.setData({
            isUploading: percent == 100 ? false : true,
            uploadStatus: percent
          })
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
      utils.logger(res, '更新生活馆logo')
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
      utils.logger(res, '更新生活馆')
      if (res.success) {
        this.setData({
          'lifeStore.name': res.data.name,
          'lifeStore.description': res.data.description,
          showEditModal: false
        })

        // 更新标题
        let lifeStoreName = res.data.name + '的生活馆'
        this.handleSetNavigationTitle(lifeStoreName)
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
    wx.navigateTo({
      url: '../product/product?rid=' + e.detail.rid + '&product=' + this.data.myProduct + "&storeRid=" + e.detail.storeRid
    })
  },

  /**
   * 跳转商品详情
   */
  handleGoProduct(e) {
    let rid = e.detail.rid
    wx.navigateTo({
      url: '/pages/product/product?rid=' + rid + "&storeRid=" + e.detail.storeRid
    })
  },

  /**
   * 查看商品详情
   */
  handleViewProduct(e) {
    let rid = e.currentTarget.dataset.rid
    wx.navigateTo({
      url: '/pages/product/product?rid=' + rid + "&storeRid=" + e.currentTarget.dataset.storeRid
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
      return
    }

    wx.navigateTo({
      url: '/lifeStore/pages/lifeStoreGuide/lifeStoreGuide',
    })
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

    wx.showModal({
      content: '你确认要下架此商品',
      cancelText: '删除',
      cancelColor: '#666',
      confirmText: '取消',
      confirmColor: '#5fe4b1',
      success: (res) => {
        if (res.cancel) { // 取消 与 确认 互换
          utils.logger('Delete, rid: ' + rid + ', idx: ' + idx)
          http.fxDelete(api.life_store_delete_product, data, (result) => {
            utils.logger(result, '删除商品')
            if (result.success) {
              let _storeProducts = this.data.storeProducts
              let isEmpty = false
              utils.logger(_storeProducts)

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

  /** 探索页面 **/

  // 广告位置
  getExploreAdvertisement() {
    http.fxGet(api.banners_explore, {}, (result) => {
      utils.logger(result, '探索-头部广告')
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
      utils.logger(result, '分类列表')
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
      utils.logger(result, '编辑推荐')
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
      utils.logger(result, '特色品牌馆')

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
      utils.logger(result, '关注品牌馆')
      if (result.success) {
        this.setData({
          ['characteristicStoreList.stores[' + index + '].is_followed']: true
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

    http.fxPost(api.delete_watch, {
      rid: rid
    }, (result) => {
      utils.logger(result, '取消关注品牌馆')
      if (result.success) {
        this.setData({
          ['characteristicStoreList.stores[' + index + '].is_followed']: false
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 人气推荐的轮播点
  handleGratefulSwiper(e) {
    utils.logger(e.detail.current)
    this.setData({
      gratefulSwiper: e.detail.current
    })
  },

  // 添加浏览记录
  handleAddBrowse() {
    if (!this.data.sid) {
      return
    }
    let openId = wx.getStorageSync('jwt').openid
    http.fxPost(api.add_browse, {
      openid: openId,
      rid: this.data.sid
    }, (result) => {
      utils.logger(result, this.data.sid, '添加浏览者')
      this.getBrowsePeople()
    })
  },

  // 取消关注人
  handleDeleteFollow(e) {
    let uid = e.currentTarget.dataset.uid
    this._handleFollow(uid, false)

    http.fxPost(api.unfollow_user, {
      uid: uid
    }, result => {
      utils.logger(result, "取消关注")
    })
  },

  // 处理红包的时间
  _handleNewUserCouponTime() {
    let newUserCouponInfo = this.data.newUserCouponInfo

    let currentTime = new Date()
    let currentTimeStr = Date.parse(currentTime) / 1000

    newUserCouponInfo.forEach(v => {
      v.created_at = utils.timestamp2string(currentTimeStr, 'date')
      v.end_at = utils.timestamp2string(currentTimeStr + 604800, 'date')
    })

    this.setData({
      newUserCouponInfo
    })
  },

  // 新人领取红包 market_grant_new_user_bonus
  handleNewUserCoupon() {
    // 是否登陆
    if (!app.globalData.isLogin) {
      utils.handleHideTabBar()
      this.setData({
        is_mobile: true
      })
      return
    }

    http.fxPost(api.market_grant_new_user_bonus, {}, result => {
      if (result.success) {
        this.setData({
          newUserCouponSuccess: true,
          newUserCoupon: false
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 新人领取优惠券后去使用
  handleNewGoUseCoupon() {
    this.setData({
      newUserCouponSuccess: false
    })
  },

  // 去我的优惠券
  handleGoCoupon() {
    wx.navigateTo({
      url: '../coupon/coupon'
    })

    this.handleNewGoUseCoupon()
  },

  // 关闭新人红包
  handleOffNewCoupon() {
    this.setData({
      newUserCoupon: false
    })
  },

  // 复制信息
  handleCopyWXCode() {
    wx.setClipboardData({
      data: 'lexixiaoduo',
      success(res) {}
    })
  },

  // 获取浏览记录
  getBrowsePeople() {
    if (!this.data.sid) {
      return
    }

    let openId = wx.getStorageSync('jwt').openid
    http.fxGet(api.BrowseQuantityNumber.replace(/:rid/g, this.data.sid), {
      openid: openId
    }, (result) => {
      utils.logger(result, this.data.sid, '获取的浏览者')
      if (result.success) {
        this.setData({
          shopInfo: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 优质新品
  getHighQuality() {
    http.fxGet(api.column_explore_new, {}, (result) => {
      utils.logger(result, '优质新品')
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
    http.fxGet(api.column_collections_basic, {}, (result) => {
      utils.logger(result, '集合')
      if (result.success) {
        result.data.collections.forEach((v, i) => {
          v.sub_name = v.sub_name.length > 7 ? v.sub_name.substr(0, 8) + ' ...' : v.sub_name
        })

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
      utils.logger(result, '特惠好设计')
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
      utils.logger(result, '百元好物')
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

  // 发现生活美学 
  getLifeWindow() {
    http.fxGet(api.shop_windows_handpick, {}, (result) => {
      utils.logger(result, '今日推荐')
      if (result.success) {
        this.setData({
          lifeWindow: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 今日推荐
  getTodayRecommend() {
    http.fxGet(api.column_daily_recommends, {}, (result) => {
      utils.logger(result, '今日推荐')
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
      utils.logger(result, '人气推荐')
      if (result.success) {
        this.setData({
          gratefulList: [],
          isLoadPageShow: false
        })

        this.setData({
          gratefulList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 猜图游戏
  handleGuessGame() {
    wx.navigateTo({
      url: '/games/pages/guessGame/guessGame',
    })
  },

  // 监听动画结束
  handleAnimationend() {


    setInterval(() => {

      this.setData({
        aplayStoreAnimationIndex: this.data.aplayStoreAnimationIndex + 1
      })

      if (this.data.aplayStoreAnimationIndex == 47) {
        this.setData({
          aplayStoreAnimationIndex: 0
        })
      }

    }, 3000)
  },

  // 精选的中间广告banners_handpick_content  handerAdvertisementList
  getChoiceMiddleAdvertisement() {
    http.fxGet(api.banners_handpick_content, {
      page: 1,
      per_page: 15
    }, (result) => {
      utils.logger(result, '精选-中间广告')
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
      utils.logger(result, '精选-头部广告')
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
      utils.logger(result, '乐喜优选')
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
      utils.logger(result, '种草清单')
      if (result.success) {
        result.data.life_records.forEach((v) => {
          v.description = v.description.replace(/<\s*\/?\s*[a-zA-z_]([^>]*?["][^"]*["])*[^>"]*>/g, '')
        })

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
      per_page: 20
    }, (res) => {
      utils.logger(res, '最受欢迎商品')
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
      user_record: 1
    }

    http.fxGet(api.life_store_products, params, (res) => {
      utils.logger(res, '全部分销商品')
      if (res.success) {
        res.data.products.forEach(v => {
          if (typeof(v.stick_text) == 'object') {
            v.stick_text = false
          }
        })

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
          isNextRecommend: res.data.next // 没有下一页了
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
      utils.logger(res, '生活馆信息-1710')
      if (res.success) {
        let isCadet = true
        if (res.data.phases == 2) {
          isCadet = false
        }

        this.setData({
          lifeStore: res.data,
          isCadet: isCadet
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
      utils.logger(res, '生活馆头条')
      if (res.success) {
        let l = res.data.headlines.length

        res.data.headlines.forEach((v, i) => {
          if (v.event == 1) {
            v.text = v.time + v.time_info + '开了生活馆' // v.username + 
          }
          if (v.event == 2) {
            v.text = v.time + v.time_info + '售出' + v.quantity + '单' // v.username + 
          }
          if (v.event == 3) {
            v.text = v.time + v.time_info + '售出' + v.quantity + '单' // v.username + 
          }
          if (v.event == 4) {
            v.text = '售出' + v.quantity + '单' // v.username + 
          }
          // 随机颜色
          let num = Math.ceil(Math.random() * 5)
          if (i % num == 0) {
            v.color = true
          }

        })

        // 暂时展示2条
        this.setData({
          storeHeadlines: res.data.headlines
        })

        this.handleAnimationend()
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 获取最新3个分销商品
   */
  getDistributeNewest() {
    http.fxGet(api.distribute_newest, {
      count: 20
    }, (res) => {
      utils.logger(res, '选品中心')
      if (res.success) {
        this.setData({
          latestDistributeProducts: res.data.products
        })

        this._lifeAnimation()
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 获取单个附件信息
   */
  getAssetInfo(asset) {
    this.setData({
      'lifeStore.logo': asset.view_url
    })
  },

  // 分享的生活馆图片
  getLifePhotoUrl() {
    if (!this.data.sid) {
      return
    }

    http.fxPost(api.market_share_life_store, {
      rid: this.data.sid
    }, (result) => {
      utils.logger(result, this.data.sid + '-分享生活馆图片的地址')
      if (result.success) {
        this.setData({
          lifePhotoUrl: result.data.image_url
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },


  // 头部广告 发现
  getAdvertisement() {
    http.fxGet(api.marketBanners.replace(/:rid/g, 'discover_ad'), {}, (result) => {
      utils.logger(result, '发现-头部广告')
      if (result.success) {
        this.setData({
          advertisement: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 猜你喜欢 发现
  getYouLike() {
    http.fxGet(api.life_records_guess_likes, {}, (result) => {
      utils.logger(result, '猜你喜欢')

      this.setData({
        isLoadPageShow: false
      })

      if (result.success) {
        // 去除标签
        result.data.life_records.forEach((v) => {
          v.description = v.description.replace(/<\s*\/?\s*[a-zA-z_]([^>]*?["][^"]*["])*[^>"]*>/g, '')
        })

        this.setData({
          youLike: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 精彩故事
  getWonderfulStories() {
    http.fxGet(api.life_records_wonderful_stories, {}, (result) => {
      utils.logger(result, '精彩故事')
      if (result.success) {
        // 去除标签
        result.data.life_records.forEach((v) => {
          v.description = v.description.replace(/<\s*\/?\s*[a-zA-z_]([^>]*?["][^"]*["])*[^>"]*>/g, '')
        })

        this.setData({
          wonderfulStories: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 新人是否领取过红包
  getNewCoupon() {
    // 没有登录
    if (!app.globalData.isLogin) {
      this._handleNewUserCouponTime()
      this.setData({
        newUserCoupon: true
      })

    } else {
      http.fxGet(api.market_is_new_user_bonus, {}, result => {
        if (result.data.is_grant == 0) {
          this._handleNewUserCouponTime()
          this.setData({
            newUserCoupon: true
          })

        }
      })
    }
  },

  //新品速递
  getHandpickNewExpress() {
    http.fxGet(api.handpick_new_express, {}, result => {
      if (result.success) {
        this.setData({
          handpickNewExpress: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 生活馆的头部广告为
  getTopAdvPhoto() {
    http.fxGet(api.banners_rid.replace(/:rid/, 'wxa_lifestore_head'), {}, result => {
      if (result.success) {
        this.setData({
          topAdvPhoto: result.data.banner_images[0]
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 开馆指引的背景广告位置
  getAplayStoreBGAdv() {
    http.fxGet(api.banners_rid.replace(/:rid/, 'wxa_lifestore_bg'), {}, result => {
      if (result.success) {
        this.setData({
          aplayStoreBGAdv: result.data.banner_images[0]
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 加载探索页数据
  _loadingExplorePage() {
    this.getExploreAdvertisement() // 广告位
    this.getCategory() // 分类
    this.getEditRecommend() // 编辑推荐
    this.getCharacteristicBranderStore() // 特色品牌馆
    this.getHighQuality() // 优质新品
    this.getGather() // 集合产品
    this.getGoodDesign() // 特惠好设计
    this.getOneHundred() // 百元好物
  },

  // 加载精选页数据
  _loadingFeaturedPage() {
    this.getChoiceHanderAdvertisement() // 头部广告
    this.getStoreHeadlines() // 开馆头条
    this.getTodayRecommend() // 今日推荐
    this.getGrateful() // 人气推荐
    this.getChoiceMiddleAdvertisement() // 中间广告
    this.getLitePick() // 乐喜优选
    this.getPlantOrder() // 种草清单
    this.getLifeWindow() // 发现生活美学
  },

  // 加载生活馆数据
  _loadingLifeStorePage() {
    this.handleAddBrowse() // 添加浏览者
    this.getLifeStore() // 生活馆信息
    this.getStoreProducts() // 生活馆商品
    this.getWeekPopular() // 本周最受欢迎商品
    this.getHandpickNewExpress() // 新品速递
    this.getTopAdvPhoto() // 头部广告位
    this.getAplayStoreBGAdv() // 开馆指引广告位
  },

  // 验证是否存在生活馆
  validateLifeStore() {
    const lifeStore = wx.getStorageSync('lifeStore')

    // 判断登录用户是否有生活馆
    if (lifeStore.isSmallB) {
      let sid = lifeStore.lifeStoreRid

      this.setData({
        sid: sid,
        isExistLifeStore: true,
        pageActiveTab: 'lifeStore'
      })

      // 请求当前数据
      this._swtichActivePageTab('lifeStore')
    } else {
      this.setData({
        isExistLifeStore: false
      })
    }
  },

  /**
   * 激活页面Tab
   */
  _swtichActivePageTab(name) {
    switch (name) {
      case 'lifeStore':
        this.setData({
          page: 1
        })

        // 验证生活馆是不是自己的
        const lifeStore = wx.getStorageSync('lifeStore')
        // 判断登录用户是否有生活馆
        if (lifeStore.isSmallB) {
          if (this.data.sid == lifeStore.lifeStoreRid) {
            const userInfo = wx.getStorageSync('userInfo')
            this.setData({
              storeOwner: userInfo,
              isSmallB: true,
              canAdmin: true,
              showBack: false
            })
          } else {
            this.setData({
              isSmallB: false,
              canAdmin: false,
              showBack: true
            })
          }
        }

        // 更新当前用户的last_store_rid
        app.updateLifeStoreLastVisit(this.data.sid)

        // 同步更新全局变量
        wx.setStorageSync('showingLifeStoreRid', this.data.sid)

        this._loadingLifeStorePage()
        break;
      case 'featured': // 精选
        this.handleSetNavigationTitle('精选')

        this.setData({
          swiperIndex: 0
        })

        break;
      case 'explore': // 探索
        this.handleSetNavigationTitle('探索')
        break;
      case 'find': // 发现
        this.handleSetNavigationTitle('发现')
        break;
    }
  },

  /**
   * 做动画
   */
  _lifeAnimation() {
    animationInterval = setInterval(() => {
      let arrayData = this.data.latestDistributeProducts
      this.setData({
        latestDistributeProducts: arrayData.concat(arrayData[this.data.animationNum]),
        animationNum: this.data.animationNum + 1,
      })
    }, 2000)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 检测网络
    app.ckeckNetwork()

    // scene格式：sid + '-' + uid
    let scene = decodeURIComponent(options.scene)
    let sid = ''

    // 全局参数里有生活馆
    const showingLifeStoreRid = wx.getStorageSync('showingLifeStoreRid')
    if (showingLifeStoreRid != '') {
      this.setData({
        sid: showingLifeStoreRid
      })
    }

    // 传参数里有生活馆
    if (options.sid) {
      this.setData({
        sid: options.sid
      })
    }

    // 场景参数优先级高
    if (scene && scene != 'undefined') {
      let scene_ary = scene.split('-')
      sid = utils.trim(scene_ary[0])
      // 分销商uid
      if (scene_ary.length == 2) {
        let customer_rid = utils.trim(scene_ary[1])
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
      utils.logger('验证登录用户是否为小B')

      // 异步请求，已完成登录，装载用户信息
      if (Object.keys(app.globalData.lifeStore).length > 0) {
        this.validateLifeStore()
      } else { // 登录请求还未完成
        // 给app.js 定义一个方法。
        app.userInfoReadyCallback = res => {
          utils.logger('用户信息请求完毕')
          if (res) {
            this.validateLifeStore()
          } else {
            utils.fxShowToast('授权失败，请稍后重试')
          }
        }
      }
    } else { // 显示其他人的生活馆
      this.setData({
        'pageTabs[0].disabled': false,
        pageActiveTab: 'lifeStore'
      })

      // 请求当前数据
      this._swtichActivePageTab('lifeStore')
    }

    // 预加载精选、探索数据 ， 发现页面
    this._loadingFeaturedPage()
    this._loadingExplorePage()

  },

  /**
   * 监听页面滚动
   * **/
  onPageScroll(e) {
    if (e.scrollTop > 50) {
      if (!this.data.isNavbarAdsorb) {
        this.setData({
          isNavbarAdsorb: true
        })
      }
    }

    if (e.scrollTop <= 50) {
      if (this.data.isNavbarAdsorb) {
        this.setData({
          isNavbarAdsorb: false
        })
      }
    }

    //记录页面滚动
    let scrollPosition = e.scrollTop
    let currentPage = this.data.pageActiveTab
    // 生活馆
    if (currentPage == 'lifeStore') {
      this.setData({
        'pageTabs[0].pageScroll': scrollPosition
      })
    }
    // 精选
    if (currentPage == 'featured') {
      this.setData({
        'pageTabs[1].pageScroll': scrollPosition
      })
    }
    // 探索
    if (currentPage == 'explore') {
      this.setData({
        'pageTabs[2].pageScroll': scrollPosition
      })
    }
    // 橱窗
    if (currentPage == 'window') {
      this.setData({
        'pageTabs[3].pageScroll': scrollPosition
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.setData({
      isLoadPageShow: false,
      readyOver: true
    })

    let that = this
    setTimeout(() => {
      that.setData({
        isLoading: false
      })
    }, 500)

    // 新人红包
    this.getNewCoupon()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function(e) {
    // 标识自己是否为小B
    const lifeStore = wx.getStorageSync('lifeStore')
    if (lifeStore.isSmallB) {
      this.setData({
        isSmallB: true
      })
    }

    // 当前显示生活馆与应该显示生活馆是否一致
    const showingLifeStoreRid = wx.getStorageSync('showingLifeStoreRid')
    if (this.data.sid != '' && showingLifeStoreRid && this.data.sid != showingLifeStoreRid) {
      this.setData({
        'pageTabs[0].disabled': false,
        sid: showingLifeStoreRid,
        page: 1
      })

      // 刷新生活馆
      if (this.data.pageActiveTab == 'lifeStore') {
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 0
        })
        this._swtichActivePageTab('lifeStore')
      } else {
        const fromMenu = wx.getStorageSync('fromMenu')
        if (fromMenu == 'visitLifeStore') {
          this.setData({
            pageActiveTab: 'lifeStore',
            'pageTabs[0].pageScroll': 0
          })
          wx.pageScrollTo({
            scrollTop: 0,
            duration: 0
          })
          this._swtichActivePageTab('lifeStore')
        } else {
          this._loadingLifeStorePage()
        }
      }
    }

    // 初次进入时无生活馆，后续申请开通后
    if (this.data.sid == '') {
      if (lifeStore.isSmallB) {
        this.setData({
          'pageTabs[0].disabled': false,
          sid: lifeStore.lifeStoreRid,
          canAdmin: true
        })
      }
      // 当没有生活馆时
      if (showingLifeStoreRid) {
        this.setData({
          'pageTabs[0].disabled': false,
          sid: showingLifeStoreRid
        })

        const fromMenu = wx.getStorageSync('fromMenu')
        if (fromMenu == 'visitLifeStore') {
          this.setData({
            pageActiveTab: 'lifeStore',
            'pageTabs[0].pageScroll': 0
          })
          wx.pageScrollTo({
            scrollTop: 0,
            duration: 0
          })
          this._swtichActivePageTab('lifeStore')
        }
      }
    }

    // 选品中心的动画
    if (this.data.canAdmin) {
      // 加载选品中心的动画
      this.getDistributeNewest()
    }

    // 获取当前环境
    this.getRunEnv()
  },

  /**
   * 获取运行环境
   */
  getRunEnv() {
    http.fxGet(api.run_env, {}, (res) => {
      if (res.success) {
        utils.logger(res, '环境变量')
        this.setData({
          runEnv: res.data.status
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    clearInterval(animationInterval) // 清除动画
    this.setData({
      latestDistributeProducts: [],
      animationNum: 0
    })

    // 来源查看生活馆记录
    wx.removeStorageSync('fromMenu')
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearInterval(animationInterval) // 清除动画
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    utils.logger(this.data.pageActiveTab, '下拉刷新')
    if (this.data.pageActiveTab == 'featured') {
      this._loadingFeaturedPage()
    }
    if (this.data.pageActiveTab == 'explore') {
      this._loadingExplorePage()
    }
    if (this.data.pageActiveTab == 'lifeStore') {
      this.setData({
        page: 1
      })
      this._loadingLifeStorePage()
    }

    wx.stopPullDownRefresh()
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
    utils.logger(e)

    // 在生活馆里面分享
    if (this.data.pageActiveTab == 'lifeStore') {
      // 分享平台或生活馆
      if (e.from == 'menu' || e.target.dataset.from == 1) {
        if (this.data.pageActiveTab == 'lifeStore') {
          let lastVisitLifeStoreRid = app.getDistributeLifeStoreRid()

          // scene格式：sid + '-' + uid
          let scene = lastVisitLifeStoreRid
          utils.logger(lastVisitLifeStoreRid, '分享的场景参数')
          return {
            title: this.data.lifeStore.name + '的生活馆',
            path: 'pages/index/index?scene=' + scene,
            imageUrl: this.data.lifePhotoUrl,
            success: (res) => {
              utils.logger(res, '分享成功!')
            }
          }
        }
      }

      // 分享产品 shareProduct
      if (e.target.dataset.from == 2) {
        let title = this.data.shareProduct.name
        return app.shareWxaProduct(this.data.shareProduct.rid, title, this.data.shareProduct.cover)
      }

    } else {
      // 精选和探索里面分享
      // return app.shareLeXi()
      return {
        title: '让有趣变得流行',
        path: 'pages/index/index',
        imageUrl: "https://static.moebeast.com/vimage/share-lexi.png",
        success: (res) => {
          utils.logger(res, '分享成功!')
        }
      }
    }
  },

  // 点击分类
  handleCategoryInfoTap(e) {
    utils.logger(e)
  },

  // 跳转搜索页面
  handleToSearch() {
    wx.navigateTo({
      url: '../search/search',
    })
  },

  // 包邮专区
  handleToExemptionFromPostage() {
    wx.navigateTo({
      url: '../exemptionFromPostage/exemptionFromPostage',
    })
  },

  // 领券中心
  handleToreceiveCoupon() {
    wx.navigateTo({
      url: '../receiveCoupon/receiveCoupon',
    })
  },

  // 乐喜优选
  handleToLexiPick() {
    wx.navigateTo({
      url: '../leXiHighPick/leXiHighPick',
    })
  },

  // 乐喜优选
  handleGoNewProductExpress() {
    wx.navigateTo({
      url: '../newProductExpress/newProductExpress',
    })
  },

  // 跳转到商品列表页面
  handleToProductList(e) {
    utils.logger(e.currentTarget.dataset.from)
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
    wx.navigateTo({
      url: '../categoryList/categoryList?categryId=' + e.currentTarget.dataset.id + "&titleName=" + e.currentTarget.dataset.titleName,
    })
  },

  // 跳转到集合详情
  handleToGatherInfo(e) {
    wx.navigateTo({
      url: '../gatherInfo/gatherInfo?rid=' + e.currentTarget.dataset.rid
    })
  },

  // 跳转到品牌馆详情
  handleTobrandStore(e) {
    wx.navigateTo({
      url: '../branderStore/branderStore?rid=' + e.currentTarget.dataset.rid,
    })
  },

  // 橱窗详情
  handleGoWindowDetail(e) {
    let windowRid = e.currentTarget.dataset.windowRid
    wx.navigateTo({
      url: '../windowDetail/windowDetail?windowRid=' + windowRid,
    })
  },

  // 跳转到品牌馆列表
  handelTobrandList(e) {
    wx.navigateTo({
      url: '../branderStoreList/branderStoreList?rid=' + e.currentTarget.dataset.rid,
    })
  }

})