// pages/addresses/addresses.js
var app=getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userAddresses: [
      {
        "_id": "5ab35afab35a91722a553f5e",
        "createdAt": "2018-03-22T07:27:54.334Z",
        "updatedAt": "2018-04-17T02:01:15.052Z",
        "name": "Calvin1",
        "mobilePhone": "13268183362",
        "country": "CHN",
        "province": "广西壮族自治区",
        "provinceId": "450000",
        "city": "南宁市",
        "cityId": "450100",
        "district": "青秀区",
        "districtId": "450103",
        "address": "123 Street",
        "mobilePhoneCountry": "CHN",
        "postalCode": "",
        "street": "中山街道",
        "streetId": "450103002",
        "user": "5aa9efa2104b1e613138b5e1",
        "lastUsedAt": "2018-04-17T02:01:15.051Z",
        "__v": 0
      },
      {
        "_id": "5ad551e079d73a3ab1ee8ddd",
        "createdAt": "2018-04-17T01:46:08.433Z",
        "updatedAt": "2018-04-17T01:46:08.433Z",
        "name": "harley",
        "country": "CHN",
        "province": "广东省",
        "provinceId": "440000",
        "city": "东莞市",
        "cityId": "441900",
        "district": "东莞市",
        "districtId": "441900",
        "street": "茶山镇",
        "streetId": "441900103",
        "address": "A11",
        "mobilePhone": "13413645389",
        "mobilePhoneCountry": "CHN",
        "user": "5aa9efa2104b1e613138b5e1",
        "lastUsedAt": "2018-04-17T01:46:08.426Z",
        "__v": 0
      },
      {
        "_id": "5acec3b709d19735c7739457",
        "createdAt": "2018-04-12T02:25:59.066Z",
        "updatedAt": "2018-04-16T07:25:58.179Z",
        "name": "Harley",
        "country": "CHN",
        "province": "天津",
        "provinceId": "120000",
        "city": "天津市",
        "cityId": "120100",
        "district": "和平区",
        "districtId": "120101",
        "street": "劝业场街道",
        "streetId": "120101001",
        "address": "创业谷",
        "mobilePhone": "13413645389",
        "mobilePhoneCountry": "CHN",
        "user": "5aa9efa2104b1e613138b5e1",
        "lastUsedAt": "2018-04-16T07:25:31.701Z",
        "__v": 0
      },
      {
        "_id": "5ab36295b35a91722a553f6d",
        "createdAt": "2018-03-22T08:00:21.078Z",
        "updatedAt": "2018-03-30T13:04:21.805Z",
        "name": "harley",
        "country": "CHN",
        "province": "广东省",
        "provinceId": "440000",
        "city": "东莞市",
        "cityId": "441900",
        "district": "东莞市",
        "districtId": "441900",
        "street": "东城街道",
        "streetId": "441900003",
        "address": "123street",
        "mobilePhone": "13413645389",
        "mobilePhoneCountry": "CHN",
        "user": "5aa9efa2104b1e613138b5e1",
        "lastUsedAt": "2018-03-30T13:04:12.883Z",
        "__v": 0
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!this.data.locale || this.data.locale !== app.globalData.locale) {
      app.translate.langData(this);
    }
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

  }
})