// pages/product.js
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')

//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    rid: '',
    product: {},
    productContent: {},
    skus: {
      modes: [],
      colors: []
    },
    posterImage: '',
    posterSaving: false,
    posterBtnText: '保存图片',
    favorited: false,
    choosed: {},
    choosedSkuText: '',
    cartTotalCount: 0,
    activeModeIdx: 0,
    activeColorIdx: 0,
    hasMode: false,
    hasColor: false,
    chooseMode: {},
    chooseColor: {},
    quantity: 1,
    buyWay: '',
    hasBuyWay: false,
    seeSkuModal: false,
    swiperCurrent: 1,
    productImageCount: 0,
    seePosterModal: false,
    indicatorDots: false,
    autoplay: false,
    interval: 5000,
    duration: 1000
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    // scene格式：rid + '#' + customer_rid
    let scene = decodeURIComponent(options.scene)
    let rid = ''
    if (scene && scene != 'undefined') {
      let scene_ary = scene.split('#')
      rid = scene_ary[0]
      // 分销商ID
      if (scene_ary.length == 2) {
        let customer_rid = scene_ary[1]
        wx.setStorageSync('customer_rid', customer_rid)
      }
    } else {
      rid = options.rid
    }

    this.setData({
      rid: rid,
      cartTotalCount: app.globalData.cartTotalCount
    })
    
    this.getProduct()
    this.getSkus()
    this.getProductContent()
  },

  // 初始化sku
  initialShowSku() {
    let hasMode = this.data.skus.modes.length > 0 ? true : false
    let hasColor = this.data.skus.colors.length > 0 ? true : false
    let choosed = {}
    let chooseMode = {}
    let chooseColor = {}
    let activeColorIdx = 0
    let activeModeIdx = 0
    
    // 默认选中一个，有库存的
    if (hasMode) {
      for (let i = 0; i < this.data.skus.items.length; i++) {
        if (this.data.skus.items[i].stock_count > 0) {
          choosed = this.data.skus.items[i]
          activeModeIdx = this.getModeIndex(this.data.skus.items[i].s_model)
          chooseMode = this.data.skus.modes[activeModeIdx]
          break
        }
      }
    }

    if (hasColor) {
      for (let i=0; i<this.data.skus.items.length; i++) {
        if (this.data.skus.items[i].stock_count > 0) {
          choosed = this.data.skus.items[i]
          activeColorIdx = this.getColorIndex(this.data.skus.items[i].s_color)
          chooseColor = this.data.skus.colors[activeColorIdx]
          break
        }
      }
    }

    // 同时存在时，color获取实际存在的一个
    if (hasMode && hasColor) {
      for (let i = 0; i < this.data.skus.items.length; i++) {
        if (this.data.skus.items[i].stock_count > 0) {
          choosed = this.data.skus.items[i]
          activeModeIdx = this.getModeIndex(this.data.skus.items[i].s_model)
          activeColorIdx = this.getColorIndex(this.data.skus.items[i].s_color)
          chooseMode = this.data.skus.modes[activeModeIdx]
          chooseColor = this.data.skus.colors[activeColorIdx]
          break
        }
      }
    }

    this.setData({
      hasMode: hasMode,
      hasColor: hasColor,
      choosed: choosed,
      chooseMode: chooseMode,
      chooseColor: chooseColor,
      activeModeIdx: activeModeIdx,
      activeColorIdx: activeColorIdx,
    });

    this.renewStockStatus()

    this.choosedSku()
  },

  /**
   * 获取激活颜色索引
   */
  getColorIndex (name) {
    for (let k=0; k<this.data.skus.colors.length; k++) {
      if (this.data.skus.colors[k].name == name) {
        return k
      }
    }
  },

  /**
   * 获取激活型号索引
   */
  getModeIndex (name) {
    for (let k = 0; k < this.data.skus.modes.length; k++) {
      if (this.data.skus.modes[k].name == name) {
        return k
      }
    }
  },

  /**
   * 验证是否有库存
   */
  renewStockStatus () {
    // 仅型号选项
    if (this.data.hasMode && !this.data.hasColor) {
      let tmpModes = []
      for (const mode of this.data.skus.modes) {
        for (const item of this.data.skus.items) {
          if (item.s_model == mode.name && item.stock_count <= 0) {
            mode.valid = false
          }
        }
        tmpModes.push(mode)
      }

      this.setData({
        'skus.modes': tmpModes
      })
    }

    // 仅颜色选项
    if (this.data.hasColor && !this.data.hasMode) {
      let tmpColors = []
      for (const color of this.data.skus.colors) {
        for (const item of this.data.skus.items) {
          if (item.s_color == color.name && item.stock_count <= 0) {
            color.valid = false
          }
        }
        tmpColors.push(color)
      }
      this.setData({
        'skus.colors': tmpColors
      })
    }

    // 型号、颜色同时存在
    if (this.data.hasMode && this.data.hasColor) {
      let chooseMode = this.data.chooseMode
      let filter_colors = []
      for (const c of this.data.skus.colors) {
        if (!this.hasExistItem(chooseMode.name, c.name)) {
          c.valid = false
        } else {
          c.valid = true
        }
        filter_colors.push(c)
      }

      let chooseColor = this.data.chooseColor
      let filter_modes = []
      for (const m of this.data.skus.modes) {
        if (!this.hasExistItem(m.name, chooseColor.name)) {
          m.valid = false
        } else {
          m.valid = true
        }
        filter_modes.push(m)
      }

      this.setData({
        'skus.modes': filter_modes,
        'skus.colors': filter_colors
      })
    }

  },

  /**
   * 选中sku信息
   */
  choosedSku () {
    if (this.data.choosed) {
      let sku_txt = [];
      if (this.data.choosed.s_model) {
        sku_txt.push(this.data.choosed.s_model)
      }
      if (this.data.choosed.s_color) {
        sku_txt.push(this.data.choosed.s_color)
      }

      this.setData({
        choosedSkuText: sku_txt.join(' ') + '，' + this.data.quantity + '个'
      })
    }
  },

  // 显示弹出层
  showSkuModal (e) {
    let t = e.currentTarget.dataset.type || '';
    let hasBuyWay = false
    if (t == 'cart' || t == 'buy') {
      hasBuyWay = true
    }
    this.setData({
      seeSkuModal: true,
      buyWay: t,
      hasBuyWay: hasBuyWay
    })
  },

  /**
   * 添加收藏
   */
  handleFavorite (e) {
    const that = this
    let params = {
      rid: this.data.rid
    }
    http.fxPost(api.wishlist_addto, params, function (res) {
      if (res.success) {
        wx.showToast({
          title: '收藏成功',
          icon: 'success',
          duration: 2000
        })
        that.setData({
          favorited: true
        })
      }
    })
  },

  // 隐藏弹出层
  hideSkuModal () {
    this.setData({
      seeSkuModal: false
    })
  },

  //购物车
  handleCartTap () {
    wx.switchTab({
      url: '../cart/cart'
    })
  },
  
  hasExistItem (mode, color) {
    for (const item of this.data.skus.items) {
      if (item.s_model === mode && item.s_color === color && item.stock_count > 0) {
        return true
      }
    }
    return false
  },

  handleChooseMode (e) {
    const that = this;
    const idx = e.currentTarget.dataset.idx;
    const valid = e.currentTarget.dataset.valid;
    if (!valid) return;

    let activeModeIdx = idx;
    let chooseMode = this.data.skus.modes[idx];
    // 重新筛选与型号匹配的颜色
    let filter_colors = []
    for (const c of this.data.skus.colors) {
      if (!this.hasExistItem(chooseMode.name, c.name)) {
        c.valid = false
      } else {
        c.valid = true
      }
      filter_colors.push(c)
    }

    let choosed = {};
    for (const item of this.data.skus.items) {
      if (item.s_model == chooseMode.name) {
        if (that.data.hasColor) {
          if (item.s_color == that.data.chooseColor.name) {
            choosed = item
          }
        } else {
          choosed = item
        }
      }
    }

    this.setData({
      choosed: choosed,
      chooseMode: chooseMode,
      activeModeIdx: activeModeIdx,
      'skus.colors': filter_colors
    });

    this.choosedSku()
  },

  handleChooseColor (e) {
    const idx = e.currentTarget.dataset.idx;
    const valid = e.currentTarget.dataset.valid;
    if (!valid) return;

    let activeColorIdx = idx;
    let chooseColor = this.data.skus.colors[idx];

    // 重新筛选与颜色匹配的型号
    let filter_modes = [];
    for (const m of this.data.skus.modes) {
      if (!this.hasExistItem(m.name, chooseColor.name)) {
        m.valid = false
      } else {
        m.valid = true
      }
      filter_modes.push(m)
    }
    let choosed = {};
    for (const item of this.data.skus.items) {
      if (item.s_color == chooseColor.name) {
        if (this.data.hasMode) {
          if (item.s_model == this.data.chooseMode.name) {
            choosed = item
          }
        } else {
          choosed = item
        }
      }
    }

    this.setData({
      choosed: choosed,
      chooseColor: chooseColor,
      activeColorIdx: activeColorIdx,
      'skus.modes': filter_modes
    });

    this.choosedSku()
  },

  /**
   * 更新购物车数量
   */
  updateCartTotalCount (item_count) {
    app.globalData.cartTotalCount = item_count
    this.setData({
      cartTotalCount: item_count
    })
  },

  /**
   * 更新数量
   */
  handleChangeQuantity (e) {
    this.setData({
      quantity: e.detail.value
    })
    // 更新
    this.choosedSku()
  },

  handleAddCart: function (e) {
    if (this.validateChooseSku()) {
      const that = this;
      http.fxPost(api.cart_addon, {
        rid: this.data.choosed.rid, quantity: this.data.quantity, option: ''
      }, (result) => {
        if (result.success) {
          // 隐藏弹出层
          that.hideSkuModal()

          // 更新数量
          that.updateCartTotalCount(result.data.item_count)
        }
      })
    }
  },

  /**
   * 直接购买
   */
  handleQuickBuy (e) {
    if (this.validateChooseSku()) {
      app.globalData.checkedBuyItems = [{
        rid: this.data.choosed.rid,
        quantity: this.data.quantity,
        option: '',
        checked: true,
        product: this.data.choosed
      }]

      wx.navigateTo({
        url: './../checkout/checkout',
      })
    }
  },

  /**
   * 验证是否选择sku
   */
  validateChooseSku () {
    if (!this.data.choosed) {
      return false
    }
    if (!this.data.quantity) {
      return false
    }
    return true
  },

  /**
   * 商品详细信息
   */
  getProduct() {
    const that = this
    const params = {}
    http.fxGet(api.product_detail.replace(/:rid/g, this.data.rid), params, (result) => {
      wx.hideToast();
      if (result.success) {
        that.setData({
          product: result.data
        })

        wx.setNavigationBarTitle({
          title: that.data.product.name
        })
      }
    })
  },

  /**
   * 获取商品图文介绍
   */
  getProductContent () {
    let that = this
    http.fxGet(api.product_content.replace(/:rid/g, this.data.rid), {}, (res) => {
      if (res.success) {
        that.setData({
          productContent: res.data,
          productImageCount: res.data.images.length
        })
      }
    })
  },

  /**
   * 获取sku数量
   */
  getSkus() {
    const that = this
    const params = {
      rid: this.data.rid
    }
    http.fxGet(api.product_skus, params, (result) => {
      if (result.success) {
        that.setData({
          skus: result.data
        })
        that.initialShowSku()
      }
    })
  },

  /**
   * 滑块变化
   */
  handleSwiperChange: function (e) {
    this.setData({
      swiperCurrent: e.detail.current + 1
    })
  },
  
  /**
   * 生成推广海报
   */
  handleGenPoster(e) {
    let that = this

    this.setData({
      seePosterModal: true
    })

    let rid = e.currentTarget.dataset.rid
    // 添加自定义扩展信息
    let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}

    let params = {
      rid: rid,
      path: 'pages/product/product',
      auth_app_id: extConfig.authAppid
    }

    http.fxPost(api.wxacode, params, (res) => {
      if (res.success) {
        that.setData({
          posterImage: res.data.wxa_image
        })
      }
    })
  },

  /**
   * 保存海报至本地
   */
  handleSavePoster() {
    let that = this

    if (this.data.posterImage && !this.data.posterSaving) {
      this.setData({
        posterSaving: true,
        posterBtnText: '正在保存...'
      })
      // 下载网络文件至本地
      wx.downloadFile({
        url: this.data.posterImage,
        success: function (res) {
          if (res.statusCode === 200) {
            // 保存文件至相册
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success(res) {
                wx.showToast({
                  title: '图片保存成功',
                })
                that.setData({
                  posterSaving: false,
                  posterBtnText: '保存图片',
                  seePosterModal: false
                })
              },
              fail(res) {
                console.log(res)
                that.setData({
                  posterSaving: false,
                  posterBtnText: '保存图片'
                })
              }
            })
          }
        }
      })
    } else {
      wx.showToast({
        title: '图片正在生成中',
        icon: 'loading',
        duration: 2000
      })
    }
  },

  /**
   * 隐藏生成海报框
   */
  hidePosterModal() {
    this.setData({
      seePosterModal: false
    })
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