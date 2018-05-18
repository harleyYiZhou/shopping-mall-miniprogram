// select-address.js
const guzzuUtils = require('../../utils/guzzu-utils');
const { showModal } = require('../../utils/util');
const app = getApp();
const callApi = guzzuUtils.callApi.post;

Page({
	data: {
		userAddresses: [],
		selectedIndex: -1,
		viewOnly: '',
	},
	onLoad(option) {
		let { viewOnly } = option;
		if (viewOnly) {
			this.setData({
				viewOnly
			});
		}
	},
	onShow() {
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		let selectedIndex = -1;
		callApi('UserAddress.find', 400).then(results => {
			let flag = false;
			if (results && results.length) {
				if (app.globalData.shippingAddress) {
					for (let i = 0; i < results.length; ++i) {
						if (results[i]._id === app.globalData.shippingAddress._id) {
							flag = true;
							selectedIndex = i;
							break;
						}
					}
				}
				if (!flag) {
					selectedIndex = 1;
				}
				this.setData({
					selectedIndex,
					userAddresses: results
				});
				app.globalData.shippingAddress = results[selectedIndex];
			}
		});
	},
	tapAddress(event) {
		if (this.data.viewOnly) {
			return;
		}
		let index = event.currentTarget.dataset.index;
		this.setData({
			selectedIndex: index
		});
		app.globalData.shippingAddress = this.data.userAddresses[index];
		wx.navigateBack();
	},
	addAddress() {
		wx.navigateTo({
			url: '/pages/update-address/update-address'
		});
	},
	removeAddress(event) {
		let index = event.currentTarget.dataset.index;
		new Promise((resolve, reject) => {
			showModal({
				title: 'selectAddress.removeTitle',
				content: 'selectAddress.removeContent',
				success(res) {
					if (res.confirm) {
						resolve(true);
					} else {
						resolve(false);
					}
				}
			});
		}).then(result => {
			if (result) {
				return callApi('UserAddress.remove', {
					userAddressId: this.data.userAddresses[index]._id
				}, 400);
			} else {
				return false;
			}
		}).then(result => {
			if (result) {
				let userAddresses = this.data.userAddresses;
				userAddresses.splice(index, 1);
				this.setData({
					userAddresses
				});
				if (this.data.selectedIndex === index) {
					this.setData({
						selectedIndex: 0
					});
					app.globalData.shippingAddress = userAddresses[0];
				}
			}
		}).catch(err => {
			console.error(err);
		});
	},
	updateAddress(event) {
		let addressId = event.currentTarget.dataset.addressId;
		wx.navigateTo({
			url: '/pages/update-address/update-address?addressId=' + addressId
		});
	}
});
