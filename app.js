// app.js
var guzzuUtils = require('./utils/guzzu-utils.js');
const translate = require('./utils/translate.js');

App({
	onLaunch: function () {
		let that = this;
		var value = wx.getStorageSync('locale');
		if (value) {
			that.globalData.locale = value;
		} else {
			wx.setStorage({
				key: 'locale',
				data: 'zh'
			});
		}
		that.globalData.trans = require(`./locales/${that.globalData.locale}`);
		// this.login();
		var timestamp = new Date();
		console.log(time.formatTime(timestamp, 'Y/M/D h:m:s'));
		console.log(time.formatTime(timestamp, 'h:m'));
	},
	translate,
	btmNavLink: function (e) {
		this.globalData.selected = e.currentTarget.id;
		console.log(this.globalData);
		wx.showLoading({
			title: 'loading',
		});
		var id = e.currentTarget.id;
		switch (id) {
			case '0':
				wx.redirectTo({
					url: '/pages/index/index',
				});
				break;
			case '1':
				wx.redirectTo({
					url: '/pages/shopping-cart/shopping-cart',
				});
				break;
			case '2':
				wx.redirectTo({
					url: '/pages/catagory/catagory',
				});
				break;
			case '3':
				wx.redirectTo({
					url: '/pages/user-center/user-center',
				});
				break;
		}
		wx.hideLoading();
	},
	globalData: {
		userInfo: null,
		selected: '0',
		locale: 'zh'
	}
});
