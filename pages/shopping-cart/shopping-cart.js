// index.js
const app = getApp();
const { priceFilter, showModal, _, showLoading, debug } = require('../../utils/util');
const { callApi, session, removeItems, checkInventory } = require('../../utils/guzzu-utils.js');

Page({
	data: {
		shopCarInfo: null,
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
			// console.log(scale);
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
		let localCart = wx.getStorageSync('localCart');
		app.globalData.login.finally(() => {
			session.check().then(res => {
				if (res) {
					if (localCart) {
						return _synchronizeCart(localCart);
					}
					return getStoreCarts();
				}
				return localCart;
			}).then(res => {
				if (res) {
					let cartsInfo = res.map(item => {
						return {
							storeId: item.store._id,
							selectAll: false,
							itemSelected: false,
							totalCost: '0.00',
							selectedItems: [],
							items: []
						};
					});
					this.setData({
						carts: res,
						cartsInfo
					});
				}
			}).catch(err => {
				console.error(err);
			});
		});
		this.setData({
			selected: '2',
		});
		debug('cart show');
	},
	toIndexPage() {
		wx.redirectTo({
			url: '/pages/index/index'
		});
	},

	touchS(e) {
		if (e.touches.length === 1) {
			this.setData({
				startX: e.touches[0].clientX
			});
		}
	},
	touchM(e) {
		let index = e.currentTarget.dataset.index;
		if (e.touches.length === 1) {
			let moveX = e.touches[0].clientX;
			let disX = this.data.startX - moveX;
			let delBtnWidth = this.data.delBtnWidth;
			let left = '';
			if (disX == 0 || disX < 0) { // 如果移动距离小于等于0，container位置不变
				left = 'margin-left:0px';
			} else if (disX > 0) { // 移动距离大于0，container left值等于手指移动距离
				left = 'margin-left:-' + disX + 'px';
				if (disX >= delBtnWidth) {
					left = 'left:-' + delBtnWidth + 'px';
				}
			}
			let list = this.data.goodsList.list;
			if (index != '' && index != null) {
				list[parseInt(index)].left = left;
				// this.setGoodsList(this.getSaveHide(), this.totalCost(), this.allSelect(), this.noSelect(), list);
			}
		}
	},

	touchE(e) {
		let index = e.currentTarget.dataset.index;
		if (e.changedTouches.length == 1) {
			let endX = e.changedTouches[0].clientX;
			let disX = this.data.startX - endX;
			let delBtnWidth = this.data.delBtnWidth;
			// 如果距离小于删除按钮的1/2，不显示删除按钮
			let left = disX > delBtnWidth / 2 ? 'margin-left:-' + delBtnWidth + 'px' : 'margin-left:0px';
			let list = this.data.goodsList.list;
			if (index !== '' && index != null) {
				list[parseInt(index)].left = left;
				// this.setGoodsList(this.getSaveHide(), this.totalCost(), this.allSelect(), this.noSelect(), list);
			}
		}
	},
	delItem(e) {
		let index = e.currentTarget.dataset.index;
		let list = this.data.goodsList.list;
		list.splice(index, 1);
		// this.setGoodsList(this.getSaveHide(), this.totalCost(), this.allSelect(), this.noSelect(), list);
	},
	/*
	updateItem(event) {
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
	selectTap(e) {
		let itemIndex = e.currentTarget.dataset.itemIndex;
		let cartIndex = e.currentTarget.dataset.cartIndex;
		let cartsInfo = this.data.cartsInfo;
		cartsInfo[cartIndex].items[itemIndex] = !cartsInfo[cartIndex].items[itemIndex];
		this.setGoodsList(cartsInfo, cartIndex);
		// this.setGoodsList(this.getSaveHide(), this.totalCost(), this.allSelect(), this.noSelect(), carts);
	},

	/*
	noSelect() {
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
	/*
	setGoodsList(editable, total, allSelect, noSelect, list) {
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
		updateItem(carts[cartIndex], itemIndex, quantity).then(carts => {
			this.setData({
				carts
			});
			this.setGoodsList(this.data.cartsInfo, cartIndex);
		}).catch(err => {
			console.error(err);
		});
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
		updateItem(carts[cartIndex], itemIndex, quantity).then(carts => {
			this.setData({
				carts
			});
			this.setGoodsList(this.data.cartsInfo, cartIndex);
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
		if (quantity == carts[cartIndex].items[itemIndex].quantity) {
			return;
		}
		if (!checkInventory(carts[cartIndex].items, [itemIndex], quantity)) {
			return;
		}
		updateItem(carts[cartIndex], itemIndex, quantity).then(res => {
			this.setData({
				carts: res
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
					};
					removeItems(params).then(() => {
						return getStoreCarts();
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
					for (let i = carts.length - 1; i >= 0; i--) {
						let params = {
							storeId: carts[i].store._id,
							selectAll: true,
						};
						promises.push(removeItems(params));
					}
					Promise.all(promises).then(() => {
						that.setData({
							carts: [],
							cartsInfo: []
						});
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
		let { goodsList } = this.data;
		goodsList.editable = false;
		this.setData({
			goodsList
		});
		this.toggleTotalSelected({
			option: {
				bool: false
			}
		});
	},
	getSaveHide() {
		let editable = this.data.goodsList.editable;
		return editable;
	},
	deleteSelected() {
		let list = this.data.goodsList.list;
		/*
     for(let i = 0 ; i < list.length ; i++){
           let curItem = list[i];
           if(curItem.active){
             list.splice(i,1);
           }
     }
     */
		// above codes that remove elements in a for statement may change the length of list dynamically
		list = list.filter((curGoods) => {
			return !curGoods.active;
		});
		this.setGoodsList(this.getSaveHide(), this.totalCost(), this.allSelect(), this.noSelect(), list);
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
		if (checkInventory(carts[cartIndex].items, selectedItems)) {
			url = `/pages/checkout/checkout?storeId=${storeId}&selectedItems=${JSON.stringify(selectedItems)}&selectAll=${selectAll}`;
		}
		if (url) {
			wx.navigateTo({
				url
			});
		}
	},
	navigateToPayOrder() {
		wx.hideLoading();
		wx.navigateTo({
			url: '/pages/to-pay-order/index'
		});
	}

});

function getStoreCarts() {
	showLoading();
	return new Promise((resolve, reject) => {
		callApi.post('StoreCart.getAll', {}, 400).then(datas => {
			/* ???
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
			*/
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

function _synchronizeCart(localCart) {
	return new Promise((res, rej) => {
		let promises = [];
		localCart.forEach(cart => {
			cart.items.forEach(item => {
				let params = _.pick(item, ['storeId', 'productId', 'quantity', 'productOptionId']);
				promises.push(callApi.post('StoreCart.addItem', params, 400));
			});
		});
		Promise.all(promises).then(() => {
			wx.removeStorageSync('localCart');
			res(getStoreCarts());
		}).catch(err => {
			rej(err);
		});
	});
}
