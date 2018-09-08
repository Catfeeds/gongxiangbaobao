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

    // 图片的大小 1是最小图片(每排3个半) 
    // 图片的大小 2是小图片(每排2个半)
    // 图片的大小 3是中图（每排2个）
    // 图片的大小 4是大图 (每排1个)
    // 图片的大小 5是长方形图 (每排2个)
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
    productItem:{
      cover:"https://static.moebeast.com/static/img/null-product.png",
      name:"乐喜平台",
      min_sale_price:0
    },
  },

  /**
   *初始化 
  */
  ready(e) {

    let NewData = this.properties.product
    let dataLength = this.properties.product.name.length
  
    // 最小图片
    if (this.properties.photo == 1 && NewData.is_free_postage){
      NewData.name = dataLength > 5 ? NewData.name.substr(0,5 ) + '...' : NewData.name
    }
    if (this.properties.photo == 1 && !NewData.is_free_postage){
      NewData.name = dataLength > 8 ? NewData.name.substr(0, 7) + '...' : NewData.name
    }

    // 小图片
    if (this.properties.photo == 2 && NewData.is_free_postage){
      
      NewData.name = dataLength > 8 ? NewData.name.substr(0, 7) + '...' : NewData.name
    } 
    if (this.properties.photo == 2 && !NewData.is_free_postage){
    
      NewData.name = dataLength > 12 ? NewData.name.substr(0, 11) + '...' : NewData.name
    }

    // 中图
    if (this.properties.photo == 3 && NewData.is_free_postage){
      NewData.name = dataLength > 10 ? NewData.name.substr(0, 9) + '...' : NewData.name
    } 
    if (this.properties.photo == 3 && !NewData.is_free_postage) {
      NewData.name = dataLength > 12 ? NewData.name.slice(0, 11) + '...' : NewData.name
    }

    // 大图
    if (this.properties.photo == 4 && NewData.is_free_postage){
      NewData.name = dataLength > 25 ? NewData.name.substr(0, 24) + '...' : NewData.name
    } 
    if (this.properties.photo == 4 && !NewData.is_free_postage) {
      NewData.name = dataLength > 30 ? NewData.name.substr(0, 29) + '...' : NewData.name
    }

    // 中图
    if (this.properties.photo == 5 && NewData.is_free_postage) {
      NewData.name = dataLength > 10 ? NewData.name.substr(0, 9) + '...' : NewData.name
    }
    if (this.properties.photo == 5 && !NewData.is_free_postage) {
      NewData.name = dataLength > 12 ? NewData.name.slice(0, 11) + '...' : NewData.name
    }


    this.setData({
      productItem: NewData
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
