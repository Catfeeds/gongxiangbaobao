// components/FxcategoryList/FxcategoryList.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    porduck:{
      type:Object,
      value:{}
      },
      cid:{
        type: Number,
        value:0
      },
      rid:{
        type:Number,
        value:0
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
    pickTap(e){
      console.log(e.currentTarget.dataset.cid)
      // this.data.cid = e.currentTarget.dataset.cid
      this.triggerEvent('tapEvent',{
        rid: e.currentTarget.dataset.cid
      })
    }

  }
})
