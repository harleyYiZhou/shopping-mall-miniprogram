// order.js
const { callApi } = require('../../utils/guzzu-utils');
const app = getApp();
const { showToast, showModal, formatTime } = require('../../utils/util');

Page({
	data: {
		order: null,
		shareCampaignInstance: null,
		timeLeft: 30,
		isShowExpress: false,
		autoConfirmTime: null,
		expressDetails: [],
		refundStatus: null
	},
	onLoad(option) {
		let orderId = option.orderId;
		getOrder(this, orderId);
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
	},
	onShow() {
		if (this.data.order) {
			let orderId = this.data.order._id;
			getOrder(this, orderId);
		}
	},
	onPullDownRefresh() {
		wx.showNavigationBarLoading();
		this.onShow();
	},
	tapWxpay() {
		let orderId = this.data.order._id;
		callApi.post('Order.generateWxpayOrderForMiniProgram', {
			orderId
		}, 400).then(result => {
			let params = result;
			return new Promise((resolve, reject) => {
				params.success = function (res) {
					showToast({
						title: 'order.paySuccess',
						icon: 'success',
						duration: 1000
					});
					resolve(true);
				};
				params.fail = function (err) {
					console.error('payment fail');
					reject(err);
				};
				wx.requestPayment(params);
			});
		}).then(() => {
			return callApi.post('Order.get', { orderId }, 400);
		}).then(result => {
			this.setData({
				order: result
			});
		}, err => {
			console.error(err);
		});
	},
	backToOrders() {
		let routes = getCurrentPages().reverse();
		if (routes.length > 1 && routes[1].route.indexOf('orders') > -1) {
			wx.navigateBack({
				delta: 1
			});
			return;
		}
		wx.redirectTo({
			url: '/pages/orders/orders?status=1'
		});
	},
	tabStore() {
		wx.switchTab({
			url: `/pages/index/index`
		});
	},
	contactStore() {
		let storeId = this.data.order.store._id;
		wx.navigateTo({
			url: `/pages/contact-store/contact-store?storeId=${storeId}`
		});
	},
	showRefundDialog() {
		this.setData({
			refundDialog: true
		});
	},
	hideRefundDialog() {
		this.setData({
			refundDialog: false
		});
	},
	refundConfirm(e) {
		let orderId = this.data.order._id;
		callApi.post('Order.customerRequestRefund', {
			orderId,
			note: e.detail.value.refundReason
		}, 400).then(res => {
			getOrder(this, orderId);
			this.setData({
				refundDialog: false
			});
			showModal({
				showCancel: false,
				content: 'order.waiteRefundRequestHint'
			});
		}).catch(err => {
			console.error(err);
		});
	},
	confirmReceipt() {
		let that = this;
		let orderId = that.data.order._id;
		showModal({
			content: '@{order.confirmReceipt}?',
			success(res) {
				if (res.confirm) {
					callApi.post('Order.confirmReceipt', {
						orderId
					}, 400).then(res => {
						getOrder(that, orderId);
					}).catch(err => {
						console.error(err);
					});
				}
			}
		});
	}, // 查快递
	showExpress() {
		let that = this;
		if (!that.data.order.shippingProvider || !that.data.order.trackingCode) {
			showModal({
				content: 'order.noShipping',
				showCancel: false
			});
			return;
		}
		if (that.data.isShowExpress) {
			that.setData({
				isShowExpress: false
			});
		} else {
			let nu = that.data.order.trackingCode;
			let com = that.data.order.shippingProvider.code;
			wx.request({
				url: 'http://api.kuaidi100.com/api',
				data: {
					id: 'f52b5a685461b78e',
					com,
					nu,
					show: 0, // 0 |1 | 2 | 3
					muti: 1, // 0 | 1
					order: 'desc' // desc	| asc
				},
				success(res) {
					if (res.data.status == 0) {
						that.setData({
							isShowExpress: true,
							expressDetails: [{
								context: res.data.message
							}]
						});
					}
					if (res.data.status == 1) {
						that.setData({
							isShowExpress: true,
							expressDetails: res.data.data
						});
					}
					if (res.data.status == 2) {
						console.error('快递100接口出现异常');
					}
				},
				fail(err) {
					console.error(err);
				}
			});
		}
	},
	onShareAppMessage(res) {
		let that = this;
		let orderId = that.data.order._id;
		wx.showShareMenu({
			withShareTicket: true
		});
		return {
			title: '分享优惠',
			path: '/pages/share-campaign-instance/share-campaign-instance?orderId=' + orderId,
			success(res) {
				// 转发成功
				wx.navigateTo({
					url: '/pages/share-campaign-instance/share-campaign-instance?orderId=' + orderId
				});
			},
			fail(res) {
				// 转发失败
				showToast({
					title: '分享失败',
					image: '/img/icon-close.png',
					duration: 2000
				});
			}
		};
	}
});

function getOrder(that, orderId) {
	wx.hideShareMenu();
	callApi.post('Order.get', {
		orderId
	}, 400)
		.then(result => {
			if (result.shippingAddress) {
				result.fullAddress = [
					result.shippingAddress.province,
					result.shippingAddress.city,
					result.shippingAddress.district,
					result.shippingAddress.address
				].join('');
			}
			if (result.createdAt) {
				let pastTimes = parseInt((new Date() - new Date(result.createdAt)) / 60000);
				pastTimes > 0 || (pastTimes = 0);
				let timeLeft = 15 - pastTimes;
				that.setData({
					timeLeft
				});
				result.createdAt = formatTime(new Date(result.createdAt));
			}
			if (result.paidAt) {
				result.paidAt = formatTime(new Date(result.paidAt));
			}
			if (result.shippedAt) {
				let timeLeft = new Date(new Date(result.createdAt).getTime() + 10 * 24 * 60 * 60 * 1000);
				that.setData({
					autoConfirmTime: formatTime(timeLeft)
				});
				result.shippedAt = formatTime(new Date(result.shippedAt));
			}
			if (result.receivedAt) {
				result.receivedAt = formatTime(new Date(result.receivedAt));
			}
			result.totalCost = Math.round(result.totalCost);
			let refundStatus = null;
			let rejectReason = '';
			let timestamp = null;
			if (result.log[result.log.length - 1].type == 'customer_requested_refund') {
				refundStatus = 'pending';
				timestamp = formatTime(result.log[result.log.length - 1].timestamp);
			}
			if (result.log[result.log.length - 1].type == 'rejected_customer_refund_request') {
				refundStatus = 'rejected';
				rejectReason = result.log[result.log.length - 1].data;
			}
			that.setData({
				order: result,
				refundStatus,
				rejectReason,
				timestamp
			});
			return result;
		})
		.then(result => {
			if (result.status === 'open' && result.paymentStatus === 'pending') {
				callApi.post('ShareCampaignInstance.getByOrder', {
					orderId
				}, 400).then(result => {
					if (result) {
						wx.showShareMenu();
						that.setData({
							shareCampaignInstance: result
						});
					}
				});
			}
			wx.hideNavigationBarLoading();
			wx.stopPullDownRefresh();
		});
}
