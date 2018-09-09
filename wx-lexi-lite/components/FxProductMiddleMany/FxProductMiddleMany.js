// components/FxProductMiddle/FxProductMiddle.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    product: {
      type: Object,
      value: false
    },
    //购买的数量
    shopingNumber:{
      type: Boolean,
      value: false
    },
    //颜色组建是否显示，false为不显示，true为显示
    color: {
      type: Boolean,
      value: false
    },
    //店铺信息是否显示，false为不显示，true为显示
    shopName: {
      type: Boolean,
      value: false
    },
    //价格信息是否显示，false为不显示，true为显示
    price: {
      type: Boolean,
      value: false
    },
    //原价是否显示
    originPric: {
      type: Boolean,
      value: false
    },
    //喜欢商品的人数,是否显示
    is_likeNumber: {
      type: Boolean,
      value: false
    },
    //该商品已售馨,是否显示
    repertoryNumber: {
      type: Boolean,
      value: false
    },
    round: {
      type: Boolean,
      value: false
    },
    photoHeight:{
      type:Number,
      value:180
    },
    photoWidth:{
      type:Number,
      value:180
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    productItem:''
  },


  /**
 *初始化 
*/
  ready(e) {
    let NewData = this.properties.product
    this.setData({
      productItem: NewData
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleProductInfo(e) {
      this.triggerEvent("triggerEvent_product", {
        rid: e.currentTarget.dataset.rid,
        storeRid: e.currentTarget.dataset.storeRid
      })
    }
  }
})
