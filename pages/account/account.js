// pages/account/account.js
const { Actionsheet, extend } = require('../components/actionsheet/actionsheet.js');
const Zan = require('../index.js');
var app=getApp();

Page(Object.assign({}, Zan.Dialog, {
  data: {

  },
  onLoad: function (option){
    console.log(1);
    if (!this.data.locale || this.data.locale !== app.globalData.locale) {
      app.translate.langData(this);
    }
  },
  toggleBaseDialog() {
    this.showZanDialog({
      title: '修改姓名',
      content: 'harley',
      showCancel: true
    }).then(() => {
      console.log('=== dialog ===', 'type: confirm');
    }).catch(() => {
      console.log('=== dialog ===', 'type: cancel');
    });
  },

  toggleWithoutTitleDialog() {
    this.showZanDialog({
      content: '这是一个模态弹窗'
    }).then(() => {
      console.log('=== dialog without title ===', 'type: confirm');
    });
  },

  toggleButtonDialog() {
    this.showZanDialog({
      title: '弹窗',
      content: '这是一个模态弹窗',
      buttons: [{
        text: '现金支付',
        color: 'red',
        type: 'cash'
      }, {
        text: '微信支付',
        color: '#3CC51F',
        type: 'wechat'
      }, {
        text: '取消',
        type: 'cancel'
      }]
    }).then(({ type }) => {
      console.log('=== dialog with custom buttons ===', `type: ${type}`);
    });
  },

  toggleVerticalDialog() {
    this.showZanDialog({
      title: '弹窗',
      content: '这是一个模态弹窗',
      buttonsShowVertical: true,
      buttons: [{
        text: '现金支付',
        color: 'red',
        type: 'cash'
      }, {
        text: '微信支付',
        color: '#3CC51F',
        type: 'wechat'
      }, {
        text: '取消',
        type: 'cancel'
      }]
    }).then(({ type }) => {
      console.log('=== dialog with vertical buttons ===', `type: ${type}`);
    });
  },
  userImg: function(){
    wx.showActionSheet({
      itemList: ['手机拍照','本地图片'],
      success: function (res) {
        console.log(res.tapIndex);
        if(res.tapIndex===0){
          console.log("scan");
        }
        if(res.tapIndex===1){
          console.log("imgage");
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  }
}));