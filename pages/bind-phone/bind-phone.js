// bind-phone.js
var guzzuUtils = require('../../utils/guzzu-utils');
var app = getApp();

Page({
	data: {
		disableGetVerifyCode: true,
		mobilePhone: '',
		interval: null,
		countdown: 0
	},
	onLoad: function (options) {
		// 页面初始化 options为页面跳转所带来的参数
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
	},
	verifyMobilePhone: function (event) {
		var that = this;
		var mobilePhone = event.detail.value;
		var pattern = /^\d{11}$/;
		if (pattern.test(mobilePhone)) {
			that.setData({
				disableGetVerifyCode: false,
				mobilePhone: mobilePhone
			});
		} else {
			that.setData({
				disableGetVerifyCode: true,
				mobilePhone: mobilePhone
			});
		}
	},
	getVerifyCode: function () {
		var that = this;
		guzzuUtils.callApi('Auth.requestSmsCode', {
			mobilePhone: that.data.mobilePhone
		}).then(function () {
			// noop
		}, function (err) {
			console.log(err);
		});

		that.setData({
			countdown: 60
		});
		var interval = setInterval(function () {
			that.setData({
				countdown: that.data.countdown - 1
			});
			if (that.data.countdown === 0) {
				clearInterval(interval);
				that.setData({
					interval: null
				});
			}
		}, 1000);
		that.setData({
			interval: interval
		});
	},
	submit: function (event) {
		var that = this;
		var value = event.detail.value;
		var phonePattern = /^\d{11}$/;
		var verifyCodePattern = /^\d{6}$/;

		if (phonePattern.test(value.mobilePhone) && verifyCodePattern.test(value.verifyCode)) {
			guzzuUtils.callApi('Auth.bindMobilePhone', {
				mobilePhone: value.mobilePhone,
				verifyCode: value.verifyCode
			}).then(function (result) {
				wx.setStorageSync('guzzuSessionId', result.sessionId);
				wx.showToast({
					title: '绑定手机成功',
					icon: 'success',
					duration: 1500,
					complete: function () {
						wx.navigateBack();
					}
				});
			}, function (res) {
				console.log(res);
				var err = res.error;
				var modalParam = {
					title: that.data.trans.error,
					content: '',
					showCancel: false
				};
				if (err === 'Account has already binded to a mobile phone') {
					modalParam.content = '该账号已绑定到了另一手机号码';
				} else if (err === 'Mobile phone has already been binded to a Weixin account') {
					modalParam.content = '该手机号码已绑定到另一微信账号了';
				} else if (err === '无效的短信验证码') {
					modalParam.content = '无效的短信验证码';
				} else {
					modalParam.content = that.data.trans.unknownError;
				}
				wx.showModal(modalParam);
			});
		} else {
			wx.showModal({
				title: that.data.trans.error,
				content: '手机号码或验证码格式不正确',
				showCancel: false
			});
		}
	},
	getPhoneNumber(e) {
		guzzuUtils.bindPhoneNumber(e);
	}
});
