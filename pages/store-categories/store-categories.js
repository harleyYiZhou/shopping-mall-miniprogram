// pages/store-categories/store-categories.js
const guzzuUtils = require('../../utils/guzzu-utils');
const app = getApp();
const { callApi } = guzzuUtils;

Page({
	data: {
		store: null,
		categories: null
	},
	onLoad(options) {
		let storeId = options.storeId;
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		// callApi.get(`stores/${storeId}/categories`).then((result) => {
		callApi.post('Category.find', { storeId }, 400).then((result) => {
			this.setData({
				categories: result
			});
		}, (err) => {
			console.error(err);
		});

		callApi.get(`stores/${storeId}`).then(result => {
			this.setData({
				store: result
			});
		}, (err) => {
			console.error(err);
		});
	},
	onShow() {

	},
	onPullDownRefresh() {

	},

	onReachBottom() {

	},
	onShareAppMessage() {

	},

	tapCategory(e) {
		let storeGroup = e.currentTarget.dataset.storeGroup;
		let storeId = this.data.store._id;
		wx.navigateTo({
			url: '/pages/store-category/store-category?storeId=' + storeId + '&slug=' + storeGroup.slug
		});
	},
	tapStore() {
		let storeId = this.data.store._id;
		wx.redirectTo({
			url: '/pages/store/store?storeId=' + storeId
		});
	},
});
