// components/FxFormId/FxformId.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    name:{
      type:String,
      value:'付款'
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
    formSubmit(e){
      console.log(e,'id')

    }
  }
})
