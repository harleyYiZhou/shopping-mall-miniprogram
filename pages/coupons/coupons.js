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
		let storeCards = {};
		let stores = {};
		callApi.post('Discount.find', 400).then(res => {
			res.forEach(elem => {
				stores[elem.store._id] = elem.store;
				let storeCard = storeCards[elem.store._id];
				elem.membership.name || (elem.membership.name = 'vip');
				if (storeCard) {
					storeCard.push(elem.membership);
				} else {
					storeCards[elem.store._id] = [elem.membership];
				}
			});
			this.setData({
				storeCards: Object.entries(storeCards),
				coupons: res,
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
