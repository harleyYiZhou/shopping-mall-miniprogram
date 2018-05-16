// index.js
const app = getApp();
const { priceFilter, showModal, showToast, showLoading, debug } = require('../../utils/util');
const { callApi, session, addToShopCarInfo } = require('../../utils/guzzu-utils.js');

Page({
	data: {
		shopCarInfo: null,
		goodsList: {
			editable: false,
			totalCost: 0,
			allSelect: false,
			noSelect: false,
		},
		delBtnWidth: 120, // 删除按钮宽度单位（rpx）
		fakeList: {},
		selected: '1',
		activeItems: [],
	},
	btnNavLink: app.btnNavLink(),
	// 获取元素自适应后的实际宽度
	getEleWidth: function (w) {
		var real = 0;
		try {
			var res = wx.getSystemInfoSync().windowWidth;
			var scale = (750 / 2) / (w / 2); // 以宽度750px设计稿做宽度的自适应
			// console.log(scale);
			real = Math.floor(res / scale);
			return real;
		} catch (e) {
			return false;
			// Do something when catch error
		}
	},
	initEleWidth: function () {
		var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
		this.setData({
			delBtnWidth: delBtnWidth
		});
	},
	onLoad: function () {
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		this.initEleWidth();
	},
	onShow: function () {
		app.globalData.login.finally(() => {
			session.check().then(res => {
				if (res) {
					return getStoreCarts();
				}
				return res;
			}).then(res => {
				if (res) {
					let activeItems = res.map(() => {
						return {
							active: false,
							totalCost: '0.00',
							items: []
						};
					});
					this.setData({
						carts: res,
						activeItems
					});
				}
			}).catch(err => {
				console.error(err);
			});
		});
		var shopList = [];
		// 获取购物车数据
		var shopCarInfoMem = wx.getStorageSync('shopCarInfo');
		if (shopCarInfoMem && shopCarInfoMem.shopList) {
			shopList = shopCarInfoMem.shopList;
		}
		// this.data.goodsList.list = this.data.fakeList;
		this.setData({
			// goodsList: this.data.fakeList,
			selected: '1',
			shopCarInfo: shopCarInfoMem,
		});
		// this.setGoodsList(this.getSaveHide(), this.totalCost(), this.allSelect(), this.noSelect(), shopList);
		debug('cart show');
	},
	toIndexPage: function () {
		wx.redirectTo({
			url: '/pages/index/index'
		});
	},

	touchS: function (e) {
		if (e.touches.length === 1) {
			this.setData({
				startX: e.touches[0].clientX
			});
		}
	},
	touchM: function (e) {
		var index = e.currentTarget.dataset.index;
		if (e.touches.length === 1) {
			var moveX = e.touches[0].clientX;
			var disX = this.data.startX - moveX;
			var delBtnWidth = this.data.delBtnWidth;
			var left = '';
			if (disX == 0 || disX < 0) { // 如果移动距离小于等于0，container位置不变
				left = 'margin-left:0px';
			} else if (disX > 0) { // 移动距离大于0，container left值等于手指移动距离
				left = 'margin-left:-' + disX + 'px';
				if (disX >= delBtnWidth) {
					left = 'left:-' + delBtnWidth + 'px';
				}
			}
			var list = this.data.goodsList.list;
			if (index != '' && index != null) {
				list[parseInt(index)].left = left;
				this.setGoodsList(this.getSaveHide(), this.totalCost(), this.allSelect(), this.noSelect(), list);
			}
		}
	},

	touchE: function (e) {
		var index = e.currentTarget.dataset.index;
		if (e.changedTouches.length == 1) {
			var endX = e.changedTouches[0].clientX;
			var disX = this.data.startX - endX;
			var delBtnWidth = this.data.delBtnWidth;
			// 如果距离小于删除按钮的1/2，不显示删除按钮
			var left = disX > delBtnWidth / 2 ? 'margin-left:-' + delBtnWidth + 'px' : 'margin-left:0px';
			var list = this.data.goodsList.list;
			if (index !== '' && index != null) {
				list[parseInt(index)].left = left;
				this.setGoodsList(this.getSaveHide(), this.totalCost(), this.allSelect(), this.noSelect(), list);
			}
		}
	},
	delItem: function (e) {
		var index = e.currentTarget.dataset.index;
		var list = this.data.goodsList.list;
		list.splice(index, 1);
		this.setGoodsList(this.getSaveHide(), this.totalCost(), this.allSelect(), this.noSelect(), list);
	},
	/*
	updateItem: function (event) {
		var that = this;
		var cartIndex = parseInt(event.currentTarget.dataset.cartIndex);
		var itemIndex = parseInt(event.currentTarget.dataset.itemIndex);
		var quantity = parseInt(event.currentTarget.dataset.quantity);
		wx.showLoading({
			title: that.data.trans.loading
		});
		cartUtils.updateItem(that.data.carts[cartIndex], itemIndex, quantity).then(function (result) {
			// update view
			if (result) {
				getStoreCarts().then(function (results) {
					that.setData({
						carts: results
					});
				}, function (err) {
					console.log(err);
				});
			}
		}, function (err) {
			console.log(err);
		});
	},

	*/

	// 单个product 选择状态，关联全选
	selectTap: function (e) {
		let itemIndex = e.currentTarget.dataset.itemIndex;
		let cartIndex = e.currentTarget.dataset.cartIndex;
		let activeItems = this.data.activeItems;
		debug(itemIndex, cartIndex, activeItems);
		activeItems[cartIndex].items[itemIndex] = !activeItems[cartIndex].items[itemIndex];
		this.setGoodsList(activeItems, cartIndex);
		// this.setGoodsList(this.getSaveHide(), this.totalCost(), this.allSelect(), this.noSelect(), carts);
	},

	/*
	noSelect: function () {
		var list = this.data.goodsList.list;
		var noSelect = 0;
		for (var i = 0; i < list.length; i++) {
			var curItem = list[i];
			if (!curItem.active) {
				noSelect++;
			}
		}
		if (noSelect == list.length) {
			return true;
		} else {
			return false;
		}
	},
	*/

	// 设置编辑状态，单购物车：全选，总价
	setGoodsList(activeItems, cartIndex) {
		let carts = this.data.carts;
		allSelect(activeItems, cartIndex, carts);
		totalCost(activeItems, cartIndex, carts);
		this.setData({
			activeItems,
		});
	},
	/*
	setGoodsList: function (editable, total, allSelect, noSelect, list) {
		this.setData({
			goodsList: {
				editable: editable,
				totalCost: total,
				allSelect: allSelect,
				noSelect: noSelect,
				list: list
			}
		});
		var shopCarInfo = {};
		var tempNumber = 0;
		shopCarInfo.shopList = list;
		for (var i = 0; i < list.length; i++) {
			tempNumber = tempNumber + list[i].number;
		}
		shopCarInfo.shopNum = tempNumber;
		wx.setStorage({
			key: 'shopCarInfo',
			data: shopCarInfo
		});
	},
	*/
	// product 全选/不选
	bindAllSelect: function (e) {
		let cartIndex = e.currentTarget.dataset.cartIndex;
		let activeItems = this.data.activeItems;
		let carts = this.data.carts;
		activeItems[cartIndex].active = !activeItems[cartIndex].active;
		let bool = false;
		if (activeItems[cartIndex].active) {
			bool = true;
		}
		carts[cartIndex].items.forEach((i, j) => {
			activeItems[cartIndex].items[j] = bool;
		});
		this.setGoodsList(activeItems, cartIndex);
	},
	// +1
	jiaBtnTap: function (e) {
		let cartIndex = e.currentTarget.dataset.cartIndex;
		let itemIndex = e.currentTarget.dataset.itemIndex;
		let carts = this.data.carts;
		let quantity = carts[cartIndex].items[itemIndex].quantity + 1;
		updateItem(carts[cartIndex], itemIndex, quantity).then(carts => {
			this.setData({
				carts
			});
			this.setGoodsList(this.data.activeItems, cartIndex);
		}).catch(err => {
			console.error(err);
		});
	},
	// -1
	jianBtnTap: function (e) {
		let cartIndex = e.currentTarget.dataset.cartIndex;
		let itemIndex = e.currentTarget.dataset.itemIndex;
		let carts = this.data.carts;
		let quantity = carts[cartIndex].items[itemIndex].quantity - 1;
		if (quantity < 1) {
			return;
		}
		updateItem(carts[cartIndex], itemIndex, quantity).then(carts => {
			this.setData({
				carts
			});
			this.setGoodsList(this.data.activeItems, cartIndex);
		}).catch(err => {
			console.error(err);
		});
	},
	inputNum(e) {
		let cartIndex = e.currentTarget.dataset.cartIndex;
		let itemIndex = e.currentTarget.dataset.itemIndex;
		let carts = this.data.carts;

		let quantity = e.detail.value.replace(/\D+/g, '');
		quantity < 1 && (quantity = 1);
		if (quantity === carts[cartIndex].items[itemIndex].quantity) {
			return;
		}

		updateItem(carts[cartIndex], itemIndex, quantity).then(res => {
			this.setData({
				carts: res
			});
			this.setGoodsList(this.data.activeItems, cartIndex);
		}).catch(err => {
			console.error(err);
		});
	},
	editTap: function () {
		var list = this.data.goodsList.list;
		for (var i = 0; i < list.length; i++) {
			var curItem = list[i];
			curItem.active = false;
		}
		this.setGoodsList(!this.getSaveHide(), this.totalCost(), this.allSelect(), this.noSelect(), list);
	},
	saveTap: function () {
		var list = this.data.goodsList.list;
		for (var i = 0; i < list.length; i++) {
			var curItem = list[i];
			curItem.active = true;
		}
		this.setGoodsList(!this.getSaveHide(), this.totalCost(), this.allSelect(), this.noSelect(), list);
	},
	getSaveHide: function () {
		var editable = this.data.goodsList.editable;
		return editable;
	},
	deleteSelected: function () {
		var list = this.data.goodsList.list;
		/*
     for(let i = 0 ; i < list.length ; i++){
           let curItem = list[i];
           if(curItem.active){
             list.splice(i,1);
           }
     }
     */
		// above codes that remove elements in a for statement may change the length of list dynamically
		list = list.filter(function (curGoods) {
			return !curGoods.active;
		});
		this.setGoodsList(this.getSaveHide(), this.totalCost(), this.allSelect(), this.noSelect(), list);
	},
	toPayOrder(e) {
		let cartIndex = e.currentTarget.dataset.cartIndex;
		let { activeItems, carts } = this.data;
		let storeId = carts[cartIndex].store._id;
		let url;
		if (activeItems[cartIndex].active && _checkInventory(carts[cartIndex].items)) {
			url = '/pages/checkout/checkout?storeId=' + storeId;
		} else {
			let selectedItems = [];
			activeItems[cartIndex].items.forEach((item, i) => {
				if (item) {
					selectedItems.push(i);
				}
			});
			if (selectedItems.length && _checkInventory(carts[cartIndex].items, selectedItems)) {
				url = `/pages/checkout/checkout?storeId=${storeId}&selectedItems=${JSON.stringify(selectedItems)}`;
			}
		}
		if (url) {
			wx.navigateTo({
				url
			});
		}
	},
	navigateToPayOrder: function () {
		wx.hideLoading();
		wx.navigateTo({
			url: '/pages/to-pay-order/index'
		});
	}

});

function getStoreCarts() {
	showLoading({
		title: 'common.loading'
	});
	return new Promise((resolve, reject) => {
		callApi.post('StoreCart.getAll', {}, 400).then(data => {
			let promiseArray = [];
			data.forEach((tempCart, index) => {
				let temp = new Promise((resolve_, reject_) => {
					callApi.post('StoreCart.get', {
						storeId: tempCart.store._id
					}, 400).then(resultData => {
						resultData.store = tempCart.store;
						priceFilter(resultData);
						resolve_(resultData);
					});
				});
				promiseArray.push(temp);
			}); // end each
			return Promise.all(promiseArray);
		}).then(value => {
			resolve(value);
		}).catch(err => {
			reject(err);
		}).finally(() => {
			wx.hideLoading();
		});
	});
}

// 判断全选状态
function allSelect(activeItems, cartIndex, carts) {
	let list = activeItems[cartIndex].items;
	for (let i = 0; i < carts[cartIndex].items.length; i++) {
		if (!list[i]) {
			activeItems[cartIndex].active = false;
			return;
		}
	}
	activeItems[cartIndex].active = true;
}
// 计算总价
function totalCost(activeItems, cartIndex, carts) {
	if (activeItems[cartIndex].active) {
		activeItems[cartIndex].totalCost = carts[cartIndex].totalCost;
		return;
	}
	let total = carts[cartIndex].items.reduce((inc, item, i) => {
		let itemPrice = 0;
		if (activeItems[cartIndex].items[i]) {
			itemPrice = item.quantity * item.price;
		}
		inc += itemPrice;
		return inc;
	}, 0);
	activeItems[cartIndex].totalCost = total.toFixed(2);
}

function updateItem(cart, itemIndex, quantity) {
	return new Promise(function (resolve, reject) {
		callApi.post('StoreCart.updateItem', {
			storeId: cart.store._id || cart.store,
			itemIndex,
			quantity
		}, 400).then(result => {
			return getStoreCarts(result);
		}).then(result => {
			resolve(result);
		}).catch(err => {
			reject(err);
		});
	});
}

function _checkInventory(items, selectedItems) {
	let bool = true;

	function _checkItem(item) {
		if (item.productOption) {
			if (item.quantity > item.productOption.maxQuantity) {
				return false;
			}
		} else if (item.quantity > item.product.maxQuantity) {
			return false;
		}
		return true;
	}

	if (selectedItems) {
		selectedItems.forEach(item => {
			bool = _checkItem(items[item]);
		});
	} else {
		for (let i = 0; i < items.length; i++) {
			bool = _checkItem(items[i]);
			if (!bool) {
				break;
			}
		}
	}

	if (!bool) {
		showModal({
			title: 'common.error',
			content: 'common.error1',
			showCancel: false
		});
	}
	return bool;
}
