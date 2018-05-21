// pages/store-category/store-category.js
const guzzuUtils = require('../../utils/guzzu-utils');
const app = getApp();
const { callApi } = guzzuUtils;
const { priceFilter } = require('../../utils/util');

Page({
	data: {
		category: null,
		products: null
	},
	onLoad(options) {
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		// let categoryId = '58087addcbb4821324cc6f92';
		let { slug, storeId } = options;
		callApi.post('Category.getBySlug', {
			storeId,
			slug
		}, 400).then((result) => {
			priceFilter(result);
			this.setData({
				category: result,
				products: result.products
			});
		}, (err) => {
			console.error(err);
		});
	},

	tapProduct(event) {
		let productId = event.currentTarget.dataset.productId;
		wx.navigateTo({
			url: '/pages/product-detail/product-detail?productId=' + productId
		});
	},
	onShow() {

	},
	onPullDownRefresh() {

	},
	onReachBottom() {

	},
	onShareAppMessage() {

	}
});
