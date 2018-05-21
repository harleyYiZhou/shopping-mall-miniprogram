// pages/product-detail/product-detail
const app = getApp();
const { callApi, session, checkInventory } = require('../../utils/guzzu-utils.js');
const { priceFilter, debug, showToast } = require('../../utils/util');
const WxParse = require('../../utils/wxParse/wxParse.js');

Page({
	data: {
		gallery: null,
		hideShopPopup: true,
		buyNum: 1,
		showProductDetail: false,
		product: null,
		selectIndex: -1,
		optionSelected: false,
		showPopupOptions: false,
		terms: null,
	},
	onLoad(options) {
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		let productId = options.productId;

		callApi.get(`products/${productId}`).then(res => {
			priceFilter(res);
			let images = res.gallery.concat(res.image);
			let items = images.map(item => {
				return {
					image: item
				};
			});
			let imgHeight = items[0].image.medium.height;
			let imgWidth = items[0].image.medium.width;
			let swiperHeight = 750 / imgWidth * imgHeight;
			this.setData({
				product: res,
				gallery: {
					items,
					swiperHeight
				}
			});

			if (res.description) {
				WxParse.wxParse('description', 'html', res.description, this);
			}
			if (res.shippingDescription && res.shippingDescription.content) {
				WxParse.wxParse('shippingDescription', 'html', res.shippingDescription.content, this);
			}
			return callApi.get(`stores/${res.store}`);
		}).then(res => {
			this.setData({
				store: res
			});
			return callApi.get(`stores/${res._id}/profile`);
		}).then(res => {
			debug.trace('profile', res);
			this.setData({
				terms: res
			});
		}).catch(err => {
			console.error(err);
		});
	},
	onShow() {

	},
	bindchange(e) {
		// console.log(e.detail.current)
		this.setData({ current: e.detail.current });
	},
	showPopup() {
		this.setData({
			hideShopPopup: false
		});
		setTimeout(() => {
			this.setData({
				showPopupOptions: true
			});
		});
	},
	hideShopPopup() {
		this.setData({
			showPopupOptions: false
		});
		setTimeout(() => {
			this.setData({
				hideShopPopup: true
			});
		}, 300);
	},
	addToCart() {
		let { product, selectIndex, buyNum: quantity, store } = this.data;
		let productOptionId;
		let params = {
			storeId: store._id,
			productId: product._id,
			quantity,
		};
		let selectedInfo = {
			name: product.name,
			price: product.price,
			product,
		};
		if (selectIndex > -1) {
			productOptionId = product.productOptions[selectIndex]._id;
			selectedInfo.name = product.productOptions[selectIndex].name;
			selectedInfo.price = product.productOptions[selectIndex].price;
			selectedInfo.productOption = product.productOptions[selectIndex];
		} else {
			if (product.productOptions && product.productOptions.length) {
				return this.showPopup();
			}
			params.quantity = 1;
		}

		if (productOptionId) {
			params.productOptionId = productOptionId;
		}
		let cartItem = Object.assign({}, params, selectedInfo);
		if (!checkInventory([cartItem], [0])) {
			return;
		}
		session.check().then(res => {
			if (res) {
				return callApi.post('StoreCart.addItem', params, 400);
			}
			return _addToLocalCart(cartItem, store);
		}).then(res => {
			let that = this;
			showToast({
				icon: 'none',
				title: `${selectedInfo.name}\n@{productDetail.addSuccess}`,
				complete() {
					that.hideShopPopup();
				}
			});
		}).catch(err => {
			console.error(err);
		});
	},
	numMinus() {
		if (this.data.buyNum > 1) {
			let num = this.data.buyNum;
			num -= 1;
			this.setData({
				buyNum: num
			});
		}
	},
	numAdd() {
		if (this.data.buyNum) {
			let num = this.data.buyNum;
			num += 1;
			this.setData({
				buyNum: num
			});
		}
	},
	changeNum(e) {
		let buyNum = 1;
		if (e.detail.value > 1) {
			buyNum = parseInt(e.detail.value);
		}
		this.setData({
			buyNum
		});
	},
	toStore(e) {
		let { storeId } = e.currentTarget.dataset;
		debug.trace(storeId);
		wx.navigateTo({
			url: '/pages/store/store?storeId=' + storeId
		});
	},
	toShoppingCart() {
		app.globalData.selected = '1';
		wx.reLaunch({
			url: '/pages/shopping-cart/shopping-cart'
		});
	},
	selectTap(e) {
		let selectIndex = e.currentTarget.dataset.index;
		if (selectIndex === this.data.selectIndex) {
			selectIndex = -1;
		}
		this.setData({
			selectIndex
		});
	},
	checkout() {
		let { product, selectIndex, buyNum: quantity, store } = this.data;
		let item = {
			name: product.name,
			productId: product._id,
			price: product.price,
			quantity,
			product,
		};
		if (selectIndex > -1) {
			item.name = product.productOptions[selectIndex].name;
			item.price = product.productOptions[selectIndex].price;
			item.productOption = product.productOptions[selectIndex];
		} else {
			if (product.productOptions && product.productOptions.length) {
				return this.showPopup();
			}
			item.quantity = 1;
		}
		let url;
		let selectedItems = [0];
		let cart = {
			store,
			items: [item]
		};
		if (checkInventory(cart.items, selectedItems)) {
			url = `/pages/checkout/checkout?storeId=${store._id}&selectedItems=${JSON.stringify(selectedItems)}&noStoreCart=1`;
			wx.setStorageSync('cart', cart);
		}

		if (url) {
			if (session.checkSync()) {
				wx.navigateTo({
					url,
				});
			}
		}
	},
	onReachBottom() {
		if (this.data.showProductDetail) {
			return;
		}
		this.setData({
			showProductDetail: true
		});
	},
});

/**
 * @description 离线本地储存 storeCart ，item 的数据结构与在线的完全一致
 * @param {*} item storeCart 里的 item
 * @param {*} store
 */
function _addToLocalCart(item, store) {
	if (!item || !item.storeId || !item.productId) {
		console.error(item);
		throw new ReferenceError('_addToLocalCart');
	}
	let localCart = wx.getStorageSync('localCart') || [];
	let hasStore = false;
	let storeIndex = -1;
	let hasItem = false;
	let itemIndex = -1;
	localCart.forEach((cart, i) => {
		if (hasStore) {
			return;
		}
		if (cart.store._id === store._id) {
			hasStore = true;
			storeIndex = i;
			cart.items.forEach((elem, j) => {
				if (hasItem) {
					return;
				}
				if (elem.productOptionId && item.productOptionId && elem.productOptionId === item.productOptionId) {
					hasItem = true;
					itemIndex = j;
					return;
				}
				if (!elem.productOptionId && !item.productOptionId && elem.productId === item.productId) {
					hasItem = true;
					itemIndex = j;
				}
			});
		}
	});

	if (hasStore) {
		if (hasItem) {
			item.quantity += localCart[storeIndex].items[itemIndex].quantity;
			localCart[storeIndex].items[itemIndex] = item;
		} else {
			localCart[storeIndex].items.push(item);
		}
		// update totalCost
		let totalCost = localCart[storeIndex].items.reduce((inc, item) => {
			inc += item.price * item.quantity;
			return inc;
		}, 0);
		debug.trace(item, totalCost);
		localCart[storeIndex].totalCost = totalCost.toFixed(2);
	} else {
		let storeCart = {
			store,
			subtotal: 0,
			totalCost: (item.price * item.quantity).toFixed(2),
			items: [item]
		};
		localCart.push(storeCart);
	}

	return Promise.resolve(wx.setStorageSync('localCart', localCart));
}
