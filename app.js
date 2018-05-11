// app.js
const translate = require('./utils/translate.js');
const { btnNavLink } = require('./utils/util.js');

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
	},
	translate,
	btnNavLink,
	globalData: {
		firstCheck: true,
		userInfo: null,
		selected: '0',
		locale: 'zh'
	}
});
