// index.js
// 获取应用实例
// var navbar=require("../components/navbar/navbar.js")
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
		activeCategoryId: 0
	},
	btnNavLink: app.btnNavLink(),
	onLoad: function () {
		var that = this;
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}

		callApi.get('shopping-malls/{smallid}/pages').then(function (result) {
			that.setData({
				pages: result
			});
			var pageId = that.data.pages[that.data.activeCategoryId]._id;
			callApi.get('shopping-malls/{smallid}/pages/' + pageId).then(function (res) {
				that.setData({
					page: res
				});
				for (var i in that.data.page.blocks) {
					console.log(that.data.page.blocks[i].type);
					if (that.data.page.blocks[i].type === 'navgroup') {
						var navlength = that.data.page.blocks[i].items.length;
					}
					if (that.data.page.blocks[i].type === 'productgroup') {
						if (that.data.page.blocks[i].template === 'double') {
							let productCol = 2;
							that.setData({
								productCol: productCol
							});
						}
						if (that.data.page.blocks[i].template === 'single') {
							let productCol = 1;
							that.setData({
								productCol: productCol
							});
						}
						if (that.data.page.blocks[i].template === 'triple') {
							let productCol = 3;
							that.setData({
								productCol: productCol
							});
						}
					}
					if (that.data.page.blocks[i].type === 'banner') {
						var imgHeight = that.data.page.blocks[i].items[0].image.medium.height;
						var imgWidth = that.data.page.blocks[i].items[0].image.medium.width;
						var height = 750 / imgWidth * imgHeight;
						var arr = that.data.imageArr;
						arr.push(height);
						// console.log(e.detail.width)
						// console.log(e.detail.height)
						// console.log(arr);
						that.setData({
							imageArr: arr,
							swiperHeight: height
						});
					}
				}
				let navwidth = 100 / navlength;
				let productwidth = 100 / that.data.productCol;
				let imageHeight = 750 * 0.8 / that.data.productCol;
				console.log(that.data.page1.items);
				that.setData({
					navWidth: navwidth,
					productwidth: productwidth,
					imageHeight: imageHeight,
					selected: app.globalData.selected
				});
			});
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
		var product = e.currentTarget.dataset.product;
		let linkType = e.currentTarget.dataset.product.linkType;
		console.log(linkType);
		let linkId = product._id;
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
					linkId = product.shoppingMallCategory;
					wx.navigateTo({
						url: '/pages/product-detail/product-detail?linkId=' + linkId,
					});
				}
				break;
			case 'store':
				if (linkType) {
					linkId = product.store;
					wx.navigateTo({
						url: '/pages/product-detail/product-detail?linkId=' + linkId,
					});
				}
				break;
			case 'store-category':
				wx.navigateTo({
					url: '/store-category/store-category?linkId' + linkId,
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
	tabClick: function (e) {
		var that = this;
		this.setData({
			activeCategoryId: e.currentTarget.id
		});
		var pageId = that.data.pages[that.data.activeCategoryId]._id;
		console.log(pageId);
		callApi.get('shopping-malls/{smallid}/pages/' + pageId).then(function (res) {
			that.setData({
				page: res
			});
			for (var i in that.data.page.blocks) {
				if (that.data.page.blocks[i].type === 'navgroup') {
					var navlength = that.data.page.blocks[i].items.length;
				}
				if (that.data.page.blocks[i].type === 'productgroup') {
					if (that.data.page.blocks[i].template === 'double') {
						let productCol = 2;
						that.setData({
							productCol: productCol
						});
					}
					if (that.data.page.blocks[i].template === 'single') {
						let productCol = 1;
						that.setData({
							productCol: productCol
						});
					}
					if (that.data.page.blocks[i].template === 'triple') {
						let productCol = 3;
						that.setData({
							productCol: productCol
						});
					}
				}
				if (that.data.page.blocks[i].type === 'banner') {
					var imgHeight = that.data.page.blocks[i].items[0].image.medium.height;
					var imgWidth = that.data.page.blocks[i].items[0].image.medium.width;
					var height = 750 / imgWidth * imgHeight;
					var arr = that.data.imageArr;
					arr.push(height);
					// console.log(e.detail.width)
					// console.log(e.detail.height)
					// console.log(arr);
					that.setData({
						imageArr: arr,
						swiperHeight: height
					});
				}
			}
			let navwidth = 100 / navlength;
			let productwidth = 100 / that.data.productCol;
			let imageHeight = 750 * 0.8 / that.data.productCol;
			console.log(that.data.page1.items);
			that.setData({
				navWidth: navwidth,
				productwidth: productwidth,
				imageHeight: imageHeight,
				selected: app.globalData.selected
			});
		});
	},

	bindchange: function (e) {
		// console.log(e.detail.current)
		this.setData({ current: e.detail.current });
	},

});
