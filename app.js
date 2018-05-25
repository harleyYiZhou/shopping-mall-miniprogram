// app.js
const translate = require('./utils/translate.js');

const {
	login,
	cartsCounter,
	synchronizeCart,
	callApi,
} = require('./utils/guzzu-utils.js');

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
		wx.setTabBarStyle({
			selectedColor: '#FF0000',
		});
		this.globalData.login = new Promise((resovle, reject) => {
			let info;
			let error;
			login().then(res => {
				info = res;
			}).catch(err => {
				error = err || new Error('login fail');
			}).finally(() => {
				return processCartsCounter(error);
			}).then(() => {
				if (error) {
					reject(error);
				} else {
					resovle(info);
				}
			}).catch(err => {
				console.error(err);
			});
		});
		let routes = getCurrentPages().reverse();
		if (routes.length > 0 && routes[0].route.indexOf('shopping-cart') > -1 && this.globalData.onShow) {
			this.globalData.onShow();
		}
	},
	translate,
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

function processCartsCounter(bool) {
	let routes = getCurrentPages().reverse();
	if (routes.length > 0 && routes[0].route.indexOf('shopping-cart') > -1) {
		return Promise.resolve();
	}
	let localCarts = wx.getStorageSync('localCarts');
	if (bool) {
		cartsCounter(localCarts);
		return Promise.resolve();
	} else {
		return new Promise((resolve, reject) => {
			let getCarts;
			if (localCarts) {
				getCarts = synchronizeCart(localCarts);
			} else {
				getCarts = callApi.post('StoreCart.getAll', {}, 400);
			}
			getCarts.then(res => {
				resolve(cartsCounter(res));
			});
		});
	}
}
