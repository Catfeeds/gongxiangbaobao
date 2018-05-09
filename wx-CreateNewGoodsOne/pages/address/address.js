// pages/address/address.js
const http = require('./../../utils/http.js')
const api = require('./../../utils/api.js')

//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 来源：ucenter: 个人中心，orderCheckout: 结算页
    prev_ref: 'ucenter',
    editStatus: false,
    isEditing: false,
    isEmpty: false,
    index: 0,
    provinces: [],
    cindex: 0,
    current_cities: [],
    tindex: 0,
    current_towns: [],
    aindex: 0,
    current_areas: [],
    addressList: [],
    newAddress: {
      first_name: '',
      mobile: '',
      zipcode: '',
      street_address: '',
      is_default: false
    }
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    // 来源
    if (options && options.prev_ref) {
      this.setData({
        prev_ref: options.prev_ref
      })
    }

    // 获取省级列表
    this.getProvinces()
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
    this.getAddressList()
  },

  /**
   * 获取地址列表
   */
  getAddressList () {
    const that = this
    let params = {}

    http.fxGet(api.addresses, params, function (result) {
      if (result.success) {
        that.setData({
          addressList: result.data
        })

        // 如果地址列表为空，自动显示添加地址栏
        if (!that.data.addressList.length) {
          that.handleNewAddress()
        }
      }
    })
  },

  /**
   * 获取所有省级列表
   */
  getProvinces () {
    const that = this
    let params = {}

    http.fxGet(api.place_provinces, params, function (result) {
      if (result.success) {
        that.setData({
          provinces: result.data
        })

        // 查找匹配index
        if (that.editStatus && that.newAddress) {
          that.data.provinces.foreach(function(item, k) {
              if (item.province == that.newAddress.province) {
                that.setData({
                  index: k
                })
              }
          })
        }

        // 同步触发默认值
        that.getCities(that.data.provinces[that.data.index].oid)
      }
    })
  },

  /**
   * 获取市级列表
   */
  getCities (pid) {
    const that = this
    let params = {}

    http.fxGet(api.place_cities.replace(/:pid/g, pid), params, function (result) {
      if (result.success) {
        that.setData({
          current_cities: result.data
        })

        // 查找匹配cindex
        if (that.editStatus && that.newAddress) {
          that.data.current_cities.foreach(function (item, k) {
            console.log(k)
            if (item.city == that.newAddress.city) {
              that.setData({
                cindex: k
              })
            }
          })
        }

        // 同步触发默认值
        that.getTowns(that.data.current_cities[that.data.cindex].oid)
      }
    })
  },

  /**
   * 获取区镇级列表
   */
  getTowns (pid) {
    const that = this
    let params = {}

    http.fxGet(api.place_towns.replace(/:pid/g, pid), params, function (result) {
      if (result.success) {
        that.setData({
          current_towns: result.data
        })

        // 查找匹配tindex
        if (that.editStatus && that.newAddress) {
          that.data.current_towns.foreach(function (item, k) {
            if (item.town == that.newAddress.town) {
              that.setData({
                tindex: k
              })
            }
          })
        }

        // 同步触发默认值
        that.getAreas(that.data.current_towns[that.data.tindex].oid)
      }
    })
  },

  /**
   * 获取村或区域级列表
   */
  getAreas (pid) {
    const that = this
    let params = {}

    http.fxGet(api.place_areas.replace(/:pid/g, pid), params, function (result) {
      if (result.success) {
        that.setData({
          current_areas: result.data
        })

        // 查找匹配tindex
        if (that.editStatus && that.newAddress) {
          that.data.current_areas.foreach(function (item, k) {
            if (item.town == that.newAddress.area) {
              that.setData({
                aindex: k
              })
            }
          })
        }

      }
    })
  },

  /**
   * 选定 某个地址
   */
  handleChooseAddress (e) {
    let rid = e.currentTarget.dataset.rid

    if (this.data.prev_ref == 'orderCheckout') {
      for (let addr of this.data.addressList) {
        if (addr.rid == rid) {
          app.globalData.checkedDeliveryAddress = addr
        }
      }
      console.log(app.globalData.checkedDeliveryAddress)
      // 返回结算页
      wx.navigateBack({
        delta: 1
      })
    }
  },

  /**
   * 是否设置为默认
   */
  handleSwitchChange (e) {
    this.setData({
      'newAddress.is_default': e.detail.value
    })
  },

  /**
   * 地址输入事件
   */
  handleAddressInput (e) {
    let name = e.currentTarget.dataset.name
    let params = {}
    let key = 'newAddress.' + name
    params[key] = e.detail.value

    this.setData(params)
  },

  handleChooseProvince (e) {
    console.log(e)
    let idx = e.detail.value
    this.setData({
      index: idx
    })
    // 同步获取市级列表
    this.getCities(parseInt(this.data.provinces[idx].oid))
  },

  handleChooseCity (e) {
    let idx = e.detail.value
    this.setData({
      cindex: idx
    })
    // 同步获取区镇级列表
    this.getTowns(parseInt(this.data.current_cities[idx].oid))
  },

  handleChooseTown (e) {
    let idx = e.detail.value
    this.setData({
      tindex: idx
    })
    // 同步获取村域列表
    this.getAreas(parseInt(this.data.current_towns[idx].oid))
  },

  handleChooseArea (e) {
    let idx = e.detail.value
    this.setData({
      aindex: idx
    })
  },

  /**
   * 调用微信地址
   */
  handleWxAddress(e) {
    const that = this
    wx.chooseAddress({
      success: function (res) {
        console.log(res)
        // 提交微信地址
        let wxAddress = {
          first_name: res.userName,
          mobile: res.telNumber,
          zipcode: res.postalCode,
          street_address: res.detailInfo,
          province: res.provinceName,
          city: res.cityName,
          town: res.countyName,
          area: '',
          is_from_wx: true,
          is_default: false
        }

        http.fxPost(api.address_addto, wxAddress, function (result) {
          if (result.success) {
            // 追加进列表
            let tmpList = that.data.addressList
            tmpList.push(result.data)

            that.setData({
              addressList: tmpList
            })
          }
        })

      }
    })
  },

  /**
   * 提交新地址
   */
  handleAddSubmit(e) {
    const that = this
    let newAddress = this.data.newAddress
    if (this.data.provinces[this.data.index]) {
      newAddress['province_id'] = this.data.provinces[this.data.index].oid
    }
    
    if (this.data.current_cities[this.data.cindex]) {
      newAddress['city_id'] = this.data.current_cities[this.data.cindex].oid
    }

    if (this.data.current_towns[this.data.tindex]) {
      newAddress['town_id'] = this.data.current_towns[this.data.tindex].oid
    }
    
    if (this.data.current_areas[this.data.aindex]) {
      newAddress['area_id'] = this.data.current_areas[this.data.aindex].oid
    }

    if (this.data.isEditing) { // 编辑更新
      http.fxPut(api.address_update, newAddress, function (result) {
        if (result.success) {
          // 替换
          let tmpList = that.addressList.map(function (item, key, ary) {
            if (item.rid == newAddress.rid) {
              return newAddress
            }
            return item
          })

          that.setData({
            isEditing: false,
            addressList: tmpList
          })
        }
      })
    } else { // 新增
      http.fxPost(api.address_addto, newAddress, function (result) {
        if (result.success) {
          // 追加进列表
          let tmpList = that.data.addressList
          tmpList.push(result.data)
          
          that.setData({
            addressList: tmpList
          })
        }
      })
    }
    

    this.setData({
      editStatus: false
    })
  },

  handleNewAddress(e) {
    this.setData({
      editStatus: true
    })
  },

  handleCancelSubmit(e) {
    this.setData({
      isEditing: false,
      editStatus: false
    })
  },

  /**
   * 编辑
   */
  handleEditEvent (e) {
    let rid = e.currentTarget.dataset.rid
    let editAddress = {}
    for (let addr of this.data.addressList) {
      if (addr.rid == rid) {
        editAddress = addr
      }
    }

    this.setData({
      isEditing: true,
      editStatus: true,
      newAddress: editAddress
    })

    this.getProvinces()
  },

  /**
   * 删除
   */
  handleDeleteEvent (e) {
    let rid = e.currentTarget.dataset.rid
    let params = {}
    const that = this

    let tmpAddressList = []
    for (let addr of this.data.addressList) {
      if (addr.rid != rid) {
        tmpAddressList.push(addr)
      }
    }

    http.fxDelete(api.address_delete.replace(/:rid/g, rid), params, function (res) {
      if (res.success) {
        that.setData({
          addressList: tmpAddressList
        })
      }
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
  onShareAppMessage: function () {
  
  }
})