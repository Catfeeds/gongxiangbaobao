// pages/editInfo/editInfo.js
const app = getApp()
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
const adressData = wx.getStorageSync('allPlaces')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // isPicker: false,// 地址呼出框是否显示
   
    rid: '',
    isEditing: true, // 是否为编辑状态
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

    gender: ['女', '男'], // 性别选择器---
    region: ['北京市', '北京市', '朝阳区'], // 地址的pick---
    date:'',// pick的日期---

    userInfo: {}, // 用户的信息---
    uploadParams: {}, // 上传所需参数
    avatar: '', // 用户头像

    // 修改过的信息
    isEdited: false, // 是否编辑过信息
    editUserInfo: {
      username: '', // String  昵称 - 必须保持唯一
      avatar_id: '', // Integer 可选 用户头像ID
      about_me: '', // String 可选 个人介绍
      gender: 1, // Integer 可选 0 性别
      country_id: '', // Integer 可选 国家ID
      province_id: '', // Integer 可选 省ID
      city_id: '', // Integer 可选 市ID
      town_id:'', // 镇
      mail: '', // String 可选 邮箱
      date: '', // String 可选 出生日期
    }
  },

  // 地址s

  // 国家选择器发生变化
  handleChangeCountry(e) {
    let countryIndex = e.detail.value
    let country_id = this.data.countryList[countryIndex].id
    if (this.data.isEditing) { // 编辑状态，改变国家，需恢复省市区默认值
      if (country_id != this.data.editUserInfo.country_id) {
        this.setData({
          'editUserInfo.province_id': '',
          'editUserInfo.city_id': '',
          'editUserInfo.town_id': ''
        })
      }
    }
    this.setData({
      countryIndex: countryIndex,
      'editUserInfo.country_id': country_id
    })

    // this._validateCrossBorder(country_id)

    // 重新获取国家下地点
    this.getAllPlaces()
  },

  // 获取所有的国家
  getCountry() {
    http.fxGet(api.get_country, { status: 1 }, (result) => {
      console.log(result, '国家列表')
      if (result.success) {
        let countries = result.data.area_codes
        this.setData({
          countryList: countries
        })
        // 设置默认值
        let defaultCountryId = countries[0].id
        if (app.globalData.userInfo.profile.country_id==null) { // 新增状态
          this.setData({
            countryIndex: 0,
            'editUserInfo.country_id': defaultCountryId
          })

        } else {
          let countryIndex = 0
          defaultCountryId = this.data.editUserInfo.country_id
          countries.map((item, index) => {
            if (item.id == this.data.editUserInfo.country_id) {
              countryIndex = index
            }
          })
          this.setData({
            countryIndex: countryIndex
          })
        }

        // 验证默认值是否为跨境
        // this._validateCrossBorder(defaultCountryId)

        // 获取某个国家的省市区
        this.getAllPlaces()

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 省市区选择器
  handleRegionsChange(e) {
    console.log(e, '省市区选择器')

    let town_id = 0
    if (this.data.regions.length == 3) {
      town_id = this.data.regions[2][this.data.multiIndex[2]].oid
    }

    this.setData({
      'editUserInfo.province_id': this.data.regions[0][this.data.multiIndex[0]].oid,
      'editUserInfo.city_id': this.data.regions[1][this.data.multiIndex[1]].oid,
      'editUserInfo.town_id': town_id
    })
  },

  // 省市区列选择器
  handleRegionColumnChange(e) {
    console.log(e, '省市区列选择器')
    let column = e.detail.column
    let idx = e.detail.value

    if (column == 0) { // 第1列，省级
      let province = this.data.regions[0][idx]
      let newCities = this.data.allPlaces['k_2_' + province.oid]
      let cityIndex = 0
      let city = newCities[cityIndex]
      if (this.data.regions.length == 3) {
        let newTowns = this.data.allPlaces['k_3_' + city.oid]
        this.setData({
          'regions[1]': newCities,
          'regions[2]': newTowns,
          'multiIndex': [idx, cityIndex, 0]
        })
      } else {
        this.setData({
          'regions[1]': newCities,
          'multiIndex': [idx, cityIndex]
        })
      }
    }

    if (column == 1) { // 第2列，市级
      if (this.data.regions.length == 3) {
        let city = this.data.regions[1][idx]
        let newTowns = this.data.allPlaces['k_3_' + city.oid]

        this.setData({
          'regions[2]': newTowns,
          'multiIndex[1]': idx,
          'multiIndex[2]': 0
        })
      } else {
        this.setData({
          'multiIndex[1]': idx
        })
      }
    }

    if (column == 2) { // 第3列，区级
      this.setData({
        'multiIndex[2]': idx
      })
    }
  },

  // 获取市和区
  getAllPlaces() {
    // 恢复默认值
    // this.setData({
    //   loaded: false,
    //   multiIndex: [0, 0, 0]
    // })
    http.fxGet(api.provinces_cities, {
      country_id: this.data.editUserInfo.country_id
    }, (result) => {
      console.log(result, '省市区')
      if (result.success) {
        let allPlaces = result.data
        let regions = this.data.regions
        let provinceIndex = 0
        let cityIndex = 0
        let townIndex = 0

        regions[0] = allPlaces['k_1_0']
        if (app.globalData.userInfo.profile.province_id == null) { // 编辑状态
          provinceIndex = this._getCurrentIndex(regions[0], this.data.editUserInfo.province_id)
          // 获取市级
          regions[1] = allPlaces['k_2_' + regions[0][provinceIndex].oid]
          cityIndex = this._getCurrentIndex(regions[1], this.data.editUserInfo.city_id)
          // 获取区级
          let townKey = 'k_3_' + regions[1][cityIndex].oid
          if (Object.keys(allPlaces).indexOf(townKey) !== -1) {

            regions[2] = allPlaces[townKey]
            townIndex = this._getCurrentIndex(regions[2], this.data.editUserInfo.town_id)
            console.log(townIndex,"索引")
            // 设置默认值
            this.setData({
              loaded: true,
              allPlaces: allPlaces,
              regions: regions,
              multiIndex: [provinceIndex, cityIndex, townIndex]
            })
          } else { // 区级不存在
            this.setData({
              loaded: true,
              allPlaces: allPlaces,
              regions: [regions[0], regions[1]],
              multiIndex: [provinceIndex, cityIndex]
            })
          }
        } else { // 新增状态
          // 获取默认值
          let province = regions[0][0]
          // 获取市级
          regions[1] = allPlaces['k_2_' + province.oid]
          let city = regions[1][0]
          // 获取区级
          let townKey = 'k_3_' + city.oid
          if (Object.keys(allPlaces).indexOf(townKey) !== -1) {
            regions[2] = allPlaces[townKey]
            // 设置默认值
            this.setData({
              loaded: true,
              allPlaces: allPlaces,
              regions: regions,
              'editUserInfo.province_id': province.oid,
              'editUserInfo.city_id': city.oid,
              'editUserInfo.town_id': regions[2][0].oid
            })

            console.log(this.data.editUserInfo,"这是初始的市级地址")
          } else { // 区级不存在
            this.setData({
              loaded: true,
              allPlaces: allPlaces,
              regions: [regions[0], regions[1]],
              multiIndex: [0, 0],
              'editUserInfo.province_id': province.oid,
              'editUserInfo.city_id': city.oid,
              'editUserInfo.town_id': 0
            })
          }
        }
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取当前地址信息
  getAddressInfo() {
  
    let userProfile = app.globalData.userInfo.profile

    console.log(userProfile)
      
    console.log(userProfile, '地址详情')
    let _address = userProfile
        this.setData({
          currentAddress: _address,
          'editUserInfo.first_name': _address.first_name,
          'editUserInfo.mobile': _address.mobile,
          'editUserInfo.country_id': _address.country_id,
          'editUserInfo.province_id': _address.province_id,
          'editUserInfo.city_id': _address.city_id,
          'editUserInfo.town_id': _address.town_id,
          'editUserInfo.street_address': _address.street_address,
          'editUserInfo.zipcode': _address.zipcode,
          'editUserInfo.is_default': _address.is_default
        })
        // 获取所有国家
        this.getCountry()

  },

  // 获取当前索引
  _getCurrentIndex(list, v) {
    let currentIndex = 0
    list.map((item, index) => {
      if (item.oid == v) {
        currentIndex = index
      }
    })

    console.log(currentIndex,"默认的索引")
    return currentIndex
  },

  // 地址e


  // name 输入时候
  handleNameInput(e){
    console.log(e.detail.value)
    this.setData({
      isEdited: true,
      ['editUserInfo.username']: e.detail.value
    })
  },

  // 个人介绍
  handleOwnerIntroduce(e) {
    console.log(e.detail.value, '个人介绍')
    this.setData({
      isEdited: true,
      ['editUserInfo.about_me']: e.detail.value
    })
  },

  // 邮箱
  hanleOwnerMail(e) {
    console.log(e)
    this.setData({
      isEdited: true,
      ['editUserInfo.mail']: e.detail.value
    })
  },

  // 时间选择
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      isEdited: true,
      ['editUserInfo.date']: e.detail.value
    })
  },

  // 性别选择
  bindGenderChange(e) {
    this.setData({
      isEdited: true,
      ['editUserInfo.gender']: parseInt(e.detail.value)
    })
  },

  // 保存按钮
  handlePreserveTap() {
    console.log(this.data.editUserInfo,"修改的信息")
    http.fxPut(api.user, this.data.editUserInfo, (result)=>{
      console.log(result)
      if (result.success) {
        wx.showToast({
          title: '已保存',
          icon: 'success',
          duration: 1200,
          success: () => {
            // 返回上一页
            wx.navigateBack({
              delta: 1
            })
          }
        })
        this.setData({
          isEdited: false
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 上传头像
  handleUploadAvatar () {
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
            console.log(res,"上传后的图片")

            this.setData({
              'editUserInfo.avatar_id':res.ids
            })

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
  getAssetInfo (rid) {
    http.fxGet(api.asset_detail, { rid: rid }, (result) => {
      if (result.success) {
        console.log(result, '附件信息')
        app.globalData.userInfo.profile.avatar = result.data.view_url
        this.setData({
          isEdited: true,
          userInfo: app.globalData.userInfo,
          ['editUserInfo.avatar_id']: rid
        })
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取上传所需Token
  getUploadToken () {
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


  // 获取用户信息 ---
  getUserInfo() {

    http.fxGet(api.users_profile,{},(result)=>{
      console.log(result,"用户的个人资料")
      if (result.success) {
        this.setData({
          userInfo: result.data
        })

        let userProfile = this.data.userInfo.profile
        console.log(this.data.userInfo, "用户的资料")

        if (userProfile.country_id == null) {
          this.getAddressInfo()
        } else {
          this.getCountry() // 获取所有的国家
        }

        let time = utils.timestamp2string(userProfile.created_at, 'cn')

        this.setData({
          ['editUserInfo.avatar_id']: userProfile.avatar_id, // Integer 可选 用户头像ID
          ['editUserInfo.username']: userProfile.username, // String  昵称 - 必须保持唯一
          ['editUserInfo.mail']: userProfile.mail, // String 可选 邮箱
          'editUserInfo.country_id': userProfile.country_id,
          'editUserInfo.province_id': userProfile.province_id,
          'editUserInfo.city_id': userProfile.city_id,
          ['editUserInfo.about_me']: userProfile.about_me, // String 可选 个人介绍
          ['editUserInfo.date']: userProfile.data,

          // 'editUserInfo.first_name': userProfile.first_name,
          'editUserInfo.mobile': userProfile.mobile,

          'editUserInfo.town_id': userProfile.town_id,
          'editUserInfo.street_address': userProfile.street_address,
          'editUserInfo.zipcode': userProfile.zipcode,
          'editUserInfo.is_default': userProfile.is_default
        })

        console.log(this.data.editUserInfo, "初始信息")

        // 获取所有国家
        this.getCountry()

      }
    })
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options,"uid")

    let rid = options.rid
    this.setData({
      rid: rid,
    })



    this.getUserInfo() // 获取用户信息
    this.getUploadToken()

    // this.getAddressInfo()
    // this.getCountry() // 获取所有的国家

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
    console.log(5)

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function(e) {

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
  // //呼出框取消
  // handledeletePick(){
  //   this.setData({
  //     isPicker:false
  //   })
  // },
  // //呼出框显示
  // handleShowPick(){
  //   this.setData({
  //     isPicker: true
  //   })
  // }
})