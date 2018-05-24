// order.js
const { callApi } = require('../../utils/guzzu-utils');
const app = getApp();

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
		let that = this;
		let orderId = option.orderId;
		getOrder(that, orderId);
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
	},
	onShow() {
		let that = this;
		if (that.data.order) {
			let orderId = that.data.order._id;
			getOrder(that, orderId);
		}
	},
	onPullDownRefresh() {
		wx.showNavigationBarLoading();
		this.onShow();
	},
	tapWxpay() {
		let that = this;
		let orderId = that.data.order._id;
		callApi.post('Order.generateWxpayOrderForMiniProgram', {
			orderId
		}, 400).then(result => {
			let params = result;
			return new Promise((resolve, reject) => {
				params.success = function (res) {
					wx.showToast({
						title: '付款成功',
						icon: 'success',
						duration: 1000
					});
					resolve(true);
				};
				params.fail = function (err) {
					console.log('payment fail');
					reject(err);
				};
				wx.requestPayment(params);
			});
		}).then(() => {
			return callApi.post('Order.get', { orderId }, 400);
		}).then(result => {
			that.setData({
				order: result
			});
		}, err => {
			console.log(err);
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
		wx.redirectTo({
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
		let that = this;
		let orderId = that.data.order._id;
		callApi.post('Order.customerRequestRefund', {
			orderId,
			note: e.detail.value.refundReason
		}, 400).then(res => {
			console.log(res);
			getOrder(that, orderId);
			this.setData({
				refundDialog: false
			});
			wx.showModal({
				title: '提示',
				showCancel: false,
				content: '退款请求成功,请等待商家处理'
			});
		}).catch(err => {
			console.log(err);
			wx.showModal({
				title: '提示',
				showCancel: false,
				content: '退款请求失败,请重试'
			});
		});
	},
	confirmReceipt() {
		let that = this;
		let orderId = that.data.order._id;
		wx.showModal({
			title: '提示:',
			content: '确定收货?',
			success(res) {
				if (res.confirm) {
					console.log('用户确定收货');
					callApi.post('Order.confirmReceipt', {
						orderId
					}, 400).then(res => {
						console.log(res);
						getOrder(that, orderId);
					}).catch(err => {
						console.log(err);
					});
				}
			}
		});
	}, // 查快递
	showExpress() {
		let that = this;
		if (!that.data.order.shippingProvider || !that.data.order.trackingCode) {
			wx.showModal({
				title: '提示:',
				content: '暂时没有物流信息',
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
						console.log('快递100接口出现异常');
					}
				},
				fail(err) {
					console.log('expr', err);
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
				wx.showToast({
					title: '分享失败',
					image: '/img/icon-close.png',
					duration: 2000
				});
			}
		};
	}
});

function formatDate(date) {
	let digits = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09'];
	let str = [date.getFullYear(),
		digits[date.getMonth() + 1] || date.getMonth() + 1,
		digits[date.getDate()] || date.getDate()
	].join('-') +
		' ' + [digits[date.getHours()] || date.getHours(),
		digits[date.getMinutes()] || date.getMinutes()
	].join(':');
	return str;
}

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
				result.createdAt = formatDate(new Date(result.createdAt));
			}
			if (result.paidAt) {
				result.paidAt = formatDate(new Date(result.paidAt));
			}
			if (result.shippedAt) {
				let timeLeft = new Date(new Date(result.createdAt).getTime() + 10 * 24 * 60 * 60 * 1000);
				that.setData({
					autoConfirmTime: formatDate(timeLeft)
				});
				result.shippedAt = formatDate(new Date(result.shippedAt));
			}
			if (result.receivedAt) {
				result.receivedAt = formatDate(new Date(result.receivedAt));
			}
			result.totalCost = Math.round(result.totalCost);
			let refundStatus = null;
			let rejectReason = '';
			let timestamp = null;
			if (result.log[result.log.length - 1].type == 'customer_requested_refund') {
				refundStatus = 'pending';
				timestamp = formatDate(result.log[result.log.length - 1].timestamp);
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
