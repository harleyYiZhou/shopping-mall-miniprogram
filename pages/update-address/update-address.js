// update-address.js
var guzzuUtils = require('../../utils/guzzu-utils');
var app = getApp();

// userAddress.js
// var zoneUtils = require('../../utils/china_zones.js');
Page({

	/**
   * 页面的初始数据
   */
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

	/**
   * 生命周期函数--监听页面加载
   */
	onLoad: function (options) {
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		var that = this;
		// 请求获取province
		var params = {
			// provinceId: '440000'
		};
		console.log(app.globalData.trans);

		guzzuUtils.callApi('Zone.findProvince', params).then(function (result) {
			// init zone
			var zones = result;
			var provinces = [];
			for (var i in zones) {
				provinces.push({
					id: i,
					name: zones[i].name
				});
			}
			that.setData({
				provinces: provinces,
				provinces_index: 0,
				zones: zones
			});
			console.log(zones);
			console.log(provinces.length);
		});
		var addressId = options.addressId;
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		if (addressId) {
			that.editAddress(addressId);
		} else {
			that.addAddress();
		}
	},

	/**
   * 生命周期函数--监听页面初次渲染完成
   */
	onReady: function () {

	},

	/**
   * 生命周期函数--监听页面显示
   */
	onShow: function () {

	},

	/**
   * 生命周期函数--监听页面隐藏
   */
	onHide: function () {

	},

	/**
   * 生命周期函数--监听页面卸载
   */
	onUnload: function () {

	},

	selectZone: function (event, analog_level, analog_index) {
		var that = this;
		var level = analog_level || Number(event.target.dataset.level); // 1:province;2:city;3:area;
		var index = 0;
		that.setData({
			state: ''
		});
		if (analog_index != null) {
			index = analog_index;
		} else {
			index = event.detail.value;
		}
		var item = [];
		// var parent = [];
		if (level === 1) {
			item = that.data.provinces[index];
			// 请求获取city
			var params = {
				provinceId: that.data.provinces[index].id
			};
			guzzuUtils.callApi('Zone.findCity', params).then(function (result) {
				// init zone
				var zones = result;
				var citys = [];
				for (var i in zones) {
					citys.push({
						id: i,
						name: zones[i].name
					});
				}
				that.setData({
					citys: citys,
					citys_index: 0
					// zones: zones
				});
				var level1 = citys.length === 0 ? level : level + 1;
				that.setData({
					zoneLevel: level1
				});
				// console.log(zones)
				// console.log(that.data.zoneLevel);
			});
			// parent = that.data.zones[item.id];
		} else if (level === 2) {
			item = that.data.citys[index];
			var params = {
				cityId: that.data.citys[index].id
			};
			guzzuUtils.callApi('Zone.findDistrict', params).then(function (result) {
				// init zone
				var zones = result;
				var areas = [];
				for (var i in zones) {
					areas.push({
						id: i,
						name: zones[i].name
					});
				}
				that.setData({
					areas: areas,
					areas_index: 0
				});
				var level1 = areas.length === 0 ? level : level + 1;
				that.setData({
					zoneLevel: level1
				});
				console.log(that.data.zoneLevel);

				if (that.data.areas.length === 1) {
					console.log(that.data.zoneLevel);
					var params = {
						districtId: that.data.areas[0].id
					};
					guzzuUtils.callApi('Zone.findStreet', params).then(function (result) {
						console.log(result);
						that.setData({
							zoneLevel: 4,
							state: 'none'
						});
						// init zone
						var zones = result;
						var streets = [];
						for (var i in zones) {
							streets.push({
								id: i,
								name: zones[i].name
							});
						}
						that.setData({
							streets: streets,
							streets_index: 0
						});
					});
				}
			});
			console.log(that.data.zoneLevel);
		} else if (level === 3) {
			var params = {
				districtId: that.data.areas[index].id
			};
			guzzuUtils.callApi('Zone.findStreet', params).then(function (result) {
				// init zone
				var zones = result;
				var streets = [];
				for (var i in zones) {
					streets.push({
						id: i,
						name: zones[i].name
					});
				}
				that.setData({
					streets: streets,
					streets_index: 0
				});
				that.data.zoneLevel = streets.length === 0 ? level : level + 1;
				that.setData({
					zoneLevel: that.data.zoneLevel
				});
			});
		} else if (level === 4) {
			if (that.data.areas.length === 1) {
				that.setData({
					state: 'none'
				});
			}
			that.setData({
				streets_index: index
			});
		}

		var subItems = [];
		if (parent.subItems) {
			for (var i in parent.subItems) {
				subItems.push({
					id: i,
					name: parent.subItems[i].name
				});
			}
		}

		switch (level) {
			case 1:
				that.data.provinces_index = index;
				that.data.citys_index = 0;
				that.data.citys = subItems;
				break;
			case 2:
				that.data.citys_index = index;
				that.data.areas_index = 0;
				that.data.areas = subItems;
				break;
			case 3:
				that.data.areas_index = index;
				that.data.streets_index = 0;
				break;
			case 4:
				that.data.streets_index = index;
				console.log(index);
			default:
				break;
		}

		that.setData({
			provinces_index: that.data.provinces_index,
			citys_index: that.data.citys_index,
			areas_index: that.data.areas_index,
			streets_index: that.data.streets_index,
			provinces: that.data.provinces,
			citys: that.data.citys,
			areas: that.data.areas
			// zoneLevel: that.data.zoneLevel
		});
	},

	submit: function (event) {
		var that = this;
		var value = event.detail.value;
		if (!value.name || !value.mobilePhone || !value.province ||
      !value.city || !value.address || !that.data.citys || !that.data.areas) {
			wx.showModal({
				title: that.data.trans.error,
				content: that.data.trans.infoNotComplete,
				showCancel: false
			});
		} else {
			var params_province = that.data.provinces[value.province];
			var params_city = that.data.citys[value.city];
			var params_district = that.data.areas && that.data.areas[value.district];
			var params_street = that.data.streets[value.street];
			var params = {
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
			var uri = 'UserAddress.create';
			if (value.userAddressId) {
				params.userAddressId = value.userAddressId;
				uri = 'UserAddress.update';
			}
			wx.showLoading({
				title: that.data.trans.updating
			});
			guzzuUtils.callApi(uri, params).then(function (result) {
				app.globalData.shippingAddress = result;
				that.setData({
					currAddress: result
				});
				wx.showToast({
					title: that.data.trans.updateSuccess,
					icon: 'success',
					duration: 1500,
					success: function () {
						wx.navigateBack();
					}
				});
			}, function (err) {
				console.log(err);
				wx.showModal({
					title: that.data.trans.error,
					content: that.data.trans.updateFailed,
					showCancel: false
				});
			});
		}
	},

	editAddress: function (addressid) {
		var that = this;
		wx.showLoading({
			title: that.data.trans.loading
		});
		var params = {
			userAddressId: addressid
		};
		guzzuUtils.callApi('UserAddress.get', params).then(function (result) {
			console.log(result);
			wx.hideLoading();
			that.data.currAddress = result;
			that.setData(that.data);
			var index = 0;
			for (var i in that.data.zones) {
				if (i === result.provinceId) {
					that.selectZone(null, 1, index);

					break;
				}
				index++;
			}

			if (result.cityId) {
				var params1 = {
					provinceId: result.provinceId
				};
				guzzuUtils.callApi('Zone.findCity', params1).then(function (result1) {
					// init zone
					var zones = result1;
					var citys = [];
					for (var i in zones) {
						citys.push({
							id: i,
							name: zones[i].name
						});
					}
					that.setData({
						citys: citys,
						citys_index: 0
						// zones: zones
					});
					var index1 = 0;
					for (var i in zones) {
						if (i === result.cityId) {
							that.selectZone(null, 2, index1);
							break;
						}
						index1++;
					}

					if (result.districtId) {
						var params2 = {
							cityId: result.cityId
						};
						guzzuUtils.callApi('Zone.findDistrict', params2).then(function (result2) {
							// init zone
							var zones = result2;
							var areas = [];
							for (var i in zones) {
								areas.push({
									id: i,
									name: zones[i].name
								});
							}
							that.setData({
								areas: areas,
								areas_index: 0
								// zones: zones
							});
							index = 0;
							for (var i in zones) {
								if (i === result.districtId) {
									that.selectZone(null, 3, index);
									break;
								}
								index++;
							}
							if (result.streetId) {
								var params = {
									districtId: result.districtId
								};
								guzzuUtils.callApi('Zone.findStreet', params).then(function (result3) {
									// init zone
									var zones = result3;
									var streets = [];
									for (var i in zones) {
										streets.push({
											id: i,
											name: zones[i].name
										});
									}
									that.setData({
										streets: streets,
										streets_index: 0
									});
									index = 0;
									for (var i in zones) {
										if (i === result.streetId) {
											that.selectZone(null, 4, index);
											break;
										}
										index++;
									}
									console.log(that.data.areas.length);
									if (that.data.areas.length === 1) {
										that.setData({
											state: 'none'
										});
									}
								});
							}
						});
					}
				});
			}
		});
	},

	addAddress: function (event) {
		var that = this;
		that.data.currAddress = {};
		that.data.zoneLevel = 1;
		that.data.provinces_index = 0;
		that.data.citys_index = 0;
		that.data.areas_index = 0;
		that.data.citys = null;
		that.data.areas = null;
		that.setData(that.data);
	}
});
// var app = getApp();
// Page({
// 	data: {
// 		chinaZones: null,
// 		shippingAddress: null,
// 		provinceIndex: -1,
// 		cityIndex: -1,
// 		districtIndex: -1
// 	},
// 	onLoad: function (options) {
// 		var that = this;
// 		var addressId = options.addressId;
// 		guzzuUtils.callApi("UserAddress.get", {
// 			userAddressId: addressId
// 		}).then(function (result) {
// 			that.setData({
// 				shippingAddress: result
// 			});
// 			app.globalData.shippingAddress = result;
// 			return getChinaZones();
// 		}).then(function (result) {
// 			// parse the JSON file
// 			var chinaZones = [];
// 			var i, j, k;
// 			for (i in result) {
// 				var cities = [];
// 				for (j in result[i].city) {
// 					var areas = [];
// 					for (k in result[i].city[j].area) {
// 						areas.push(result[i].city[j].area[k]);
// 					}
// 					cities.push({
// 						cityName: result[i].city[j].city_name,
// 						areas: areas
// 					});
// 				}
// 				chinaZones.push({
// 					provinceName: result[i].province_name,
// 					cities: cities
// 				});
// 			}
// 			that.setData({
// 				chinaZones: chinaZones
// 			});

// 			// set the original selection of address
// 			var shippingAddress = that.data.shippingAddress;
// 			for (i in chinaZones) {
// 				for (j in chinaZones[i].cities) {
// 					for (k in chinaZones[i].cities[j].areas) {
// 						if (shippingAddress.district ==== chinaZones[i].cities[j].areas[k]) {
// 							that.setData({
// 								districtIndex: k
// 							});
// 							break;
// 						}
// 					}
// 					if (shippingAddress.city ==== chinaZones[i].cities[j].cityName) {
// 						that.setData({
// 							cityIndex: j
// 						});
// 						break;
// 					}
// 				}
// 				if (shippingAddress.province ==== chinaZones[i].provinceName) {
// 					that.setData({
// 						provinceIndex: i
// 					});
// 					break;
// 				}
// 			}
// 		});
// 	},
// 	provinceChange: function (event) {
// 		var that = this;
// 		that.setData({
// 			provinceIndex: event.detail.value,
// 			cityIndex: -1,
// 			districtIndex: -1
// 		});
// 	},
// 	cityChange: function (event) {
// 		var that = this;
// 		that.setData({
// 			cityIndex: event.detail.value,
// 			districtIndex: -1
// 		});
// 	},
// 	districtChange: function (event) {
// 		var that = this;
// 		that.setData({
// 			districtIndex: event.detail.value
// 		});
// 	},
// 	submit: function (event) {
// 		var that = this;
// 		var value = event.detail.value;
// 		if (!value.name || !value.mobilePhone || !value.province ||
// 			!value.city || !value.address || !value.postalCode) {
// 			wx.showModal({
// 				title: "错误",
// 				content: "地址信息未填写完整，操作失败！",
// 				showCancel: false,
// 			});
// 		} else {
// 			var params = {
// 				userAddressId: that.data.shippingAddress._id,
// 				name: value.name,
// 				mobilePhone: value.mobilePhone,
// 				country: "CHN",
// 				province: that.data.chinaZones[value.province].provinceName,
// 				city: that.data.chinaZones[value.province].cities[value.city].cityName,
// 				district: that.data.chinaZones[value.province].cities[value.city].areas[value.district],
// 				address: value.address,
// 				postalCode: value.postalCode,
// 				mobilePhoneCountry: "+86"
// 			};

// 			guzzuUtils.callApi("UserAddress.update", params).then(function (result) {
// 				app.globalData.shippingAddress = result;
// 				that.setData({
// 					shippingAddress: result
// 				});
// 				wx.showToast({
// 					title: '成功更改地址',
// 					icon: 'success',
// 					duration: 1500,
// 					success: function () {
// 						wx.navigateBack();
// 					}
// 				});
// 			}, function (err) {
// 				console.log(err);
// 				wx.showModal({
// 					title: "错误",
// 					content: "更改地址失败！",
// 					showCancel: false,
// 				});
// 			});
// 		}
// 	}
// });

// function getChinaZones() {
// 	return new Promise(function (resolve, reject) {
// 		var file = "https://m.guzzu.cn/js/china_zones.json";
// 		wx.request({
// 			url: file,
// 			method: "GET",
// 			success: function (res) {
// 				if (res.statusCode ==== 200 || res.statusCode ==== "200") {
// 					resolve(res.data);
// 				} else {
// 					reject(res);
// 				}
// 			},
// 			fail: function (err) {
// 				reject(err);
// 			}
// 		});
// 	});
// }
