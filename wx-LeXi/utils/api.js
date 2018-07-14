'use strict';

// 配置API接口文件
module.exports = {
  // Auth
  auth_login: 'accounts/wxa_login',  // POST 登录
  auth_logout: 'auth/logout',  // POST 退出登录
  auth_register: 'auth/register', // POST 注册
  auth_check_mobile: 'auth/mobile', // GET 验证手机号是否存在
  auth_get_msm_code: 'users/register_verify_code', // POST 注册时候手机验证码---
  bind_mobile:'accounts/wxa_bind_mobile',//绑定手机号码---

  // User
  user: 'users',   // GET 获取用户（当前登录用户）
  user_profile: 'users/:id/profile', // GET 获取用户资料（当前登录用户）
  user_authorize: 'accounts/wxa_authorize', //openid---

  // Category
  categories: 'categories',  // GET 获取产品分类
  siblings_categories: 'categories/siblings',  // GET 同级分类

  // Brand
  brand_list: 'brands',  // GET 品牌列表
  brand_detail: 'brands/:rid',  // GET 品牌详情
  shop_info: 'store/info', // 获取店铺信息--
  store_announcement: 'store/announcement', //获取店铺公告---
  BrowseQuantityNumber:'store/:rid/visitor', //浏览过的人数
  // Product
  products: 'products/by_store',  // GET 产品列表---
  latest_products: 'products/latest',  // GET 最新产品---
  sticked_products: 'fx_distribute/agency',  // GET 推荐产品---
  brand_products: 'products/by_brand/:rid',  // GET 品牌下产品列表
  product_content: 'products/:rid/detail',  // GET 产品图文介绍
  product_detail: 'products/:rid/all_detail', // GET 产品详情---
  by_sku: 'by_sku', // GET 多个sku详情---
  product_skus: 'products/skus',  // GET 产品SKU
  skus: 'products/by_sku',  // GET 产品SKU信息
  wishlist: 'wishlist', // GET 心愿单---
  wishlist_addto: 'wishlist/addto',  // POST 添加收藏
  wishlist_remove: 'wishlist/remove',  // POST 移除收藏
  wxacode: 'market/wxacode',  // POST 生成小程序码
  theme_product: 'wx_app_design', //get 1,主打设计 2,优质精选---
  theme:'wx_app_design/collections', //Get 主题---
  // Cart
  cart: 'cart',  // GET 加入购物车---
  cart_addon: 'cart',  // POST 添加产品至购物车
  cart_remove: 'cart/:rid/remove',  // DELETE 移除产品
  cart_clear: 'cart/clear', // DELETE 清空购物车
  cart_item_count: 'cart/item_count',  // GET 购物车产品数---
  clearCart:'cart/remove', // 移除购物车
  // Order
  orders: 'orders',  // GET 订单列表---
  order_detail: 'orders/:rid',  // GET 订单详情
  order_quick_buy: 'orders/quick_buy',  // POST 立即购买
  order_by_cart: 'orders/cart_buy',  // POST 购物车下单
  order_create: 'orders/create', // POST 新增订单
  order_delete: 'orders/:rid/delete',  // DELETE 删除订单
  order_cancel: 'orders/cancel',  // POST 取消订单
  order_signed: 'orders/signed',  // POST 订单签收
  order_paid_status: 'orders/up_paid_status',  // POST 更新订单支付状态
  order_prepay_sign: 'orders/wx_prepay_sign',  // POST 获取prepay_id和支付签名验证paySign

  // Market
  coupons: 'market/coupons',  // POST 优惠券列表---
  coupon_detail: 'market/coupons/:rid',  // GET 单个优惠券
  user_coupons: 'market/user_coupons',  // POST 用户优惠券列表
  available_coupons: 'market/coupons/available',  // POST 用户可用优惠券
  coupon_grant: 'market/coupons/grant',  // POST 领取优惠券

  // Search
  search: 'search/products',  // POST 搜索商品
  search_history: 'search/history',  // GET 搜索历史关键词

  // City
  cities: 'address/cities',  // GET 城市列表
  city: 'address/cities',   // GET 城市信息

  // Address
  addresses: 'address', // GET 地址列表---
  address_addto: 'address',  // POST 添加收货地址---
  address_update: 'address/:rid',  // get 获取用户设置的收获地址---
  address_delete: 'address/:rid',   // DELETE 删除收货地址
  address_default: 'address/is_default',  // GET 获取默认地址
  address_set_default: 'address/:rid/set_default', // PUT 快捷更新默认收货地址
  place_provinces: 'places/provinces',  // GET 获取所有省级列表---
  place_cities: 'places/:pid/cities',  // GET 获取所有市级列表---
  place_towns: 'places/:pid/towns',  // GET 获取所有区镇级列表---
  place_areas: 'places/:pid/areas',  // GET 获取所有村或区域级列表
  all_places:'places',// 获取所有的地址---
  get_country:'auth/area_code', //获取所有的国家---

  // Pay
  pay_wechat: 'pay/wechat', // POST 微信支付

  // Slides
  slide_list: 'common/slides',  // GET 幻灯片列表

  // 关于我们
  wxapp_info: 'store/wxapp',  // GET

  // Test
  demo: 'demo',
  // post关注---
  add_watch: 'follow/store', // 添加
  delete_watch: 'unfollow/store', // 取消关注
  examine_watch: 'follow/get_status', // 查看是否关注
  add_browse : 'store/visitor', //添加访问者---
  userlike:'userlike', //添加喜欢
  // 查询运费模板详情
  logisitcs:'logistics/freight_template/:rid',

  //店铺的主人的
  store_owner_info:'users/authenticate'

}