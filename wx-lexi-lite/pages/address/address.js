// pages/address/address.js
const app = getApp()

const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')
const utils = require('./../../utils/util.js')
const common = require('./../../utils/common.js')

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
    // 表单信息---
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

  // 保存新增地址
  handleSubmitAddress() {
    if (!this.data.isEditing) {
      http.fxPost(api.address_addto, { ...this.data.form
      }, (result) => {
        utils.logger(result, '新增地址')
        if (result.success) {
          if (this.data.from_ref == 'checkout') {
            wx.navigateBack({
              delta: 1
            })
          } else {
            wx.redirectTo({
              url: '../receiveAddress/receiveAddress',
            })
          }
        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    } else {
      this.setData({
        'form.rid': this.data.rid
      })
      utils.logger(this.data.form)
      http.fxPut(api.address_addto, { ...this.data.form
      }, (result) => {
        utils.logger(result, '更新地址')
        if (result.success) {
          if (this.data.from_ref == 'checkout') {
            wx.navigateBack({
              delta: 1
            })
          } else {
            wx.redirectTo({
              url: '../receiveAddress/receiveAddress',
            })
          }
        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    }

  },

  // 删除地址
  handleDeleteAddress() {
    if (this.data.isEditing) { // 编辑地址时
      http.fxDelete(api.address_delete.replace(/:rid/g, this.data.rid), {}, (result) => {
        if (result.success) {
          wx.redirectTo({
            url: '../receiveAddress/receiveAddress',
          })
        } else {
          utils.fxShowToast(result.status.message)
        }
      })
    } else { // 直接调回列表
      wx.redirectTo({
        url: '../receiveAddress/receiveAddress',
      })
    }
  },

  // 姓名
  handleUserName(e) {
    this.setData({
      'form.first_name': e.detail.value
    })
  },

  // 填写手机号码
  handleMobile(e) {
    this.setData({
      'form.mobile': e.detail.value
    })
  },

  // 邮政编号
  handleZipCode(e) {
    this.setData({
      'form.zipcode': e.detail.value
    })
  },

  // 详细的地址
  handleStreetInfo(e) {
    utils.logger(e.detail.value)
    this.setData({
      'form.street_address': e.detail.value
    })
  },

  // 设置为默认的收货地址
  handleDefaultChange(e) {
    this.setData({
      'form.is_default': e.detail.value
    })
  },

  // 设置身份证号
  handleIdCardChange(e) {
    this.setData({
      'form.id_card': e.detail.value
    })
  },

  // 国家选择器发生变化
  handleChangeCountry(e) {
    let countryIndex = e.detail.value
    let country_id = this.data.countryList[countryIndex].id
    if (this.data.isEditing) { // 编辑状态，改变国家，需恢复省市区默认值
      if (country_id != this.data.form.country_id) {
        this.setData({
          'form.province_id': '',
          'form.city_id': '',
          'form.town_id': ''
        })
      }
    }
    this.setData({
      countryIndex: countryIndex,
      'form.country_id': country_id
    })

    this._validateCrossBorder(country_id)

    // 重新获取国家下地点
    this.getAllPlaces()
  },

  // 验证是否为跨境订单
  _validateCrossBorder(country_id) {
    // 验证是否为跨境地址
    utils.logger(app.globalData.deliveryCountries, '发货国家')
    let deliveryCountries = app.globalData.deliveryCountries
    if (deliveryCountries.length > 0 && deliveryCountries.indexOf(country_id) == -1) {
      this.setData({
        'form.is_overseas': true,
        needUserCustom: 1
      })
      // 此地址为跨境，需验证身份信息
      this.getUserIdCard()
    } else {
      this.setData({
        'form.is_overseas': false,
        needUserCustom: 0
      })
    }
  },

  // 省市区选择器
  handleRegionsChange(e) {
    utils.logger(e, '省市区选择器')

    let town_id = 0
    if (this.data.regions.length == 3) {
      town_id = this.data.regions[2][this.data.multiIndex[2]].oid
    }

    this.setData({
      'form.province_id': this.data.regions[0][this.data.multiIndex[0]].oid,
      'form.city_id': this.data.regions[1][this.data.multiIndex[1]].oid,
      'form.town_id': town_id
    })
  },

  // 省市区列选择器
  handleRegionColumnChange(e) {
    utils.logger(e, '省市区列选择器')
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

  // 上传身份证
  handleUploadIdCard(e) {
    let type = e.currentTarget.dataset.type
    this.setData({
      uploadType: type
    })
    wx.chooseImage({
      count: 1,
      success: (res) => {
        let tempFilePaths = res.tempFilePaths
        const uploadTask = http.fxUpload(api.asset_upload, tempFilePaths[0], {}, (result) => {
          utils.logger(result)
          if (result.data.length > 0) {
            if (this.data.uploadType == 'front') {
              this.setData({
                isUploadingFront: false,
                uploadFrontStatus: 100
              })

              this.getAssetFrontInfo(result.data[0])
            } else {
              this.setData({
                isUploadingBack: false,
                uploadBackStatus: 100
              })

              this.getAssetBackInfo(result.data[0])
            }
          }
        })

        uploadTask.onProgressUpdate((res) => {
          utils.logger('上传进度', res.progress)

          let percent = res.progress
          if (type == 'front') {
            this.setData({
              isUploadingFront: percent == 100 ? false : true,
              uploadFrontStatus: percent
            })
          }

          if (type == 'back') {
            this.setData({
              isUploadingBack: percent == 100 ? false : true,
              uploadBackStatus: percent
            })
          }

        })
      }
    })
  },

  // 获取海关所需身份证信息
  getUserIdCard() {
    if (!this.data.form.first_name || !this.data.form.mobile) {
      return
    }
    http.fxGet(api.address_user_custom, {
      user_name: this.data.form.first_name,
      mobile: this.data.form.mobile
    }, (result) => {
      utils.logger(result, '海关身份证')
      if (result.success) {
        if (Object.keys(result.data).length > 0) {
          this.setData({
            userCustom: result.data,
            id_card_front_image: result.data.id_card_front.view_url, // 身份证正面
            id_card_back_image: result.data.id_card_back.view_url, // 身份证背面
            'form.id_card': result.data.id_card, // 海关-身份证号码
            'form.id_card_front': result.data.id_card_front.id || '', // 海关-身份证正面-ID
            'form.id_card_back': result.data.id_card_back.id || '' // 海关-身份证背面-ID
          })
        }
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取单个附件信息
  getAssetFrontInfo(asset) {
    this.setData({
      id_card_front_image: asset.view_url,
      'form.id_card_front': asset.id || ''
    })
  },

  // 获取身份证背面信息
  getAssetBackInfo(asset) {
    this.setData({
      id_card_back_image: asset.view_url,
      'form.id_card_back': asset.id || ''
    })
  },

  // 获取所有的国家
  getCountry() {
    http.fxGet(api.get_country, {
      status: 1
    }, (result) => {
      utils.logger(result, '国家列表')
      if (result.success) {
        let countries = result.data.area_codes
        this.setData({
          countryList: countries
        })

        // 设置默认值
        let defaultCountryId = countries[0].id
        if (!this.data.isEditing) { // 新增状态
          this.setData({
            countryIndex: 0,
            'form.country_id': defaultCountryId
          })

        } else {
          let countryIndex = 0
          defaultCountryId = this.data.form.country_id
          countries.map((item, index) => {
            if (item.oid == this.data.form.country_id) {
              countryIndex = index
            }
          })
          this.setData({
            countryIndex: countryIndex
          })
        }

        // 验证默认值是否为跨境
        this._validateCrossBorder(defaultCountryId)

        // 获取某个国家的省市区
        this.getAllPlaces()

      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  // 获取市和区
  getAllPlaces() {
    wx.showLoading({
      title: '加载中...',
    })

    // 恢复默认值
    this.setData({
      loaded: false,
      multiIndex: [0, 0, 0]
    })

    app.getAddressPlaces(this.data.form.country_id, (allPlaces) => {
      wx.hideLoading()
      if (allPlaces) {
        let regions = this.data.regions
        let provinceIndex = 0
        let cityIndex = 0
        let townIndex = 0

        regions[0] = allPlaces['k_1_0']
        if (this.data.isEditing) { // 编辑状态
          provinceIndex = this._getCurrentIndex(regions[0], this.data.form.province_id)
          // 获取市级
          regions[1] = allPlaces['k_2_' + regions[0][provinceIndex].oid]
          cityIndex = this._getCurrentIndex(regions[1], this.data.form.city_id)
          // 获取区级
          let townKey = 'k_3_' + regions[1][cityIndex].oid
          if (Object.keys(allPlaces).indexOf(townKey) !== -1) {
            regions[2] = allPlaces[townKey]
            townIndex = this._getCurrentIndex(regions[2], this.data.form.town_id)
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
              'form.province_id': province.oid,
              'form.city_id': city.oid,
              'form.town_id': regions[2][0].oid
            })
          } else { // 区级不存在
            this.setData({
              loaded: true,
              allPlaces: allPlaces,
              regions: [regions[0], regions[1]],
              multiIndex: [0, 0],
              'form.province_id': province.oid,
              'form.city_id': city.oid,
              'form.town_id': 0
            })
          }
        }
      } else {
        utils.fxShowToast('地址加载有误！')
      }
    })
  },

  // 获取当前索引
  _getCurrentIndex(list, v) {
    let currentIndex = 0
    list.map((item, index) => {
      if (item.oid == v) {
        currentIndex = index
      }
    })
    return currentIndex
  },

  // 获取当前地址信息
  getAddressInfo() {
    http.fxGet(api.address_info.replace(/:rid/, this.data.rid), {}, (result) => {
      if (result.success) {
        utils.logger(result, '地址详情')
        let _address = result.data
        this.setData({
          currentAddress: _address,
          'form.first_name': _address.first_name,
          'form.mobile': _address.mobile,
          'form.country_id': _address.country_id,
          'form.province_id': _address.province_id,
          'form.city_id': _address.city_id,
          'form.town_id': _address.town_id,
          'form.street_address': _address.street_address,
          'form.zipcode': _address.zipcode,
          'form.is_default': _address.is_default
        })
        // 获取所有国家
        this.getCountry()
      } else {
        utils.fxShowToast(result.status.message)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
    let rid = options.rid || '' // 编辑地址
    // 验证是否需要设置海关信息
    let needUserCustom = options.need_custom || 0
    let is_overseas = false
    if (needUserCustom == 1) {
      is_overseas = true
    }
    // 是否为编辑状态
    let isEditing = false
    if (rid) {
      isEditing = true
    }

    this.setData({
      rid: rid,
      isEditing: isEditing,
      needUserCustom: needUserCustom,
      'form.is_overseas': is_overseas,
      from_ref: options.from_ref || '' // 来源
    })

    if (isEditing) {
      this.getAddressInfo()
    } else {
      this.getCountry() // 获取所有的国家
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
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
    return app.shareLeXi()
  },

  // 模板的显示与隐藏
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

  // 呼出框取消
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