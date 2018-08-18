// components/FxModalV/FxModalV.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: ''
    },
    // 是否需要显示关闭icon
    close: {
      type: Boolean,
      value: true
    },
    visible: {
      type: Boolean,
      value: false
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
    /**
     * 隐藏弹出框
     */
    hideModal () {
      this.setData({
        visible: false
      })
      // 触发关闭回调
      this.triggerEvent('closeEvent')
    },

    /**
     * do nothing
     */
    handleDoNothing(e) {
      // 阻止事件穿透
      return false
    }

  }
})
