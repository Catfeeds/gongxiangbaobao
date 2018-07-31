// components/FxSortProduct/FxSortProduct.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    teHuiShow:{
      type:Boolean,
      value:false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    sortData:[
      {name:'由低至高',rid:2},
      {name:'由高至低',rid:3}
    ],
    pitchOn:0, //页面的选择
    tehui:0,
  },
  /**
   * 初始化
   * **/
  created(){

  },


  /**
   * 组件的方法列表
   */
  methods: {
    // 排序成功
    handlePickTap(e){
      console.log(e.currentTarget.dataset.rid)
      this.setData({
        pitchOn: e.currentTarget.dataset.rid,
        tehui: 0,
      })
      this.triggerEvent('handlePickOver', {
        rid: e.currentTarget.dataset.rid
      })
    },
    // 关闭盒子
    handleSortOff(){
      this.triggerEvent('handleSortOff')
    },
    //特惠
    handleTeHuiTap() {
      console.log(123)
      this.setData({
        pitchOn: 5, //页面的选择
        tehui: 1,
      })
    },
  }


})
