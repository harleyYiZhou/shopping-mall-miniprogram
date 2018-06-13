// pages/category/category.js
let app = getApp();
const { callApi } = require('../../utils/guzzu-utils.js');
const { priceFilter, showLoading } = require('../../utils/util');

Page({
	data: {
		tapIndex: 0,
		categoryPage: [],
		stores: null,
		scrollHeight: 0 // 左侧标题高度
	},
	onLoad(options) {
		let categoryId = wx.getStorageSync('categoryId');
		wx.removeStorageSync('categoryId');
		let scrollHeight = wx.getSystemInfoSync().windowHeight / wx.getSystemInfoSync().windowWidth * 750;
		this.setData({
			scrollHeight: scrollHeight
		});
		_getCategory.bind(this)(categoryId);
	},
	onShow() {
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
			this.onLoad();
		}
		if (wx.getStorageSync('categoryId')) {
			this.onLoad();
		}
	},
	chooseLevel(e) {
		let tapIndex = e.currentTarget.dataset.index;
		if (tapIndex === this.data.tapIndex) {
			return;
		}
		this.setData({
			tapIndex
		});
		if (tapIndex === '-1') {
			this.setData({
				categoryPage: {}
			});
			callApi.get('shopping-malls/{smallid}/stores').then(result => {
				this.setData({
					stores: result,
				});
			}).catch(err => {
				console.error(err);
			});
			return;
		}
		this.setData({
			stores: []
		});
		_getCategory.bind(this)();
	}
});

function _getCategory(categoryId) {
	showLoading();
	callApi.get('shopping-malls/{smallid}/categories').then((results) => {
		let tapIndex = this.data.tapIndex;
		if (categoryId) {
			let bool;
			results.forEach((elem, i) => {
				if (bool) {
					return;
				}
				if (elem._id === categoryId) {
					tapIndex = i;
					bool = true;
				}
			});
		} else {
			categoryId = results[tapIndex]._id;
		}
		this.setData({
			category: results,
			categoryId,
			tapIndex,
		});
		return callApi.get('shopping-malls/{smallid}/categories/' + categoryId);
	}).then((result) => {
		priceFilter(result);
		this.setData({
			categoryPage: result
		});
		if (!this.data.stores) {
			this.setData({
				stores: []
			});
		}
	}).catch(err => {
		console.error(err);
	}).finally(() => {
		wx.hideLoading();
	});
}
