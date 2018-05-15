// components/FxAddDeleteBtn/FxAddDeleteBtn.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    product:{
      type:Object,
      value:{}
    }

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 减少
    reduce(e){
      this.triggerEvent("changeNumberTap", {
        id: e.currentTarget.dataset.id,
        NeedNumber: this.properties.product.shopingNumber - 1
      })
      // console.log(this.properties.product = this.properties.product-1)
      // console.log(e.currentTarget.dataset.id)

    },
    // 增加
    add(e){
      this.triggerEvent("changeNumberTap", {
        id: e.currentTarget.dataset.id,
        NeedNumber: this.properties.product.shopingNumber + 1
      })

    }

  }
})
