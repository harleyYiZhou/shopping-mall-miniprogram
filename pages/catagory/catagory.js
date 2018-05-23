// pages/catagory/catagory.js
let app = getApp();
const { callApi } = require('../../utils/guzzu-utils.js');

Page({
	data: {
		tapIndex: 0,
		selected: '1',
		categoryPage: [],
		stores: [],
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
			selected: '1'
		});
	},
	btnNavLink: app.btnNavLink(),
	chooseLevel(e) {
		let tapIndex = e.currentTarget.dataset.index;
		this.setData({
			tapIndex
		});
		if (tapIndex === '-1') {
			this.setData({
				categoryPage: {}
			});
			let temp = this.data.stores;
			let options = {
				page: this.data.currentPage,
				pageSize: this.data.pageSize
			};
			callApi.post('Store.find', options, 400).then(result => {
				if (result && result.totalPages) {
					temp = temp.concat(result.results);
					this.setData({
						stores: temp,
						totalPages: result.totalPages,
						currentPage: result.currentPage,
					});
				}
			}).catch(err => {
				console.error(err);
			});
			return;
		}
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
