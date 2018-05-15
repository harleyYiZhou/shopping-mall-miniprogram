const _ = require('./lodash');
const { MODE } = require('../config');

const formatTime = date => {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const hour = date.getHours();
	const minute = date.getMinutes();
	const second = date.getSeconds();

	return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
};

const formatNumber = n => {
	n = n.toString();
	return n[1] ? n : '0' + n;
};

const priceFilter = data => {
	let keys = ['price', 'originalPrice', 'shippingCost', 'subtotal', 'totalCost', 'discount', 'shippingCost', 'balance', 'minPurchase'];
	let keyReg = new RegExp('^' + keys.join('$|^') + '$');
	if (_.isNumber(data) || _.isString(data)) {
		return /^\d+\.?\d*$|^\d*\.?\d+$/.test(data) ? (Number(data) / 100).toFixed(2) : data;
	}
	if (_.isArray(data)) {
		data.forEach((item, i) => {
			if (_.isObject(item)) {
				priceFilter(data[i]);
			}
		});
		return;
	}
	if (_.isObject(data)) {
		_.forEach(data, (value, key) => {
			if (keyReg.test(key)) {
				data[key] = priceFilter(value);
			}
			if (_.isObject(value) || _.isArray(value)) {
				priceFilter(data[key]);
			}
		});
	}
};

/**
 * @description 顶层路由
 */
const btnNavLink = () => {
	return function (e) {
		const app = getApp();
		let id = e.currentTarget.dataset.id;
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
};

const showModal = (data = {}) => {
	let params = Object.assign({
		title: 'common.showModal.title',
		content: '',
		showCancel: true,
		cancelText: 'common.showModal.cancel',
		cancelColor: '#000000',
		confirmText: 'common.showModal.confirm',
		confirmColor: '#3CC51F',
		success: function (res) { },
		fail: function (res) { },
		complete: function (res) { },
	}, data);
	let trans = require(`../locales/${wx.getStorageSync('locale')}`);
	let keys = ['title', 'content', 'cancelText', 'confirmText'];
	keys.forEach(key => {
		let value = params[key];
		let localizeTemp = value.replace(/@{([^{^}]*)?}/g, i => {
			return _.get(trans, i.replace(/@{|}/g, '')) || i;
		});
		params[key] = _.get(trans, value) || localizeTemp;
	});
	wx.showModal(params);
};

const showToast = (data = {}) => {
	let params = Object.assign({
		title: '',
		icon: 'success', // "success", "loading", "none"
		image: '',
		duration: 1500,
		mask: false,
		success: function (res) { },
		fail: function (res) { },
		complete: function (res) { },
	}, data);
	let trans = require(`../locales/${wx.getStorageSync('locale')}`);
	let value = params['title'];
	let localizeTemp = value.replace(/@{([^{^}]*)?}/g, i => {
		return _.get(trans, i.replace(/@{|}/g, '')) || i;
	});
	params['title'] = _.get(trans, value) || localizeTemp;
	wx.showToast(params);
};

const showLoading = (data = {}) => {
	let params = Object.assign({
		title: '',
		mask: false,
		// duration: 1500,
		success: function (res) { },
		fail: function (res) { },
		complete: function (res) { },
	}, data);
	let trans = require(`../locales/${wx.getStorageSync('locale')}`);
	let value = params['title'];
	let localizeTemp = value.replace(/@{([^{^}]*)?}/g, i => {
		return _.get(trans, i.replace(/@{|}/g, '')) || i;
	});
	params['title'] = _.get(trans, value) || localizeTemp;
	wx.showLoading(params);
};
const debug = (...params) => {
	if (/^production$/i.test(MODE)) {
		return;
	}
	console.log(...params);
};
debug.trace = (...params) => {
	if (/^production$/i.test(MODE)) {
		return;
	}
	console.trace(...params);
};
module.exports = {
	formatTime,
	priceFilter,
	btnNavLink,
	showModal,
	showToast,
	showLoading,
	_,
	debug,
};

let data = {
	price: 5000,
	name: 'name',
	totalCost: 100000,
	items: [
		{
			subtotal: 123
		},
		{
			subtotal: 456
		},
		{
			subtotal: 200
		},
		{
			subtotal: 300
		},
		{
			subItem: [
				{
					subtotal: 123
				}, {
					subtotal: 456
				}, {
					subtotal: 200
				},
			]
		},
		{
			totalCost2: 123000
		},
	]
};
let str = JSON.stringify(data);
let multi = [
	JSON.parse(str),
	JSON.parse(str),
	JSON.parse(str),
	JSON.parse(str),
];
priceFilter(data);
priceFilter(multi);

console.log(data);
console.log(multi);
