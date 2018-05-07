// guzzu-utils.js
var config = require('../config.js');

module.exports.callApiPost = callApiPost;
module.exports.callApiGet = callApiGet;
module.exports.hasLoginSession = hasLoginSession;
module.exports.checkMobilePhone = checkMobilePhone;
module.exports.login = login;
module.exports.storageGet = storageGet;
module.exports.storageSet = storageSet;
module.exports.storageRemove = storageRemove;
module.exports.bindPhoneNumber = bindPhoneNumber;

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

function checkLogin(err) {
	console.log(1);
	console.log(err);
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

function callApiGet(name) {
	return new Promise(function (resolve, reject) {
		var app = getApp();
		var API_URL = config.API_URL;
		var obj = {
			method: 'GET',
			url: API_URL + name,
			header: {
				'x-guzzu-lang': getApp().globalData.locale
			},
			success: function (res) {
				if (res.statusCode === '200' || res.statusCode === 200) {
					resolve(res.data);
				} else if (res.statusCode === '500' || res.statusCode === 500) {
					reject(res.data);
					checkLogin(res.data);
					// wx.showToast({
					//   title: res.data.detail.message,
					//   icon:'none',
					//   duration:2000
					// })
					wx.showModal({
						title: 'error',
						content: res.data.detail.message,
						showCancel: false
					});
					app.globalData.islegal = app.globalData.islegal && false;
					console.log(app.globalData.islegal);
				} else {
					reject(res);
				}
			},
			fail: function (err) {
				reject(err);
			}
		};
		var sessionId = wx.getStorageSync('guzzuSessionId');
		// var sessionId = storageGet('guzzuSessionId');
		if (sessionId) {
			obj.header['x-guzzu-sessionid'] = sessionId;
		}
		wx.request(obj);
	});
}

function callApiPost(name, params) {
	return new Promise(function (resolve, reject) {
		var app = getApp();
		var API_URL = config.API_URL;
		var obj = {
			method: 'POST',
			header: {
				'x-guzzu-lang': getApp().globalData.locale
			},
			url: API_URL + name,
			data: params,
			success: function (res) {
				if (res.statusCode === '200' || res.statusCode === 200) {
					resolve(res.data);
				} else if (res.statusCode === '500' || res.statusCode === 500) {
					reject(res.data);
					checkLogin(res.data);
					// wx.showToast({
					//   title: res.data.detail.message,
					//   icon:'none',
					//   duration:2000
					// })
					wx.showModal({
						title: 'error',
						content: res.data.detail.message,
						showCancel: false
					});
					app.globalData.islegal = app.globalData.islegal && false;
					console.log(app.globalData.islegal);
				} else {
					reject(res);
				}
			},
			fail: function (err) {
				reject(err);
			}
		};
		var sessionId = wx.getStorageSync('guzzuSessionId');
		// var sessionId = storageGet('guzzuSessionId');
		if (sessionId) {
			obj.header['x-guzzu-sessionid'] = sessionId;
		}
		wx.request(obj);
	});
};

function hasLoginSession() {
	var sessionId = wx.getStorageSync('guzzuSessionId');
	// var sessionId = storageGet('guzzuSessionId');
	if (sessionId) {
		return true;
	} else {
		return false;
	}
};

function checkMobilePhone() {
	return new Promise(function (resolve, reject) {
		console.log('checkMobilePhone', hasLoginSession());
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
			wx.setStorageSync('guzzuSessionId', result.sessionId);
			// storageSet('guzzuSessionId', result.sessionId);
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
