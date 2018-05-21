// pages/order/order.js
const app = getApp();
const { priceFilter, formatTime, showLoading } = require('../../utils/util');
const { callApi } = require('../../utils/guzzu-utils.js');
const statuses = ['allOrders', 'pending', 'unshipped', 'shipped', 'received'];

Page({
	data: {
		orderStatus: [
			{
				text: '全部',
				selected: true
			},
			{
				text: '待付款',
				selected: true
			},
			{
				text: '待发货',
				selected: false
			},
			{
				text: '待收获',
				selected: false
			},
			{
				text: '已完成',
				selected: false
			}
		],
		orderList: [
			{ id: '123' }
		]
	},
	onShow() {
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		let status = wx.getStorageSync('status');
		let orderStatus = [
			{
				text: this.data.trans.allOrders,
				selected: false
			},
			{
				text: this.data.trans.pending,
				selected: false
			},
			{
				text: this.data.trans.unshipped,
				selected: false
			},
			{
				text: this.data.trans.shipped,
				selected: false
			},
			{
				text: this.data.trans.received,
				selected: false
			}
		];
		orderStatus[status].selected = true;
		let currStatus = statuses[status];
		this.setData({
			orderStatus,
			currStatus,
		});
		showLoading();
		let params = {
			page: 1,
			pageSize: this.data.pageSize,
			filters: {
				type: 'default'
			}
		};
		if (this.data.currStatus !== 'allOrders') {
			params.tab = this.data.currStatus;
		}
		callApi.post('Order.find', params, 400).then(data => {
			priceFilter(data);
			let orders = data.results;
			let filterOrders = [];
			for (let i = 0; i < orders.length; ++i) {
				let createdAt = new Date(orders[i].createdAt);
				orders[i].createdAt = formatTime(createdAt);
				orders[i].exStatus = checkStatus(orders[i]);
				filterOrders.push(orders[i]);
			}
			this.setData({
				currentPage: 1,
				lastPageLength: data.results.length,
				totalPages: data.totalPages,
				orders: filterOrders
			});
		}).catch(err => {
			console.error(err);
		}).finally(() => {
			wx.stopPullDownRefresh();
			wx.hideNavigationBarLoading();
			wx.hideLoading();
		});
	},
	switchStatus(e) {
		let { status } = e.currentTarget.dataset;
		wx.setStorageSync('status', status);
		this.onShow();
	},
	onPullDownRefresh() {
	},
	onReachBottom() {
	},
});
function checkStatus(order) {
	// 待付款
	if (order.status === 'open' && order.paymentStatus === 'pending') {
		return 'pending';
	}
	// 待发货
	if (order.paymentStatus === 'paid' && order.shippingStatus === 'unshipped') {
		return 'unshipped';
	}
	// 待收货
	if (order.shippingStatus === 'shipped') {
		return 'shipped';
	}
	// 已完成
	if (order.shippingStatus === 'received') {
		return 'closed';
	}
}
