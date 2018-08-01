// 共用的方法函数
const http = require('./http.js')
const api = require('./api.js')
const utils = require('./util.js')

const app = getApp()

// 预先请求省/市/地区
const getAllPlaces = (country_id = 1) => {
  http.fxGet(api.all_places, {
    country_id: country_id
  }, (result) => {
    console.log(result, '预加载地点列表')
    if (result.success) {
      wx.setStorageSync('allPlaces', result.data)
    } else {
      utils.fxShowToast(result.status.message)
    }
  })
}

module.exports = {
  getReceivePlaces: getAllPlaces
}