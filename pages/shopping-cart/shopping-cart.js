// index.js
const app = getApp();
const { priceFilter, showModal, _, showLoading, debug } = require('../../utils/util');
const { callApi, session, removeItems, checkInventory } = require('../../utils/guzzu-utils.js');

Page({
	data: {
		goodsList: {
			editable: false,
			allSelect: false,
			noSelect: false,
		},
		delBtnWidth: 120, // 删除按钮宽度单位（rpx）
		selected: '2',
		cartsInfo: [], // 记录购物车各种状态：storeCart 是否全选，item 是否选中，记录选中的 items 的 indexes
	},
	btnNavLink: app.btnNavLink(),
	// 获取元素自适应后的实际宽度
	getEleWidth(w) {
		let real = 0;
		try {
			let res = wx.getSystemInfoSync().windowWidth;
			let scale = (750 / 2) / (w / 2); // 以宽度750px设计稿做宽度的自适应
			real = Math.floor(res / scale);
			return real;
		} catch (e) {
			return false;
			// Do something when catch error
		}
	},
	initEleWidth() {
		let delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
		this.setData({
			delBtnWidth
		});
	},
	onLoad() {
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		this.initEleWidth();
	},
	onShow() {
		let localCarts = wx.getStorageSync('localCarts') || [];
		app.globalData.login.finally(() => {
			session.check().then(res => {
				if (res) {
					if (localCarts) {
						return _synchronizeCart(localCarts);
					}
					return getStoreCarts();
				}
				return localCarts;
			}).then(res => {
				if (res) {
					let cartsInfo = res.map(item => {
						return {
							storeId: item.store._id,
							selectAll: false,
							itemSelected: false,
							totalCost: '0.00',
							selectedItems: [],
							items: [],
							pos: [],
						};
					});
					this.setData({
						carts: res,
						cartsInfo
					});
				}
			}).catch(err => {
				console.error(err);
			}).finally(() => {
				wx.stopPullDownRefresh();
			});
		});
		this.setData({
			selected: '2',
		});
	},
	toIndexPage() {
		wx.redirectTo({
			url: '/pages/index/index'
		});
	},

	touchS(e) {
		if (!this.data.goodsList) {
			return;
		}
		if (e.touches.length === 1) {
			this.setData({
				startX: e.touches[0].clientX
			});
		}
	},
	touchM(e) {
		if (!this.data.goodsList) {
			return;
		}

		let { itemIndex, cartIndex } = e.currentTarget.dataset;
		let { cartsInfo } = this.data;

		if (e.touches.length === 1) {
			let moveX = e.touches[0].clientX;
			let disX = this.data.startX - moveX;
			let delBtnWidth = this.data.delBtnWidth;
			let left = '';
			if (disX == 0) {
				return;
			}
			if (disX > 0) { // 移动距离大于0，container left值等于手指移动距离
				left = 'margin-left:-' + disX + 'px';
				if (disX >= delBtnWidth) {
					left = 'left:-' + delBtnWidth + 'px';
				}
			} else {
				left = 'margin-left:0px';
			}
			cartsInfo[cartIndex].pos[itemIndex] = left;
			this.setData({
				cartsInfo
			});
		}
	},

	touchE(e) {
		if (!this.data.goodsList) {
			return;
		}
		let { itemIndex, cartIndex } = e.currentTarget.dataset;
		let { cartsInfo } = this.data;
		if (e.changedTouches.length == 1) {
			let endX = e.changedTouches[0].clientX;
			let disX = this.data.startX - endX;
			let delBtnWidth = this.data.delBtnWidth;
			// 如果距离小于删除按钮的1/2，不显示删除按钮
			if (disX < delBtnWidth / 2) {
				return;
			}
			let left = 'margin-left:-' + delBtnWidth + 'px';
			cartsInfo[cartIndex].pos[itemIndex] = left;
			this.setData({
				cartsInfo
			});
		}
	},
	delItem(e) {
		let { itemIndex, cartIndex } = e.currentTarget.dataset;
		let { cartsInfo, goodsList } = this.data;
		goodsList.processing = true;
		cartsInfo[cartIndex].selectedItems = [itemIndex];
		this.setData({
			cartsInfo,
			goodsList
		});
		this.removeSelections({
			currentTarget: {
				dataset: {
					cartIndex
				}
			}
		});
	},

	// 单个product 选择状态，关联全选
	selectTap(e) {
		let itemIndex = e.currentTarget.dataset.itemIndex;
		let cartIndex = e.currentTarget.dataset.cartIndex;
		let cartsInfo = this.data.cartsInfo;
		cartsInfo[cartIndex].items[itemIndex] = !cartsInfo[cartIndex].items[itemIndex];
		this.setGoodsList(cartsInfo, cartIndex);
	},

	// 设置编辑状态，单购物车：全选，总价
	setGoodsList(cartsInfo, cartIndex) {
		let { carts, goodsList } = this.data;
		ckeckSelected(cartsInfo, cartIndex, carts);
		totalCost(cartsInfo, cartIndex, carts);
		checkTotalSelected(cartsInfo, goodsList);
		this.setData({
			cartsInfo,
			goodsList,
		});
	},

	// product 全选/不选
	bindAllSelect(e) {
		let cartIndex = e.currentTarget.dataset.cartIndex;
		let cartsInfo = this.data.cartsInfo;
		let carts = this.data.carts;
		cartsInfo[cartIndex].selectAll = !cartsInfo[cartIndex].selectAll;
		carts[cartIndex].items.forEach((i, j) => {
			cartsInfo[cartIndex].items[j] = cartsInfo[cartIndex].selectAll;
		});
		this.setGoodsList(cartsInfo, cartIndex);
	},
	toggleTotalSelected(e) {
		let { carts, goodsList } = this.data;
		let bool = goodsList.allSelect;
		if (e.option) {
			bool = e.option.bool;
		} else {
			bool = !bool;
		}
		carts.forEach((cart, cartIndex) => {
			let { cartsInfo } = this.data;
			cartsInfo[cartIndex].selectAll = bool;
			cart.items.forEach((i, j) => {
				cartsInfo[cartIndex].items[j] = bool;
			});
			this.setGoodsList(cartsInfo, cartIndex);
		});
	},
	// +1
	jiaBtnTap(e) {
		let cartIndex = e.currentTarget.dataset.cartIndex;
		let itemIndex = e.currentTarget.dataset.itemIndex;
		let carts = this.data.carts;
		let quantity = carts[cartIndex].items[itemIndex].quantity + 1;
		if (!checkInventory(carts[cartIndex].items, [itemIndex], quantity)) {
			return;
		}
		this.updateItems(cartIndex, itemIndex, quantity);
	},
	// -1
	jianBtnTap(e) {
		let cartIndex = e.currentTarget.dataset.cartIndex;
		let itemIndex = e.currentTarget.dataset.itemIndex;
		let carts = this.data.carts;
		let quantity = carts[cartIndex].items[itemIndex].quantity - 1;
		if (quantity < 1) {
			return;
		}
		this.updateItems(cartIndex, itemIndex, quantity);
	},
	inputNum(e) {
		let cartIndex = e.currentTarget.dataset.cartIndex;
		let itemIndex = e.currentTarget.dataset.itemIndex;
		let carts = this.data.carts;

		let quantity = e.detail.value.replace(/\D+/g, '');
		quantity < 1 && (quantity = 1);
		if (quantity == carts[cartIndex].items[itemIndex].quantity) {
			return;
		}
		if (!checkInventory(carts[cartIndex].items, [itemIndex], quantity)) {
			return;
		}
		this.updateItems(cartIndex, itemIndex, quantity);
	},
	// 更新线上/本地购物车
	updateItems(cartIndex, itemIndex, quantity) {
		let carts = this.data.carts;
		session.check().then(res => {
			if (res) {
				return updateItem(carts[cartIndex], itemIndex, quantity);
			}
			return localCartsUtils.update(carts[cartIndex], cartIndex, itemIndex, quantity);
		}).then(carts => {
			this.setData({
				carts
			});
			this.setGoodsList(this.data.cartsInfo, cartIndex);
		}).catch(err => {
			console.error(err);
		});
	},
	removeSelections(e) {
		let cartIndex = e.currentTarget.dataset.cartIndex;
		let { cartsInfo, carts } = this.data;
		let storeId = carts[cartIndex].store._id;
		let { selectedItems, selectAll } = cartsInfo[cartIndex];
		let that = this;
		if (!selectAll && !selectedItems.length) {
			return;
		}
		showModal({
			title: 'shoppingCart.removeTitle',
			content: 'shoppingCart.removeContent',
			success(res) {
				if (res.confirm) {
					let params = {
						storeId,
						selectAll,
						selectedItems,
						carts,
						cartIndex
					};
					let hasSession;
					session.check().then(res => {
						hasSession = res;
						if (res) {
							return removeItems(params);
						}
					}).then(() => {
						if (hasSession) {
							return getStoreCarts();
						}
						return localCartsUtils.remove(params);
					}).then(carts => {
						that.setData({
							carts
						});
						removeCartsInfo(cartsInfo, cartIndex);
						that.setGoodsList(cartsInfo, cartIndex);
					}).catch(err => {
						console.error(err);
					});
				}
			}
		});
	},
	removeTotal() {
		let { carts } = this.data;
		let promises = [];
		let that = this;
		showModal({
			title: 'shoppingCart.removeTitle',
			content: 'shoppingCart.removeContent',
			success(res) {
				if (res.confirm) {
					session.check().then(res => {
						if (res) {
							for (let i = carts.length - 1; i >= 0; i--) {
								let params = {
									storeId: carts[i].store._id,
									selectAll: true,
								};
								promises.push(removeItems(params));
							}
							return Promise.all(promises);
						}
						if (localCartsUtils.compare(carts, wx.getStorageSync('localCarts'))) {
							return wx.removeStorageSync('localCarts');
						}
						throw Error('Conflict');
					}).then(() => {
						that.setData({
							carts: [],
							cartsInfo: []
						});
					}).catch(err => {
						console.error(err);
					});
				}
			}
		});
	},
	editTap() {
		let { goodsList } = this.data;
		goodsList.editable = true;
		this.setData({
			goodsList
		});
	},
	editExit() {
		let { goodsList, cartsInfo } = this.data;
		goodsList.editable = false;
		cartsInfo.forEach((item, i) => {
			cartsInfo[i].pos = [];
		});
		this.setData({
			goodsList,
			cartsInfo
		});
		this.toggleTotalSelected({
			option: {
				bool: false
			}
		});
	},

	toPayOrder(e) {
		let cartIndex = e.currentTarget.dataset.cartIndex;
		let { cartsInfo, carts } = this.data;
		let storeId = carts[cartIndex].store._id;
		let url;
		let { selectAll, selectedItems } = cartsInfo[cartIndex];
		if (!selectedItems.length) {
			return;
		}
		if (session.checkSync()) {
			callApi.post('StoreCart.preview', { storeId }, 400).then(() => {
				url = `/pages/checkout/checkout?storeId=${storeId}&selectedItems=${JSON.stringify(selectedItems)}&selectAll=${selectAll}`;
				wx.navigateTo({
					url
				});
			}).catch(err => {
				console.error(err);
			});
		}
	},
	onPullDownRefresh() {
		this.onShow();
	},

});

function getStoreCarts() {
	showLoading();
	return new Promise((resolve, reject) => {
		callApi.post('StoreCart.getAll', {}, 400).then(datas => {
			priceFilter(datas);
			resolve(datas);
		}).catch(err => {
			reject(err);
		}).finally(() => {
			wx.hideLoading();
		});
	});
}

// 判断全选状态，列表中是否有选中的状态
function ckeckSelected(cartsInfo, cartIndex, carts) {
	let list = cartsInfo[cartIndex].items;
	let itemSelected = false;
	let selectAll = true;
	let selectedItems = [];
	for (let i = 0; i < carts[cartIndex].items.length; i++) {
		if (list[i]) {
			if (!itemSelected) {
				itemSelected = true;
			}
			selectedItems.push(i);
		} else {
			if (selectAll) {
				selectAll = false;
			}
		}
	}
	cartsInfo[cartIndex].selectedItems = selectedItems;
	cartsInfo[cartIndex].itemSelected = itemSelected;
	cartsInfo[cartIndex].selectAll = selectAll;
}
// 计算总价
function totalCost(cartsInfo, cartIndex, carts) {
	if (cartsInfo[cartIndex].selectAll) {
		cartsInfo[cartIndex].totalCost = carts[cartIndex].totalCost;
		return;
	}
	let total = carts[cartIndex].items.reduce((inc, item, i) => {
		let itemPrice = 0;
		if (cartsInfo[cartIndex].items[i]) {
			itemPrice = item.quantity * item.price;
		}
		inc += itemPrice;
		return inc;
	}, 0);
	cartsInfo[cartIndex].totalCost = total.toFixed(2);
}

function updateItem(cart, itemIndex, quantity) {
	return new Promise((resolve, reject) => {
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

// prepare for remove
function checkTotalSelected(cartsInfo, goodsList) {
	if (!goodsList.editable) {
		return;
	}
	let bool = true;
	for (let item of cartsInfo) {
		if (!item.itemSelected || !item.selectAll) {
			bool = false;
			break;
		}
	}
	goodsList.allSelect = bool;
}
function removeCartsInfo(cartsInfo, cartIndex) {
	let cart = cartsInfo[cartIndex];
	cart.pos = [];
	if (cart.selectAll) {
		cartsInfo.splice(cartIndex, 1);
		return;
	}
	let selectedCopy = cart.selectedItems.concat();
	selectedCopy.sort().reverse();
	selectedCopy.forEach(item => {
		cartsInfo[cartIndex].items.splice(item, 1);
	});
}

function _synchronizeCart(localCarts) {
	return new Promise((res, rej) => {
		let promises = [];
		localCarts.forEach(cart => {
			cart.items.forEach(item => {
				let params = _.pick(item, ['storeId', 'productId', 'quantity', 'productOptionId']);
				promises.push(callApi.post('StoreCart.addItem', params, 400));
			});
		});
		Promise.all(promises).then(() => {
			wx.removeStorageSync('localCarts');
			res(getStoreCarts());
		}).catch(err => {
			rej(err);
		});
	});
}

let localCartsUtils = {
	update(cart, cartIndex, itemIndex, quantity) {
		let localCarts = wx.getStorageSync('localCarts') || [];
		let offlineCart = localCarts[cartIndex];
		if (!this.compare(cart, offlineCart)) {
			return Promise.reject(Error('Conflict'));
		}
		offlineCart.items[itemIndex].quantity = quantity;
		this.refreshInfo(localCarts, cartIndex);
		wx.setStorageSync('localCarts', localCarts);
		return Promise.resolve(localCarts);
	},
	remove(params) {
		let localCarts = wx.getStorageSync('localCarts') || [];
		let { carts, selectedItems, cartIndex, selectAll } = params;
		if (!this.compare(carts, localCarts)) {
			return Promise.reject(Error('Conflict'));
		}
		if (selectAll) {
			localCarts.splice(cartIndex, 1);
			wx.setStorageSync('localCarts', localCarts);
			return localCarts;
		}
		let selectedCopy = selectedItems.concat();
		selectedCopy.sort((a, b) => a - b).reverse();
		selectedCopy.forEach(i => {
			localCarts[cartIndex].items.splice(i, 1);
		});
		this.refreshInfo(localCarts, cartIndex);
		wx.setStorageSync('localCarts', localCarts);
		return localCarts;
	},
	refreshInfo(localCarts, cartIndex) {
		let totalCost = localCarts[cartIndex].items.reduce((inc, item) => {
			inc += item.price * item.quantity;
			return inc;
		}, 0);
		localCarts[cartIndex].totalCost = totalCost.toFixed(2);
	},
	compare(cartA, cartB) {
		if (_.isEqual(cartA, cartB)) {
			return true;
		}
		showModal({
			title: 'common.error',
			content: 'shoppingCart.invalidCart',
			showCancel: false,
		});
	}
};
