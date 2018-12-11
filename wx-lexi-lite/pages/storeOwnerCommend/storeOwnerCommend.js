// pages/storeOwnerCommend/storeOwnerCommend.js
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
    isLoading: true,
    isLoadProductShow: true, // 加载的loading
    isEmpty: false,
    lifeStore: {
      logo: 'https://static.moebeast.com/image/static/null-product.png'
    }, // 编辑生活馆信息

    canAdmin: false,
    sid: '',
    storeProducts: [],
    isNext: true, // 是否有下一页
    isDistributed: '',

    // 分享产品
    shareProduct: '', // 分享某个商品
    posterUrl: '', // 海报图url

    params: {
      page: 1,
      per_page: 10,
      sid: '',
      is_distributed: 2,
      user_record: 1
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
          app.globalData.agent.storeOwnerCommendChange = true
          http.fxDelete(api.life_store_delete_product, data, (result) => {
            utils.logger(result, '删除商品')
            if (result.success) {
              
            } else {
              utils.fxShowToast(result.status.message)
            }
          })
        }
      }
    })
  },

  /**
   * 推荐分享-销售
   */
  handleStickShareDistribute(e) {
    let isDistributed = e.currentTarget.dataset.isDistributed
    let rid = e.currentTarget.dataset.rid
    let idx = e.currentTarget.dataset.idx

    this.setData({
      isDistributed: isDistributed || '',
      showShareModal: true,
      shareProduct: this.data.storeProducts[idx]
    })

    this.getWxaPoster()
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
   * 查看商品详情
   */
  handleViewProduct(e) {
    let rid = e.currentTarget.dataset.rid
    wx.navigateTo({
      url: '/pages/product/product?rid=' + rid + "&storeRid=" + e.currentTarget.dataset.storeRid
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

  // 去别人的主页
  handleToPeople(e) {
    let uid = e.currentTarget.dataset.uid
    wx.navigateTo({
      url: '../people/people?uid=' + uid
    })
  },

  /**
   * 获取生活馆商品列表
   */
  getStoreProducts() {

    http.fxGet(api.life_store_products, this.data.params, (res) => {
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
          isNext: res.data.next, // 没有下一页了
          isLoadProductShow: false
        })
      } else {
        utils.fxShowToast(res.status.message)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    this.setData({
      'params.sid': options.sid,
      'lifeStore.logo': options.avatar,
      sid: options.sid
    })
    this.getStoreProducts()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let that = this
    setTimeout(() => {
      that.setData({
        isLoading: false
      })
    }, 500)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 验证生活馆是不是自己的
    const lifeStore = wx.getStorageSync('lifeStore')
    // 判断登录用户是否有生活馆
    if (lifeStore.isSmallB) {
      if (this.data.sid == lifeStore.lifeStoreRid) {
        const userInfo = wx.getStorageSync('userInfo')
        this.setData({
          canAdmin: true
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (!this.data.isNext) {
      return
    }

    this.setData({
      ['params.page']: this.data.params.page + 1,
      isLoadProductShow: true
    })

    this.getStoreProducts()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(e) {
    // 分享平台或生活馆
    if (e.from == 'menu') {
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

    // 分享产品 shareProduct
    if (e.target.dataset.from == 2) {
      let title = this.data.shareProduct.name
      return app.shareWxaProduct(this.data.shareProduct.rid, title, this.data.shareProduct.cover)
    }
  }
})