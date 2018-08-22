// pages/findInfo/findInfo.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
let wxparse = require("../../wxParse/wxParse.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    rid:'', // rid
    category:'', // 频道的名字
    liveInfo:'',// 详情
    product: [
      {
        category_id: 148,
        commission_price: 0.12,
        commission_rate: 1,
        cover: "https://kg.erp.taihuoniao.com/20180810/3751FhWSjNZn-LWZ9kJO9dpB-xCk1bj3.jpg",
        cover_id: 3541,
        custom_details: "",
        delivery_country: "中国",
        delivery_country_id: 1,
        features: "个风格化法国",
        have_distributed: false,
        id_code: "",
        is_custom_made: true,
        is_custom_service: false,
        is_distributed: true,
        is_free_postage: false,
        is_made_holiday: true,
        is_proprietary: false,
        is_sold_out: false,
        like_count: 0,
        made_cycle: 12,
        material_id: 1,
        material_name: "棉.麻",
        max_price: 12,
        max_sale_price: 0,
        min_price: 12,
        min_sale_price: 0,
        modes:
          (2)["黑色", "撒上"],
        name: "阿三",
        published_at: 1533890325,
        real_price: 12,
        real_sale_price: 0,
        rid: "8218957346",
        second_category_id: 148,
        status: 1,
        sticked: false,
        store_name: "都能收到你的",
        store_rid: "92436958",
        style_id: 1,
        style_name: "可爱",
        top_category_id: 130,
        total_stock: 2,
      },
      {
        category_id: 148,
        commission_price: 0.12,
        commission_rate: 1,
        cover: "https://kg.erp.taihuoniao.com/20180810/3751FhWSjNZn-LWZ9kJO9dpB-xCk1bj3.jpg",
        cover_id: 3541,
        custom_details: "",
        delivery_country: "中国",
        delivery_country_id: 1,
        features: "个风格化法国",
        have_distributed: false,
        id_code: "",
        is_custom_made: true,
        is_custom_service: false,
        is_distributed: true,
        is_free_postage: false,
        is_made_holiday: true,
        is_proprietary: false,
        is_sold_out: false,
        like_count: 0,
        made_cycle: 12,
        material_id: 1,
        material_name: "棉.麻",
        max_price: 12,
        max_sale_price: 0,
        min_price: 12,
        min_sale_price: 0,
        modes:
          (2)["黑色", "撒上"],
        name: "阿三",
        published_at: 1533890325,
        real_price: 12,
        real_sale_price: 0,
        rid: "8218957346",
        second_category_id: 148,
        status: 1,
        sticked: false,
        store_name: "都能收到你的",
        store_rid: "92436958",
        style_id: 1,
        style_name: "可爱",
        top_category_id: 130,
        total_stock: 2,
      },
      {
        category_id: 148,
        commission_price: 0.12,
        commission_rate: 1,
        cover: "https://kg.erp.taihuoniao.com/20180810/3751FhWSjNZn-LWZ9kJO9dpB-xCk1bj3.jpg",
        cover_id: 3541,
        custom_details: "",
        delivery_country: "中国",
        delivery_country_id: 1,
        features: "个风格化法国",
        have_distributed: false,
        id_code: "",
        is_custom_made: true,
        is_custom_service: false,
        is_distributed: true,
        is_free_postage: false,
        is_made_holiday: true,
        is_proprietary: false,
        is_sold_out: false,
        like_count: 0,
        made_cycle: 12,
        material_id: 1,
        material_name: "棉.麻",
        max_price: 12,
        max_sale_price: 0,
        min_price: 12,
        min_sale_price: 0,
        modes:
          (2)["黑色", "撒上"],
        name: "阿三",
        published_at: 1533890325,
        real_price: 12,
        real_sale_price: 0,
        rid: "8218957346",
        second_category_id: 148,
        status: 1,
        sticked: false,
        store_name: "都能收到你的",
        store_rid: "92436958",
        style_id: 1,
        style_name: "可爱",
        top_category_id: 130,
        total_stock: 2,
      },
      {
        category_id: 148,
        commission_price: 0.12,
        commission_rate: 1,
        cover: "https://kg.erp.taihuoniao.com/20180810/3751FhWSjNZn-LWZ9kJO9dpB-xCk1bj3.jpg",
        cover_id: 3541,
        custom_details: "",
        delivery_country: "中国",
        delivery_country_id: 1,
        features: "个风格化法国",
        have_distributed: false,
        id_code: "",
        is_custom_made: true,
        is_custom_service: false,
        is_distributed: true,
        is_free_postage: false,
        is_made_holiday: true,
        is_proprietary: false,
        is_sold_out: false,
        like_count: 0,
        made_cycle: 12,
        material_id: 1,
        material_name: "棉.麻",
        max_price: 12,
        max_sale_price: 0,
        min_price: 12,
        min_sale_price: 0,
        modes:
          (2)["黑色", "撒上"],
        name: "阿三",
        published_at: 1533890325,
        real_price: 12,
        real_sale_price: 0,
        rid: "8218957346",
        second_category_id: 148,
        status: 1,
        sticked: false,
        store_name: "都能收到你的",
        store_rid: "92436958",
        style_id: 1,
        style_name: "可爱",
        top_category_id: 130,
        total_stock: 2,
      },
      {
        category_id: 148,
        commission_price: 0.12,
        commission_rate: 1,
        cover: "https://kg.erp.taihuoniao.com/20180810/3751FhWSjNZn-LWZ9kJO9dpB-xCk1bj3.jpg",
        cover_id: 3541,
        custom_details: "",
        delivery_country: "中国",
        delivery_country_id: 1,
        features: "个风格化法国",
        have_distributed: false,
        id_code: "",
        is_custom_made: true,
        is_custom_service: false,
        is_distributed: true,
        is_free_postage: false,
        is_made_holiday: true,
        is_proprietary: false,
        is_sold_out: false,
        like_count: 0,
        made_cycle: 12,
        material_id: 1,
        material_name: "棉.麻",
        max_price: 12,
        max_sale_price: 0,
        min_price: 12,
        min_sale_price: 0,
        modes:
          (2)["黑色", "撒上"],
        name: "阿三",
        published_at: 1533890325,
        real_price: 12,
        real_sale_price: 0,
        rid: "8218957346",
        second_category_id: 148,
        status: 1,
        sticked: false,
        store_name: "都能收到你的",
        store_rid: "92436958",
        style_id: 1,
        style_name: "可爱",
        top_category_id: 130,
        total_stock: 2,
      },
      {
        category_id: 148,
        commission_price: 0.12,
        commission_rate: 1,
        cover: "https://kg.erp.taihuoniao.com/20180810/3751FhWSjNZn-LWZ9kJO9dpB-xCk1bj3.jpg",
        cover_id: 3541,
        custom_details: "",
        delivery_country: "中国",
        delivery_country_id: 1,
        features: "个风格化法国",
        have_distributed: false,
        id_code: "",
        is_custom_made: true,
        is_custom_service: false,
        is_distributed: true,
        is_free_postage: false,
        is_made_holiday: true,
        is_proprietary: false,
        is_sold_out: false,
        like_count: 0,
        made_cycle: 12,
        material_id: 1,
        material_name: "棉.麻",
        max_price: 12,
        max_sale_price: 0,
        min_price: 12,
        min_sale_price: 0,
        modes:
          (2)["黑色", "撒上"],
        name: "阿三",
        published_at: 1533890325,
        real_price: 12,
        real_sale_price: 0,
        rid: "8218957346",
        second_category_id: 148,
        status: 1,
        sticked: false,
        store_name: "都能收到你的",
        store_rid: "92436958",
        style_id: 1,
        style_name: "可爱",
        top_category_id: 130,
        total_stock: 2,
      },

    ]
  },




  // 获取生活志详情
  getLiveInfo(){
    http.fxGet(api.life_records_detail, {rid:this.data.rid},(result)=>{
      console.log(result,"生活志详情")
      if (result.success) {
        result.data.published_at = utils.timestamp2string(result.data.published_at,"date")

        this.setData({
          liveInfo: result.data
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
    console.log(options)
    this.setData({
      rid: options.rid,
      category: options.category,
    })

    this.getLiveInfo() // 生活志详情
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

  }
})