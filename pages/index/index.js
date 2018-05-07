// index.js
// 获取应用实例
// var navbar=require("../components/navbar/navbar.js")
const app = getApp();
var json = require('../../json/page.js');
var guzzuUtils = require('../../utils/guzzu-utils.js');

Page({
	data: {
		motto: 'Hello World',
		userInfo: {},
		hasUserInfo: false,
		canIUse: wx.canIUse('button.open-type.getUserInfo'),
		navWidth: 0,
		imageArr: [],
		current: 0,
		productCol: 2,
		page1: json.page1,
		selected: '0',
		activeCategoryId: 0
	},
	btmNavLink: app.btmNavLink,
	// 事件处理函数
	bindViewTap: function () {
		wx.navigateTo({
			url: '../logs/logs'
		});
	},
	onLoad: function () {
		var that = this;
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}

		guzzuUtils.callApiGet('shopping-malls/5adedc43de3c90022eb25d3b/pages').then(function (result) {
			that.setData({
				pages: result
			});
			var pageId = that.data.pages[that.data.activeCategoryId]._id;
			guzzuUtils.callApiGet('shopping-malls/5adedc43de3c90022eb25d3b/pages/' + pageId).then(function (res) {
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
		switch (linkType) {
			case 'product':
				if (linkType) {
					let linkId = product._id;
					wx.navigateTo({
						url: '/pages/product-detail/product-detail?linkId=' + linkId,
					});
				}
				break;
			case 'shoppingMallCategory':
				if (linkType) {
					let linkId = product.shoppingMallCategory;
					wx.navigateTo({
						url: '/pages/product-detail/product-detail?linkId=' + linkId,
					});
				}
				break;
			case 'store':
				if (linkType) {
					let linkId = product.store;
					wx.navigateTo({
						url: '/pages/product-detail/product-detail?linkId=' + linkId,
					});
				}
				break;
			case 'store-category':
				// let linkId = product._id;
				wx.navigateTo({
					url: '/store-category/store-category?linkId' + linkId,
				});
				break;
			case 'global-category':
				// let linkId = product._id;
				wx.navigateTo({
					url: '/global-category/global-category?linkId' + linkId,
				});
				break;
			case 'store-top':
				// let linkId = product._id;
				wx.navigateTo({
					url: '/store-top/store-top?linkId' + linkId,
				});
				break;
			case 'global-top':
				// let linkId = product._id;
				wx.navigateTo({
					url: '../index/index',
				});
				break;
			case 'page':
				// let linkId = product._id;
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
		guzzuUtils.callApiGet('shopping-malls/5adedc43de3c90022eb25d3b/pages/' + pageId).then(function (res) {
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
