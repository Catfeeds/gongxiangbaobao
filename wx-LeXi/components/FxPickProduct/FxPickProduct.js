// components/FxPickProduct/FxPickProduct.js
let setTimeoutFn
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pickQuantity: {
      type: Number,
      value: 0
    },
    recommend: {
      type: Boolean,
      value: false
    },
    category: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    
    isDisabled: false, // 是否禁用
    lineLeft: 0, //线距离左边的距离
    lineWhite: 520, // 线的长度
    categoryId: [], // 选择的分类
    categoryList: [], // 分类的列表
    logisticsPrice: 0, // 是否包邮

    minPrice: 0, //最小价格 
    maxPrice: -1, // 最大的价格

    xLeft: 0, // 
    xRight: 600,

    windowWidth: 375, // 屏幕的宽度(真机)
    movableLeftRight: 37.5, //滑块的左右距离（真机）
    movableRight: 560, //右面滑块的偏移
    movableLeft: 0, // 左面滑块的偏移
    offsetLeft: 40, // 设计稿--左边滑块的移动距离
    offsetRight: 40, //

    leftLastTime: 0, //左边滑块上次距离
    rightLastTime: 560, //右边边滑块上次距离
  },
  /**
   * 初始化
   * **/
  created() {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowWidth: res.windowWidth,

        })
      }
    })
  },

  /**
   * 页面渲染完成
   * **/
  ready() {
    let current = getCurrentPages()
    if (current[0].route == "pages/index/index") {
      let pickCategory = this.properties.category
      pickCategory.forEach((v)=>{
        v[2] = 0
      })
      this.setData({
        currentPages: current[0].route,
        categoryList: pickCategory
      })
      console.log(this.data.categoryList)
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 倒计时的函数
    handleSettimeout(){
      clearTimeout(setTimeoutFn)
      
      setTimeoutFn = setTimeout((result)=>{

        console.log(this.data.categoryId)
        if (this.data.currentPages== "pages/index/index"){
          console.log(this.data.categoryId,this.data.minPrice,this.data.maxPrice)
          this.triggerEvent('handlePickProduct', {
            minPrice: this.data.minPrice, //最小价格 
            maxPrice: this.data.maxPrice, // 最大的价格
          })
          
        }else{
          console.log(this.data.minPrice)
          console.log(this.data.maxPrice)
          this.triggerEvent('logisticsPrice', {
            minPrice: this.data.minPrice, //最小价格 
            maxPrice: this.data.maxPrice, // 最大的价格
            logisticsPrice: this.data.logisticsPrice
          })
        }
      },2000)
    },

    // 是否包邮 推荐
    handleLogistics() {
      if (this.data.logisticsPrice == 1){
        this.setData({
          logisticsPrice: 0
        })
      }else{
        this.setData({
          logisticsPrice: 1
        })
      }

      this.triggerEvent('logisticsPrice', {
        logisticsPrice: this.data.logisticsPrice
      })

    },
    // 选择分类 
    hanlePickCategory(e) {
      console.log(e)
      console.log(e.currentTarget.dataset.rid)
      let rid = e.currentTarget.dataset.rid
      let categoryIds = this.data.categoryId
      let index = e.currentTarget.dataset.index

      let ridArray = this.data.categoryId

      if (ridArray.indexOf(rid)==-1){
        ridArray.push(rid)
      }else{
        ridArray.splice(index, 1)
      }

      this.setData({
        categoryId: ridArray
      })
      console.log(ridArray)

      // 改变颜色
      if (this.data.categoryList[index][2] == 1){
        this.setData({
          ['categoryList['+index+'][2]']:0
        })
      }else{
        this.setData({
          ['categoryList[' + index + '][2]']: 1
        })
      }

      console.log(index)

      this.triggerEvent('handlePickProduct', {
        page:1,
        category: this.data.categoryId,
        minPrice: this.data.minPrice, //最小价格 
        maxPrice: this.data.maxPrice, // 最大的价格
      })
    },

    // 重新设置
    newSeting(){
      this.setData({
        xLeft: 0, // 
        xRight: 600,
      })
    },

    //
    handleSlider3change(e) {
      console.log(e)
    },

    //关闭选择的盒子
    handleOffPick(e) {
      this.triggerEvent('handlePickOff')
    },

    // 查看是否禁用
    handleIsDisabled() {
      let params = Math.ceil(this.data.movableRight) - Math.ceil(this.data.movableLeft)
      console.log(params, "滑块的距离")
      if (params <= 80) {
        this.setData({
          isDisabled: true
        })
      }
    },

    //左边滑块
    handleMovableLeft(e) {
      console.log(e)
      console.log(e.detail.x, '左面')
      console.log(750 * e.detail.x / this.data.windowWidth + 75, '在设计稿上左边移动的宽度')
      console.log(750 * e.detail.x / this.data.windowWidth, '左边滑块的偏移')
      console.log(this.data.lineWhite - 750 * e.detail.x / this.data.windowWidth, '线的长')
      let left = 750 * e.detail.x / this.data.windowWidth // 设计稿的左边距离长度
      this.setData({
        leftLastTime: left,
        lineWhite: this.data.lineWhite - (left - this.data.leftLastTime), //线的长度
        movableLeft: left,
        offsetLeft: 750 * e.detail.x / this.data.windowWidth + 40
      })
      // console.log(this.data.offsetLeft)

      this.handleIsDisabled() // 检查是否禁用

      // 设置金额
      let price = 0

      if (left > 0 && left <= 80) {

      }
      if (left > 80 && left <= 160) {
        price = 150
      }
      if (left > 160 && left <= 240) {
        price = 300
      }
      if (left > 240 && left <= 320) {
        price = 400
      }
      if (left > 320 && left <= 400) {
        price = 500
      }
      if (left > 400 && left <= 480) {
        price = 800
      }
      if (left > 480) {

      }

      this.setData({
        minPrice: price
      })

      //获取数据
      this.handleSettimeout() 
    },

    //右面滑块
    handleMovableRight(e) {
      console.log(e)
      console.log(e.detail.x, '右面')
      console.log(560 - 750 * e.detail.x / this.data.windowWidth, '在设计稿上右边移动的宽度')
      console.log(750 * e.detail.x / this.data.windowWidth, '右边滑块的偏移')

      let right = 750 * e.detail.x / this.data.windowWidth

      this.setData({
        rightLastTime: right,
        lineWhite: this.data.lineWhite - (this.data.rightLastTime - right), //线的长度
        // movableRight: Math.ceil(right) ,
        movableRight: right,
        offsetRight: 750 * e.detail.x / this.data.windowWidth + 75
      })
      console.log(this.data.movableRight, 33)

      this.handleIsDisabled() // 检查是否禁用

      let price = -1

      if (right > 0 && right <= 80) {

      }
      if (right > 80 && right <= 160) {
        price = 150
      }
      if (right > 160 && right <= 240) {
        price = 300
      }
      if (right > 240 && right <= 320) {
        price = 400
      }
      if (right > 320 && right <= 400) {
        price = 500
      }
      if (right > 400 && right <= 480) {
        price = 800
      }
      if (right > 480) {
        price = -1
      }
      this.setData({
        maxPrice: price
      })

      //获取数据
      this.handleSettimeout() 
    }
  }

})