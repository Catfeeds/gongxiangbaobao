// pages/settings/settings.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    country_code:886,
    // 手机号码的验证是否弹出
    is_mobile: false,
    //选择国家的模态框是否弹出
    is_country: false,
    //获取验证码按钮的颜色
    getBtnStyle: false,
    //获取手机及号码的按钮和秒变按钮是否显示
    is_time: false,
    time: 60,
    // 手机号码
    mobaile_number: [],
    //验证码
    verification_code: [],
    // 完成按钮
    over_button: false,
    // 选择国家
    country_pick:[
      { country_name:"中国大陆",code:86,rid:1},
      { country_name:"中国台湾",code:886,rid:2},
      { country_name:"中国香港",code:852,rid:3},
      { country_name:"中国澳门",code:853,rid:4},
      { country_name:"日本",code:81,rid:5},
      { country_name:"泰国",code:66,rid:6},
    ]
  },
  //选择国家的id
  pickCountryTap(e){
    this.setData({
      country_code: e.currentTarget.dataset.code,
      is_country:false
    })

  },

  // 清空手机号码的按钮
  mobileNumberNullTap() {
    this.setData({
      mobaile_number: []
    })
  },
  //获取手机号码的按钮
  getNumberTap() {
    clearInterval(pageTime)
    this.setData({
      is_time: true,
      time: 60
    })
    if (this.data.is_time == true) {
      var pageTime = setInterval(() => {

        this.setData({
          time: --this.data.time
        })
        if (this.data.time == 0) {
          clearInterval(pageTime)
          this.setData({
            is_time: false
          })
        }
      }, 100)
    }
  },
  //输入手机号码时候出发
  inputText(e) {

    if (e.detail.cursor >= 0) {
      this.setData({
        getBtnStyle: true,
        mobaile_number: e.detail.value
      })
    } else {
      this.setData({
        getBtnStyle: false
      })
    }
    this.verification()
  },
  //验证码的输入框
  serveNumber(e) {

    this.setData({
      verification_code: e.detail.value
    })
    this.verification()
  },
  //手机号码绑定是否弹出
  bindMobileTap() {
    this.setData({
      is_mobile: true
    })
  },
  countryHidTap() {
    this.setData({
      is_mobile: false
    })
  },
  //选择国家的模态框是否弹出
  countryTap() {
    this.setData({
      is_country: true
    })
    wx.setNavigationBarTitle({
      title: '选择国家与地区'
    })
  },

  //校验绑定手机号码的完成按钮是否y颜色
  verification() {
    console.log(this.data.verification_code )
    console.log(this.data.mobaile_number )
    if (this.data.verification_code != false && this.data.mobaile_number != false) {
      this.setData({
        over_button: true
      })
    } else {
      this.setData({
        over_button: false
      })
    }
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
  onShareAppMessage: function () {

  },
  //跳转到编辑信息页面
  editInfoTap() {
    wx.navigateTo({
      url: '../editInfo/editInfo',
    })
  },
  //orderTap 我的订单
  orderTap() {
    wx.navigateTo({
      url: '../order/order',
    })
  },
  //阻止返回，防止点击穿透
  returnTap() {
    return
  }
})