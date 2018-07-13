// pages/address/address.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    allTowns:[], //所有的县镇列表---
    allTownsIndex:[], //所有的县镇列表index---
    allCity:[],// 所有的市区列表---
    allCityIndex:[],// 所有的市区列表index---
    allProvince:[], // 所有的省份列表---
    allProvinceIndex:[], // 所有的省份列表index---
    AllAdress:[], //获取所有的地区 ---
    country:[], //所有的国家的--
    countryIndex:[], //所有的国家的index--
    is_cameraOrPhoto:false,
    is_template: 0,
    addressInfo: [
      {
        s: "北京",
        sh: ["海淀", "朝阳", "大型", "大红门"],
        x: ["海淀", "朝阳", "大型", "大红门"]
      },
      {
        s: "上海",
        sh: ["海淀", "朝阳", "大型", "大红门"],
        x: ["海淀", "朝阳", "大型", "大红门"]
      }
    ],
    s:[],
    sh:[],
    x:[],
    //表单信息---
    form:{
      first_name:'',//String	必需	 	姓
      mobile: "",//String	必需	 	手机号码
      province_id: '',//Number	必需	 	省市
      city_id: '',//Number	必需	 	城区
      street_address: '',//String	必需	 	详细街道

      last_name:''	,//String	可选	 	名
      phone:''	,//String	可选	 	电话
      country_id:''	,//Number	可选	1	国家
      town_id:''	,//Number	可选	 	镇/地区
      area_id:''	,//Number	可选	 	村/ 区域
      street_address_two:''	,//String	可选	 	 
      zipcode:''	,//Number	可选	 	邮编
      is_default:''	,//Bool	可选	False	是否默认地址
      is_overseas:''	,//Bool	可选	False	是否海外地址
      user_custom_id:''	,//Integer	可选	 	海关信息id
    }
  },
  //保存新增地址
  storageTap() {
    http.fxPost(api.address_addto, { ...this.data.form},(result)=>{
      console.log(result)
    })
    wx.navigateBack({
      delta: 1
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
  //姓名填写---
  ahndleUserName(e) {
    console.log(e.detail.value)
    this.setData({
      ['form.first_name']: e.detail.value
    })
  },
  //填写手机号码---
  handleMobileCode (e) {
    console.log(e.detail.value)
    this.setData({
      ['form.mobile']: e.detail.value
    })
  },
  // 获取所有的地址---
  getAdress(){
    http.fxGet(api.all_places, {country_id:1},(result)=>{
      console.log(result)
      if(result.success){
        this.setData({
          AllAdress:result.data
        })
      }else{
        
      }
    })
  },
  //获取所有的省份
  getAllProvinces(e = 1) {
    http.fxGet(api.place_provinces, {country_id:e},(result)=>{
      console.log(result,'所有的省份')
      if(result.success){
        this.setData({
          allProvince:result.data
        })
      }else{
        utils.fxShowToast(result.status.message)
      }
    })
  },
  // 省发生变化---
  bindProvinceChange(e) {
    
    this.setData({
      allProvinceIndex: e.detail.value,
      ['form.province_id']: this.data.allProvince[e.detail.value].oid
    })
    console.log(e.detail.value, this.data.allProvince[e.detail.value].oid)
    this.getAllCity(this.data.allProvince[e.detail.value].oid)
  },
  //获取所有的市区---
  getAllCity(e = 1) {
    http.fxGet(api.place_cities.replace(/:pid/g,e), {country_id:1},(result)=>{
      console.log(result,'所有的市')
      if (result.success) {
        this.setData({
          allCity: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  // 市区发生变化---
  bindCityChange(e) {
    this.setData({
      allCityIndex: e.detail.value,
      ['form.city_id']: this.data.allCity[e.detail.value].oid
    })
    console.log(e.detail.value, this.data.allCity[e.detail.value].oid)
    this.getAllTowns(this.data.allCity[e.detail.value].oid)
  },
  //获取所有的县---
  getAllTowns(e=72) {
    http.fxGet(api.place_towns.replace(/:pid/g, e), {country_id:1},(result)=>{
      console.log(result,'所有的县')
      if (result.success) {
        this.setData({
          allTowns: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },
  // 县发生变化---
  bindAllTownsChange(e) {
    console.log(e.detail.value)
    this.setData({
      allTownsIndex: e.detail.value,
      ['form.town_id']: this.data.allTowns[e.detail.value].oid
    })
  },
  // 获取所有的国家---
  getCountry() {
    http.fxGet(api.get_country,{},(result)=>{
      if (result.success){
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
  //要填写在地址栏里面的地址信息
  addInfomation(e){
    var index=e.detail.value
    console.log(index)
    this.setData({
      s:this.data.addressInfo[index[0]].s,
      sh:this.data.addressInfo[index[0]].sh[index[1]],
      x: this.data.addressInfo[index[0]].sh[index[2]]
    })
  },

  pickCameraOrPhoto(){
    this.setData({
      is_cameraOrPhoto:false
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.getAdress() // 获取所有的地址---
    this.getCountry() // 获取所有的国家---
    this.getAllProvinces() //获取省份---
    this.getAllCity() // 获取所有的市---
    this.getAllTowns() // 获取所有的镇---

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

})