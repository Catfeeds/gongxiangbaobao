// components/FxGameModal/FxGameModal.js
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
    // 是否显示头部
    showHead: {
      type: Boolean,
      value: true
    },
    // 是否显示重置按钮
    showReset: {
      type: Boolean,
      value: false
    },
    reset: {
      type: String,
      value: ''
    },
    visible: {
      type: Boolean,
      value: false
    },
    // 是否需要动画
    animation: {
      type: Boolean,
      value: true
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
      wx.showTabBar()
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
    preventTouchMove() {
      return false
    },

    /**
     * 重置事件
     */
    resetModal(e) {
      this.triggerEvent('resetEvent', e)
    },

    // 触发点击事件
    handleViewTap(e) {
      this.triggerEvent('tapEvent', e)
    }
    
  }
})
