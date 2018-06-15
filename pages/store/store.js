// store.js
const guzzuUtils = require('../../utils/guzzu-utils');
const app = getApp();
const { callApi } = guzzuUtils;
Page({
	data: {
		store: null,
		products: [],
		currentPage: 1,
		pageSize: 10,
		lastPageLength: 0,
		totalPages: 1
	},
	onLoad(option) {
		let { storeId } = option;
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		callApi.get(`stores/${storeId}`).then(result => {
			this.setData({
				store: result
			});
			storeId = result._id;
			return callApi.post('Product.find', {
				storeId,
				page: 1,
				pageSize: this.data.pageSize,
				type: 'default'
			}, 400);
		}).then(data => {
			let products = data.results;
			this.setData({
				currentPage: 1,
				lastPageLength: data.results.length,
				totalPages: data.totalPages,
				products
			});
			wx.stopPullDownRefresh();
			wx.hideNavigationBarLoading();
		}, (err) => {
			console.error(err);
		});
	},
	onPullDownRefresh() {
		wx.showNavigationBarLoading();
		this.setData({
			products: [],
			totalPages: 0,
			currentPage: 1
		});
		let pages = getCurrentPages();
		let currPage = pages[pages.length - 1];
		this.onLoad(currPage.options);
	},
	onReachBottom() {
		let that = this;
		let currentPage = that.data.currentPage;
		let lastPageLength = that.data.lastPageLength;
		let totalPages = that.data.totalPages;
		let nextPage = ++currentPage;
		let isLastPage = false;
		if (nextPage > totalPages) {
			--nextPage;
			isLastPage = true;
		}
		callApi.post('Product.find', {
			storeId: that.data.store._id,
			page: nextPage,
			pageSize: that.data.pageSize,
			type: 'default'
		}, 400).then((data) => {
			let products = that.data.products;
			if (isLastPage) {
				for (let i = lastPageLength; i < data.results.length; ++i) {
					products.push(data.results[i]);
				}
			} else {
				for (let i = 0; i < data.results.length; ++i) {
					products.push(data.results[i]);
				}
			}
			that.setData({
				currentPage: data.currentPage,
				lastPageLength: data.results.length,
				totalPages: data.totalPages,
				products
			});
		}, (err) => {
			console.error(err);
		});
	}, // 点击商品跳转到详情
	tapProduct(event) {
		let productId = event.currentTarget.dataset.productId;
		wx.navigateTo({
			url: '/pages/product-detail/product-detail?productId=' + productId
		});
	},
	tapStore() {
		wx.switchTab({
			url: '/pages/index/index'
		});
	}, // 跳转商品分类，传入两个参数slug&storeId
	tapStoreCategory() {
		let that = this;
		let slug = that.data.store.slug;
		let storeId = that.data.store._id;
		wx.navigateTo({
			url: '/pages/store-categories/store-categories?slug=' + slug + '&storeId=' + storeId
		});
	},
	onShareAppMessage() {
		let pages = getCurrentPages();
		let page = pages[pages.length - 1];
		return {
			title: this.data.store.name,
			path: `/${page.route}?slug=${page.options.slug}`
		};
	}
});
