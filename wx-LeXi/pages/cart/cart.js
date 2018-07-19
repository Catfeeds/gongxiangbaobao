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
    skuPrice: '', //sku价格
    needSpecifications: [], // 需要的规格---
    needColor: [], //需要的颜色---
    pickColor: [], // 所有的颜色---
    pickSpecifications: [], // 所有的规格---
    productInfomation: [], // 获取商品的详情，用来获取商品的规格和颜色，，用来挑选
    pickBox: false, //选择的呼出框
    addDesireOrder: [], // 要加入心愿单的rid---
    falseheckbox: false, //falseheckbox---
    checkboxPick: [], //选中的物品---
    changeCart: false, //购物车是否编辑---
    shoppingCart: [{}], //添加到购物车的内容产品内容---
    payment: 0, //应该支付的总金额---
    //添加购物车和修改购买数量的时候参数
    addCartParams: {
      rid: '', //	商品Id
      quantity: 1, // 1	购买数量
      option: '', // 其他选项
      open_id: '', //	独立小程序openid
    },

    thinkOrder: [{}], // 心愿单的内容---

  },
  // 获取购物车 ---
  getCartProduct() {
    http.fxGet(api.cart, {
      open_id: wx.getStorageSync('jwt').openid
    }, (result) => {
      console.log(result)
      if (result.success) {
        this.setData({
          shoppingCart: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  //  获取心愿单---
  getDesireOrder() {
    http.fxGet(api.wishlist, {}, (result) => {
      if (result.success) {
        console.log(result)
        this.setData({
          thinkOrder: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }

    })
  },
  //心愿单添加到购物车
  addCartTap(e) {
    console.log(e.currentTarget.dataset.rid)
    var select = e.currentTarget.dataset.rid
    this.getProductInfomation(select)
    this.setData({
      pickBox: true,
      skuPrice: ''
    })
  },

  //编辑按钮点击后左边的选择,赋值给data---
  checkboxChange(e) {
    console.log(e.detail.value)
    this.setData({
      checkboxPick: e.detail.value
    })
    //加入心愿单
    var pickProduct = this.data.shoppingCart.items.filter((v, i) => {
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

  //当点击移除---
  clearCart() {
    http.fxPost(api.clearCart, {
      open_id: wx.getStorageSync("jwt").openid,
      rids: this.data.checkboxPick
    }, (result) => {
      if (result.success) {
        console.log(result)
        this.getCartProduct()
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
    //重新计算
    this.paymentPrice()
  },
  // 放入心愿单--
  addDesire() {
    console.log(this.data.addDesireOrder)
    var rid = this.data.addDesireOrder.map((v, i) => {
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
        this.getCartProduct()
        this.paymentPrice()
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  //购物车点击移除按钮和放入心愿单按钮---
  cartClearTap(e) {
    var cartAllInfo = []
    var btnType = e.currentTarget.dataset.type
    if (btnType == "clear") {
      this.clearCart()
    } else if (btnType == "addThink") {
      this.addDesire()

    }
  },
  //编辑按钮购物车---
  changeCartTap(e) {
    var status = e.currentTarget.dataset.change
    console.log(e.currentTarget.dataset.change)
    if (status == "start") {
      this.setData({
        changeCart: true
      })
    } else if (status == "over") {
      this.setData({
        changeCart: false
      })
    }
  },
  // 应该支付的总金额shoppingCart---
  paymentPrice() {
    this.setData({
      payment: 0
    })
    console.log(this.data.shoppingCart.items)
    this.data.shoppingCart.items.map((value, index) => {
      this.setData({
        payment: ((this.data.payment * 1000 + value.product.sale_price * value.quantity * 1000) / 1000).toFixed(2)
      })
    })
  },

  //增加数量或者减少数量---
  changeQuantity(e) {
    console.log(e.currentTarget.dataset)
    var is_function = e.currentTarget.dataset.function
    var index = e.currentTarget.dataset.index
    var openid = wx.getStorageSync('jwt').openid
    var rid = e.currentTarget.dataset.rid
    this.setData({
      ['addCartParams.rid']: rid,
      ['addCartParams.open_id']: openid,
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
  },
  //更新购物车---
  putRenovateCart(e) {
    http.fxPut(api.cart, this.data.addCartParams, (result) => {
      console.log(result)
      if (result.success) {} else {
        utils.fxShowToast('添加失败')
        return
      }
    })
  },
  /** start 后续抽离**/
  // 查找sku的价格
  getSkuPrice() {
    var sku = this.data.needSpecifications + " " + this.data.needColor
    console.log(sku, this.data.productInfomation)
    this.data.productInfomation.skus.forEach((v, i) => {
      if (v.mode == sku) {
        this.setData({
          skuPrice: v.price
        })
        console.log(this.data.skuPrice)
      }
    })
  },
  // 获取商品详情
  getProductInfomation(e) {
    http.fxGet(api.product_detail.replace(/:rid/g, e), {}, (result) => {
      if (result.success) {
        console.log(result)
        this.setData({
          productInfomation: result.data
        })
        this.filterSpecifications()
        this.filterColor()
        wx.setStorageSync('logisticsIdFid', result.data.fid)
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  //过滤产品的型号
  filterSpecifications() {
    var newColor = []
    var colorTwo = []
    this.data.productInfomation.skus.forEach((v, i) => {
      if (newColor.indexOf(v.s_model) == -1) {
        newColor.push(v.s_model)
      }
    })
    newColor.forEach((v, i) => {
      colorTwo.push({
        name: v,
        disabled: true,
        is_bg: false
      })
    })
    this.setData({
      pickSpecifications: colorTwo
    })
  },
  // 过滤产品的颜色去重
  filterColor() {
    var newColor = []
    var colorTwo = []
    this.data.productInfomation.skus.forEach((v, i) => {
      if (newColor.indexOf(v.s_color) == -1) {
        newColor.push(v.s_color)
      }
    })
    newColor.forEach((v, i) => {
      colorTwo.push({
        name: v,
        disabled: true,
        is_bg: false
      })
    })
    this.setData({
      pickColor: colorTwo
    })
  },
  // 点击颜色按钮
  handlePickColor(e) {
    var newData = []
    var haveProduct = []
    var havespecifications = []
    if (!e.currentTarget.dataset.ispick) {
      wx.showToast({
        title: '亲！此商品库存不足',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    //改变按钮颜色
    this.data.pickColor.forEach((v, i) => {
      this.setData({
        ['pickColor[' + i + '].is_bg']: false
      })
      if (e.currentTarget.dataset.icon == v.name) {
        this.setData({
          ['pickColor[' + i + '].is_bg']: true,
          needColor: v.name
        })
      }
    })
    // 拼接规格
    this.data.pickSpecifications.forEach((v, i) => {
      newData.push(v.name + " " + e.currentTarget.dataset.colorname)
    })
    // 把拼接的规格和后台发过来的数据做比较
    newData.forEach((v, i) => {
      this.data.productInfomation.skus.forEach((e, index) => {
        if (e.mode == v) {
          haveProduct.push(v)
        }
      })
    })
    // 把找到的规格记录下来
    haveProduct.forEach((v, i) => {
      var newstring = v.split(' ')[0]
      havespecifications.push(newstring)
    })
    //去改变按钮颜色
    this.data.pickSpecifications.forEach((v, i) => {
      if (havespecifications.indexOf(v.name) == -1) {
        this.setData({
          ["pickSpecifications[" + i + "].disabled"]: false
        })
      } else {
        this.setData({
          ["pickSpecifications[" + i + "].disabled"]: true
        })
      }
    })
    this.getSkuPrice()
  },
  //点击规格按钮
  handleSpecificationsTap(e) {
    var newData = []
    var haveProduct = []
    var havespecifications = []
    if (!e.currentTarget.dataset.ispick) {
      wx.showToast({
        title: '亲！此商品库存不足',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    //改变按钮颜色
    this.data.pickSpecifications.forEach((v, i) => {
      this.setData({
        ['pickSpecifications[' + i + '].is_bg']: false
      })
      if (e.currentTarget.dataset.icon == v.name) {
        this.setData({
          ['pickSpecifications[' + i + '].is_bg']: true,
          needSpecifications: v.name
        })
      }
    })
    // 拼接颜色
    this.data.pickColor.forEach((v, i) => {
      newData.push(e.currentTarget.dataset.specificationsname + ' ' + v.name)
    })
    // 把拼接的颜色和后台发过来的数据做比较
    newData.forEach((v, i) => {
      this.data.productInfomation.skus.forEach((e, index) => {
        if (e.mode == v) {
          haveProduct.push(v)
        }
      })
    })
    // 把找到的颜色记录下来
    haveProduct.forEach((v, i) => {
      var newstring = v.split(' ')[1]
      havespecifications.push(newstring)
    })
    //去改变按钮颜色
    this.data.pickColor.forEach((v, i) => {
      if (havespecifications.indexOf(v.name) == -1) {
        this.setData({
          ["pickColor[" + i + "].disabled"]: false
        })
      } else {
        this.setData({
          ["pickColor[" + i + "].disabled"]: true
        })
      }
    })
    this.getSkuPrice()
  },
  // 选好了按钮
  receiveOrderTap() {
    var rid
    if (this.data.needSpecifications == '' || this.data.needColor == '') {
      wx.showToast({
        title: '选择不完整',
        icon: 'none',
        duration: 1500
      })
      return
    }
    this.data.productInfomation.skus.forEach((v, i) => {
      if (v.mode == this.data.needSpecifications + ' ' + this.data.needColor) {
        rid = v.rid
        this.setOrderParamsProductId(v.rid) // 设置订单的商品id---
      }
    })
    wx.navigateTo({
      url: '../receiveAddress/receiveAddress?rid=' + rid,
    })
  },
  // 加入购物车
  handleAddCart() {
    var rid
    if (this.data.needSpecifications == '' || this.data.needColor == '') {
      wx.showToast({
        title: '请选择',
        icon: 'none',
        duration: 1500
      })
      return
    }
    this.data.productInfomation.skus.forEach((v, i) => {
      if (v.mode == this.data.needSpecifications + ' ' + this.data.needColor) {
        rid = v.rid
        this.setOrderParamsProductId(v.rid) // 设置订单的商品id,sku---
      }
    })
    var addCartParams = {
      rid: '', //String	必填	 商品sku
      quantity: 1, //Integer	可选	1	购买数量
      option: '', //String	可选	 	其他选项
      open_id: '' //String	独立小程序端必填	 	独立小程序openid
    }
    addCartParams.open_id = wx.getStorageSync("jwt").openid
    addCartParams.rid = rid
    http.fxPost(api.cart, addCartParams, (result) => {
      if (result.success) {
        console.log(result)
        utils.fxShowToast('成功购物车')
        this.getCartProduct() // 获取购物车商品---
        this.getDesireOrder() // 获取心愿单---
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  // 设置订单参数的 商品的rid store_items.itemsrid = 
  setOrderParamsProductId(e) {
    var productId = wx.getStorageSync('orderParams')
    productId.store_items[0].items[0].rid = e
    console.log(productId)
    wx.setStorageSync('orderParams', productId)
  },
  /** end 后续抽离**/

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    this.getDesireOrder() // 获取心愿单
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
    //计算金额
    setTimeout(() => {
      this.paymentPrice()
    }, 1000)
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

  },
  //去首页
  indexTap() {
    wx.switchTab({
      url: '../index/index',
    })
  },
  //提示信息
  warn(title, content) {
    wx.showModal({
      title: title,
      content: content,
    })
  },
  //结算跳转
  chekoutTap() {
    var shopProduct = []
    // 订单内容

    var store_items = [{
      store_rid: '', //String	必需	 	当前店铺rid
      is_distribute: 0,//Integer  可选 0 是否分销 0、否 1、是
      original_store_rid:'',// String 可选   原店铺rid
      buyer_remark: '', //String	可选	 	买家备注
      blessing_utterance: '', //String	可选	 	买家寄语
      coupon_codes: '', //Array	可选	 	优惠券码列表
      items: [{
        rid: '', //String	必需	 	sku
        quantity: '', //Number	必需	1	购买数量
        express_id: '', //Integer	必需	 	物流公司ID
        warehouse_id: '' //Number	可选	 	发货的仓库ID
      }]
    }]
    var skus = []
    var skusNeedQuantity = []
    console.log(this.data.shoppingCart)



    this.data.shoppingCart.items.forEach((v, i) => {
      skusNeedQuantity.push(v.product.rid + ":" + v.quantity) // 每个sku需求数量
      skus.push(v.product.rid)

    })
    // var orderParams = wx.getStorageSync('orderParams')
    // orderParams.store_items[0].items = shopProduct
    // wx.setStorageSync('orderParams', orderParams)
    // console.log(shopProduct)

    // 获取产品的详情

    http.fxGet(api.by_store_sku, {
      rids: skus.join(',')
    }, (result) => {
      console.log(result)
      if(result.success){
        //添加每件sku的需求数量
        Object.keys(result.data).forEach((key) => {
          console.log(result.data[key]) // 每个店铺
          result.data[key].forEach((v, i) => {//每个sku
            console.log(v)
            // 当前店铺的rid
            v.current_store_rid = wx.getStorageSync('storeInfo').rid
            // 是否为分销商品
            if (v.store_rid != wx.getStorageSync('storeInfo').rid){
              v.is_distribute=1
            }else{
              v.is_distribute = 0
            }
            //需求数量
            skusNeedQuantity.forEach((item, n) => {
              var newArray = item.split(":")
              console.log(newArray)
              if (v.rid == newArray[0]) {
                v.needQuantity = newArray[1]
              }
            })
          })
        })
        app.globalData.orderSkus = result 

        wx.navigateTo({
          url: '../receiveAddress/receiveAddress',
        })
      }else{
        utils.fxShowToast(result.status.message)
      }
    })
    console.log(skus, skusNeedQuantity)
  },

  // 关闭选择呼出框、
  handlePickBoxOffTap() {
    this.setData({
      pickBox: false
    })
  }

})