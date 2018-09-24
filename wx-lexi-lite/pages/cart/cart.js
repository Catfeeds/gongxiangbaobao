// pages/cart/cart.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLoadPageShow:true, // 加载的三个点
    is_mobile: false, // 登陆呼出框
    carQuantity: 0, // 购物车的数量问题
    desireOrderProductRid:'', // 移除心愿单的rid
    skus: {
      modes: [],
      colors: []
    },
    choosed: {},
    choosedSkuText: '',
    activeModeIdx: 0,
    activeColorIdx: 0,
    hasMode: false,
    hasColor: false,
    chooseMode: {},
    chooseColor: {},
    quantity: 1,
    cartTotalCount: 0,

    productInfomation: [], // 获取商品的详情，用来获取商品的规格和颜色，用来挑选
    pickBox: false, // 选择的呼出框
    addDesireOrder: [], // 要加入心愿单的rid---
    falseheckbox: false, // falseheckbox---
    checkboxPick: [], // 选中的物品---
    changeCart: false, // 购物车是否编辑---
    isShowOrder: true, // 心愿单是否可见
    shoppingCart: {  // 添加到购物车的内容产品内容---
      items: []
    },
    payment: 0, // 应该支付的总金额---

    // 添加购物车和修改购买数量的时候参数
    addCartParams: {
      rid: '', //	商品Id
      quantity: 1, // 1	购买数量
      option: '', // 其他选项
      open_id: '', //	独立小程序openid
    },
    
    thinkOrder: {  // 心愿单的内容---
      products: []
    },
  },

  // 是否登陆
  getIsLogin() {
    if (!app.globalData.isLogin) {
      this.setData({
        is_mobile: true
      })
      return
    }
  },

  // 是否获取物品与用户之间的关系
  handleIsGetProductAtRelation() {
    if (!app.globalData.isBind) {
      return
    }
  },

  // 获取购物车 ---
  getCartProduct() {
    let jwt = wx.getStorageSync('jwt')
    http.fxGet(api.cart, { open_id: jwt.openid }, (result) => {
      console.log(result, '获取购物车')
      if (result.success) {
        this.updateCartTotalCount(result.data.item_count)

        result.data.items.forEach((v, i) => {
          v.product.product_name = v.product.product_name && v.product.product_name.length > 21 ? v.product.product_name.substr(0, 16) + ' ...' : v.product.product_name
        })

        if (result.data.items.length == 0){
          this.setData({
            changeCart: false
          })
          // 更新全局购物车数量
          app.updateCartTotalCount(result.data.item_count)
        }

        this.setData({
          shoppingCart: result.data
        }, () => {
          this.paymentPrice() // 计算金额
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取心愿单---
  getDesireOrder() {
    http.fxGet(api.wishlist, {}, (result) => {
      console.log(result, '获取心愿单')
      if (result.success) {
        this.setData({
          thinkOrder: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 心愿单添加到购物车
  addCartTap(e) {
    wx.hideTabBar()

    console.log(e.currentTarget.dataset.rid)

    this.setData({
      desireOrderProductRid: e.currentTarget.dataset.rid,
      productInfomation:[]
    })
    let select = e.currentTarget.dataset.rid
    this.getProductInfomation(select)
    this.getSkus(select)
    
    this.setData({
      pickBox: true
    })
  },

  // 编辑按钮点击后左边的选择,赋值给data---
  checkboxChange(e) {
    console.log(e.detail.value)
    this.setData({
      checkboxPick: e.detail.value
    })

    // 加入心愿单
    let pickProduct = this.data.shoppingCart.items.filter((v, i) => {
      return this.data.checkboxPick.indexOf(v.product.rid) != -1
    })
    console.log(pickProduct)
    if (pickProduct.length == 0) {
      return
    }

    this.setData({
      addDesireOrder: pickProduct
    })
  },

  // 当点击移除---
  clearCart() {
    if (this.data.checkboxPick.length==0){
      utils.fxShowToast('请选择')
      return
    }
    let jwt = wx.getStorageSync('jwt')

    http.fxPost(api.clearCart, {
      open_id: jwt.openid,
      rids: this.data.checkboxPick
    }, (result) => {
      console.log(result, '删除购物车商品')
      if (result.success) {
        this.getCartProduct()
        if (this.data.thinkOrder.products.length != 0 && this.data.shoppingCart.items.length!=0){
          this.setData({
            isShowOrder:true
          })
        }
      } else {
        utils.fxShowToast(result.status.message)
      }
    })

    // 重新计算
    this.paymentPrice()
  },

  // 放入心愿单--
  addDesire() {
    if (this.data.checkboxPick.length == 0) {
      utils.fxShowToast('请选择')
      return
    }
    
    console.log(this.data.addDesireOrder)
    let rid = this.data.addDesireOrder.map((v, i) => {
      console.log(v)
      return v.product.product_rid
    })
    console.log(rid)
    http.fxPost(api.wishlist, {
      rids: rid
    }, (result) => {
      console.log(result)
      if (result.success) {
        this.getDesireOrder()
        // this.getCartProduct()
        this.clearCart()
        this.paymentPrice()

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 点击移除按钮和放入心愿单按钮---
  cartClearTap(e) {
    let cartAllInfo = []
    let btnType = e.currentTarget.dataset.type

    if (btnType == 'clear') {
      this.clearCart()
    } else if (btnType == 'addThink') {
      this.addDesire()
    }
  },

  // 编辑按钮购物车---
  changeCartTap(e) {
    let status = e.currentTarget.dataset.change
    console.log(e.currentTarget.dataset.change)
    if (status == 'start') {
      this.setData({
        changeCart: true,
        isShowOrder:false
      })
    } else if (status == 'over') {
      this.setData({
        changeCart: false,
        isShowOrder:true
      })
    }
  },

  // 应该支付的总金额shoppingCart---
  paymentPrice() {
    let aggregatePrice = 0
    let quantity = 0

    this.data.shoppingCart.items.forEach((v, i) => {
      quantity = v.quantity - 0 + quantity
      let sellPrice = v.product.sale_price == 0 ? v.product.price : v.product.sale_price
      aggregatePrice = (aggregatePrice*1000 + sellPrice * v.quantity*1000)/1000
    })

    this.setData({
      carQuantity: quantity,
      payment: aggregatePrice.toFixed(2)
    })

    // 更新数量
    app.updateCartTotalCount(quantity)
    
  },

  // 增加数量或者减少数量---
  changeQuantity(e) {
    console.log(e.currentTarget.dataset)
    let is_function = e.currentTarget.dataset.function
    let index = e.currentTarget.dataset.index

    let rid = e.currentTarget.dataset.rid
    let jwt = wx.getStorageSync('jwt')
    this.setData({
      ['addCartParams.rid']: rid,
      ['addCartParams.open_id']: jwt.openid,
    })

    if (is_function == 'add') {
      if (this.data.shoppingCart.items[index].quantity - 0 + 1 > this.data.shoppingCart.items[index].product.stock_quantity) {
        utils.fxShowToast('仓库中数量不足')
        return false
      } else {
        this.setData({
          ['addCartParams.quantity']: this.data.shoppingCart.items[index].quantity - 0 + 1,
        })
        this.putRenovateCart()
        this.setData({
          ['shoppingCart.items[' + index + '].quantity']: this.data.shoppingCart.items[index].quantity - 0 + 1
        })
      }
    } else if (is_function == 'subtract') {
      if (this.data.shoppingCart.items[index].quantity - 1 < 1) {
        utils.fxShowToast('数量不能少于1')
        return false
      } else {
        this.setData({
          ['addCartParams.quantity']: this.data.shoppingCart.items[index].quantity - 1,
        })
        this.putRenovateCart()
        this.setData({
          ['shoppingCart.items[' + index + '].quantity']: this.data.shoppingCart.items[index].quantity - 1
        })
      }
    }

    this.paymentPrice() // 计算金额
  },

  // 更新购物车---
  putRenovateCart(e) {
    http.fxPut(api.cart, this.data.addCartParams, (result) => {
      if (!result.success) {
        utils.fxShowToast('添加失败')
        return
      }
    })
  },

  /** start 后续抽离**/

  /**
   * 获取sku数量
   */
  getSkus(rid) {
    let params = {
      rid: rid
    }
    http.fxGet(api.product_skus, params, (result) => {
      console.log(result.data, 'skus信息')
      if (result.success) {
        this.setData({
          skus: result.data
        })
        this.initialShowSku()
      }
    })
  },

  // 获取商品详情
  getProductInfomation(e) {
    http.fxGet(api.product_detail.replace(/:rid/g, e), {}, (result) => {
      console.log(result, '购物车-商品详情')
      if (result.success) {
        this.setData({
          productInfomation: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
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
      for (let i = 0; i < this.data.skus.items.length; i++) {
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
  getColorIndex(name) {
    for (let k = 0; k < this.data.skus.colors.length; k++) {
      if (this.data.skus.colors[k].name == name) {
        return k
      }
    }
  },

  /**
   * 获取激活型号索引
   */
  getModeIndex(name) {
    for (let k = 0; k < this.data.skus.modes.length; k++) {
      if (this.data.skus.modes[k].name == name) {
        return k
      }
    }
  },

  /**
   * 验证是否有库存
   */
  renewStockStatus() {
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
  choosedSku() {
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

  hasExistItem(mode, color) {
    for (const item of this.data.skus.items) {
      if (item.s_model === mode && item.s_color === color && item.stock_count > 0) {
        return true
      }
    }
    return false
  },

  handleChooseMode(e) {
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

  /**
   * 选择颜色
   */
  handleChooseColor(e) {
    console.log(e)
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
  updateCartTotalCount(item_count) {
    app.globalData.cartTotalCount = item_count
    this.setData({
      cartTotalCount: item_count
    })
  },

  /**
   * 验证是否选择sku
   */
  validateChooseSku() {
    if (!this.data.choosed) {
      return false
    }
    if (!this.data.quantity) {
      return false
    }
    return true
  },

  // 移除心愿单
  handleDeleteDesireOrder(e){
    http.fxDelete(api.wishlist, {
      rids: [e]
    }, (result) => {
      console.log(result)
      if (result.success) {
        utils.fxShowToast('成功', "success")
        this.getDesireOrder()
      } else {
        utils.fxShowToast(result.status.message)
      }
    })

  },

  /**
   * 加入购物车
   */
  handleAddCart(e) {
    let jtw = wx.getStorageSync('jwt')
    if (this.validateChooseSku()) {
      this.setOrderParamsProductId(this.data.choosed.rid) // 设置订单的商品id,sku---
      let cartParams = {
        rid: this.data.choosed.rid, // String	必填	 商品sku
        quantity: this.data.quantity, // Integer	可选	1	购买数量
        option: '', // String	可选	 	其他选项
        open_id: jtw.openid // String	独立小程序端必填/openid
      }

      http.fxPost(api.cart_addon, cartParams, (result) => {
        if (result.success) {
          // 隐藏弹出层
          this.hideSkuModal()

          // 获取购物车 ---
          this.getCartProduct()

          // 更新数量
          this.updateCartTotalCount(result.data.item_count)

          // 心愿单产品放入购物车后，在心愿单删除产品
          this.handleDeleteDesireOrder(this.data.desireOrderProductRid)

          this.setData({
            skus: {
              modes: [],
              colors: []
            },
            choosed:{},
            productInfomation: [],
          })
        }
      })
    }
  },

  /**
   * 直接购买
   */
  handleQuickBuy(e) {
    if (this.validateChooseSku()) {
      this.setOrderParamsProductId(this.data.choosed.rid) // 设置订单的商品id,sku---

      http.fxGet(api.by_store_sku, { rids: this.data.choosed.rid }, (result) => {
        if (result.success) {
          Object.keys(result.data).forEach((key) => {
            console.log(result.data[key]) // 每个店铺
            result.data[key].forEach((v, i) => { //每个sku
              // 当前店铺的rid
              v.current_store_rid = app.globalData.storeInfo.rid
              // 是否为分销商品
              if (v.store_rid != app.globalData.storeInfo.rid) {
                v.is_distribute = 1
              } else {
                v.is_distribute = 0
              }
              // 需求数量
              v.quantity = 1
            })
          })

          app.globalData.orderSkus = result
          // 设置当前商品的物流模板
          wx.setStorageSync('logisticsIdFid', this.data.productInfomation.fid)

          this.setData({
            skus: {
              modes: [],
              colors: []
            },
            choosed:{},
            productInfomation: [],
          })
          // 心愿单产品放入购物车后，在心愿单删除产品
          this.handleDeleteDesireOrder(this.data.desireOrderProductRid)

          wx.navigateTo({
            url: './../receiveAddress/receiveAddress?from_ref=cart&&rid=' + this.data.choosed.rid,
          })
        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    }
  },

  // 设置订单参数的 商品的rid store_items.itemsrid = 
  setOrderParamsProductId(e) {
    app.globalData.orderParams.store_items[0].items[0].rid = e
  },
  /** end 后续抽离 **/

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
    this.setData({
      cartTotalCount: app.globalData.cartTotalCount
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.setData({
      isLoadPageShow: false
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

    // 未登录
    if (!app.globalData.isLogin) {
      return
    }

    // 已登录
    this.getDesireOrder() // 获取心愿单
    this.getCartProduct() // 获取购物车商品
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
  onShareAppMessage: function() {
    return app.shareLeXi()
  },

  // 去首页
  indexTap() {
    wx.switchTab({
      url: '../index/index',
    })
  },

  // 提示信息
  warn(title, content) {
    wx.showModal({
      title: title,
      content: content,
    })
  },

  // 跳转结算
  chekoutTap() {
    let shopProduct = []
    let skus = []
    let skusNeedQuantity = []

    this.data.shoppingCart.items.forEach((v, i) => {
      skusNeedQuantity.push(v.product.rid + ":" + v.quantity) // 每个sku需求数量
      skus.push(v.product.rid)
    })

    http.fxGet(api.by_store_sku, {
      rids: skus.join(',')
    }, (result) => {
      console.log(result, '购物车-去结算')
      if (result.success) {
        let deliveryCountries = [] // 发货的国家列表

        // 添加每件sku的需求数量
        Object.keys(result.data).forEach((key) => {

          result.data[key].forEach((v, i) => { // 每个sku

            // 收集所有发货国家或地区，验证是否跨境
            if (deliveryCountries.indexOf(v.delivery_country_id) === -1) {
              deliveryCountries.push(v.delivery_country_id)
            }

            // 当前店铺的rid
            v.current_store_rid = app.globalData.storeRid

            // 是否为分销商品
            if (v.store_rid != app.globalData.storeRid) {
              v.is_distribute = 1
            } else {
              v.is_distribute = 0
            }
            
            // 需求数量
            skusNeedQuantity.forEach((item, n) => {
              let newArray = item.split(':')
              if (v.rid == newArray[0]) {
                v.quantity = newArray[1]
              }
            })
          })
        })

        app.globalData.orderSkus = result
        app.globalData.deliveryCountries = deliveryCountries

        console.log(app.globalData.orderSkus, '结算SKU')
        console.log(app.globalData.deliveryCountries, '发货国家s')

        wx.navigateTo({
          url: '../receiveAddress/receiveAddress?from_ref=cart',
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 关闭选择呼出框
  handlePickBoxOffTap() {
    wx.showTabBar()

    this.setData({
      skus: {
        modes: [],
        colors: []
      },
      choosed: {},
      productInfomation: [],
      pickBox: false
    })
  },

  // 隐藏弹出层
  hideSkuModal() {
    wx.showTabBar()

    this.setData({
      skus: {
        modes: [],
        colors: []
      },
      choosed:{},
      productInfomation:[],
      pickBox: false
    })
  },

  // 点击sku层，不触发隐藏
  handleSkuModal() {
    console.log(123)
    return 
  },

  // 关闭
  hanleOffLoginBox(e) {
    this.setData({
      is_mobile: false
    })
  }

})