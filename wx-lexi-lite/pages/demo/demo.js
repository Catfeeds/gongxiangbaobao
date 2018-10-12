// pages/demo/demo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rpx: '',
    showText: '乐喜',
    step: 1,// 计数动画次数
    num: 0,// 计数倒计时秒数（n - num）
    end: 1.5 * Math.PI,// 开始的弧度
    start: -0.5 * Math.PI,// 结束的弧度
    timer: null, // 计时器容器
    animationTime: 100, // 每1秒运行一次计时器
    n: 100 // 当前倒计时为10秒
  },

  drawProgressbg () {
    // 使用 wx.createContext 获取绘图上下文 context
    let ctx = wx.createCanvasContext('canvasProgressbg')
    ctx.setLineWidth(10 * this.data.rpx) // 设置圆环的宽度
    ctx.setStrokeStyle('#FFCF00') // 设置圆环的颜色
    ctx.setLineCap('round') // 设置圆环端点的形状
    ctx.beginPath() // 开始一个新的路径
    ctx.arc(40 * this.data.rpx, 40 * this.data.rpx, 30 * this.data.rpx, 0, 2 * Math.PI, false)
    ctx.stroke() // 对当前路径进行描边
    ctx.draw()
  },

  // 画布绘画函数
  drawRingMove (s, e) {
    let context = wx.createCanvasContext('canvasProgress')

    // 绘制圆环
    context.setStrokeStyle('#6A378D')
    context.beginPath()
    context.setLineWidth(10 * this.data.rpx)
    context.arc(40 * this.data.rpx, 40 * this.data.rpx, 30 * this.data.rpx, s, e, true)
    context.stroke()
    context.closePath()

    context.draw()

    let leftTime = Math.round((this.data.n - this.data.num) / 10)
    let showText = '乐喜'
    if (leftTime > 0) {
      showText = leftTime + ''
    }

    // 每完成一次全程绘制就+1
    this.setData({
      num: this.data.num + 1,
      showText: showText
    })
  },

  // 开启动画
  startAnimation () {
    if (this.data.step <= this.data.n) {
      let end = this.data.end - 2 * Math.PI / this.data.n
      let step = this.data.step + 1
      this.drawRingMove(this.data.start, end)
      this.setData({
        end: end,
        step: step
      })
    } else {
      clearInterval(this.data.timer)
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 倒计时前先绘制整圆的圆环
    this.drawRingMove(this.data.start, this.data.end)

    // 创建倒计时
    this.setData({
      timer: setInterval(this.startAnimation, this.data.animationTime)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    wx.getSystemInfo({
      success: (res) => {
        // 计算主体部分高度,单位为px
        this.setData({
          rpx: res.windowWidth / 375
        })
      }
    })
    
    console.log(this.data.rpx, '像素转换')

    this.drawProgressbg()
    let that = this
    setTimeout(() => {
      that.setData({
        readyOver: true,
        isLoading: false
      })
    }, 350)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})