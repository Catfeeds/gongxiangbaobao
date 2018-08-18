'use strict';

// 配置API接口文件
module.exports = {
  // Auth
  auth_login: 'accounts/wxa_login', // POST 登录
  auth_logout: 'auth/logout', // POST 退出登录
  auth_register: 'auth/register', // POST 注册
  auth_check_mobile: 'auth/mobile', // GET 验证手机号是否存在
  auth_get_msm_code: 'users/wx_bind_mobile_verify_code', // POST 注册时候手机验证码---
  bind_mobile: 'accounts/wxa_bind_mobile', //绑定手机号码---
  wxa_authorize_bind_mobile: 'accounts/wxa_authorize_bind_mobile', // 微信授权绑定手机号
  countries: 'countries', // 获取国家列表

  // User
  user: 'users', // GET 获取用户（当前登录用户）
  user_profile: 'users/:id/profile', // GET 获取用户资料（当前登录用户）
  user_authorize: 'accounts/wxa_authorize', //openid---
  user_avatar_upload: '', // POST 
  user_upload_token: 'assets/user_upload_token', // GET 获取上传Token

  // Asset
  asset_detail: 'assets/show_asset', // GET 获取附件 

  // Category
  categories: 'categories', // GET 获取产品分类
  siblings_categories: 'categories/siblings', // GET 同级分类

  // Brand
  brand_list: 'brands', // GET 品牌列表
  brand_detail: 'brands/:rid', // GET 品牌详情
  shop_info: 'store/info', // 获取店铺信息--h
  store_announcement: 'store/announcement', //获取店铺公告---
  BrowseQuantityNumber: 'store/:rid/visitor', //浏览过的人数---
  brand_info: 'store/detail', // 品牌故事
  is_authentication: 'users/get_authenticate_status', //GET店铺是否经过官方认证

  // 生活馆

  life_store: 'store/life_store', // GET 生活馆信息
  life_store_apply: 'store/apply_life_store', // POST 申请生活馆
  life_store_products: 'core_platforms/products/by_store', // POST 生活馆商品
  life_store_delete_product: 'core_platforms/fx_distribute/remove', // DELETE 从生活馆删除某商品
  life_store_update_rid: 'users/update_last_store_rid', // POST 更新最后访问的生活馆ID
  life_store_headlines: 'store/store_headline', // GET 
  life_store_edit: 'store/edit_store', // GET
  life_store_update_logo: 'store/update_life_store_logo', // POST 

  // 分销

  // GET 分销池
  get_all_distribution: 'fx_distribute/index',
  // GET 获取-推荐--热门单品的分销
  get_hot_distribution: 'fx_distribute/hot',
  // GET 获取-推荐--官方单品的分销
  get_sticked_distribution: 'fx_distribute/sticked',
  // GET 获取-推荐--新品单品的分销
  get_new_distribution: 'fx_distribute/latest',
  // PUT 已经上架
  distribution_sell: 'core_platforms/fx_distribute/publish',
  // GET 最新分销商品
  distribute_newest: 'core_platforms/fx_distribute/latest',
  // GET 本周最受欢迎的分销商品
  distribution_week_popular: 'fx_distribute/week_popular',
  
  // Product
  products: 'products/by_store', // GET 产品列表---
  latest_products: 'products/latest', // GET 最新产品---
  sticked_products: 'fx_distribute/agency', // GET 推荐产品---
  brand_products: 'products/by_brand/:rid', // GET 品牌下产品列表
  product_info: 'products/:rid', // GET 产品信息
  product_content: 'products/:rid/detail', // GET 产品图文介绍
  product_detail: 'products/:rid/all_detail', // GET 产品详情---
  by_sku: 'products/by_sku', // GET 多个sku详情---
  by_store_sku: 'products/by_store_sku', // GET sku以及店铺的信息详情---
  product_skus: 'products/skus', // GET 产品SKU
  skus: 'products/by_sku', // GET 产品SKU信息
  wishlist: 'wishlist', // GET 心愿单---
  wishlist_addto: 'wishlist/addto', // POST 添加收藏
  wishlist_remove: 'wishlist/remove', // POST 移除收藏
  wxacode: 'market/wxacode', // POST 生成小程序码
  theme_product: 'wx_app_design', //get 1,主打设计 2,优质精选---
  theme: 'wx_app_design/collections', //Get 主题---
  marketBanners: 'banners/:rid', //广告--
  products_index:'products/index', // 首页作品的排序---

  // 核心 product
  banners_explore: 'banners/explore', //探索的头部广告h
  banners_handpick: 'banners/handpick', // 精选区域的头部广告
  category_products: 'category/products', // 分类商品列表
  column_collections: 'column/collections', // 集合
  column_explore_new: 'column/explore_new', // 优质新品
  core_platforms_search: 'core_platforms/search', // 搜索历史
  life_records_recommend: 'life_records/recommend', // 种草清单
  column_daily_recommends: "column/daily_recommends", //今日推荐
  column_affordable_goods: 'column/affordable_goods', //百元好物
  column_explore_recommend:'column/explore_recommend', // 编辑推荐h
  column_collections_detail:'column/collections/detail', //集合详情
  banners_handpick_content: 'banners/handpick_content', // 精选的中间广告
  column_handpick_recommend:'column/handpick_recommend', // 人气推荐
  column_preferential_design: 'column/preferential_design', // 特惠好设计
  column_handpick_optimization:'column/handpick_optimization', // 乐喜优选
 
  // 核心 store
  users_user_dynamic:"users/user_dynamic", // 获取自己的动态
  column_feature_store: 'column/feature_store', // 特色品牌管h
  column_handpick_store:'column/handpick_store', // 特色品牌馆精选
  column_browse_records:'column/browse_records', // 浏览过乐喜优选，优质新品……人数以及头像
  users_other_followed_stores: 'users/other_followed_stores', // 获取用户关注地店铺列表

  // people 核心
  users_other_followed_users: "users/other_followed_users", //获取别人的关注
  other_userlike: 'other_userlike', //其他人喜欢的商品
  other_wishlist: 'other_wishlist', // 其他人心愿单
  users_other_followed_life_stores: 'users/other_followed_stores', //别人收藏的设计管
  users_other_user_dynamic: "users/other_user_dynamic", // 其他人的动态
  users_other_user_center: 'users/get_other_user_center', // 获取别人个人中心
  users_other_user_fans:'users/other_user_fans', // 获取别人的粉丝
  other_user_browses:'other_user_browses',// 别人的浏览记录

  // Cart
  cart: 'cart', // GET 加入购物车---
  cart_addon: 'cart', // POST 添加产品至购物车
  cart_remove: 'cart/:rid/remove', // DELETE 移除产品
  cart_clear: 'cart/clear', // DELETE 清空购物车
  cart_item_count: 'cart/item_count', // GET 购物车产品数---
  clearCart: 'cart/remove', // 移除购物车

  // Order
  orders: 'orders', // GET 订单列表---
  order_detail: 'orders/:rid', // GET 订单详情
  order_quick_buy: 'orders/quick_buy', // POST 立即购买
  order_by_cart: 'orders/cart_buy', // POST 购物车下单
  order_create: 'orders/create', // POST 新增订单---
  order_delete: 'orders/:rid/delete', // DELETE 删除订单
  order_cancel: 'orders/cancel', // POST 取消订单
  order_signed: 'orders/signed', // POST 订单签收
  order_paid_status: 'orders/up_paid_status', // POST 更新订单支付状态
  order_prepay_sign: 'orders/wx_prepay_sign', // POST 获取prepay_id和支付签名验证paySign
  critique_product: 'orders/product/comment/create', //post 评论商品---
  orders_delete: 'orders/delete', // 删除订单---

  // Market
  is_first_order:"market/coupons/new_user_discount", // 查看是否属于首单
  user_login_coupon:'market/user_master_coupons',//用户登陆时候的优惠券
  coupons: 'market/coupons', // get 优惠券列表---
  checkout_authority_couponList: 'market/user_official_fill', // get 优惠券列表---
  noCouponsList: 'market/not_login_coupons', // get 优惠券列表---
  coupon_detail: 'market/coupons/:rid', // GET 单个优惠券
  user_coupons: 'market/user_coupons', // POST 用户优惠券列表---
  available_coupons: 'market/coupons/available', // POST 用户可用优惠券
  coupon_grant: 'market/coupons/grant', // POST 领取优惠券---
  red_bag: 'market/bonus', //GET红包列表---
  authority_coupon:'market/user_official', //官方的优惠券
  order_info_page_coupon: 'market/user_order_coupons', //订单页面优惠券
  full_reduction: 'market/user_order_full_reduction', //满减
  first_order_reduction: 'market/coupons/new_user_discount', //满减
  noLoginFullSubtraction: 'market/coupons', //没有登陆下的满减

  // Search  
  search: 'search/products', // POST 搜索商品
  search_history: 'search/history', // GET 搜索历史关键词

  // City
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
  get_country: 'auth/area_code', //获取所有的国家---

  // Pay
  pay_wechat: 'pay/wechat', // POST 微信支付

  // Slides
  slide_list: 'common/slides', // GET 幻灯片列表

  // 关于我们
  wxapp_info: 'store/wxapp', // GET

  // Test
  demo: 'demo',

  // post关注---
  add_watch: 'follow/store', // 添加
  delete_watch: 'unfollow/store', // 取消关注
  examine_watch: 'follow/get_status', // 查看是否关注
  // add_browse : 'store/visitor', //添加访问者---
  userlike: 'userlike', //添加喜欢---
  usetIsLike: 'products_userlike', // 查看用户是否喜欢
  // 查询运费模板详情
  logisitcs: 'logistics/freight_template/:rid',
  logistics_product_express: 'logistics/product/express', //post获取每件商品的物流公司列表
  cheapLogisitcs: 'logistics/freight/available', // post合适的运费模板---
  calculate_logisitcs: 'logistics/freight/calculate', // post计算运费---
  //店铺的主人的
  store_owner_info: 'users/authenticate',
  masterInfo: 'store/master_info',
  users_user_center: 'users/user_center', // 获取用户的收藏 喜欢 设计管

  // user
  users_profile: 'users/profile', //get 获取用户的信息---
  user_browses: 'user_browses', // post添加浏览记录/get获取浏览记录---
  product_userlike: 'product/userlike', // 获取添加喜欢商品的用户
  users_fans_counts: 'users/user_fans', // 获取用户的粉丝
  users_followed_users: 'users/followed_users', // 获取关注
  follow_user: 'follow/user', // 添加关注
  unfollow_user: 'unfollow/user', // 取消关注
  users_followed_stores: 'users/followed_stores', // 获取关注店铺的列表

  // POST 获取验证码
  auth_sms_code: 'users/wx_bind_mobile_verify_code',



}