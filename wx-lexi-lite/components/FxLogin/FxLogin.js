// components/FxLogin/FxLogin.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
const common = require('./../../utils/common.js')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 获取手机号码btn

  },

  /**
   * 组件的初始数据
   */
  data: {
    pickAddress:0,//选择好国家
    isDeleteBtn:false, // 删除按钮是否显示
    prompt: false, // 验证码错误提示
    mobaile_number: '', // 手机号码
    getBtnStyle: '', // 输入框的的颜色
    is_time: false, //获取手机及号码的按钮和秒变按钮是否显示---
    verification_code: [], //验证码输入---
    over_button: false, // 完成按钮---
    country_pick: [], // 开放国家列表---
    is_country: false, //国家列表盒子---
    country_code: '+86', // 选择国家的---
  },

  /**
   * 组建钩子函数
   * **/
  created() {
    http.fxGet(api.countries, {}, (result) => {
      console.log(result)
      this.setData({
        country_pick: result.data
      })
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //关闭按钮
    offBtnTap() {
      this.setData({
        is_country: false
      })
    },
    //选择国家的id
    pickCountryTap(e) {
      this.setData({
        pickAddress: e.currentTarget.dataset.index,
        country_code: e.currentTarget.dataset.code,
        is_country:false
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

    // 清空手机号码的按钮
    mobileNumberNullTap() {
      this.setData({
        mobaile_number: '',
        getBtnStyle:false,
        isDeleteBtn:false
      })
    },

    // 输入手机号码
    inputText(e) {
      console.log(e.detail.value)
      var buttonStyle
      var deleteBtn
      this.setData({
        mobaile_number: e.detail.value,
        prompt: false
      })

      if (this.data.mobaile_number) {
        buttonStyle = true
        deleteBtn =true
      } else {
        buttonStyle = false
        deleteBtn = false
      }
      this.setData({
        getBtnStyle: buttonStyle,
        isDeleteBtn: deleteBtn
      })
    },

    //获取手机验证码的按钮
    getNumberTap() {
      var mobileNumber = this.data.mobaile_number - 0
      var getMobalCode = {
        mobile: '', //String	必须	 	手机号
        area_code: this.data.country_code, //String	可选	+86	区号
        page: 'phone_verify_code' //String	必须	 	接口请求地址(如注册页面就是register)
      }
      if (!(/^[1][3,4,5,7,8][0-9]{9}$/.test(mobileNumber))) {
        utils.fxShowToast('输入的手机号码错误')
        return
      }
      getMobalCode.mobile = mobileNumber.toString()
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
        }, 1000)
      }
      http.fxPost(api.auth_get_msm_code, getMobalCode, (result) => {
        console.log(result)
        if (result.success) {
          this.setData({
            testCode: result.data.phone_verify_code
          })
        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    },
    
    //验证码的输入框
    serveNumber(e) {
      this.setData({
        verification_code: e.detail.value,
        prompt: false
      })
      this.verification()
    },

    //校验绑定手机号码的完成按钮是否y颜色
    verification() {
      console.log(this.data.verification_code)
      console.log(this.data.mobaile_number)
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

    // 完成按钮
    handleVerifyOverTap() {
      var params = {
        area_code: this.data.country_code,
        auth_app_id: app.globalData.configInfo.authAppid, // 小程序ID
        openid: app.globalData.jwt.openid, //	用户标识
        mobile: this.data.mobaile_number, // 	手机号
        verify_code: this.data.testCode, //	手机验证码
      }
      if (!this.data.over_button || this.data.verification_code != this.data.testCode) {
        utils.fxShowToast('手机号码或验证码错误')
        this.setData({
          prompt: true
        })
        return
      }
      console.log(params)
      http.fxPost(api.bind_mobile, params, (result) => {
        console.log(result)
        utils.fxShowToast('ok', 'success')
        if (result.success) {
          app.globalData.isLogin = true
          wx.setStorage({
            key: 'jwt',
            data: result.data
          })
          app.globalData.userInfo = {}
          app.globalData.userInfo.avatar = result.data.avatar,
            app.globalData.userInfo.username = result.data.username,
            app.globalData.userInfo.mobile = result.data.mobile,
            app.globalData.userInfo.username = result.data.username
          this.triggerEvent('customevent', {
            offBox: false
          })
          console.log(app.globalData.isLogin)
        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    },

    //防止穿透
    returnTap(){
      return
    }
  }
})