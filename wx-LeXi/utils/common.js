// 共用的方法函数
const http = require('./http.js')
const api = require('./api.js')
const utils = require('./util.js')

const app = getApp()

// 预先请求省/市/地区
const getAllPlaces = (country_id = 1, province_oid = 0) => {
  http.fxGet(api.all_places, {
    country_id: country_id,
    province_oid: province_oid
  }, (result) => {
    console.log(result, '预加载地点列表')
    if (result.success) {
      wx.setStorageSync('allPlaces', result.data)
    } else {
      utils.fxShowToast(result.status.message)
    }
  })
}

let shareLexi = (title, imgUrl) => {
  return {
    title: title,
    path: 'pages/index/index',
    imageUrl: imgUrl,
    success: (res) => {
      console.log(res, '分享商品成功!')
    }
  }
}

module.exports = {
  getReceivePlaces: getAllPlaces,
  shareLexi: shareLexi
}