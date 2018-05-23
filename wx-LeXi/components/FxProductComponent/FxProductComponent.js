// components/FxProductComponent/FxProductComponent.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    oldPrice: {
      type: Boolean,
      value: false
    },
    like_number: {
      type: Boolean,
      value: false
    },
    
    product:{
        type:String,
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
    product(e){
      console.log(this)
      this.triggerEvent("triggerEvent_product")
    }

  }
})
