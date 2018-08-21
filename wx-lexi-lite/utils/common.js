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

/**
 * 获取字符串实际长度(包含汉字)
 */
const strLength = (s, isChinese=false) => {
  let l = s.length
  let blen = 0
  for (let i=0; i<l; i++) {
    // 识别中文
    if (isChinese) {
      if ((s.charCodeAt(i) & 0xff00) != 0) {
        blen++
      }
    }
    blen++
  }
  return blen
}

// 截取符合要求的字符串
const sliceString = (data,num) => {
  let originData = data
  if(data.length>num){
    originData = originData.slice(0,num)
    originData = originData + "..."
  }

  return originData
}

module.exports = {
  getReceivePlaces: getAllPlaces,
  strLength,
  sliceString: sliceString, // 字符串切片
}