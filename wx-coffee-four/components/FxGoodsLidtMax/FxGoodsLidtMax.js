// components/FxGoodsLidtMax/FxGoodsLidtMax.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    label: {
      type: String,
      value: []
    },
    product: {
      type: Object,
      value: []
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
    //点击商品事件
    viewTap(e) {
      console.log(1111111)
      this.triggerEvent('viewProduct', {
        rid: e.currentTarget.dataset.rid,
        title: e.currentTarget.dataset.title
      })
    }
  }
})
