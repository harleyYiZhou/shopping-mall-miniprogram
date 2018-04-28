// pages/product-detail/product-detail.js
var json = require("../../json/page.js");
var app=getApp();
var guzzuUtil=require("../../utils/guzzu-utils.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page1: json.page1,
    item: json.page1.blocks[1],
    imageArr: [],
    footerhidden: false,
    hideShopPopup: true,
    buyNum: 1,
    showProductDetail: true,
    "goodsDetail": {
      "logistics": {
        "isFree": true,
        "feeType": 0,
        "feeTypeStr": "按件数",
        "details": [
          {
            "addAmount": 0,
            "addNumber": 1,
            "firstAmount": 8,
            "firstNumber": 100,
            "type": 0,
            "userId": 951
          }
        ]
      },
      "category": {
        "dateAdd": "2017-09-12 11:07:32",
        "icon": "",
        "id": 1872,
        "isUse": true,
        "key": "1",
        "name": "上装",
        "paixu": 0,
        "pid": 0,
        "type": "",
        "userId": 951
      },
      "pics": [
        {
          "goodsId": 4470,
          "id": 26187,
          "pic": "https://cdn.it120.cc/apifactory/2017/09/23/2b17c4d23cb83824eb4362052831ab8e.jpg"
        }
      ],
      "content": "<p>中小童毛衣，适合2-5岁宝宝</p><p><img src=\"https://cdn.it120.cc/apifactory/2017/09/23/451361ecbda08566743ea470179af961.jpg\" title=\"apifactory/2017/09/23/451361ecbda08566743ea470179af961.jpg\" alt=\"微信图片_20170924093256.jpg\"/></p>",
      "properties": [
        {
          "childsCurGoods": [
            {
              "dateAdd": "2017-09-12 20:59:48",
              "id": 1583,
              "name": "90",
              "paixu": 0,
              "propertyId": 870,
              "remark": "",
              "userId": 951,
              "active": false
            },
            {
              "dateAdd": "2017-09-12 20:59:53",
              "id": 1584,
              "name": "100",
              "paixu": 0,
              "propertyId": 870,
              "remark": "",
              "userId": 951,
              "active": false
            },
            {
              "dateAdd": "2017-09-13 09:50:34",
              "id": 1594,
              "name": "110",
              "paixu": 0,
              "propertyId": 870,
              "remark": "",
              "userId": 951,
              "active": true
            }
          ],
          "dateAdd": "2017-09-12 20:59:10",
          "id": 870,
          "name": "尺码",
          "paixu": 0,
          "userId": 951
        },
        {
          "childsCurGoods": [
            {
              "dateAdd": "2017-09-13 10:10:21",
              "id": 1602,
              "name": "橘红色",
              "paixu": 0,
              "propertyId": 871,
              "remark": "",
              "userId": 951,
              "active": true
            },
            {
              "dateAdd": "2017-09-13 12:51:46",
              "id": 1618,
              "name": "酒红色",
              "paixu": 0,
              "propertyId": 871,
              "remark": "",
              "userId": 951,
              "active": false
            },
            {
              "dateAdd": "2017-09-13 13:56:09",
              "id": 1624,
              "name": "枣红色",
              "paixu": 0,
              "propertyId": 871,
              "remark": "",
              "userId": 951,
              "active": false
            },
            {
              "dateAdd": "2017-09-22 15:49:11",
              "id": 1876,
              "name": "宝蓝色",
              "paixu": 0,
              "propertyId": 871,
              "remark": "",
              "userId": 951,
              "active": false
            }
          ],
          "dateAdd": "2017-09-12 21:03:40",
          "id": 871,
          "name": "颜色",
          "paixu": 0,
          "userId": 951
        }
      ],
      "basicInfo": {
        "categoryId": 1872,
        "characteristic": "中小童毛衣",
        "commission": 0,
        "commissionType": 0,
        "dateAdd": "2017-09-24 09:47:58",
        "dateStart": "2017-09-24 09:43:08",
        "dateUpdate": "2018-04-25 15:14:22",
        "id": 4470,
        "logisticsId": 386,
        "minPrice": 49,
        "minScore": 0,
        "name": "毛衣",
        "numberFav": 0,
        "numberGoodReputation": 0,
        "numberOrders": 0,
        "originalPrice": 89,
        "paixu": 0,
        "pic": "https://cdn.it120.cc/apifactory/2017/09/23/2b17c4d23cb83824eb4362052831ab8e.jpg",
        "propertyIds": ",870,871,",
        "recommendStatus": 0,
        "recommendStatusStr": "普通",
        "shopId": 0,
        "status": 0,
        "statusStr": "上架",
        "stores": 100,
        "userId": 951,
        "views": 2434,
        "weight": 0
      }
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    if (!this.data.locale || this.data.locale !== app.globalData.locale) {
      app.translate.langData(this);
    }
    that.setData({
      productId: options.linkId
    })
    guzzuUtil.callApiGet('products/'+that.data.productId).then(function(res1){
      console.log(res1);
      that.setData({
        page: res1
      });
      guzzuUtil.callApiGet('stores/'+res1.store).then(function(res2){
        console.log(res2);
        that.setData({
          store: res2
        })
      })
    })
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
  imageLoad: function (e) {
    var that = this;
    var height = 750 / e.detail.width * e.detail.height;
    var arr = that.data.imageArr;
    arr.push(height);
    // console.log(e.detail.width)
    // console.log(e.detail.height)
    // console.log(arr);
    that.setData({
      imageArr: arr
    })
  },
  bindchange: function (e) {
    // console.log(e.detail.current)
    this.setData({ current: e.detail.current })
  },
  showPopup: function () {
    this.setData({
      hideShopPopup: false,
      footerhidden: true
    })
  },
  hideShopPopup: function () {
    this.setData({
      hideShopPopup: true,
      footerhidden: false
    })
  },
  labelItemTap: function (e) {
    var that = this;
    var childs = that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods;
    for (var i = 0; i < childs.length; i++) {
      that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[i].active = false;
    }
    // 设置当前选中状态
    that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[e.currentTarget.dataset.propertychildindex].active = true;
    that.setData({
      goodsDetail: that.data.goodsDetail
    })
  },
  numJianTap: function () {
    if (this.data.buyNum > 1) {
      var num = this.data.buyNum;
      num = num - 1;
      this.setData({
        buyNum: num
      })
    }
  },
  numJiaTap: function () {
    if (this.data.buyNum) {
      var num = this.data.buyNum;
      num = num + 1;
      this.setData({
        buyNum: num
      })
    }
  },
  changeNum: function(e){
    if (e.detail.value>1){
      console.log(e.detail.value);
      var num=parseInt(e.detail.value);
      this.setData({
        buyNum: num
      })
    }else{
      this.setData({
        buyNum: this.data.buyNum
      })
    }
  },

  
  onReachBottom: function(){
    console.log(44);
    this.setData({
      showProductDetail: false
    })
  }
})