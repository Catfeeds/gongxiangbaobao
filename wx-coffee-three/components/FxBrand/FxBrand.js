// components/FxBrand/FxBrand.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    brand: {
      type: Object,
      value: {}
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
      this.triggerEvent('viewBrand', {
        rid: e.currentTarget.dataset.rid,
        title: e.currentTarget.dataset.title
      })
    }
  }
})
