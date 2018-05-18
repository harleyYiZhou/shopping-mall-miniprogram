const guzzuUtils = require('../../utils/guzzu-utils.js');
const { priceFilter, showLoading, _, debug } = require('../../utils/util');
const { callApi, removeItems } = guzzuUtils;
const app = getApp();
const pickupKeys = ['name', 'mobilePhone', 'province', 'provinceId', 'city', 'cityId', 'district', 'districtId', 'address'];
const areaShippingKeys = ['appointmentTime', 'description', 'image', 'minPurchase', 'shippingCost', 'enabledAppointment'];

Page({
	data: {
		storeId: '',
		shippingType: 'regular',
		cart: null,
		shippingAddress: null,
		provinceIndex: -1,
		cityIndex: -1,
		districtIndex: -1,
		items: [], // 将要提交的商品的参数从 cart 里提取出来
		discountItems: [],
		serviceHours: app.globalData.serviceHours,
		weekdays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
		selectTime: null,
		discountItemsIndex: 0,
		pickupPlaceIndex: 0,
		order: {},
		regularPicSrc: '/public/images/icon/option-check.png',
		cityPicSrc: '/public/images/icon/option-none.png',
		pickupPicSrc: '/public/images/icon/option-none.png',
		areaShipping: null,
		pickupPlace: app.globalData.pickupPlace,
		pickupPlace_params: {},
		areaShipping_params: {},
		isLocalDelivery: false,
		isCustomerPickup: false,
		isShowAddress: true,
		selectedItems: [],
		selectAll: false,
		displayItems: [],
		noStoreCart: '',
	},
	onLoad(option) {
		debug('option', option);
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		let { storeId, selectedItems = [], selectAll = '', noStoreCart = '' } = option;
		selectedItems = selectedItems && JSON.parse(selectedItems);
		selectAll = selectAll && JSON.parse(selectAll);
		this.setData({
			selectedItems,
			selectAll,
			storeId,
			noStoreCart
		});

		let discountItems = [{
			name: this.data.trans.selectItem
		}];
		showLoading();
		// 1. get store cart
		let getCart;
		if (noStoreCart) {
			getCart = Promise.resolve(wx.getStorageSync('cart'));
		} else {
			getCart = callApi.post('StoreCart.get', {
				storeId
			}, 400);
		}
		getCart.then(result => {
			// wx.removeStorageSync('cart');
			if (!result || result.items.length < 1) {
				wx.redirectTo({
					url: '/pages/shopping-cart/shopping-cart'
				});
				throw new TypeError('Empty Order');
			}
			noStoreCart || priceFilter(result);
			this.setData({
				cart: result
			});
			return callApi.post('UserAddress.getLastUsed', 400);
		})// 2. 获取最近使用的地址
			.then(result => {
				this.setData({
					shippingAddress: result
				});
				app.globalData.shippingAddress = result;
				return callApi.post('StoreApp.checkPermission', {
					storeId,
					slug: 'customer-pick-up'
				}, 400);
			}) // 3. 判断App 自提 是否可用
			.then(result => {
				if (result && result.enabled == true) {
					this.setData({
						isCustomerPickup: true
					});
				}
				return callApi.post('StoreApp.checkPermission', {
					storeId,
					slug: 'local-delivery'
				}, 400);
			}) // 4. 判断App 本地配送 是否可用
			.then(result => {
				if (result && result.enabled == true) {
					this.setData({
						isLocalDelivery: true
					});
				}
				let params = {
					storeId
				};
				return callApi.post('PickUpPlace.find', params, 400);
			}) // 5. 获取自提地址，返回:[]
			.then(result => {
				let pickupPlaceIndex = app.globalData.selectShopIndex;
				let pickupPlace = result.results[pickupPlaceIndex];
				if (!pickupPlace) {
					return;
				}
				let serviceHours = [];
				if (pickupPlace.serviceHours) {
					serviceHours = pickupPlace.serviceHours;
				}
				this.setData({
					pickupPlaceIndex,
					pickupPlace,
					serviceHours
				});
			})// 6. 获取可用的优惠
			.then(() => {
				// items: 订单里的商品
				let items = [];
				let displayItems = [];
				this.data.cart.items.forEach((item, index) => {
					let itm = {
						productId: item.productId,
						quantity: item.quantity
					};
					if (item.productOption) {
						itm.productOptionId = item.productOption._id;
					}
					if (!selectAll) {
						if (selectedItems.indexOf(index) > -1) {
							items.push(itm);
							displayItems.push(item);
						}
						return;
					}
					items.push(itm);
					displayItems.push(item);
				});
				this.setData({
					items,
					displayItems
				});
				return callApi.post('Discount.findAvailable', {
					storeId,
					items
				}, 400);
			})// return []
			.then(results => {
				discountItems = discountItems.concat(results);
				this.setData({
					discountItems,
				});
				_previewOrder.call(this);
			}).catch(err => {
				console.error(err);
			}).finally(() => {
				wx.hideLoading();
			});

		// init nonce
		initNonce();
	},
	onShow() {
		this.setData(_.pick(app.globalData, ['selectTime', 'shippingAddress', 'pickupPlace', 'serviceHours', 'appointmentTime']));
		if (this.data.shippingType === 'areaShipping') {
			let areaShipping_params = _.pick(this.data.areaShipping, areaShippingKeys);
			areaShipping_params.appointmentTime = app.globalData.appointmentTime;
			this.setData({
				areaShipping_params
			});
		}
	},
	submit(event) {
		// generate order params
		let storeId = this.data.cart.store._id;
		let value = event.detail.value;
		let discountId = this.data.discountItems[value.discountItemsIndex].discountId;
		let { selectedItems, selectAll, shippingType, shippingAddress, noStoreCart } = this.data;

		// prepare order params
		let params;
		if (shippingType === 'regular') {
			params = {
				shippingAddress,
			};
		}
		if (shippingType === 'areaShipping') {
			params = {
				shippingAddress,
				areaShipping: this.data.areaShipping_params,
			};
		}
		if (shippingType === 'pickup') {
			let pickupPlace_params = _.pick(this.data.pickupPlace, pickupKeys);
			this.setData({
				pickupPlace_params
			});
			params = {
				shippingAddress: {
					name: value.name,
					mobilePhone: value.mobilePhone
				},
				pickUpPlace: pickupPlace_params,
			};
		}

		if (discountId) {
			params.discountId = discountId;
		}
		Object.assign(params, {
			shippingType,
			note: value.note,
			storeId,
			items: this.data.items,
			nonce: guzzuUtils.storageGet('nonce'),
			clientType: 'mini-program',
			type: 'default',
		});
		// call api to create order
		let order;
		callApi.post('Order.create', params, 400).then(result => {
			order = result;
			// clear cart | items
			if (noStoreCart) {
				return;
			}
			return removeItems({
				storeId,
				selectAll,
				selectedItems
			});
		}).then(() => {
			clearNonce();
			wx.redirectTo({
				url: '/pages/order/order?orderId=' + order._id
			});
		}, err => {
			console.error(err);
			clearNonce();
			initNonce();
		});
	},
	selectAddress() {
		if (this.data.shippingType === 'regular' || this.data.shippingType === 'areaShipping') {
			wx.navigateTo({
				url: '/pages/select-address/select-address'
			});
		}
		if (this.data.shippingType === 'pickup') {
			let params = {
				storeId: this.data.storeId,
				selectShopId: this.data.pickupPlace._id
			};
			let str = JSON.stringify(params);
			wx.navigateTo({
				url: '/pages/select-shop/select-shop?params=' + str
			});
		}
	},
	addAddress() {
		wx.navigateTo({
			url: '/pages/update-address/update-address'
		});
	},
	showShopPic() {
		let params = {
			shopPicSrc: this.data.pickupPlace.images
		};
		let str = JSON.stringify(params);
		wx.navigateTo({
			url: '/pages/shopdetail-pic/shopdetail-pic?shopPic=' + str
		});
	},
	selectDeliverTime() {
		let params = {
			areaShipping: this.data.areaShipping
		};
		let str = JSON.stringify(params);
		wx.navigateTo({
			url: '/pages/deliver-time/deliver-time?areaShipping=' + str
		});
	},
	selectDiscountItem(e) {
		this.setData({
			discountItemsIndex: e.detail.value
		});
		_previewOrder.call(this);
	},
	selectShipping(event) {
		let { shippingType } = event.currentTarget.dataset;
		this.setData({
			discountItemsIndex: 0
		});
		let { storeId } = this.data;

		if (shippingType === 'regular') {
			this.setData({
				shippingType,
				isShowAddress: true,
				regularPicSrc: '/public/images/icon/option-check.png',
				cityPicSrc: '/public/images/icon/option-none.png',
				pickupPicSrc: '/public/images/icon/option-none.png'
			});
			_previewOrder.call(this);
		}
		if (shippingType === 'areaShipping') {
			this.setData({
				shippingType,
				isShowAddress: true,
				regularPicSrc: '/public/images/icon/option-none.png',
				cityPicSrc: '/public/images/icon/option-check.png',
				pickupPicSrc: '/public/images/icon/option-none.png'
			});

			let params = {
				storeId
			};
			callApi.post('AreaShipping.get', params, 400).then(result => {
				let areaShipping = result;
				let serviceHours = [];
				if (areaShipping.serviceHours) {
					serviceHours = areaShipping.serviceHours;
				}
				app.globalData.serviceHours = serviceHours;

				let areaShipping_params = _.pick(areaShipping, areaShippingKeys);
				this.setData({
					areaShipping,
					serviceHours,
					areaShipping_params
				});
				_previewOrder.call(this);
			}).catch(err => {
				console.error(err);
			});
		}
		if (shippingType === 'pickup') {
			this.setData({
				shippingType,
				isShowAddress: false,
				regularPicSrc: '/public/images/icon/option-none.png',
				cityPicSrc: '/public/images/icon/option-none.png',
				pickupPicSrc: '/public/images/icon/option-check.png',
				pickupPlaceIndex: app.globalData.selectShopIndex
			});

			let params = {
				storeId
			};
			callApi.post('PickUpPlace.find', params, 400).then(result => {
				let pickupPlace = result.results[this.data.pickupPlaceIndex];
				let pickupPlace_params = _.pick(pickupPlace, pickupKeys);
				let serviceHours = [];
				if (pickupPlace.serviceHours) {
					serviceHours = pickupPlace.serviceHours;
				}

				this.setData({
					serviceHours,
					pickupPlace,
					pickupPlace_params,
				});
				_previewOrder.call(this);
			}).catch(err => {
				console.error(err);
			});
		}
	}
});

function initNonce() {
	let nonce = guzzuUtils.storageGet('nonce');
	if (typeof nonce !== 'string' || nonce.length === 0) {
		nonce = '' + (new Date()).getTime();
		guzzuUtils.storageSet('nonce', nonce);
	}
	return nonce;
}

function clearNonce() {
	guzzuUtils.storageRemove('nonce');
}

function _previewOrder() {
	let discountId = this.data.discountItems[this.data.discountItemsIndex].discountId;
	let params;
	if (this.data.shippingType === 'regular') {
		params = {
			shippingAddress: this.data.shippingAddress,
		};
	}
	if (this.data.shippingType === 'areaShipping') {
		params = {
			shippingAddress: this.data.shippingAddress,
			areaShipping: this.data.areaShipping_params,
		};
	}
	if (this.data.shippingType === 'pickup') {
		params = {
			shippingAddress: {
				name: this.data.shippingAddress.name,
				mobilePhone: this.data.shippingAddress.mobilePhone
			},
			pickUpPlace: this.data.pickupPlace_params,
		};
	}
	if (!params) {
		throw new TypeError('Invalid params');
	}
	if (discountId) {
		params.discountId = discountId;
	}
	Object.assign(params, {
		storeId: this.data.storeId,
		items: this.data.items,
		shippingType: this.data.shippingType,
		nonce: String(Date.now()),
		type: 'default',
	});
	let preview = callApi.post('Order.preview', params, 400);
	preview.then(result => {
		priceFilter(result.order);
		this.setData({
			order: result.order
		});
	}).catch(err => {
		console.error(err);
	});
	return preview;
}
