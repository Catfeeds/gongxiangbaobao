// components/FxModal/FxModal.js
Component({
  /**
   * 启用多slot支持
   */
  options: {
    multipleSlots: true
  },

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
    reset: {
      type: String,
      value: ''
    },
    visible: {
      type: Boolean,
      value: false
    },
    showFoot: {
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
     * 隐藏弹窗
     */
    hideModal() {
      this.setData({
        visible: false
      })
      // 触发关闭回调
      this.triggerEvent('closeEvent')
    },

    /**
     * 显示弹窗
     */
    showModal() {
      this.setData({
        visible: true
      })
    },

    /**
     * 弹出框蒙层截断touchmove事件
     */
    preventTouchMove () {

    },

    /**
     * 重置事件
     */
    resetModal (e) {
      this.triggerEvent('resetEvent', e)
    },
    
    // 触发点击事件
    handleViewTap(e) {
      this.triggerEvent('tapEvent', e)
    }

  }
})
