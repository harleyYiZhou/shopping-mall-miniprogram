// bind-phone.js
const { callApi, bindPhoneNumber, session, login } = require('../../utils/guzzu-utils.js');
const { showToast, showModal } = require('../../utils/util');

let app = getApp();

Page({
	data: {
		disableGetVerifyCode: true,
		mobilePhone: '',
		interval: null,
		countdown: 0
	},
	onLoad(options) {
		// 页面初始化 options为页面跳转所带来的参数
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		login();
	},
	verifyMobilePhone(event) {
		let that = this;
		let mobilePhone = event.detail.value;
		let pattern = /^\d{11}$/;
		if (pattern.test(mobilePhone)) {
			that.setData({
				disableGetVerifyCode: false,
				mobilePhone
			});
		} else {
			that.setData({
				disableGetVerifyCode: true,
				mobilePhone
			});
		}
	},
	getVerifyCode() {
		let that = this;
		callApi.post('Auth.requestSmsCode', {
			mobilePhone: that.data.mobilePhone
		}, 400).then(() => {
			// noop
		}, (err) => {
			console.error(err);
		});

		that.setData({
			countdown: 60
		});
		let interval = setInterval(() => {
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
			interval
		});
	},
	submit(event) {
		let value = event.detail.value;
		let phonePattern = /^\d{11}$/;
		let verifyCodePattern = /^\d{6}$/;

		if (phonePattern.test(value.mobilePhone) && verifyCodePattern.test(value.verifyCode)) {
			callApi.post('Auth.bindMobilePhone', {
				mobilePhone: value.mobilePhone,
				verifyCode: value.verifyCode
			}, 400).then((result) => {
				session.set(result.sessionId);
				showToast({
					title: 'common.bindSuccess',
					icon: 'success',
					duration: 1500,
					complete() {
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
