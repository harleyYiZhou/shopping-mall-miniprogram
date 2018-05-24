// pages/coupons/coupons.js
const app = getApp();
const { callApi } = require('../../utils/guzzu-utils.js');

Page({

	data: {
		coupons: {},
		stores: {}
	},

	onLoad(options) {
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		let coupons = {};
		let stores = {};
		callApi.post('Discount.getByPromoCode', {
			storeId: '57d7703f8a2848bc5f150e06',
			promoCode: 'zx9527'
		}, 400).then(res => {
			let results = [res];
			results.forEach(elem => {
				stores[elem.store._id] = elem.store;
				let storeCoupons = coupons[elem.store._id];
				if (storeCoupons) {
					storeCoupons.push(elem);
				} else {
					coupons[elem.store._id] = [elem];
				}
			});
			this.setData({
				coupons: Object.entries(coupons),
				userCoupons: res,
				stores,
			});
		}).catch(err => {
			console.error(err);
		});
	},

	onReady() {

	},

	onShow() {

	},

	onHide() {

	},

	onUnload() {

	},

	onPullDownRefresh() {

	},

	onReachBottom() {

	},

	onShareAppMessage() {

	}
});
