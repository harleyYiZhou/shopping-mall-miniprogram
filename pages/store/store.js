// store.js
const guzzuUtils = require('../../utils/guzzu-utils');
const app = getApp();
const callApi = guzzuUtils.callApi.post;
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
		let that = this;
		let storeId;
		let slug = option.slug;
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		callApi('Store.get', {
			slug
		}, 400).then((result) => {
			that.setData({
				store: result
			});
			storeId = result._id;
			return callApi('Product.find', {
				storeId,
				page: 1,
				pageSize: that.data.pageSize
			}, 400);
		}).then((data) => {
			let products = data.results;
			that.setData({
				currentPage: 1,
				lastPageLength: data.results.length,
				totalPages: data.totalPages,
				products
			});
			wx.stopPullDownRefresh();
			wx.hideNavigationBarLoading();
		}, (err) => {
			console.log(err);
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
		callApi('Product.find', {
			storeId: that.data.store._id,
			page: nextPage,
			pageSize: that.data.pageSize
		}, 400).then((data) => {
			console.log(1, data);
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
			console.log(err);
		});
	}, // 点击商品跳转到详情
	tapProduct(event) {
		let productId = event.currentTarget.dataset.productId;
		wx.navigateTo({
			url: '/pages/product-detail/product-detail?productId=' + productId
		});
	},
	tapStoreCart() {
		let that = this;
		let slug = that.data.store.slug;
		let storeId = that.data.store._id;
		if (app.globalData.userInfo && app.globalData.mobilePhone) {
			wx.navigateTo({
				url: '/pages/store-cart/store-cart?storeId=' + storeId + '&slug=' + slug
			});
			return;
		}
		app.login().then(res => {
			wx.navigateTo({
				url: '/pages/store-cart/store-cart?storeId=' + storeId + '&slug=' + slug
			});
		});
	},
	tapStore() {
		wx.reLaunch({
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
