// guzzu-utils.js
const config = require('../config.js');
const { showModal } = require('./util');

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

const session = {
	check() {
		return new Promise((resolve, reject) => {
			let { accessToken, expireAt } = this.get();
			if (accessToken && new Date(expireAt) <= new Date()) {
				return resolve(accessToken);
			}
			showModal({
				content: 'common.sessionExpired',
				success: function (res) {
					if (res.confirm) {
						login();
					}
				}
			});
			reject(false);
		});
	},
	set(accessToken) {
		wx.setStorageSync('accessToken', {
			accessToken: accessToken,
			expireAt: new Date(Date.now() + config.session_expire_seconds * 1000)
		});
	},
	get() {
		return wx.getStorageSync('accessToken') || {
			accessToken: '',
			expireAt: ''
		};
	}
};
const callApi = {
	get: _request('GET'),
	post: _request('POST')
};

function _request(method = 'GET') {
	return (url, params = {}, serve = 3002) => {
		let serve_url = config.SERVE_URL[config.MODE];
		let port = '';
		if (config.MODE === 'localhost') {
			port = config.PORT[serve];
		}
		let api_url = serve_url + port + config.API_PREFIX[serve];
		return new Promise(function (resolve, reject) {
			const app = getApp();
			const obj = {
				method,
				url: api_url + url.replace(/{\s*smallid\s*}/i, config.shoppingMallId),
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

// ------------------------------------------------------

function toLogin() {
	if (getCurrentPages().reverse()[0].route.indexOf('bind-phone') < 0) {
		wx.showModal({
			title: '提示',
			content: '登录超时，\n请重新登录',
			success(res) {
				if (res.confirm) {
					wx.navigateTo({
						url: '/pages/bind-phone/bind-phone'
					});
				}
			}
		});
	}
}

function checkMobilePhone() {
	return new Promise((resolve, reject) => {
		console.log('checkMobilePhone', hasLoginSession());
		callApi('Auth.getCurrentSession', {}).then(result => {
			console.log('1', result);
			if (result && result.user && result.user.mobilePhone) {
				resolve(result);
			} else {
				wx.navigateTo({
					url: '/pages/bind-phone/bind-phone'
				});
				resolve(false);
			}
		}, err => {
			reject(err);
		});
	});
}

function login() {
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
			return callApi('WxMiniProgram.signin', {
				code,
				encryptedData,
				iv
			});
		}).then(result => {
			// 4. set guzzu-session-id in local storage
			session.set(result.sessionId);
			return checkMobilePhone();
		}).then(result => {
			resolve(result);
		}, err => {
			reject(err);
		});
		// 如果获取用户信息失败，判断授权情况
		getUserInfo.catch(err => {
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
							success(res) {
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
		let param = {
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
				title,
				content: `新手机号是:${res.data.mobilePhone}`,
				showCancel: false,
				success(res) {
					if (res.confirm && getCurrentPages().length > 1) {
						wx.navigateBack();
					}
				}
			});
		}, err => {
			wx.showModal({
				title,
				content: err.error,
				showCancel: false
			});
		});
	} else {
		wx.showModal({
			title,
			content: '用户不允许授权，请输入手机号码',
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
