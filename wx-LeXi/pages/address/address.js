// pages/address/address.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
var adressData = wx.getStorageSync('adress')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    provinceList: [], //省地址列表---
    cityList: [], //市地址列表---
    countyList: [], //县地址列表---
    provinceOid: [], //省地址列表oid---
    cityOid: [], //市地址列表oid---
    countyOid: [], //县地址列表oid---
    adressIndex: [0, 1, 1], // 地址的下表
    isPicker: false, // 省市呼出框---
    country: [], //所有的国家的--
    countryIndex: [], //所有的国家的index--

    is_cameraOrPhoto: false,
    is_template: 0,
    uploadParams: {}, // 上传所需参数
    uploadType: 'front', // 上传类型（正面、背面）
    id_card_front_image: '', // 身份证正面
    id_card_back_image: '', // 身份证背面

    //表单信息---
    form: {
      first_name: '', //String	必需	 	姓
      mobile: "", //String	必需	 	手机号码
      province_id: '', //Number	必需	 	省市
      city_id: '', //Number	必需	 	城区
      street_address: '', //String	必需	 	详细街道

      last_name: '', //String	可选	 	名
      phone: '', //String	可选	 	电话
      country_id: '', //Number	可选	1	国家
      town_id: '', //Number	可选	 	镇/地区
      area_id: '', //Number	可选	 	村/ 区域
      street_address_two: '', //String	可选	 	 
      zipcode: '', //Number	可选	 	邮编
      is_default: false, // Bool	可选	False	是否默认地址
      is_overseas: '', // Bool	可选	False	是否海外地址
      user_custom_id: '', // Integer	可选	 海关信息id
      id_card: '', // 海关-身份证号码
      id_card_front: '', // 海关-身份证正面-ID
      id_card_back: '', // 海关-身份证背面-ID
    }
  },

  // 地址选择器
  getAdressPick() {
    console.log(this.data.adressIndex)
    var provinceOid = adressData.k_1_0[this.data.adressIndex[0]].oid
    var countyOid = adressData['k_2_' + provinceOid][this.data.adressIndex[1]].oid
    this.setData({
      provinceList: adressData.k_1_0, //省地址列表---
      cityList: adressData['k_2_' + provinceOid], //市地址列表---
      countyList: adressData['k_3_' + countyOid], //县地址列表--
    })
  },

  // 省发生变化
  provinceChange(e) {
    this.setData({
      adressIndex: e.detail.value
    })
    this.cityChange(adressData.k_1_0[e.detail.value[0]].oid)
  },

  //市
  cityChange(e) {
    this.setData({
      provinceOid: e,
      cityList: adressData['k_2_' + e]
    })
    if (!adressData['k_3_' + adressData['k_2_' + e][0].oid]){
      this.setData({
        countyList:[],
        countyOid:''
      })
      return false
    }
    this.countyChange(adressData['k_2_' + e][this.data.adressIndex[1]].oid)
  },

  // 县发生变化
  countyChange(e) {
    this.setData({
      cityOid: e,
      countyList: adressData['k_3_' + e],
      countyOid: adressData['k_3_' + e][this.data.adressIndex[2]].oid
    })
  },

  // 确定选择地址
  handlePickAdressOver() {
    this.setData({
      ['form.country_id']: this.data.countyOid, //县
      ['form.province_id']: this.data.provinceOid, //省份
      ['form.city_id']: this.data.cityOid, //Integer 市
      isPicker: false
    })
  },

  // 设置为默认的收货地址
  switch1Change(e) {
    console.log(e)
    this.setData({
      ['form.is_default']: e.detail.value
    })
  },

  // 保存新增地址
  storageTap() {
    console.log(this.data.form)
    http.fxPost(api.address_addto, { ...this.data.form }, (result) => {
      console.log(result)
      if (result.success) {
        wx.navigateBack({
          delta: 1
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })

  },

  // 邮政编号
  handleAdressCode(e) {
    console.log(e.detail.value)
    this.setData({
      ['form.zipcode']: e.detail.value
    })
  },

  // 详细的地址
  handleAddressInfo(e) {
    console.log(e.detail.value)
    this.setData({
      ['form.street_address']: e.detail.value
    })
  },

  // 姓名填写---
  ahndleUserName(e) {
    console.log(e.detail.value)
    this.setData({
      ['form.first_name']: e.detail.value
    })
  },

  // 填写手机号码---
  handleMobileCode(e) {
    console.log(e.detail.value)
    this.setData({
      ['form.mobile']: e.detail.value
    })
  },

  // 获取所有的国家---
  getCountry() {
    http.fxGet(api.get_country, {}, (result) => {
      if (result.success) {
        console.log(result)
        this.setData({
          country: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  //国家选择器发生变化的时候
  bindPickerChange(e) {
    console.log(e.detail.value)
    this.setData({
      countryIndex: e.detail.value,
      ['form.country_id']: this.data.country.area_codes[e.detail.value].id
    })
  },


  pickCameraOrPhoto() {
    this.setData({
      is_cameraOrPhoto: false
    })
  },

  // 上传身份证
  handleUploadIdCard (e) {
    let type = e.currentTarget.dataset.type
    this.setData({
      uploadType: type
    })
    wx.chooseImage({
      success: (res) => {
        let tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: this.data.uploadParams.up_endpoint,
          filePath: tempFilePaths[0],
          name: 'file',
          formData: {
            'x:directory_id': this.data.uploadParams.directory_id,
            'x:user_id': this.data.uploadParams.user_id,
            'token': this.data.uploadParams.up_token
          },
          success: (res) => {
            let data = JSON.parse(res.data)
            if (data.ids.length > 0) {
              this.getAssetInfo(data.ids[0])
            }
          }
        })
      }
    })
  },

  // 获取单个附件信息
  getAssetInfo(rid) {
    http.fxGet(api.asset_detail, { rid: rid }, (result) => {
      if (result.success) {
        console.log(result, '附件信息')
        if (this.data.uploadType == 'front') {
          this.setData({
            id_card_front_image: result.data.view_url,
            ['form.id_card_front']: rid
          })
        } else {
          this.setData({
            id_card_back_image: result.data.view_url,
            ['form.id_card_back']: rid
          })
        }
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取上传所需Token
  getUploadToken() {
    http.fxGet(api.user_upload_token, {}, (result) => {
      if (result.success) {
        console.log(result, '上传Token')
        this.setData({
          uploadParams: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // this.getAdress() // 获取所有的地址---
    this.getCountry() // 获取所有的国家---
    this.getAdressPick() // 地址获取---
    this.getUploadToken()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

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

  },
  //模板的显示与隐藏
  T_addressovar() {

    if (this.data.is_template == 0) {
      this.setData({
        is_template: 1
      })
    } else {
      this.setData({
        is_template: 0
      })
    }
  },
  //呼出框取消
  handledeletePick() {
    this.setData({
      isPicker: false
    })
  },
  //呼出框显示
  handleShowPick() {
    this.setData({
      isPicker: true
    })
  }
})