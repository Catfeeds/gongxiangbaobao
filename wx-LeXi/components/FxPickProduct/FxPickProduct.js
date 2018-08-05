// components/FxPickProduct/FxPickProduct.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pickQuantity:{
      type:Number,
      value:0
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
    isDisabled:false, // 是否禁用
    lineLeft: 0, //线距离左边的距离
    lineWhite: 600, // 线的长度
    categoryId: [], // 选择的分类
    categoryList: [], // 分类的列表
    logisticsPrice:0, // 是否包邮


    windowWidth:375, // 屏幕的宽度(真机)
    movableLeftRight:37.5, //滑块的左右距离（真机）
    movableRight:560, //右面滑块的偏移
    movableLeft:0, // 左面滑块的偏移
    // offsetLeft:75, // 设计稿--左边滑块的移动距离
  },
  /**
   * 初始化
   * **/
  created() {
    wx.getSystemInfo({
      success: (res) => {
        console.log(res.windowWidth,"屏幕的宽度")
        


        // console.log(sumLeftDistance)
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
      this.setData({
        categoryList: this.properties.category
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 是否包邮
    handleLogistics(){
      this.setData({
        logisticsPrice:1
      })
      this.triggerEvent('logisticsPrice', {
        logisticsPrice: this.data.logisticsPrice
      })
    },
    // 选择分类 
    hanlePickCategory(e) {
      console.log(e.currentTarget.dataset.rid)
      let rid = e.currentTarget.dataset.rid
      let categoryIds = this.data.categoryId
      let index = categoryIds.indexOf(rid)

      console.log(index)
      if (index == -1) {
        categoryIds.push(rid)
        this.setData({
          categoryId: categoryIds
        })
        console.log(this.data.categoryId)

      } else {
        let newArr = categoryIds.filter((v, i) => {
          return index == v
        })
        console.log(newArr)
        this.setData({
          categoryId: newArr
        })
        console.log(this.data.categoryId)
      }

      let item = this.data.categoryList
      console.log(item)
      item.forEach((v, i) => {
        if (this.data.categoryId.indexOf(v[0]) > -1) {
          v[2] = 1
        } else {
          v[2] = 0
        }
        if (item.length - 1 == i) {
          console.log(item)
          this.setData({
            categoryList: item
          })

        }
      })


      this.triggerEvent('handlePickProduct',{
        category: this.data.categoryId
      })

    },
    //
    handleSlider3change(e) {
      console.log(e)
    },
    //查看商品件数
    handleOffPick(e) {
      this.triggerEvent('handlePickOff')
    },

    // 查看是否禁用
    handleIsDisabled(){
      let params = this.data.movableRight - this.data.movableLeft
      console.log(params,"滑块的距离")
      if (params<=80){
        this.setData({
          isDisabled:true
        })
      } 
    },

    //左边滑块
    handleMovableLeft(e) {
      console.log(e)
      console.log(e.detail.x, '左面')
      console.log(750 * e.detail.x / this.data.windowWidth+75, '在设计稿上左边移动的宽度')
      console.log(750 * e.detail.x / this.data.windowWidth, '左边滑块的偏移')
      this.setData({
        lineWhite: this.data.lineWhite - 750 * e.detail.x / this.data.windowWidth-40,//线的长度
        movableLeft: Math.ceil(750 * e.detail.x / this.data.windowWidth),
        // offsetLeft: 750 * e.detail.x / this.data.windowWidth + 75
      })
      // console.log(this.data.offsetLeft)

      this.handleIsDisabled() // 检查是否禁用
    },

    //右面滑块
    handleMovableRight(e) {
      console.log(e)
      console.log(e.detail.x, '右面')
      console.log(750 * e.detail.x / this.data.windowWidth + 75, '在设计稿上右边移动的宽度')
      console.log(750 * e.detail.x / this.data.windowWidth, '右边滑块的偏移')
      this.setData({
        lineWhite: this.data.lineWhite - 750 * e.detail.x / this.data.windowWidth - 40,//线的长度
        movableRight: Math.ceil(750 * e.detail.x / this.data.windowWidth) ,
        // offsetLeft: 750 * e.detail.x / this.data.windowWidth + 75
      })
      console.log(this.data.movableRight,33)

      this.handleIsDisabled() // 检查是否禁用
    }
  }

})