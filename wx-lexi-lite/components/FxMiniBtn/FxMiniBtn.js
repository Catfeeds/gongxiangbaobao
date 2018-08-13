/**
 * 小按钮
 */

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    name: {
      type: String,
      value: '确认'
    },
    size: {
      type: String,
      value: 'md'
    },
    type: {
      type: String,
      value: 'default'
    },
    round: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    classes: 'fx-mini-btn'
  },

  /**
   * 组件实例进入页面节点树时执行
   */
  attached() {
    let classGroup = ['fx-mini-btn'];
    if (this.properties.type) {
      classGroup.push('fx-mini-btn--' + this.properties.type)
    }
    if (this.properties.size) {
      classGroup.push('fx-mini-btn--' + this.properties.size)
    }
    if (this.properties.round) {
      classGroup.push('fx-mini-btn--round')
    }
    this.setData({
      classes: classGroup.join(' ')
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 触发点击事件
    handleViewTap(e) {
      this.triggerEvent('tapEvent', e)
    }
  }
})
