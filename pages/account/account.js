// pages/account/account.js
const { Actionsheet, extend } = require('../components/actionsheet/actionsheet.js');
const Zan = require('../index.js');
var app = getApp();
const { session } = require('../../utils/guzzu-utils.js');
const { showToast, debug } = require('../../utils/util');

Page(Object.assign({}, Zan.Dialog, {
	data: {

	},
	onLoad: function (option) {
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
	},
	onShow() {
		this.setData({
			userInfo: app.globalData.userInfo
		});
	},
	logout() {
		session.remove();
		showToast({
			title: 'common.logoutSuccess'
		});
		wx.setStorageSync('logout', true);
		setTimeout(() => {
			wx.navigateBack();
		}, 1500);
	},
	toggleBaseDialog() {
		this.showZanDialog({
			title: '修改姓名',
			content: 'harley',
			showCancel: true
		}).then(() => {
			debug('=== dialog ===', 'type: confirm');
		}).catch(() => {
			console.error('=== dialog ===', 'type: cancel');
		});
	},

	toggleWithoutTitleDialog() {
		this.showZanDialog({
			content: '这是一个模态弹窗'
		}).then(() => {
			debug('=== dialog without title ===', 'type: confirm');
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
			debug('=== dialog with custom buttons ===', `type: ${type}`);
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
			debug('=== dialog with vertical buttons ===', `type: ${type}`);
		});
	},
	userImg: function () {
		wx.showActionSheet({
			itemList: ['手机拍照', '本地图片'],
			success: function (res) {
				debug(res.tapIndex);
				if (res.tapIndex === 0) {
					debug('scan');
				}
				if (res.tapIndex === 1) {
					debug('imgage');
				}
			},
			fail: function (res) {
				console.error(res.errMsg);
			}
		});
	}
}));
