// pages/dynamic/dynamic.js
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
    dynamicList: {
      "count": 5,
      "lines": [{
          created_time :"2018年8月8日",
          "created_at": 1534094558, // 发布时间
          "shop_window": { // 橱窗信息
            "comment_count": null, // 评论数
            "description": "去去去去去去去去去去", // 描述
            "is_follow": false, // 是否关注过
            "keywords": [],
            "like_count": 66, // 喜欢的人数
            "product_count": 5, // 商品数量
            "product_covers": [ // 商品图片
              "../../images/timg.jpg",
              "../../images/timg.jpg",
              "../../images/timg.jpg",
              "../../images/timg.jpg",
              "../../images/timg.jpg",
            ],
            "rid": 1,
            "title": "啊啊啊啊啊啊啊啊啊", // 标题
            "user_avatar": "../../images/timg.jpg", // 用户头像
            "user_name": "亮晶晶" // 用户名
          }
        },
        {
          "created_at": 1534094558, // 发布时间
          "shop_window": { // 橱窗信息
            "comment_count": null, // 评论数
            "description": "去去去去去去去去去去", // 描述
            "is_follow": false, // 是否关注过
            "keywords": [],
            "like_count": null, // 喜欢的人数
            "product_count": 5, // 商品数量
            "product_covers": [ // 商品图片
              "../../images/timg.jpg",
              "../../images/timg.jpg",
              "../../images/timg.jpg",
              "../../images/timg.jpg",
              "../../images/timg.jpg",
            ],
            "rid": 1,
            "title": "啊啊啊啊啊啊啊啊啊", // 标题
            "user_avatar": "../../images/timg.jpg", // 用户头像
            "user_name": "亮晶晶" // 用户名
          }
        },
      ],
    },

    // 动态信息

    // 判断是拼接橱窗还是关注
    showcaseOrWatch: 1, //1为橱窗 2为关注

    //动态信息的参数
    dynamicParams: {
      uid: "", //String	必须	 	被查看用户编号
      page: 1, //Number	可选	1	当前页码
      per_page: 10, //Number	可选	10	每页数量
    }


  },

  // 获取其他人的动态
  getOtherDynamic(e) {
    console.log(456)
    http.fxGet(api.users_other_user_dynamic,this.data.dynamicParams, (result) => {
      if (result.success) {
        console.log(result, "获取其他人的动态")
        let data = result.data

        data.lines.forEach((v, i) => {
          v.created_time = utils.timestamp2string(v.created_at, "cn")
        })

        this.setData({
          dynamicList: data
        })

        console.log(this.data.dynamicList)
      } else {
        console.log(123)
        utils.fxShowToast(result.status.message)
      }
    });
  },

  // 查看自己的动态
  getMyDynamic() {
    http.fxGet(api.users_user_dynamic, {}, (result) => {
      console.log(result, "自己的动态")
      if (result.success) {
        this.setData({
          dynamicList: result.data
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    });
  },


  /**
   * 生命周期函数--监听页面加载 
   */
  onLoad: function(options) {
    console.log(options.from)

    // 其他人的动态
    if (options.from == "people") {
      console.log(options.from)
      this.setData({
        ['dynamicParams.uid']: options.uid,
        showcaseOrWatch: 2
      })
      this.getOtherDynamic(options.uid) // 获取其他人的动态


    } else {
      this.getMyDynamic()
      this.setData({
        showcaseOrWatch: 1 // 获取自己的动态
      })
    }

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