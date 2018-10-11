const CryptoJS = require('cryptojs/cryptojs.js').Crypto;

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

// 时间戳转换为时间格式字符串
const timestamp2string = (ts, format = 'time') => {
  let date = new Date()
  date.setTime(ts * 1000)
  let y = date.getFullYear()
  let m = date.getMonth() + 1
  m = m < 10 ? ('0' + m) : m
  let d = date.getDate()
  d = d < 10 ? ('0' + d) : d
  let h = date.getHours()
  h = h < 10 ? ('0' + h) : h
  let minute = date.getMinutes()
  let second = date.getSeconds()
  minute = minute < 10 ? ('0' + minute) : minute
  second = second < 10 ? ('0' + second) : second

  if (format == 'second') {
    return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second
  }
  if (format == 'time') {
    return y + '-' + m + '-' + d + ' ' + h + ':' + minute
  }
  if (format == 'date') {
    return y + '.' + m + '.' + d
  }
  if (format == 'cn') {
    return y + '年' + m + '月' + d + '日'
  }
}

/**
 * 时间戳转换为时间格式字符串2
 */
const timestamp2dateStr = (ts) => {
  let date = new Date()
  date.setTime(ts * 1000)
  let m = date.getMonth() + 1
  m = m < 10 ? ('0' + m) : m
  let d = date.getDate()
  d = d < 10 ? ('0' + d) : d
  let h = date.getHours()
  h = h < 10 ? ('0' + h) : h
  let minute = date.getMinutes()
  minute = minute < 10 ? ('0' + minute) : minute

  return m + '.' + d + ' ' + h + ':' + minute
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 验证Token是否过期
const checkTokenIsExpired = jwt => {
  const nowstamp = parseInt(new Date().getTime() / 1000)
  if (!jwt.hasOwnProperty('created_at') || (jwt.created_at + jwt.expiration < nowstamp)) {
    return true
  }

  return false
}

// 修正金额，统一保留2位小数
const fixedAmount = amount => {
  return amount.toFixed(2)
}

// 随机获取弹幕的背景颜色
const getRandomColor = () => {
  let rgb = ['red', 'purple', 'blue']

  return rgb[Math.floor(Math.random() * rgb.length)]
}

// 生成随机字符串
const randomString = len => {
  len = len || 16
  // 默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  let nonce_str = ''
  for (let i = 0; i < len; i++) {
    nonce_str += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return nonce_str
}

// 当前时间戳
const timestamp = () => {
  return Date.parse(new Date()) / 1000
}

/**
 * 修正数字
 */
const checkTimeNumber = (val) => {
  if (val < 10) {
    val = '0' + val
  }
  return val
}

const Base64 = {

  enKey: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',

  deKey: new Array(
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
    52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
    -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
    -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1
  ),

  encode: function (src) {
    //用一个数组来存放编码后的字符，效率比用字符串相加高很多。
    var str = new Array();
    var ch1, ch2, ch3;
    var pos = 0;
    //每三个字符进行编码。
    while (pos + 3 <= src.length) {
      ch1 = src.charCodeAt(pos++);
      ch2 = src.charCodeAt(pos++);
      ch3 = src.charCodeAt(pos++);
      str.push(this.enKey.charAt(ch1 >> 2), this.enKey.charAt(((ch1 << 4) + (ch2 >> 4)) & 0x3f));
      str.push(this.enKey.charAt(((ch2 << 2) + (ch3 >> 6)) & 0x3f), this.enKey.charAt(ch3 & 0x3f));
    }
    //给剩下的字符进行编码。
    if (pos < src.length) {
      ch1 = src.charCodeAt(pos++);
      str.push(this.enKey.charAt(ch1 >> 2));
      if (pos < src.length) {
        ch2 = src.charCodeAt(pos);
        str.push(this.enKey.charAt(((ch1 << 4) + (ch2 >> 4)) & 0x3f));
        str.push(this.enKey.charAt(ch2 << 2 & 0x3f), '=');
      } else {
        str.push(this.enKey.charAt(ch1 << 4 & 0x3f), '==');
      }
    }
    //组合各编码后的字符，连成一个字符串。
    return str.join('');
  },

  decode: function (src) {
    //用一个数组来存放解码后的字符。
    var str = new Array();
    var ch1, ch2, ch3, ch4;
    var pos = 0;
    //过滤非法字符，并去掉'='。
    src = src.replace(/[^A-Za-z0-9\+\/]/g, '');
    //decode the source string in partition of per four characters.
    while (pos + 4 <= src.length) {
      ch1 = this.deKey[src.charCodeAt(pos++)];
      ch2 = this.deKey[src.charCodeAt(pos++)];
      ch3 = this.deKey[src.charCodeAt(pos++)];
      ch4 = this.deKey[src.charCodeAt(pos++)];
      str.push(String.fromCharCode(
        (ch1 << 2 & 0xff) + (ch2 >> 4), (ch2 << 4 & 0xff) + (ch3 >> 2), (ch3 << 6 & 0xff) + ch4));
    }
    //给剩下的字符进行解码。
    if (pos + 1 < src.length) {
      ch1 = this.deKey[src.charCodeAt(pos++)];
      ch2 = this.deKey[src.charCodeAt(pos++)];
      if (pos < src.length) {
        ch3 = this.deKey[src.charCodeAt(pos)];
        str.push(String.fromCharCode((ch1 << 2 & 0xff) + (ch2 >> 4), (ch2 << 4 & 0xff) + (ch3 >> 2)));
      } else {
        str.push(String.fromCharCode((ch1 << 2 & 0xff) + (ch2 >> 4)));
      }
    }
    //组合各解码后的字符，连成一个字符串。
    return str.join('');
  }
}

// {}对象是否为空
const isEmptyObject = obj => {
  let proNames = Object.getOwnPropertyNames(obj)
  return proNames.length == 0
}

// 对参数按照key=value的格式，并按照参数名ASCII字典序排序
const sortParams = (args) => {
  let keys = Object.keys(args)
  keys = keys.sort()
  let newArgs = {}
  keys.forEach(function (key) {
    newArgs[key] = args[key]
  })

  let str = ''
  for (let k in newArgs) {
    str += '&' + k + '=' + newArgs[k]
  }
  str = str.substr(1)
  return str
}

/**
 * 订单状态文本
 */
const orderStatusTitle = (status) => {
  let statusList = [
    { title: '已取消', status: -1 },
    { title: '待付款', status: 1 },
    { title: '待发货', status: 5 },
    { title: '待收货', status: 10 },
    { title: '已完成', status: 20 }
  ]
  let tmp = statusList.filter(function (item) {
    return item.status == status
  })
  return tmp ? tmp[0].title : ''
}
// 提示信息
const showToast = (v, typeText ="none") => {
  wx.showToast({
    title: v,
    icon: typeText,
    duration: 1200
  })
}
//预先加载地址


// 隐藏tabbar
const handleHideTabBar = () => {
  wx.hideTabBar()
}

// 显示tabbar
const handleShowTabBar = () => {
  wx.showTabBar()
}

// 显示加载
const handleShowLoading = () => {
  wx.showLoading({
    title: '加载中',
    mask:false
  }) 
}

// 隐藏加载
const handleHideLoading = () => {
  wx.hideLoading() 
}

/**
 * 截取字符
 */
const truncate = (s, max=10) => {
  if (s.length > max) {
    return s.substr(0, max) + '...'
  }
  return s
}

/**
 * 将小程序的API封装成支持Promise的API
 * @params fn {Function} 小程序原始API，如wx.login
 */
const wxPromisify = fn => {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        resolve(res)
      }

      obj.fail = function (res) {
        reject(res)
      }

      fn(obj)
    })
  }
}

/**
   * 时间处理
  */
const commentTime = (option) => {
    let optionTime = option
    let currentTime = new Date()
    console.log(currentTime , option,123)

  }

module.exports = {
  handleHideLoading: handleHideLoading,
  handleShowLoading: handleShowLoading,
  handleShowTabBar: handleShowTabBar,
  handleHideTabBar: handleHideTabBar,
  fxShowToast: showToast,
  formatTime: formatTime,
  timestamp2string,
  timestamp2dateStr,
  checkTokenIsExpired,
  isEmptyObject,
  fixedAmount,
  getRandomColor,
  truncate,
  randomString,
  timestamp,
  sortParams,
  checkTimeNumber,
  orderStatusTitle,
  Base64,
  wxPromisify: wxPromisify,
  commentTime
}
