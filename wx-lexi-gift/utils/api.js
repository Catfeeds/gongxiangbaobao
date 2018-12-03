'use strict';

// 配置API接口文件
module.exports = {
  // AuthhandleCountryPickOpenhandleCountryPickOpenhandleCountryPickOpen
  auth_login: 'accounts/wxa_login', // POST 登录
  auth_logout: 'auth/logout', // POST 退出登录
  auth_register: 'auth/register', // POST 注册
  auth_check_mobile: 'auth/mobile', // GET 验证手机号是否存在
  auth_get_msm_code: 'users/wx_bind_mobile_verify_code', // POST 注册时候手机验证码---
  bind_mobile: 'accounts/wxa_bind_mobile', // 绑定手机号码---
  auth_weixin: 'accounts/wxa_get_authorize_info', // POST 微信授权获取用户信息、openid、unionid
  wxa_authorize_bind_mobile: 'accounts/wxa_authorize_bind_mobile', // 微信授权绑定手机号
  auth_refresh_session: 'accounts/refresh_wxa_session', // session 过期则刷新
  bind_friend: 'guess_image/add_friend', // 绑定好友关系
  // POST 获取验证码
  auth_sms_code: 'users/wx_bind_mobile_verify_code',

  // User
  user: 'users', // GET 获取用户（当前登录用户）
  user_profile: 'users/:id/profile', // GET 获取用户资料（当前登录用户）
  users_profile: 'users/profile', // GET 获取用户资料（当前登录用户）
  user_authorize: 'accounts/wxa_authorize', //openid---
  user_avatar_upload: '', // POST 
  user_upload_token: 'assets/user_upload_token', // GET 获取上传Token

  // Asset
  asset_upload: 'assets/upload', // POST 上传附件
  asset_detail: 'assets/show_asset', // GET 获取附件 

  //share 
  market_share_store: 'market/share/store', // 分享品牌管换取图片
  market_share_life_store: 'market/share/life_store', // 分享生活馆卡片
  market_share_invite_poster: 'market/share/invite_poster', // 邀请好友生成海报
  market_share_invite_carde: 'market/share/invite_card', // 邀请好友开馆的卡片
  market_share_window_poster: 'market/share/shop_window_poster', // 分享橱窗海报
  market_share_product_card:'market/share/product_card', // 分享商品的图片生成
  market_gift_share_card: 'yiyuan/product_card', // 分享活动卡片

  // 生活馆
  life_store: 'store/life_store', // GET 生活馆信息

  // Product
  products: 'products/by_store', // GET 产品列表---


  // 1元礼物

  gift_current: 'yiyuan/product', // GET 查看今日礼物
  gift_submit: 'yiyuan/activity', // POST 新增发起送礼
  gift_activity_detail: 'yiyuan/activity/:rid', // GET 查看活动详情
  gift_receive_people: 'yiyuan/product/receive', // GET 查看领取我的礼物的人
  gift_activity_count: 'yiyuan/collect_activity', // GET 我参与的活动汇总
  gift_activity_more: 'yiyuan/activity/more', // GET 查看十个最热门的活动
  gift_activity_partake: 'yiyuan/activity/join', // GET 我参与的抽奖
  gift_activity_users: 'yiyuan/activity/users/:rid', // GET 活动参与的人
  gift_activity_join: 'yiyuan/activity/join', // POST 参与抽奖
  gift_activity_user_status: 'yiyuan/activity/status/:rid', // GET 活动状态
  gift_activity_grant: 'yiyuan/activity/grant', // POST 领取奖励
  gift_activity_having: 'yiyuan/activity/having', // GET 用户当前是否有活动
  gift_sended: 'yiyuan/activity/send', // GET 我送出的礼物
  gift_receive: 'yiyuan/activity/receive', // GET 我收到的礼物
  gift_store_products: 'yiyuan/product/store', // GET 品牌馆更多商品


  // City
  countries: 'countries', // 获取国家列表
  cities: 'address/cities', // GET 城市列表
  city: 'address/cities', // GET 城市信息

  // Address
  addresses: 'address', // GET 地址列表---
  address_addto: 'address', // POST 添加收货地址---
  address_info: 'address/:rid', // GET 地址详情
  address_update: 'address/:rid', // get 获取用户设置的收获地址---
  address_delete: 'address/:rid', // DELETE 删除收货地址---
  address_default: 'address/is_default', // GET 获取默认地址
  address_set_default: 'address/:rid/set_default', // PUT 快捷更新默认收货地址
  place_provinces: 'places/provinces', // GET 获取所有省级列表---
  place_cities: 'places/:pid/cities', // GET 获取所有市级列表---
  place_towns: 'places/:pid/towns', // GET 获取所有区镇级列表---
  place_areas: 'places/:pid/areas', // GET 获取所有村或区域级列表
  all_places: 'places', // 获取所有的地址---
  provinces_cities: 'places/provinces_cities', // GET 省/市/区 列表
  get_country: 'auth/area_code', // 获取所有的国家---
  address_user_custom: 'address/custom', // 获取海关身份证信息

  // Pay
  pay_wechat: 'pay/wechat', // POST 微信支付

  // Test
  demo: 'demo',

  // GET 当前环境
  run_env: 'run_env/wxa'

}