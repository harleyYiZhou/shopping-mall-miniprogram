const guzzuUtils = require('../../utils/guzzu-utils.js');
const { priceFilter, showModal, showToast, _, debug } = require('../../utils/util');
const { callApi } = guzzuUtils;
const app = getApp();

Page({
	data: {
		storeId: '',
		shippingType: 'regular',
		cart: null,
		shippingAddress: null,
		provinceIndex: -1,
		cityIndex: -1,
		districtIndex: -1,
		items: [],
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
		isShowAddress: true
	},
	onLoad(option) {
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		this.setData({
			storeId: option.storeId,
			discountItems: [{
				name: this.data.trans.selectItem
			}]
		});
		// 1. get store cart
		callApi.post('StoreCart.get', {
			storeId: this.data.storeId
		}, 400).then(result => {
			if (result.status === 'empty') {
				this.setData({
					cart: null
				});
			} else {
				// result.totalCost = cartUtils.calculateTotalCost(result);
				priceFilter(result);
				this.setData({
					cart: result
				});
			}
			let cart = this.data.cart;
			if (!cart || cart.items.length < 1) {
				wx.redirectTo({
					url: '/pages/shopping-cart/shopping-cart'
				});
			}
			return callApi.post('UserAddress.getLastUsed', 400);
		})// 2. 获取最近使用的地址
			.then(result => {
				this.setData({
					shippingAddress: result
				});
				app.globalData.shippingAddress = result;
				return callApi.post('StoreApp.checkPermission', {
					storeId: this.data.storeId,
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
					storeId: this.data.storeId,
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
					storeId: this.data.storeId
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
				for (let i in pickupPlace.serviceHours) {
					serviceHours.push(pickupPlace.serviceHours[i]);
				}
				this.setData({
					pickupPlaceIndex,
					pickupPlace,
					serviceHours
				});
			})// 6. 获取可用的优惠
			.then(() => {
				// items: 订单里的商品
				this.data.items = [];
				this.data.cart.items.forEach((item, index) => {
					let itm = {
						productId: item.productId,
						quantity: item.quantity
					};
					if (item.productOption) {
						itm.productOptionId = item.productOption._id;
					}
					this.data.items.push(itm);
				});
				return callApi.post('Discount.findAvailable', {
					storeId: this.data.storeId,
					items: this.data.items
				}, 400);
			})// return []
			.then(results => {
				let value = 0;
				if (results.length) {
					value = 1;
				} else {
					this.setData({
						discountItems: this.data.discountItems.concat(results)
					});
				}
				this.selectDiscountItem({
					detail: {
						value
					}
				});
			}).catch(err => {
				console.error(err);
			});

		// init nonce
		initNonce();
	},
	onShow() {
		this.setData(_.pick(app.globalData, ['selectTime', 'shippingAddress', 'pickupPlace', 'serviceHours', 'appointmentTime']));
		if (this.data.shippingType === 'areaShipping') {
			this.setData({
				areaShipping_params: {
					description: this.data.areaShipping.description,
					image: this.data.areaShipping.image,
					minPurchase: this.data.areaShipping.minPurchase,
					shippingCost: this.data.areaShipping.shippingCost,
					enabledAppointment: this.data.areaShipping.enabledAppointment,
					appointmentTime: app.globalData.appointmentTime
				}
			});
		}
	},
	submit(event) {
		// generate order params
		let storeId = this.data.cart.store._id;
		let value = event.detail.value;
		let discountId = this.data.discountItems[value.discountItemsIndex].discountId;
		// prepare order params
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
			this.setData({
				pickupPlace_params: {
					name: this.data.pickupPlace.name,
					mobilePhone: this.data.pickupPlace.mobilePhone,
					province: this.data.pickupPlace.province,
					provinceId: this.data.pickupPlace.provinceId,
					city: this.data.pickupPlace.city,
					cityId: this.data.pickupPlace.cityId,
					district: this.data.pickupPlace.district,
					districtId: this.data.pickupPlace.districtId,
					address: this.data.pickupPlace.address
				}
			});
			params = {
				shippingAddress: {
					name: value.name,
					mobilePhone: value.mobilePhone
				},
				pickUpPlace: this.data.pickupPlace_params,
			};
		}

		let cartItems = this.data.cart.items;
		params.items = [];
		for (let i = 0; i < cartItems.length; ++i) {
			let cartItem = cartItems[i];
			let orderItem = {
				quantity: cartItem.quantity,
				productId: cartItem.product._id
			};
			if (cartItem.productOption) {
				orderItem.productOptionId = cartItem.productOption._id;
			}
			params.items.push(orderItem);
		}
		if (discountId) {
			params.discountId = discountId;
		}
		Object.assign(params, {
			shippingType: this.data.shippingType,
			note: value.note,
			storeId,
			nonce: guzzuUtils.storageGet('nonce'),
			clientType: 'mini-program',
			type: 'default',
		});
		// call api to create order
		let order;
		callApi.post('Order.create', params, 400).then(result => {
			order = result;
			// clear cart
			return callApi.post('StoreCart.clear', {
				storeId
			}, 400);
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
		console.log('e', e);
		let discountItemsIndex = e.detail.value;
		this.setData({
			discountItemsIndex
		});
		let discountId = this.data.discountItems[discountItemsIndex].discountId;
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
		callApi.post('Order.preview', params, 400).then(result => {
			priceFilter(result.order);
			this.setData({
				order: result.order
			});
		});
	},
	selectShipping(event) {
		let shippingType = event.currentTarget.dataset.shippingType;
		this.setData({
			discountItemsIndex: 0
		});
		if (shippingType === 'regular') {
			this.setData({
				shippingType,
				isShowAddress: true,
				regularPicSrc: '/public/images/icon/option-check.png',
				cityPicSrc: '/public/images/icon/option-none.png',
				pickupPicSrc: '/public/images/icon/option-none.png'
			});
			var params = {
				storeId: this.data.storeId,
				shippingAddress: this.data.shippingAddress,
				items: this.data.items,
				shippingType: this.data.shippingType,
				nonce: String(Date.now()),
				type: 'default',
			};
			callApi.post('Order.preview', params, 400).then(result => {
				this.setData({
					order: result.order
				});
			});
		}
		if (shippingType == 'areaShipping') {
			this.setData({
				shippingType,
				isShowAddress: true,
				regularPicSrc: '/public/images/icon/option-none.png',
				cityPicSrc: '/public/images/icon/option-check.png',
				pickupPicSrc: '/public/images/icon/option-none.png'
			});

			var params = {
				storeId: this.data.storeId
			};
			callApi.post('AreaShipping.get', params, 400).then(result => {
				this.setData({
					areaShipping: result
				});
				let serviceHours = [];
				for (let i in result.serviceHours) {
					// console.log(result.serviceHours[i])
					serviceHours.push(result.serviceHours[i]);
				}
				app.globalData.serviceHours = serviceHours;
				this.setData({
					serviceHours: app.globalData.serviceHours
				});
			}).then(result => {
				if (this.data.areaShipping.enabledAppointment === false) {
					this.setData({
						areaShipping_params: {
							description: this.data.areaShipping.description,
							image: this.data.areaShipping.image,
							minPurchase: this.data.areaShipping.minPurchase,
							shippingCost: this.data.areaShipping.shippingCost,
							enabledAppointment: this.data.areaShipping.enabledAppointment
						}
					});
				}
				if (this.data.areaShipping.enabledAppointment === true) {
					this.setData({
						areaShipping_params: {
							description: this.data.areaShipping.description,
							image: this.data.areaShipping.image,
							minPurchase: this.data.areaShipping.minPurchase,
							shippingCost: this.data.areaShipping.shippingCost,
							enabledAppointment: this.data.areaShipping.enabledAppointment,
							appointmentTime: app.globalData.appointmentTime
						}
					});
				}
				let params = {
					storeId: this.data.storeId,
					shippingAddress: this.data.shippingAddress,
					areaShipping: this.data.areaShipping_params,
					items: this.data.items,
					shippingType: this.data.shippingType,
					nonce: String(Date.now()),
					type: 'default',
				};
				callApi.post('Order.preview', params, 400).then(result => {
					this.setData({
						order: result.order
					});
				});
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

			var params = {
				storeId: this.data.storeId
			};
			callApi.post('PickUpPlace.find', params, 400).then(result => {
				let pickupPlace = result.results[this.data.pickupPlaceIndex];
				this.setData({
					pickupPlace,
					pickupPlace_params: _.pick(pickupPlace, ['name', 'mobilePhone', 'province', 'provinceId', 'city', 'cityId', 'district', 'districtId', 'address'])
				});
				let serviceHours = [];
				for (let i in this.data.pickupPlace.serviceHours) {
					serviceHours.push(this.data.pickupPlace.serviceHours[i]);
				}
				this.setData({
					serviceHours
				});
				let params = {
					storeId: this.data.storeId,
					shippingAddress: {
						name: this.data.shippingAddress.name,
						mobilePhone: this.data.shippingAddress.mobilePhone
					},
					pickUpPlace: this.data.pickupPlace_params,
					items: this.data.items,
					shippingType: this.data.shippingType,
					nonce: String(Date.now()),
					type: 'default',
				};
				return callApi.post('Order.preview', params, 400);
			})
				.then(result => {
					priceFilter(result.order);
					this.setData({
						order: result.order
					});
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
