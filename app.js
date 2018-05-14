// app.js
const translate = require('./utils/translate.js');
const { btnNavLink } = require('./utils/util.js');
const { login } = require('./utils/guzzu-utils.js');

App({
	onLaunch: function () {
		var value = wx.getStorageSync('locale');
		if (value) {
			this.globalData.locale = value;
		} else {
			wx.setStorage({
				key: 'locale',
				data: 'zh'
			});
		}
		this.globalData.trans = require(`./locales/${this.globalData.locale}`);
	},
	onShow() {
		this.globalData.login = login();
	},
	translate,
	btnNavLink,
	globalData: {
		userInfo: null,
		selected: '0',
		locale: 'zh'
	}
});
