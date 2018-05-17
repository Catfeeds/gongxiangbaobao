// pages/address/address.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_cameraOrPhoto:true,
    is_template: 0,
    addressInfo: [
      {
        s: "北京",
        sh: ["海淀", "朝阳", "大型", "大红门"],
        x: ["海淀", "朝阳", "大型", "大红门"]
      },
      {
        s: "上海",
        sh: ["海淀", "朝阳", "大型", "大红门"],
        x: ["海淀", "朝阳", "大型", "大红门"]
      }
    ],

    s:[],
    sh:[],
    x:[]

  },
  //要填写在地址栏里面的地址信息
  addInfomation(e){
    var index=e.detail.value
    console.log(index)
    this.setData({
      s:this.data.addressInfo[index[0]].s,
      sh:this.data.addressInfo[index[0]].sh[index[1]],
      x: this.data.addressInfo[index[0]].sh[index[2]]
    })
  },

  pickCameraOrPhoto(){
    this.setData({
      is_cameraOrPhoto:false
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //模板的显示与隐藏
  T_addressovar() {

    if (this.data.is_template == 0) {
      this.setData({
        is_template: 1
      })
    } else {
      this.setData({
        is_template: 0
      })
    }

  }
})