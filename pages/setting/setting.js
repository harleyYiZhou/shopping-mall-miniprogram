// pages/setting/setting.js
var app=getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: 0,
    lang: ['简体中文','English'],
    language:[
      {
        type: 'zh',
        name: '简体中文'
      },
      {
        type:"en",
        name:'English'
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
    if(this.data.locale==='zh'){
      this.setData({
        index: 0
      })
    }
    if (this.data.locale === 'en') {
      this.setData({
        index: 1
      })
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
  tapLanguage: function (e) {
    this.setData({
      index: e.detail.value
    });
    app.translate.setLocale(this.data.language[this.data.index].type);
    app.translate.langData(this);
   
  }
})