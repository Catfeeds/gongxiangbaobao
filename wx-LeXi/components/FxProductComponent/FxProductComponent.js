// components/FxProductComponent/FxProductComponent.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 图片的大小
    photoSize:{
      type: String,
      value: "30x2"
    },

    oldPrice: {
      type: Boolean,
      value: false
    },
    like_number: {
      type: Boolean,
      value: false
    },
    
    product:{
        type:Object,
        value:" "
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
    handleProductInfo (e){
      this.triggerEvent("triggerEvent_product",{
        rid: e.currentTarget.dataset.rid
      })
    }
  }
})
