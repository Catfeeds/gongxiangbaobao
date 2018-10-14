// 获取应用实例
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
    perPage: 5,
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

    // 生活馆
    isUploading: false,
    uploadStatus: 0,
    shopInfo: '', // 生活馆信息
    lifePhotoUrl: '', // 分享生活馆的图片
    sid: '', // 生活馆sid
    openId: '', // openId
    shopInfo: '', // 生活馆信息
    lifeStore: {}, // 编辑生活馆信息
    lifePhotoUrl: '', // 分享生活馆的图片
    storeOwner: {}, // 生活馆馆长
    storeProducts: [], // 生活馆商品列表
    isNextRecommend: false, // 推荐是否有下一页
    isEmpty: false, // 是否为空
    isSmallB: false, // 当前用户是否为小B
    canAdmin: false, // 是否具备管理生活馆
    isSmallHome: false, // 是否在自己的生活馆
    showEditModal: false, // 生活馆编辑
    showConfirmModal: false, // 删除上架商品确认
    latestDistributeProducts: [], // 最新分销商品
    isDistributed: false, // 是否属于分销
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
    recommendWindow: [], // 发现生活美学
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

    isNavbarAdsorb: false, // 头部导航是否吸附
    pageActiveTab: 'featured',
    // 分类列表
    pageTabs: [{
        rid: 'p1',
        name: 'lifeStore',
        title: '生活馆',
        disabled: true
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

    is_mobile: false // 验证是否登陆
  },

  /**
   * 显示分享生活馆的
   */
  handleShareLifeBrand() {
    this.setData({
      isShowShareLifeBrand: true
    })

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

    this._swtichActivePageTab(name)
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
    console.log(this.data.storeProducts[idx])
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
    let rid = this.data.sid

    // scene格式：rid + '-' + sid
    let scene = rid
    if (lastVisitLifeStoreRid) {
      scene += '-' + lastVisitLifeStoreRid
    }

    let params = {
      rid: rid,
      type: 2,
      path: 'pages/index/index',
      auth_app_id: app.globalData.app_id,
      scene: scene
    }
    http.fxPost(api.wxa_poster, params, (result) => {
      console.log(result, '生成分享生活馆报图')
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
                      console.log('获取权限成功，再次点击图片保存到相册')
                      utils.fxShowToast('保存成功,分享至朋友圈')
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
    console.log(this.data.lifeStorePosterUrl)
    // 下载网络文件至本地
    wx.downloadFile({
      url: this.data.lifeStorePosterUrl,
      success: function(res) {
        console.log(res, '保存文件的路径')
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
                      console.log('获取权限成功，再次点击图片保存到相册')
                      utils.fxShowToast('保存成功,分享至朋友圈')
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
          console.log(result, '上传的图片')
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
          console.log('上传进度', res.progress)

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
      console.log(res, '更新生活馆')
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
    console.log(e)
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
   * 回到自己的生活馆
   */
  handleBackLifeStore() {
    const lifeStore = wx.getStorageSync('lifeStore')
    const userInfo = wx.getStorageSync('userInfo')

    let sid = lifeStore.lifeStoreRid
    this.setData({
      sid: sid,
      isSmallHome: true,
      pageActiveTab: 'lifeStore',
      canAdmin: true
    })

    this._swtichActivePageTab(this.data.pageActiveTab)

    // 更新当前用户的last_store_rid
    app.updateLifeStoreLastVisit(sid)
    
    // 重新生成海报图
    this.getLifePhotoUrl()
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
          console.log('Delete, rid: ' + rid + ', idx: ' + idx)
          http.fxDelete(api.life_store_delete_product, data, (result) => {
            console.log(result, '删除商品')
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

  /** 探索页面 **/

  // 广告位置
  getExploreAdvertisement() {
    http.fxGet(api.banners_explore, {}, (result) => {
      console.log(result, '探索-头部广告')
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
      console.log(result, '分类列表')
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
      console.log(result, '编辑推荐')
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
      console.log(result, '特色品牌馆')

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
      console.log(result)
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
      console.log(result)
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
    console.log(e.detail.current)
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
      console.log(result, '添加浏览者')
      this.getBrowsePeople()
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
      console.log(result, '获取的浏览者')
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
      console.log(result, '优质新品')
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
      console.log(result, '集合')
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
      console.log(result, '特惠好设计')
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
      console.log(result, '百元好物')
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

  // 今日推荐
  getTodayRecommend() {
    http.fxGet(api.column_daily_recommends, {}, (result) => {
      console.log(result, '今日推荐')
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
      console.log(result, '人气推荐')
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

  // 精选的中间广告banners_handpick_content  handerAdvertisementList
  getChoiceMiddleAdvertisement() {
    http.fxGet(api.banners_handpick_content, {
      page: 1,
      per_page: 15
    }, (result) => {
      console.log(result, '精选-中间广告')
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
      console.log(result, '精选-头部广告')
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
      console.log(result, '乐喜优选')
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
      console.log(result, '种草清单')
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
      user_record: 1
    }

    http.fxGet(api.life_store_products, params, (res) => {
      console.log(res, '全部分销商品')
      console.log(this.data.page, '分销商品当前页')
      if (res.success) {
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
        res.data.headlines.forEach((v, i) => {

          if (v.time > 24) {
            v.time = Math.ceil(v.time % 24) + '天'
          } else {
            v.time = v.time + '小时'
          }

          if (v.username != null && v.username - 0 != NaN && v.username.length > 9) {
            console.log(v)
            v.username = v.username.substr(0, 3) + '****' + v.username.substr(7, 4)
          }

          let newObj = []
          if ((i + 1) % 2 == 0) {
            newObj.push(v)
            newObj.push(res.data.headlines[i - 1])
            newData.push(newObj)
          }
        })

        // 暂时展示2条
        this.setData({
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
        utils.fxShowToast(result.status.message)
      }
    })
  },

  getWindow() {
    http.fxGet(api.shop_windows_recommend, {
      per_page: 5
    }, result => {
      console.log(result, "获取推荐的橱窗")
      if (result.success) {
        this.setData({
          recommendWindow: result.data
        })

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 验证是否存在生活馆
  validateLifeStore() {
    const lifeStore = wx.getStorageSync('lifeStore')
    const userInfo = wx.getStorageSync('userInfo')

    // 判断登录用户是否有生活馆
    if (lifeStore.isSmallB) {
      let sid = lifeStore.lifeStoreRid

      this.setData({
        sid: sid,
        'pageTabs[0].disabled': false,
        pageActiveTab: 'lifeStore',
        storeOwner: userInfo,
        isSmallHome: true,
        canAdmin: true
      })

      // 更新当前用户的last_store_rid
      app.updateLifeStoreLastVisit(sid)

      // 请求当前数据
      this._swtichActivePageTab('lifeStore')
    } else {
      this.setData({ // 无生活馆显示
        'pageTabs[0].disabled': true,
        pageActiveTab: 'featured'
      })

      // 请求当前数据
      this._swtichActivePageTab('featured')
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
    }
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
    this.getWindow() // 橱窗
    this.getLitePick() // 乐喜优选
    this.getPlantOrder() // 种草清单
  },

  // 加载生活馆数据
  _loadingLifeStorePage() {
    this.handleAddBrowse() // 添加浏览者
    this.getLifeStore() // 生活馆信息
    this.getDistributeNewest() // 选品中心入口
    this.getStoreProducts() // 生活馆商品
    this.getWeekPopular() // 本周最受欢迎商品
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    // 如果是由分享商品详情而来就跳转详情
    if (app.globalData.sharePageRid) {
      wx.navigateTo({
        url: '../product/product?rid=' + app.globalData.sharePageRid,
        complete: () => {
          // 跳转后清空
          app.globalData.sharePageRid = false
        }
      })
    }

    // scene格式：sid + '-' + uid
    let scene = decodeURIComponent(options.scene)
    let sid = ''
    // 传参数里有生活馆
    if (options.sid) {
      this.setData({
        sid: sid
      })
    }
    // 场景参数优先级高
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
      console.log('验证登录用户是否为小B')

      // 异步请求，已完成登录，装载用户信息
      if (Object.keys(app.globalData.lifeStore).length > 0) {
        this.validateLifeStore()
      } else { // 登录请求还未完成
        // 给app.js 定义一个方法。
        app.userInfoReadyCallback = res => {
          console.log('用户信息请求完毕')
          if (res) {
            this.validateLifeStore()
          } else {
            utils.fxShowToast('授权失败，请稍后重试')
          }
        }
      }
    } else { // 显示其他人的生活馆
      // 验证生活馆是不是自己的
      const lifeStore = wx.getStorageSync('lifeStore')
      // 判断登录用户是否有生活馆
      if (lifeStore.isSmallB && this.data.sid == lifeStore.lifeStoreRid) {
        let sid = lifeStore.lifeStoreRid

        const userInfo = wx.getStorageSync('userInfo')
        this.setData({
          'pageTabs[0].disabled': false,
          pageActiveTab: 'lifeStore',
          storeOwner: userInfo,
          isSmallHome: true,
          canAdmin: true
        })
      } else {
        this.setData({
          'pageTabs[0].disabled': false,
          pageActiveTab: 'lifeStore',
          isSmallHome: false,
          canAdmin: false
        })
      }

      // 更新当前用户的last_store_rid
      app.updateLifeStoreLastVisit(this.data.sid)

      // 请求当前数据
      this._swtichActivePageTab('lifeStore')
    }

    // 预加载精选、探索数据
    this._loadingFeaturedPage()
    this._loadingExplorePage()
  },

  /**
   * 监听页面滚动
   * **/
  onPageScroll(e) {
    if (e.scrollTop >= 50) {
      this.setData({
        isNavbarAdsorb: true
      })
    }

    if (e.scrollTop < 51) {
      this.setData({
        isNavbarAdsorb: false
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

    this.getLifePhotoUrl()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 标识自己是否为小B
    const lifeStore = wx.getStorageSync('lifeStore')
    if (lifeStore.isSmallB) {
      this.setData({
        isSmallB: true
      })
    }
    // 初次进入时无生活馆，后续申请开通后
    if (this.data.sid == '') {
      if (lifeStore.isSmallB) {
        this.setData({
          'pageTabs[0].disabled': false,
          sid: lifeStore.lifeStoreRid,
          canAdmin: true,
          isSmallHome: true
        })
      }
    }
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
    console.log(this.data.pageActiveTab, '下拉刷新')
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
    console.log(e)

    // 在生活馆里面分享
    if (this.data.pageActiveTab == 'lifeStore') {
      // 分享平台或生活馆
      if (e.from == 'menu' || e.target.dataset.from == 1) {
        if (this.data.pageActiveTab == 'lifeStore') {
          let lastVisitLifeStoreRid = app.getDistributeLifeStoreRid()

          // scene格式：sid + '-' + uid
          let scene = lastVisitLifeStoreRid
          console.log(lastVisitLifeStoreRid, '分享的场景参数')
          return {
            title: this.data.lifeStore.name + '的生活馆',
            path: 'pages/index/index?scene=' + scene,
            imageUrl: this.data.lifePhotoUrl,
            success: (res) => {
              console.log(res, '分享成功!')
            }
          }
        }
      }

      // 分享产品 shareProduct
      if (e.target.dataset.from == 2) {
        console.log(2)
        let title = this.data.shareProduct.name
        return app.shareWxaProduct(this.data.shareProduct.rid, title, this.data.shareProduct.cover)
      }

    } else {
      // 精选和探索里面分享
      return app.shareLeXi()
    }
  },

  // 点击分类
  handleCategoryInfoTap(e) {
    console.log(e)
  },

  // 跳转搜索页面
  handleToSearch() {
    wx.navigateTo({
      url: '../search/search',
    })
  },

  // 橱窗详情
  handleGoWindowDetail(e) {
    let windowRid = e.currentTarget.dataset.windowRid
    wx.navigateTo({
      url: '../windowDetail/windowDetail?windowRid=' + windowRid,
    })
  },

  // 橱窗列表
  handleGoWindow() {
    wx.navigateTo({
      url: '../window/window'
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

  // 跳转到商品列表页面
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

  // 跳转到品牌馆列表
  handelTobrandList(e) {
    wx.navigateTo({
      url: '../branderStoreList/branderStoreList?rid=' + e.currentTarget.dataset.rid,
    })
  }

})