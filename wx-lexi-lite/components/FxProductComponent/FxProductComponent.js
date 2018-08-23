// components/FxProductComponent/FxProductComponent.js

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 图片裁剪的大小
    photoSize:{
      type:String,
      value:"30"
    },

    // 图片的大小 1 为没有设置，是默认值； 2是小图片 3是中图 4是大图
    photo:{
      type: Number,
      value: 1
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
    product:'',
  },

  /**
   *初始化 
  */
  ready(e) {

    let data = this.properties.product
    if (data.is_free_postage){
      data.name = data.name.replace(0,10)
    }else{
      data.name = data.name.replace(0, 12)
    }

    data.name = data.name + "..."
    
    this.setData({
      product:data
    })
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleProductInfo (e){
      console.log(e.currentTarget.dataset.storeRid)
      this.triggerEvent("triggerEvent_product",{
        rid: e.currentTarget.dataset.rid,
        storeRid: e.currentTarget.dataset.storeRid
      })
    }
  }
})
