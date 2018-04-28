// pages/components/FxSearch/FxSearch.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isAbsolute: {
      type: Boolean,
      value: false
    },
    // 首页模版1，搜索框位置
    isCoupon: {
      type: Boolean,
      value: true
    },
    holderText: {
      type: String,
      value: '搜索'
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
    handleTapEvent (e) {
      console.log(this.triggerEvent)
      this.triggerEvent('tapEvent', e)
    },

    handleSearchEvent (e) {
      console.log(e.detail.value)
      this.triggerEvent('searchEvent', {
        query: e.detail.value
      })
    }
  }
})
