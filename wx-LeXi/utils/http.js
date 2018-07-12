'use strict';
const util = require('./util.js')
const CryptoJS = require('cryptojs/cryptojs.js').Crypto;

// 生成验证请求签名extConfig
function buildSign(timestamp, nonce_str) {
  let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
  const params = {
    // app_key: extConfig.api.appKey,
    app_key: "zXIPN0ftRj6dlrKFOZpH",
    timestamp: timestamp,
    nonce_str: nonce_str
  };
  const keys = Object.keys(params);
  keys.sort();

  const param_ary = [];
  for (let i = 0; i < keys.length; i++) {
    param_ary.push(keys[i] + '=' + params[keys[i]]);
  }

  // return CryptoJS.SHA1(param_ary.join('&') + extConfig.api.appSecret).toString();
  return CryptoJS.SHA1(param_ary.join('&') + "4d8ebaf52b76603a158b67f525a1b9e5f80677da").toString();
}

// 每个请求自动添加系统级参数
function appendSystemParams() {
  let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
  const t = util.timestamp()
  const s = util.randomString(16)
  return {
    // app_key: extConfig.api.appKey,
    app_key: "zXIPN0ftRj6dlrKFOZpH",
    timestamp: t,
    nonce_str: s,
    sign: buildSign(t, s)
  }
}

// 请求参数编码
function obj2uri(obj) {
  return Object.keys(obj).map(function (k) {
    return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]);
  }).join('&');
}

function make_base_auth(user, password) {
  var tok = user + ':' + password;
  var hash = util.Base64.encode(tok);
  return 'Basic ' + hash;
}

// 请求头部信息
function fxHeader(content_type) {
  let header = {}
  let jwt = wx.getStorageSync('jwt')
  // 请求内部类型
  if (content_type) {
    header['content_type'] = content_type
  }
  // 验证是否存在token
  if (jwt && jwt.token) {
    let auth = make_base_auth(jwt.token, jwt.token)
    header['Authorization'] = auth
  }
  return header
}

// api host
function fxUrl(url) {  
  // 获取第三方平台自定义的数据字段  
  let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
  // let urlAry = [extConfig.api.host, extConfig.api.version, url]
  let urlAry = ["https://fx.taihuoniao.com/api", "v1.0", url]
  return urlAry.join('/')
}

// Get请求
function fxGet(url, data = {}, cb) {
  wx.showNavigationBarLoading()
  wx.request({
    url: fxUrl(url),
    data: {
      ...data, ...appendSystemParams()
    },
    method: 'GET',
    header: fxHeader(),
    success(res) {
      wx.hideNavigationBarLoading()
      if (res.statusCode == 401) {
        wx.navigateTo({
          url: '/pages/authorize/authorize',
        })
      }
      return typeof cb == 'function' && cb(res.data)
    },
    fail(res) {
      wx.hideNavigationBarLoading()
      return typeof cb == 'function' && cb(false)
    }
  })
}

// post请求
function fxPost(url, data = {}, cb) {
  wx.showNavigationBarLoading()
  wx.request({
    url: fxUrl(url),
    data: {
      ...data, ...appendSystemParams()
    },
    header: fxHeader('application/json'),
    method: 'POST',
    success(res) {
      wx.hideNavigationBarLoading()
      console.log(res);
      return typeof cb == 'function' && cb(res.data)
    },
    fail() {
      wx.hideNavigationBarLoading()
      return typeof cb == 'function' && cb(false)
    }
  })
}

// put请求
function fxPut(url, data = {}, cb) {
  wx.showNavigationBarLoading()
  wx.request({
    url: fxUrl(url),
    data: {
      ...data, ...appendSystemParams()
    },
    header: fxHeader('application/json'),
    method: 'PUT',
    success(res) {
      wx.hideNavigationBarLoading()
      console.log(res);
      return typeof cb == 'function' && cb(res.data)
    },
    fail() {
      wx.hideNavigationBarLoading()
      return typeof cb == 'function' && cb(false)
    }
  })
}

// delete请求
function fxDelete(url, data = {}, cb) {
  wx.showNavigationBarLoading()
  wx.request({
    url: fxUrl(url),
    data: {
      ...data, ...appendSystemParams()
    },
    header: fxHeader('application/json'),
    method: 'DELETE',
    success(res) {
      wx.hideNavigationBarLoading()
      console.log(res)
      return typeof cb == 'function' && cb(res.data)
    },
    fail() {
      wx.hideNavigationBarLoading()
      return typeof cb == 'function' && cb(false)
    }
  })
}

module.exports = {
  fxGet,
  fxPost,
  fxPut,
  fxDelete
}