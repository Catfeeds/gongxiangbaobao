// components/FxInputNumber/FxInputNumber.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    value: {
      type: Number,
      value: 1
    },
    max: {
      type: Number,
      value: ''
    },
    min: {
      type: Number,
      value: 1
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    value: 0,
    disabledMinus: false,
    disabledAdd: false
  },

  attached() {
    this.setData({
      value: this.properties.value
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {

    // 返回输入数值
    triggerInputNumber (value) {
      this.triggerEvent('inputNumber', {
        value: value || this.data.value
      })
    },

    handleInputEvent (e) {
      const currentValue = e.detail.value;
      if (currentValue <= this.properties.max && currentValue >= this.properties.min) {
        this.setData({
          value: currentValue
        })
      }
      this.triggerInputNumber()
    },

    handleMinusEvent () {
      let v = this.data.value - 1;
      let min = this.properties.min;
      let disabledMinus = false;
      let disabledAdd = false;
      if (min) {
        if (v < min) {
          v = this.data.value;
          disabledMinus = true
        } else if (v == min) {
          disabledMinus = true
        }
      }

      if (this.properties.max && this.properties.max > v) {
        disabledAdd = false
      }

      this.setData({
        value: v,
        disabledMinus: disabledMinus,
        disabledAdd: disabledAdd
      })

      this.triggerInputNumber()
    },

    handleAddEvent () {
      let v = this.data.value + 1;
      let max = this.properties.max;
      let disabledMinus = false;
      let disabledAdd = false;
      if (max) {
        if (v > max) {
          v = this.data.value;
          disabledAdd = true
        } else if (v == max) {
          disabledAdd = true
        }
      }

      this.setData({
        value: v,
        disabledMinus: disabledMinus,
        disabledAdd: disabledAdd
      })

      this.triggerInputNumber()
    }
  }
})
