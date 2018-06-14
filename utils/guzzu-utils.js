// guzzu-utils.js
const config = require('../config.js');
const { showModal, showToast, _, debug, priceFilter, showLoading } = require('./util');
let logining = false;

/**
 * guzzu storage (run time only quick storage)
 */
let guzzuStorageCache = {};

function storageGet(key) {
	return guzzuStorageCache[key];
}

function storageSet(key, value) {
	guzzuStorageCache[key] = value;
}

function storageRemove(key) {
	delete guzzuStorageCache[key];
}

const session = {
	check() {
		return new Promise((resolve, reject) => {
			let { accessToken, expireAt } = this.get();
			if (accessToken && new Date(expireAt) > new Date()) {
				return resolve(accessToken);
			}
			this.remove();
			resolve(false);
		});
	},
	checkSync() {
		let { accessToken, expireAt } = this.get();
		if (accessToken && new Date(expireAt) > new Date()) {
			return accessToken;
		}
		_loginToast();
		this.remove();
		return false;
	},
	set(accessToken) {
		wx.setStorageSync('accessToken', {
			accessToken,
			expireAt: new Date(Date.now() + config.SESSION_EXPIRE_SECONDS * 1000)
		});
	},
	get() {
		return wx.getStorageSync('accessToken') || {
			accessToken: '',
			expireAt: ''
		};
	},
	remove() {
		getApp().globalData.userInfo = null;
		wx.removeStorageSync('accessToken');
	},
};
/**
 * @description callApi 请求类型有 get 和 post 两种
 * callApi.[get|post](url,params,serve),
 * @param {String} url 请求的地址
 * @param {Object} [params] 请求的数据，get 请求或者参数为空可省略
 * @param {Number|String} [serve] 请求的后台类型，400 | 3002，默认是3002
 */
const callApi = {
	get: _request('GET'),
	post: _request('POST')
};

function _request(method = 'GET') {
	return (url, params = {}, serve = 3002) => {
		if (/^\d+$/.test(params)) {
			serve = params;
			params = {};
		}
		// 设置请求地址
		let serve_url = config.SERVE_URL[config.MODE];
		let port = '';
		if (config.MODE === 'localhost') {
			port = config.PORT[serve];
		}
		let api_url = serve_url + port + config.API_PREFIX[serve];
		return new Promise((resolve, reject) => {
			// request 设置
			const app = getApp();
			if (!app) {
				return reject(new Error('getApp Error'));
			}
			const obj = {
				method,
				url: api_url + url.replace(/{\s*(smallid|shoppingMallId)\s*}/i, config.shoppingMallId),
				data: params,
				header: {
					'x-guzzu-lang': app.globalData.locale
				},
				success(res) {
					if (res.statusCode === '200' || res.statusCode === 200) {
						let accessToken = obj.header[config.SESSION_KEY[serve]];
						if (accessToken) {
							session.set(accessToken);
						}
						return resolve(res.data);
					}
					if (res.statusCode === '500' || res.statusCode === 500) {
						reject(res.data);
						if (_.get(res, 'data.error') == 'ERR_INVALID_AUTH') {
							_loginToast();
							return;
						}
					} else {
						reject(res);
					}
					showModal({
						title: 'common.error',
						content: _.get(res, 'data.detail.message') || _.get(res, 'data.message') || _.get(res, 'data.error') || 'unknown error',
						showCancel: false
					});
				},
				fail(err) {
					reject(err);
				}
			};
			// 判断登录状态
			let accessToken;
			if (config.SESSION_REQUIRE.indexOf(url) > -1) {
				accessToken = session.checkSync();
				if (!accessToken) {
					return reject('signin required');
				}
			}
			if (accessToken) {
				obj.header[config.SESSION_KEY[serve]] = accessToken;
			}
			wx.request(obj);
		});
	};
}

function _loginToast() {
	showModal({
		title: 'common.sessionExpired',
		content: 'common.reSignin',
		success(res) {
			if (res.confirm) {
				getApp().onShow();
			} else {
				session.remove();
			}
		}
	});
}

function checkMobilePhone() {
	return new Promise((resolve, reject) => {
		// debug('checkMobilePhone', session.get());
		callApi.post('Auth.getCurrentSession', {}, 400).then(result => {
			// debug.trace('1', result);
			if (result && result.user && result.user.mobilePhone) {
				resolve(result);
			} else {
				let pages = getCurrentPages();
				let route = pages[pages.length - 1].route;
				if (!(/bind-phone/).test(route)) {
					wx.navigateTo({
						url: '/pages/bind-phone/bind-phone'
					});
				}
				resolve(false);
			}
		}, err => {
			reject(err);
		});
	});
}

function login() {
	if (logining) {
		logining = false;
		return Promise.reject('logining');
	}
	logining = true;
	return new Promise((resolve, reject) => {
		let code;
		// 1. login with weixin
		let loginWx = new Promise((_resolve, _reject) => {
			wx.login({
				success(res) {
					_resolve(res);
				},
				fail(err) {
					_reject(err);
				}
			});
		});

		// 2. get weixin user info
		let getUserInfo = loginWx.then(res => {
			code = res.code;
			return new Promise((_resolve, _reject) => {
				if (code) {
					wx.getUserInfo({
						success(res) {
							_resolve(res);
						},
						fail(err) {
							_reject(err);
						}
					});
				} else {
					_reject(res.errMsg);
				}
			});
		});
		getUserInfo.then(res => {
			// 3. login guzzu with weixin info
			let encryptedData = res.encryptedData;
			let iv = res.iv;
			return callApi.post('WxMiniProgram.signin', {
				code,
				encryptedData,
				iv
			}, 400);
		}).then(result => {
			// 4. set guzzu-session-id in local storage
			session.set(result.sessionId);
			return checkMobilePhone();
		}).then(result => {
			logining = false;
			showToast({
				title: 'common.signinSuccess'
			});
			getApp().globalData.userInfo = result.user;
			resolve(result);
		})
		// 如果获取用户信息失败，判断授权情况
			.catch(err => {
				reject(err);
				if (wx.getStorageSync('auth') && _.get(err, 'errMsg') !== 'getUserInfo:fail auth deny') {
					return;
				}
				wx.openSetting({
					complete: res => {
						if (res.authSetting['scope.userInfo']) {
						// 重新登录
							getApp().globalData.login = login();
							wx.setStorageSync('auth', true);
						} else {
							wx.removeStorageSync('auth');
							showModal({
								title: 'common.authorizeFail',
								content: 'common.retry',
								success(res) {
									if (res.confirm) {
									// 同意授权
										getApp().globalData.login = login();
									}
								}
							});
						}
					}
				});
			});
	});
}

function bindPhoneNumber(e) {
	let title = 'common.bindFail';
	if (e.detail.errMsg.endsWith('ok')) {
		let param = {
			encryptedData: e.detail.encryptedData,
			iv: e.detail.iv
		};
		callApi.post('WxMiniProgram.getPhoneNumber', param, 400).then(res => {
			if (res.data.mobilePhone) {
				getApp().globalData.mobilePhone = res.data.mobilePhone;
				title = 'common.bindSuccess';
			}
			showModal({
				title,
				content: `@{common.newMobilephone}:${res.data.mobilePhone}`,
				showCancel: false,
				success(res) {
					if (res.confirm && getCurrentPages().length > 1) {
						wx.navigateBack();
					}
				}
			});
		}, err => {
			console.error(err);
		});
	} else {
		showModal({
			title,
			content: 'common.bindDeny',
			showCancel: false,
			success(res) {
				let pages = getCurrentPages();
				let route = pages[pages.length - 1].route;
				if (res.confirm && !(/bind-phone/).test(route)) {
					wx.navigateTo({
						url: '/pages/bind-phone/bind-phone'
					});
				}
			}
		});
	}
}

/**
 *
 * @param {Object} params
 * @param {String} params.storeId
 * @param {Boolean} params.selectAll if clear all
 * @param {Array} params.selectedItems items to be removed,储存的是 item 的 index
 */
function removeItems(params) {
	let { storeId, selectAll, selectedItems } = params;
	if (selectAll) {
		return callApi.post('StoreCart.clear', { storeId }, 400);
	}
	let removePromises = [];
	let selectedCopy = selectedItems.concat();
	selectedCopy.sort((a, b) => a - b).reverse();
	selectedCopy.forEach((item, i) => {
		if (i) {
			removePromises[i] = new Promise((resolve, rej) => {
				removePromises[i - 1].then(() => {
					return callApi.post('StoreCart.removeItem', {
						storeId,
						itemIndex: item
					}, 400);
				}).then((res) => {
					resolve(res);
				}).catch(err => {
					rej(err);
				});
			});
		} else {
			removePromises[i] = callApi.post('StoreCart.removeItem', {
				storeId,
				itemIndex: item
			}, 400);
		}
	});
	return removePromises[selectedCopy.length - 1];
}

Promise.prototype.finally = function (callback) {
	let P = this.constructor;
	return this.then(
		value => P.resolve(callback(value)).then(() => value),
		reason => P.resolve(callback(reason)).then(() => { throw reason; })
	);
};

function checkInventory(items, selectedItems, quantity) {
	let bool = true;

	function _checkItem(item) {
		if (!quantity) {
			quantity = item.quantity;
		}
		if (item.productOption) {
			if (item.productOption.inventoryPolicy === 'limited' && quantity > item.productOption.maxQuantity) {
				return false;
			}
		} else if (item.product.inventoryPolicy === 'limited' && quantity > item.product.maxQuantity) {
			return false;
		}
		return true;
	}

	selectedItems.forEach(item => {
		bool = _checkItem(items[item]);
	});

	if (!bool) {
		showModal({
			title: 'common.error',
			content: 'common.error1',
			showCancel: false
		});
	}
	return bool;
}

function cartsCounter(carts) {
	carts = carts || [];
	let counts = carts.reduce((inc, item) => {
		inc += item.items.length;
		return inc;
	}, 0);
	if (counts) {
		wx.setTabBarBadge({
			index: 2,
			text: `${counts}`,
			fail(err) {
				debug(err);
			}
		});
	} else {
		wx.removeTabBarBadge({
			index: 2,
			fail(err) {
				debug(err);
			}
		});
	}
}

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

function synchronizeCart(localCarts) {
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

module.exports.callApi = callApi;
module.exports.checkMobilePhone = checkMobilePhone;
module.exports.login = login;
module.exports.storageGet = storageGet;
module.exports.storageSet = storageSet;
module.exports.storageRemove = storageRemove;
module.exports.bindPhoneNumber = bindPhoneNumber;
module.exports.session = session;
exports.removeItems = removeItems;
exports.checkInventory = checkInventory;
exports.cartsCounter = cartsCounter;
exports.synchronizeCart = synchronizeCart;
exports.getStoreCarts = getStoreCarts;
