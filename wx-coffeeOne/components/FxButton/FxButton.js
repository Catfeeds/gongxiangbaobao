// components/FxButton/FxButton.js
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
      value: ''
    },
    type: {
      type: String,
      value: ''
    },
    isFluid: {
      type: Boolean,
      value: false
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
    classes: 'fx-btn'
  },

  // 组件实例进入页面节点树时执行
  attached () {
    let classGroup = ['fx-btn'];
    if (this.properties.type) {
      classGroup.push('fx-btn--' + this.properties.type)
    }
    if (this.properties.size) {
      classGroup.push('fx-btn--' + this.properties.size)
    }
    if (this.properties.isFluid) {
      classGroup.push('fx-btn--fluid')
    }
    if (this.properties.round) {
      classGroup.push('fx-btn--round')
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
