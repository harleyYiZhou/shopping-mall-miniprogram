// app.js
const translate = require('./utils/translate.js');
const { btnNavLink } = require('./utils/util.js');
const { login } = require('./utils/guzzu-utils.js');

App({
	onLaunch() {
		let value = wx.getStorageSync('locale');
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
		shippingAddress: null,
		userInfo: null,
		selected: '0',
		locale: 'zh',
		selectShopIndex: 0,
		pickupPlace: null,
		servicesHours: null,
		selectTime: null,
		appointmentTime: {
			beginTime: new Date(),
			endTime: new Date()
		},
	}
});
