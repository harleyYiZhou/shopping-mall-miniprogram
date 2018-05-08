// index.js
// 获取应用实例
// var page-nav=require("../components/page-nav/page-nav.js")
const app = getApp();
var json = require('../../json/page.js');
const { callApi } = require('../../utils/guzzu-utils.js');

Page({
	data: {
		hasUserInfo: false,
		navWidth: 0,
		imageArr: [],
		current: 0,
		productCol: 2,
		page1: json.page1,
		selected: '0',
		pageIndex: 0,
		pages: null,
		currentPage: null,
	},
	btnNavLink: app.btnNavLink(),
	onLoad() {
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		callApi.get('shopping-malls/{smallid}/pages').then(result => {
			this.setData({
				pages: result
			});
			_processCurrentPage(this);
		});
		this.setData({
			selected: app.globalData.selected
		});
	},
	getUserInfo: function (e) {
		console.log(e);
		app.globalData.userInfo = e.detail.userInfo;
		this.setData({
			userInfo: e.detail.userInfo,
			hasUserInfo: true
		});
	},
	linkTo: function (e) {
		let titleItem = e.currentTarget.dataset.titleItem;
		let linkType = titleItem.linkType;
		let linkId = titleItem[linkType];
		switch (linkType) {
			case 'product':
				if (linkType) {
					wx.navigateTo({
						url: '/pages/product-detail/product-detail?linkId=' + linkId,
					});
				}
				break;
			case 'shoppingMallCategory':
				if (linkType) {
					wx.navigateTo({
						url: '/pages/product-detail/product-detail?linkId=' + linkId,
					});
				}
				break;
			case 'store':
				if (linkType) {
					wx.navigateTo({
						url: '/pages/product-detail/product-detail?linkId=' + linkId,
					});
				}
				break;
			case 'category':
				wx.navigateTo({
					url: '/category/category?linkId' + linkId,
				});
				break;
			case 'global-category':
				wx.navigateTo({
					url: '/global-category/global-category?linkId' + linkId,
				});
				break;
			case 'store-top':
				wx.navigateTo({
					url: '/store-top/store-top?linkId' + linkId,
				});
				break;
			case 'global-top':
				wx.navigateTo({
					url: '../index/index',
				});
				break;
			case 'page':
				wx.navigateTo({
					url: '../page/page?linkId' + linkId,
				});
				break;
			default:
				break;
		}
	},
	tabPageNav: function (e) {
		this.setData({
			pageIndex: e.currentTarget.id
		});
		_processCurrentPage(this);
	},

	bindchange: function (e) {
		// console.log(e.detail.current)
		this.setData({ current: e.detail.current });
	},

});

function _processCurrentPage(that) {
	let pageId = that.data.pages[that.data.pageIndex]._id;
	callApi.get('shopping-malls/{smallid}/pages/' + pageId).then(res => {
		that.setData({
			currentPage: res
		});
		let blocks = that.data.currentPage.blocks;
		let navlength;
		for (let i in blocks) {
			if (blocks[i].type === 'navgroup') {
				navlength = blocks[i].items.length;
			}
			if (blocks[i].type === 'productgroup') {
				let productCol;
				if (blocks[i].template === 'single') {
					productCol = 1;
				}
				if (blocks[i].template === 'double') {
					productCol = 2;
				}
				if (blocks[i].template === 'triple') {
					productCol = 3;
				}
				that.setData({
					productCol
				});
			}
			if (blocks[i].type === 'banner') {
				let imgHeight = blocks[i].items[0].image.medium.height;
				let imgWidth = blocks[i].items[0].image.medium.width;
				let height = 750 / imgWidth * imgHeight;
				let arr = that.data.imageArr;
				arr.push(height);
				that.setData({
					imageArr: arr,
					swiperHeight: height
				});
			}
		}

		// let navWidth = 100 / navlength;
		let productWidth = 100 / that.data.productCol;
		let imageHeight = 750 * 0.8 / that.data.productCol;
		that.setData({
			// navWidth,
			productWidth,
			imageHeight,
		});
	});
}
