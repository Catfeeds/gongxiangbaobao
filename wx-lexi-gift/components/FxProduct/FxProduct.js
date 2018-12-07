// components/FxProductComponent/FxProductComponent.js

Component({
  /**
   * 组件的属性列表
   */
  properties: {

    // 图片裁剪的大小
    photoSize: {
      type: String,
      value: "30"
    },

    // 图片的大小 1是最小图片(每排3个半) 
    // 图片的大小 2是小图片(每排2个半)
    // 图片的大小 3是中图（每排2个）
    // 图片的大小 4是大图 (每排1个)
    // 图片的大小 5是长方形图 (每排2个)
    photo: {
      type: Number,
      value: 1
    },

    oldPrice: {
      type: Boolean,
      value: false
    },

    like_number: {
      type: Boolean,
      value: true
    },

    product: {
      type: Object,
      value: " "
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    productItem: '',
  },

  /**
   *初始化 
   */
  ready(e) {

    let newData = this.properties.product
    let dataLength = this.properties.product.name.length

    // 最小图片
    if (this.properties.photo == 1 && newData.is_free_postage) {
      newData.name = dataLength > 5 ? newData.name.substr(0, 5) + '...' : newData.name
    }
    if (this.properties.photo == 1 && !newData.is_free_postage) {
      newData.name = dataLength > 8 ? newData.name.substr(0, 7) + '...' : newData.name
    }

    // 小图片
    if (this.properties.photo == 2 && newData.is_free_postage) {
      newData.name = dataLength > 8 ? newData.name.substr(0, 7) + '...' : newData.name
    }
    if (this.properties.photo == 2 && !newData.is_free_postage) {
      newData.name = dataLength > 12 ? newData.name.substr(0, 11) + '...' : newData.name
    }

    // 中图
    if (this.properties.photo == 3 && newData.is_free_postage) {
      newData.name = dataLength > 10 ? newData.name.substr(0, 9) + '...' : newData.name
    }
    if (this.properties.photo == 3 && !newData.is_free_postage) {
      newData.name = dataLength > 12 ? newData.name.slice(0, 11) + '...' : newData.name
    }

    // 大图
    if (this.properties.photo == 4 && newData.is_free_postage) {
      newData.name = dataLength > 25 ? newData.name.substr(0, 24) + '...' : newData.name
    }
    if (this.properties.photo == 4 && !newData.is_free_postage) {
      newData.name = dataLength > 30 ? newData.name.substr(0, 29) + '...' : newData.name
    }

    // 中图
    if (this.properties.photo == 5 && newData.is_free_postage) {
      newData.name = dataLength > 10 ? newData.name.substr(0, 9) + '...' : newData.name
    }
    if (this.properties.photo == 5 && !newData.is_free_postage) {
      newData.name = dataLength > 12 ? newData.name.slice(0, 11) + '...' : newData.name
    }

    if (this.properties.photoSize == '30') {
      this.properties.photoSize = '30x2'
    }

    if (newData.cover) {
      newData.cover_image = newData.cover + '-p' + this.properties.photoSize
    } else {
      newData.cover_image = newData.cover
    }

    this.setData({
      productItem: newData
    })

  },

  /**
   * 组件的方法列表
   */
  methods: {
    
  }

})