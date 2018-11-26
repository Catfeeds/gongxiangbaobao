// 地址编辑

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    rid: '',
    isEditing: false, // 是否为编辑状态
    currentAddress: {}, // 地址详情信息
    from_ref: '', // 来源
    countryList: [], // 所有的国家的--
    countryIndex: 0, // 所有的国家的index--

    loaded: false, // 地点数据是否加载完毕
    regions: [ // 三列数组，省，市，区
      [],
      [],
      []
    ],
    multiIndex: [0, 0, 0], // 三列数组对应的索引
    allPlaces: {}, // 全部地点

    is_cameraOrPhoto: false,
    is_template: 0,
    needUserCustom: 0, // 是否需要海关身份信息
    userCustom: {}, // 用户的海关身份信息
    uploadParams: {}, // 上传所需参数
    uploadType: 'front', // 上传类型（正面、背面）
    id_card_front_image: '', // 身份证正面
    id_card_back_image: '', // 身份证背面
    isUploadingFront: false, // 是否正在上传
    isUploadingBack: false, // 是否正在上传
    uploadFrontStatus: 0, // 上传正面的进度
    uploadBackStatus: 0, // 上传背面的进度
    form: {
      first_name: '', //String	必需	 	姓
      last_name: '', // String	可选	 	名
      mobile: '', // String	必需	 	手机号码
      phone: '', // String	可选	 	电话
      country_id: '', // Number	可选	1	国家
      province_id: '', // Number	必需	 	省市
      city_id: '', // Number	必需	 	城区
      town_id: '', // Number	可选	 	镇/地区
      area_id: '', // Number	可选	 	村/ 区域
      street_address: '', // String	必需	 	详细街道
      street_address_two: '', // String	可选	 	 
      zipcode: '', // Number	可选	 	邮编

      is_default: false, // Bool	可选	False	是否默认地址
      is_overseas: '', // Bool	可选	False	是否海外地址
      user_custom_id: '', // Integer	可选	 海关信息id
      id_card: '', // 海关-身份证号码
      id_card_front: '', // 海关-身份证正面-ID
      id_card_back: '', // 海关-身份证背面-ID
    }
  },

  /**
   * 上传选择
   */
  pickCameraOrPhoto() {
    this.setData({
      is_cameraOrPhoto: false
    })
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
    let that = this
    setTimeout(() => {
      that.setData({
        isLoading: false
      })
    }, 350)
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

  }
})