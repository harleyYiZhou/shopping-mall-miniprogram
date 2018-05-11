// index.js
// 获取应用实例
const app = getApp();
const { callApi, session } = require('../../utils/guzzu-utils.js');

Page({
	data: {
		hasUserInfo: false,
		current: 0,
		selected: '0',
		pageIndex: 0,
		pages: null,
		currentPage: null,
	},
	btnNavLink: app.btnNavLink(),
	onLoad() {
		if (app.globalData.firstCheck) {
			session.checkSync();
			app.globalData.firstCheck = false;
		}
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		callApi.get('shopping-malls/{smallid}/pages').then(result => {
			this.setData({
				pages: result
			});
			_processCurrentPage(this);
		}).catch(err => {
			console.log(err);
		});
		this.setData({
			selected: app.globalData.selected
		});
	},
	getUserInfo: function (e) {
		app.globalData.userInfo = e.detail.userInfo;
		this.setData({
			userInfo: e.detail.userInfo,
			hasUserInfo: true
		});
	},
	linkTo: function (e) {
		let linkId = e.currentTarget.dataset.linkId;
		let linkType = e.currentTarget.dataset.linkType;

		if (!linkId || !linkType && linkType !== 'shoppingMallCategory') {
			return;
		}
		let url;
		switch (linkType) {
			case 'product':
				url = '/pages/product-detail/product-detail?productId=' + linkId;
				break;
			case 'shoppingMallCategory':
				url = 'pages/catagory/catagory';
				break;
			case 'store':
				url = 'pages/store/store?slug=' + linkId;
				break;
			case 'category':
				url = '/pages/store-category/store-category?slug=' + linkId;
				break;
			default:
				console.error('unkown linkType');
				url = '/pages/index/index';
		}
		wx.navigateTo({
			url,
		});
	},
	tabPageNav: function (e) {
		this.setData({
			pageIndex: e.currentTarget.dataset.id
		});
		_processCurrentPage(this);
	},
	bindchange: function (e) {
		this.setData({ current: e.detail.current });
	},

});

function _processCurrentPage(that) {
	let pageId = that.data.pages[that.data.pageIndex]._id;
	callApi.get('shopping-malls/{smallid}/pages/' + pageId).then(res => {
		let blocks = res.blocks;
		for (let i in blocks) {
			if (blocks[i].type === 'productgroup') {
				let productCol = 1;
				if (blocks[i].template === 'double') {
					productCol = 2;
				}
				if (blocks[i].template === 'triple') {
					productCol = 3;
				}
				blocks[i].imageHeight = 750 * 0.8 / productCol;
			}
			if (blocks[i].type === 'banner') {
				let imgHeight = blocks[i].items[0].image.medium.height;
				let imgWidth = blocks[i].items[0].image.medium.width;
				let height = 750 / imgWidth * imgHeight;
				blocks[i].swiperHeight = height;
			}
		}
		that.setData({
			currentPage: res
		});
	}).catch(err => {
		console.log(err);
	});
}
