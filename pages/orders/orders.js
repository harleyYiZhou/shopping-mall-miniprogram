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
		],
		currentPage: 1,
		next: -1,
		pageSize: 10,
		orders: []
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
			currentPage: 1,
			next: -1,
			orders: []
		});
		this.findOrders();
	},
	switchStatus(e) {
		let { status } = e.currentTarget.dataset;
		wx.setStorageSync('status', status);
		this.onShow();
	},
	onReachBottom() {
		if (this.data.next < 2) {
			return;
		}
		this.findOrders(this.data.next);
	},
	findOrders(next) {
		let params = {
			page: next || this.data.currentPage,
			pageSize: this.data.pageSize,
			filters: {
				type: 'default'
			}
		};
		if (this.data.currStatus !== 'allOrders') {
			params.tab = this.data.currStatus;
		}
		showLoading();
		callApi.post('Order.find', params, 400).then(result => {
			priceFilter(result);
			let orders = result.results;
			let filterOrders = [];
			for (let i = 0; i < orders.length; ++i) {
				let createdAt = new Date(orders[i].createdAt);
				orders[i].createdAt = formatTime(createdAt);
				orders[i].exStatus = checkStatus(orders[i]);
				filterOrders.push(orders[i]);
			}
			this.setData({
				currentPage: result.currentPage,
				next: result.next,
				orders: this.data.orders.concat(filterOrders)
			});
		}).catch(err => {
			console.error(err);
		}).finally(() => {
			wx.stopPullDownRefresh();
			wx.hideNavigationBarLoading();
			wx.hideLoading();
		});
	}
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
	// 退款
	if (order.paymentStatus === 'customer_requested_refund') {
		return 'refunding';
	}
	throw new Error('Invalid status');
}
