// pages/redBag/redBag.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //活动内容呼出框
    rule_show:[],
    //获取红包的呼出框
    get_bonus:[],
    item:[{},{},{}],
    rule_text:[
      { text:'红包的使用期限为7天，一周内未使用则失效， 仅授权微信和绑定手机用户才有参与资格领取。'},
      { text:'每人每日限领一次，分享到群与微信好友即可 获得10元红包。'},
      { text:'系统根据根据注册用户进行核查，同一个手机 号，微信号，设备 支付账户示为同一个用户情 况均视为同一个用户。'},
      { text:'通过不正当手段，恶意刷卷，批量注册，机器 模拟获得奖励，官方有权封号和收回全部所获得 优惠奖励'},
    ]
  
  },
  //活动规则内容呼出
  ruleShowTap() {
    this.animation.bottom(0).step()
    this.setData({
      rule_show: this.animation.export()
    })
  },
//活动规则内容关闭
  ruleHidTap(){
    this.animation.bottom(-2000+"rpx").step()
    this.setData({
      rule_show: this.animation.export()
    })
  },
  //获得红包 呼出框
  getBonusShow(){
    this.animation.bottom(0).step()
    this.setData({
      get_bonus: this.animation.export()
    })
  },
  //获得红包 关闭
  getHidShow() {
    this.animation.bottom(-2000+"rpx").step()
    this.setData({
      get_bonus: this.animation.export()
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    wx.showToast({
      title: '已经领取过了',
      icon: 'none'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.animation = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: 1000,
      timingFunction: "ease",
      delay: 0
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    this.getBonusShow()
    
  },
  //跳转到首页
  handleToIndexTap(){
    wx.switchTab({
      url: '../index/index',
    })
  }
})