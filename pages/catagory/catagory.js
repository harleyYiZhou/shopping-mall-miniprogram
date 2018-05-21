// pages/catagory/catagory.js
let app = getApp();
const { callApi } = require('../../utils/guzzu-utils.js');

Page({
	data: {
		tapIndex: 0,
		selected: '2'
	},
	onLoad(options) {
		let categoryId = wx.getStorageSync('catagoryId');
		wx.removeStorageSync('catagoryId');
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		let scrollHeight = wx.getSystemInfoSync().windowHeight / wx.getSystemInfoSync().windowWidth * 750;
		this.setData({
			scrollHeight: scrollHeight - 170
		});
		_getCategory.bind(this)(categoryId);
	},
	onShow() {
		this.setData({
			selected: '2'
		});
	},
	btnNavLink: app.btnNavLink(),
	chooseLevel(e) {
		this.setData({
			tapIndex: e.currentTarget.dataset.index
		});
		_getCategory.bind(this)();
	}
});

function _getCategory(categoryId) {
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
		this.setData({
			categoryPage: result
		});
	}).catch(err => {
		console.error(err);
	});
}
