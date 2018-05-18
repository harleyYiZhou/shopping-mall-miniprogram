// update-address.js
const guzzuUtils = require('../../utils/guzzu-utils');
const { showModal, showToast, showLoading, debug, _ } = require('../../utils/util');
const app = getApp();
const callApi = guzzuUtils.callApi.post;

// userAddress.js
Page({
	data: {
		zonesList: [],
		zones: null,
		zoneLevel: 1,
		provinces_index: 0,
		citys_index: 0,
		areas_index: 0,
		streets_index: 0,
		currAddress: undefined,
		state: ''
	},
	onLoad(options) {
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		// 请求获取province
		let params = {
			// provinceId: '440000'
		};
		console.log(app.globalData.trans);

		callApi('Zone.findProvince', params, 400).then((result) => {
			// init zone
			let zones = result;
			let provinces = [];
			for (let i in zones) {
				provinces.push({
					id: i,
					name: zones[i].name
				});
			}
			this.setData({
				provinces,
				provinces_index: 0,
				zones
			});
			console.log(zones);
			console.log(provinces.length);
		});
		let addressId = options.addressId;
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		if (addressId) {
			this.editAddress(addressId);
		} else {
			this.addAddress();
		}
	},
	selectZone(event, analog_level, analog_index) {
		let level = analog_level || Number(event.target.dataset.level); // 1:province;2:city;3:area;
		let index = 0;
		this.setData({
			state: ''
		});
		if (analog_index != null) {
			index = analog_index;
		} else {
			index = event.detail.value;
		}
		let item = [];
		let parent = [];
		if (level === 1) {
			item = this.data.provinces[index];
			// 请求获取city
			let params = {
				provinceId: this.data.provinces[index].id
			};
			callApi('Zone.findCity', params, 400).then(result => {
				// init zone
				let zones = result;
				let citys = [];
				for (let i in zones) {
					citys.push({
						id: i,
						name: zones[i].name
					});
				}
				let level1 = citys.length === 0 ? level : level + 1;
				this.setData({
					zoneLevel: level1,
					citys,
					citys_index: 0,
				});
			});
			parent = this.data.zones[item.id];
		} else if (level === 2) {
			item = this.data.citys[index];
			let params = {
				cityId: this.data.citys[index].id
			};
			callApi('Zone.findDistrict', params, 400).then(result => {
				// init zone
				let zones = result;
				let areas = [];
				for (let i in zones) {
					areas.push({
						id: i,
						name: zones[i].name
					});
				}
				this.setData({
					areas,
					areas_index: 0
				});
				let level1 = areas.length === 0 ? level : level + 1;
				this.setData({
					zoneLevel: level1
				});
				console.log(this.data.zoneLevel);

				if (this.data.areas.length === 1) {
					console.log(this.data.zoneLevel);
					let params = {
						districtId: this.data.areas[0].id
					};
					return callApi('Zone.findStreet', params, 400);
				}
			}).then(result => {
				if (!result) {
					return;
				}
				console.log(result);
				this.setData({
					zoneLevel: 4,
					state: 'none'
				});
				// init zone
				let zones = result;
				let streets = [];
				for (let i in zones) {
					streets.push({
						id: i,
						name: zones[i].name
					});
				}
				this.setData({
					streets,
					streets_index: 0
				});
			});
		} else if (level === 3) {
			let params = {
				districtId: this.data.areas[index].id
			};
			callApi('Zone.findStreet', params, 400).then((result) => {
				// init zone
				let zones = result;
				let streets = [];
				for (let i in zones) {
					streets.push({
						id: i,
						name: zones[i].name
					});
				}
				this.setData({
					streets,
					streets_index: 0
				});
				this.data.zoneLevel = streets.length === 0 ? level : level + 1;
				this.setData({
					zoneLevel: this.data.zoneLevel
				});
			});
		} else if (level === 4) {
			if (this.data.areas.length === 1) {
				this.setData({
					state: 'none'
				});
			}
			this.setData({
				streets_index: index
			});
		}
		// subItems???
		let subItems = [];
		if (parent.subItems) {
			for (let i in parent.subItems) {
				subItems.push({
					id: i,
					name: parent.subItems[i].name
				});
			}
		}

		switch (level) {
			case 1:
				this.data.provinces_index = index;
				this.data.citys_index = 0;
				this.data.citys = subItems;
				break;
			case 2:
				this.data.citys_index = index;
				this.data.areas_index = 0;
				this.data.areas = subItems;
				break;
			case 3:
				this.data.areas_index = index;
				this.data.streets_index = 0;
				break;
			case 4:
				this.data.streets_index = index;
				console.log(index);
		}
		let datas = _.pick(this.data, ['provinces_index', 'citys_index', 'areas_index', 'streets_index', 'provinces', 'citys', 'areas']);
		debug('datas', datas);
		this.setData(datas);
	},

	submit(event) {
		let value = event.detail.value;
		if (!value.name || !value.mobilePhone || !value.province ||
      !value.city || !value.address || !this.data.citys || !this.data.areas) {
			debug.trace(value);
			showModal({
				title: 'common.error',
				content: 'updateAddress.infoNotComplete',
				showCancel: false
			});
		} else {
			let params_province = this.data.provinces[value.province];
			let params_city = this.data.citys[value.city];
			let params_district = this.data.areas && this.data.areas[value.district];
			let params_street = this.data.streets[value.street];
			let params = {
				name: value.name,
				country: 'CHN',
				province: params_province.name,
				provinceId: params_province.id,
				city: params_city.name,
				cityId: params_city.id,
				district: params_district ? params_district.name : '',
				districtId: params_district ? params_district.id : '',
				street: params_street ? params_street.name : '',
				streetId: params_street ? params_street.id : '',
				address: value.address,
				mobilePhone: value.mobilePhone,
				mobilePhoneCountry: 'CHN'
			};
			let uri = 'UserAddress.create';
			if (value.userAddressId) {
				params.userAddressId = value.userAddressId;
				uri = 'UserAddress.update';
			}
			showLoading({
				title: 'updateAddress.updating'
			});
			callApi(uri, params, 400).then(result => {
				app.globalData.shippingAddress = result;
				this.setData({
					currAddress: result
				});
				showToast({
					title: 'updateAddress.updateSuccess',
					icon: 'success',
					duration: 1500,
					success() {
						wx.navigateBack();
					}
				});
			}).catch(err => {
				console.error(err);
				showModal({
					title: 'common.error',
					content: 'updateAddress.updateFailed',
					showCancel: false
				});
			});
		}
	},

	editAddress(addressid) {
		showLoading();
		let params = {
			userAddressId: addressid
		};
		let userAddress;
		let index = 0;
		callApi('UserAddress.get', params, 400).then(result => {
			console.log(result);
			userAddress = result;
			wx.hideLoading();
			this.data.currAddress = result;
			this.setData(this.data);
			for (let i in this.data.zones) {
				if (i === result.provinceId) {
					this.selectZone(null, 1, index);
					break;
				}
				index++;
			}

			if (result.cityId) {
				let params1 = {
					provinceId: result.provinceId
				};
				return callApi('Zone.findCity', params1, 400);
			}
		}).then(result => {
			if (!result) {
				return;
			}
			// init zone
			let zones = result;
			let citys = [];
			for (let i in zones) {
				citys.push({
					id: i,
					name: zones[i].name
				});
			}
			this.setData({
				citys,
				citys_index: 0
			});
			index = 0;
			for (let i in zones) {
				if (i === userAddress.cityId) {
					this.selectZone(null, 2, index);
					break;
				}
				index++;
			}

			if (userAddress.districtId) {
				let params = {
					cityId: userAddress.cityId
				};
				return callApi('Zone.findDistrict', params, 400);
			}
		}).then((result) => {
			if (!result) {
				return;
			}
			// init zone
			let zones = result;
			let areas = [];
			for (let i in zones) {
				areas.push({
					id: i,
					name: zones[i].name
				});
			}
			this.setData({
				areas,
				areas_index: 0
				// zones: zones
			});
			index = 0;
			for (let i in zones) {
				if (i === userAddress.districtId) {
					this.selectZone(null, 3, index);
					break;
				}
				index++;
			}
			if (userAddress.streetId) {
				let params = {
					districtId: userAddress.districtId
				};
				callApi('Zone.findStreet', params, 400);
			}
		}).then((result) => {
			if (!result) {
				return;
			}
			// init zone
			let zones = result;
			let streets = [];
			for (let i in zones) {
				streets.push({
					id: i,
					name: zones[i].name
				});
			}
			this.setData({
				streets,
				streets_index: 0
			});
			index = 0;
			for (let i in zones) {
				if (i === userAddress.streetId) {
					this.selectZone(null, 4, index);
					break;
				}
				index++;
			}
			console.log(this.data.areas.length);
			if (this.data.areas.length === 1) {
				this.setData({
					state: 'none'
				});
			}
		}).catch(err => {
			console.error(err);
		});
	},
	addAddress(event) {
		this.data.currAddress = {};
		this.data.zoneLevel = 1;
		this.data.provinces_index = 0;
		this.data.citys_index = 0;
		this.data.areas_index = 0;
		this.data.citys = null;
		this.data.areas = null;
		this.setData(this.data);
	}
});
