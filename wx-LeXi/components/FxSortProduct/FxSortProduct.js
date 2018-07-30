// components/FxSortProduct/FxSortProduct.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    sortData:[
      {name:'综合排序',rid:1},
      {name:'价格',rid:2},
      {name:'由低至高',rid:3},
      {name:'由高至低',rid:4}
    ],
    pitchOn:1 
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 筛选成功
    handlePickTap(e){
      console.log(e.currentTarget.dataset.rid)
      this.setData({
        pitchOn: e.currentTarget.dataset.rid
      })
      this.triggerEvent('handlePickOver', {
        rid: e.currentTarget.dataset.rid
      })
    },
    // 关闭盒子
    handleSortOff(){
      this.triggerEvent('handleSortOff')
    }
  }
})
