const util = require('./../../utils/util.js')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    min: {
      type: Number
    },
    max: {
      type: Number
    },
    minValue: {
      type: Number
    },
    maxValue: {
      type: Number
    },
    blockColor: {
      type: String
    },
    backgroundColor: {
      type: String
    },
    selectedColor: {
      type: String
    }
  },


  /**
   * 组件的初始数据
   */
  data: {
    min: 0,
    max: 1000,
    leftValue: 0,
    rightValue: '不限',
    totalLength: 0,
    bigLength: 0,
    ratio: 0.5,
    sliderLength: 58,
    containerLeft: 0, // 标识整个组件，距离屏幕左边的距离
    leftPercent: 0,
    bodyPercent: 100,
    rightPercent: 0,
    minPrice: 0,
    maxPrice: '不限'
  },

  /**
   * 组件的方法列表
   */
  methods: {

    /**
    * 设置左边滑块的值
    */
    _propertyLeftValueChange: function () {

      let minValue = this.data.minValue / this.data.max * this.data.bigLength
      let min = this.data.min / this.data.max * this.data.bigLength
      this.setData({
        leftValue: minValue - min
      })
    },

    /**
     * 设置右边滑块的值
     */
    _propertyRightValueChange: function () {
      let right = this.data.maxValue / this.data.max * this.data.bigLength + this.data.sliderLength
      this.setData({
        rightValue: right
      })
    },
    /**
     * 左边滑块滑动
     */
    _minMove: function (e) {
      let pagex = e.changedTouches[0].pageX / this.data.ratio - this.data.containerLeft - this.data.sliderLength / 2

      if (pagex + this.data.sliderLength >= this.data.rightValue) {
        pagex = this.data.rightValue - this.data.sliderLength
      } else if (pagex <= 0) {
        pagex = 0
      }

      let leftPercent = pagex * 100 / this.data.totalLength
      let rightPercent = (this.data.totalLength - this.data.rightValue) * 100 / this.data.totalLength

      let lowValue = parseInt(pagex / this.data.bigLength * parseInt(this.data.max) + this.data.min)
      let lowPrice = this._get_price(lowValue)
      let myEventDetail = { lowValue: lowPrice }

      this.setData({
        leftValue: pagex,
        leftPercent: leftPercent.toFixed(2),
        rightPercent: rightPercent.toFixed(2),
        bodyPercent: 100 - leftPercent.toFixed(2) - rightPercent.toFixed(2),
        minPrice: lowPrice
      })

      this.triggerEvent('lowValueChange', myEventDetail)
    },

    /**
     * 右边滑块滑动
     */
    _maxMove: function (e) {
      let pagex = e.changedTouches[0].pageX / this.data.ratio - this.data.containerLeft - this.data.sliderLength / 2
      if (pagex <= this.data.leftValue + this.data.sliderLength) {
        pagex = this.data.leftValue + this.data.sliderLength
      } else if (pagex >= this.data.totalLength) {
        pagex = this.data.totalLength
      }

      let leftPercent = this.data.leftValue * 100 / this.data.totalLength
      let rightPercent = (this.data.totalLength - pagex) * 100 / this.data.totalLength

      let highValue = parseInt(pagex / this.data.bigLength * this.data.max)
      let highPrice = this._get_price(highValue)
      let myEventDetail = { highValue: highPrice }

      this.setData({
        rightValue: pagex,
        leftPercent: leftPercent.toFixed(2),
        rightPercent: rightPercent.toFixed(2),
        bodyPercent: 100 - leftPercent.toFixed(2) - rightPercent.toFixed(2),
        maxPrice: highPrice
      })

      this.triggerEvent('highValueChange', myEventDetail)
    },

    /**
    * 重置
    */
    reset: function () {
      this.setData({
        rightValue: this.data.totalLength,
        leftValue: 0,
        leftPercent: 0,
        rightPercent: 0,
        bodyPercent: 100,
        minPrice: 0,
        maxPrice: '不限'
      })
    },

    /**
     * 返回对应的值
     */
    _get_price(percent) {
      let v = percent * 10

      // 设置金额
      let currentPrice = 0

      if (v > 100 && v <= 250) {
        currentPrice = 150
      }
      if (v > 250 && v <= 400) {
        currentPrice = 300
      }
      if (v > 400 && v <= 600) {
        currentPrice = 400
      }
      if (v > 600 && v <= 750) {
        currentPrice = 500
      }
      if (v > 750 && v <= 900) {
        currentPrice = 800
      }
      if (v > 900) {
        currentPrice = '不限'
      }

      return currentPrice
    }

  },

  ready: function () {
    let that = this;
    const getSystemInfo = util.wxPromisify(wx.getSystemInfo)
    const queryContainer = util.wxPromisify(wx.createSelectorQuery().in(this).select('.fx-slider').boundingClientRect)
    util.wxPromisify(wx.getSystemInfo)()
      .then(res => {
        let ratio = res.windowWidth / 750
        that.setData({
          ratio: ratio,
        })
      })
      .then(() => {
        const query = wx.createSelectorQuery()
        query.select('.container').boundingClientRect(function (res) {
          let _w = res.width / that.data.ratio

          that.setData({
            totalLength: _w - 40 * 2 - that.data.sliderLength,
            bigLength: _w - 40 * 2 - that.data.sliderLength * 2,
            rightValue: _w - 40 * 2 - that.data.sliderLength,
            containerLeft: res.left / that.data.ratio
          })

          /**
           * 设置初始滑块位置
           */
          that._propertyLeftValueChange()
          that._propertyRightValueChange()
        }).exec()
      })
  }
})