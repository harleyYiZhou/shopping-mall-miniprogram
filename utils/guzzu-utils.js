// guzzu-utils.js
const config = require('../config.js');

/**
 * guzzu storage (run time only quick storage)
 */
var guzzuStorageCache = {};

function storageGet(key) {
	return guzzuStorageCache[key];
}

function storageSet(key, value) {
	guzzuStorageCache[key] = value;
}

function storageRemove(key) {
	delete guzzuStorageCache[key];
}

const callApi = {
	get: _request('GET'),
	post: _request('POST')
};

function _request(method = 'GET') {
	return (url, params = {}) => {
		return new Promise(function (resolve, reject) {
			const app = getApp();
			const API_PREFIX = config.API_URL;
			const obj = {
				method,
				url: API_PREFIX + url.replace(/{\s*smallid\s*}/i, config.shoppingMallId),
				data: params,
				header: {
					'x-guzzu-lang': app.globalData.locale
				},
				success: function (res) {
					if (res.statusCode === '200' || res.statusCode === 200) {
						resolve(res.data);
					} else if (res.statusCode === '500' || res.statusCode === 500) {
						reject(res.data);
						wx.showModal({
							title: 'error',
							content: res.data.detail.message,
							showCancel: false
						});
					} else {
						reject(res);
					}
				},
				fail: function (err) {
					reject(err);
				}
			};
			let accessToken = wx.getStorageSync('accessToken');
			if (accessToken) {
				obj.header['x-guzzu-access-token'] = accessToken;
			}
			wx.request(obj);
		});
	};
}

/**
 * @description 顶层路由
 */
function btnNavLink() {
	return function (e) {
		const app = getApp();
		let id = e.currentTarget.id;
		app.globalData.selected = id;
		if (this.data.selected === id) {
			return;
		}
		wx.showLoading({
			title: 'loading',
		});
		let url;
		switch (id) {
			case '0':
				url = '/pages/index/index';
				break;
			case '1':
				url = '/pages/shopping-cart/shopping-cart';
				break;
			case '2':
				url = '/pages/catagory/catagory';
				break;
			case '3':
				url = '/pages/user-center/user-center';
				break;
		}
		if (url) {
			wx.redirectTo({
				url,
			});
		}
		wx.hideLoading();
	};
}

function checkLogin(err) {
	if (err && err.detail && err.detail.message === 'signin required') {
		wx.showModal({
			title: 'Your session has expired.',
			content: 'Please sign in again, thanks.',
			success: function (res) {
				if (res.confirm) {
					login();
				}
			}
		});
	}
	if (err && err.detail && err.detail.message === '未登录') {
		wx.showModal({
			title: '登录状态超时.',
			content: '是否重新登录？',
			success: function (res) {
				if (res.confirm) {
					login();
				}
			}
		});
	}
}

function checkMobilePhone() {
	return new Promise(function (resolve, reject) {
		callApi('Auth.getCurrentSession', {}).then(function (result) {
			console.log('1', result);
			if (result && result.user && result.user.mobilePhone) {
				resolve(result);
			} else {
				wx.navigateTo({
					url: '/pages/bind-phone/bind-phone'
				});
				resolve(false);
			}
		}, function (err) {
			reject(err);
		});
	});
}

function login() {
	return new Promise(function (resolve, reject) {
		var code;
		// 1. login with weixin
		var loginWx = new Promise(function (_resolve, _reject) {
			wx.login({
				success: function (res) {
					_resolve(res);
				},
				fail: function (err) {
					_reject(err);
				}
			});
		});

		// 2. get weixin user info
		let getUserInfo = loginWx.then(function (res) {
			code = res.code;
			return new Promise(function (_resolve, _reject) {
				if (code) {
					wx.getUserInfo({
						success: function (res) {
							_resolve(res);
						},
						fail: function (err) {
							_reject(err);
						}
					});
				} else {
					_reject(res.errMsg);
				}
			});
		});
		getUserInfo.then(function (res) {
			// 3. login guzzu with weixin info
			var encryptedData = res.encryptedData;
			var iv = res.iv;
			return callApi('WxMiniProgram.signin', {
				code: code,
				encryptedData: encryptedData,
				iv: iv
			});
		}).then(function (result) {
			// 4. set guzzu-session-id in local storage
			wx.setStorageSync('accessToken', result.accessToken);
			// storageSet('accessToken', result.accessToken);
			return checkMobilePhone();
		}).then(function (result) {
			resolve(result);
		}, function (err) {
			reject(err);
		});
		// 如果获取用户信息失败，判断授权情况
		getUserInfo.catch((err) => {
			wx.openSetting({
				complete: res => {
					if (res.authSetting['scope.userInfo']) {
						// 重新登录
						login().then(result => {
							resolve(result);
						}, err => {
							reject(err);
						});
					} else {
						wx.showModal({
							title: '授权失败',
							content: '是否尝试再次授权？',
							success: function (res) {
								if (res.confirm) {
									// 同意授权
									login().then(result => {
										resolve(result);
									}, err => {
										reject(err);
									});
								} else {
									reject(err);
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
	let title = '绑定失败';
	if (e.detail.errMsg.endsWith('ok')) {
		var param = {
			encryptedData: e.detail.encryptedData,
			iv: e.detail.iv
		};
		callApi('WxMiniProgram.getPhoneNumber', param).then(res => {
			console.log(res);
			if (res.data.mobilePhone) {
				getApp().globalData.mobilePhone = res.data.mobilePhone;
				title = '绑定成功';
			}
			wx.showModal({
				title: title,
				content: `新手机号是:${res.data.mobilePhone}`,
				showCancel: false,
				success: function (res) {
					if (res.confirm && getCurrentPages().length > 1) {
						wx.navigateBack();
					}
				}
			});
		}, err => {
			wx.showModal({
				title: title,
				content: err.error,
				showCancel: false
			});
		});
	} else {
		wx.showModal({
			title: title,
			content: '用户不允许授权，请输入手机号码',
			showCancel: false,
			success: function (res) {
				let pages = getCurrentPages();
				let route = pages[pages.length - 1].route;
				if (res.confirm && !/bind-phone/.test(route)) {
					wx.navigateTo({
						url: '/pages/bind-phone/bind-phone'
					});
				}
			}
		});
	}
}
Promise.prototype.finally = function (callback) {
	let P = this.constructor;
	return this.then(
		value => P.resolve(callback(value)).then(() => value),
		reason => P.resolve(callback(reason)).then(() => { throw reason; })
	);
};

module.exports.callApi = callApi;
module.exports.checkMobilePhone = checkMobilePhone;
module.exports.login = login;
module.exports.storageGet = storageGet;
module.exports.storageSet = storageSet;
module.exports.storageRemove = storageRemove;
module.exports.bindPhoneNumber = bindPhoneNumber;
module.exports.btnNavLink = btnNavLink;
