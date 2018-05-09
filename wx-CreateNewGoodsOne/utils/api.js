'use strict';

// 配置API接口文件
module.exports = {
  // Auth
  auth_login: 'accounts/wxa_login',  // POST 登录
  auth_logout: 'auth/logout',  // POST 退出登录
  auth_register: 'auth/register', // POST 注册
  auth_check_mobile: 'auth/mobile', // GET 验证手机号是否存在
  auth_get_msm_code: 'auth/get_msm_code', // POST 获取手机验证码

  // User
  user: 'users',   // GET 获取用户（当前登录用户）
  user_profile: 'users/:id/profile', // GET 获取用户资料（当前登录用户）

  // Category
  categories: 'categories',  // GET 获取产品分类
  siblings_categories: 'categories/siblings',  // GET 同级分类

  // Brand
  brand_list: 'brands',  // GET 品牌列表
  brand_detail: 'brands/:rid',  // GET 品牌详情

  // Product
  products: 'products',  // GET 产品列表
  latest_products: 'products/latest',  // GET 最新产品
  sticked_products: 'products/sticked',  // GET 推荐产品
  brand_products: 'products/by_brand/:rid',  // GET 品牌下产品列表
  product_detail: 'products/:rid', // GET 产品详情
  product_content: 'products/:rid/detail',  // GET 产品图文介绍
  product_skus: 'products/skus',  // GET 产品SKU
  skus: 'products/by_sku',  // GET 产品SKU信息
  wishlist: 'wishlist', // GET 收藏列表
  wishlist_addto: 'wishlist/addto',  // POST 添加收藏
  wishlist_remove: 'wishlist/remove',  // POST 移除收藏
  wxacode: 'market/wxacode',  // POST 生成小程序码

  // Cart
  cart: 'cart',  // GET 购物车列表
  cart_addon: 'cart',  // POST 添加产品至购物车
  cart_remove: 'cart/:rid/remove',  // DELETE 移除产品
  cart_clear: 'cart/clear', // DELETE 清空购物车
  cart_item_count: 'cart/item_count',  // GET 购物车产品数

  // Order
  orders: 'orders',  // GET 订单列表
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
  coupons: 'market/coupons/activity',  // POST 优惠券列表
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
  addresses: 'address', // GET 地址列表
  address_addto: 'address',  // POST 添加收货地址
  address_update: 'address/:rid',  // PUT 编辑收货地址
  address_delete: 'address/:rid',   // DELETE 删除收货地址
  address_default: 'address/is_default',  // GET 获取默认地址
  address_set_default: 'address/:rid/set_default', // PUT 快捷更新默认收货地址
  place_provinces: 'places/provinces',  // GET 获取所有省级列表
  place_cities: 'places/:pid/cities',  // GET 获取所有市级列表
  place_towns: 'places/:pid/towns',  // GET 获取所有区镇级列表
  place_areas: 'places/:pid/areas',  // GET 获取所有村或区域级列表

  // Pay
  pay_wechat: 'pay/wechat', // POST 微信支付

  // Slides
  slide_list: 'common/slides',  // GET 幻灯片列表

  // 关于我们
  wxapp_info: 'store/wxapp',  // GET

  // Test
  demo: 'demo'
}