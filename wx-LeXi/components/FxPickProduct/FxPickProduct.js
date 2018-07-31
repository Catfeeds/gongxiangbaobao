// components/FxPickProduct/FxPickProduct.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
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
    lineLeft: 0, //线距离左边的距离
    lineWhite: 600, // 线的长度
    categoryId: [], // 选择的分类
    categoryList: [], // 分类的列表
    logisticsPrice:0 // 是否包邮

  },
  /**
   * 初始化
   * **/
  created() {

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
    handleOffPick(e) {
      this.triggerEvent('handlePickOff')
    },


    //左边滑块
    handleMovableLeft(e) {
      console.log(e, '左面')
      this.setData({
        lineWhite: 600 - e.detail.x,
        // movableLeft:e.detail.x,

      })
    },

    //右面滑块
    handleMovableRight(e) {
      console.log(e, '右面')
    }
  }
})