// 共用的方法函数
const http = require('./http.js')
const api = require('./api.js')
const utils = require('./util.js')
const app = getApp()

// 预先请求地址
const getAddressInfo = () => {
  http.fxGet(api.all_places, {
    country_id: 1
  }, (result) => {
    console.log(result)
    if (result.success) {
      wx.setStorageSync('adress', result.data)
    } else {
      utils.fxShowToast(result.status.message)
    }
  })
}

module.exports = {
  getReceiveAddress: getAddressInfo,

}