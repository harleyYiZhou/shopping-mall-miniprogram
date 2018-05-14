// bind-phone.js
const { callApi, bindPhoneNumber, session, login } = require('../../utils/guzzu-utils.js');
const { showToast, showModal } = require('../../utils/util');

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
		login();
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
		callApi('Auth.requestSmsCode', {
			mobilePhone: that.data.mobilePhone
		}, 400).then(function () {
			// noop
		}, function (err) {
			console.error(err);
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
		var value = event.detail.value;
		var phonePattern = /^\d{11}$/;
		var verifyCodePattern = /^\d{6}$/;

		if (phonePattern.test(value.mobilePhone) && verifyCodePattern.test(value.verifyCode)) {
			callApi('Auth.bindMobilePhone', {
				mobilePhone: value.mobilePhone,
				verifyCode: value.verifyCode
			}, 400).then(function (result) {
				session.set(result.sessionId);
				showToast({
					title: 'common.bindSuccess',
					icon: 'success',
					duration: 1500,
					complete: function () {
						wx.navigateBack();
					}
				});
			}).catch(err => {
				console.error(err);
			});
		} else {
			showModal({
				title: 'common.error',
				content: 'common.invalidNum',
				showCancel: false
			});
		}
	},
	getPhoneNumber(e) {
		bindPhoneNumber(e);
	}
});
