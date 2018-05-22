// pages/user-center/user-center.js
const app = getApp();
const { login, session } = require('../../utils/guzzu-utils.js');
const { showLoading } = require('../../utils/util');

Page({
	data: {
		selected: '3',
		userInfo: null,
		checkItem: 0
	},
	onLoad(options) {
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
	},
	onReady() {
	},
	onShow() {
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		let checkItem = this.data.locale === 'zh' ? 0 : 1;
		this.setData({
			selected: '3',
			checkItem
		});
		app.globalData.login.finally(() => {
			this.setData({
				userInfo: app.globalData.userInfo
			});
		});
	},
	toAccount() {
		app.globalData.login.finally(() => {
			if (app.globalData.userInfo) {
				wx.navigateTo({
					url: '/pages/account/account',
				});
			} else {
				showLoading();
				login().then(() => {
					wx.hideLoading();
					this.onShow();
				});
			}
		});
	},
	toOrders(e) {
		let { status = 0 } = e.currentTarget.dataset;
		wx.setStorageSync('status', status);
		if (session.checkSync()) {
			if (app.globalData.userInfo) {
				wx.navigateTo({
					url: `/pages/orders/orders?status=${status}`,
				});
			}
		}
	},
	tapLanguage(e) {
		let langs = ['zh', 'en'];
		let checkItem = e.currentTarget.dataset.index;
		if (langs[checkItem] === this.data.locale) {
			return;
		}
		this.setData({
			checkItem
		});
		app.translate.setLocale(langs[checkItem]);
		app.translate.langData(this);
	},
	onPullDownRefresh() {

	},
	onReachBottom() {

	},
	onShareAppMessage() {

	},
	btnNavLink: app.btnNavLink()
});
