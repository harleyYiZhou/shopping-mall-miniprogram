const _ = require('./lodash');
const { MODE } = require('../config');

const formatTime = date => {
	if (!(date instanceof Date)) {
		date = new Date(date);
	}
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const hour = date.getHours();
	const minute = date.getMinutes();
	const second = date.getSeconds();

	return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':');
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

const showModal = (data = {}) => {
	let params = Object.assign({
		title: 'common.showModal.title', // 提示，Notes
		content: '',
		showCancel: true,
		cancelText: 'common.showModal.cancel',
		cancelColor: '#000000',
		confirmText: 'common.showModal.confirm',
		confirmColor: '#3CC51F',
		success(res) { },
		fail(res) { },
		complete(res) { },
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
		success(res) { },
		fail(res) { },
		complete(res) { },
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
		title: 'common.loading', // 加载中,Loading...
		mask: false,
		// duration: 1500,
		success(res) { },
		fail(res) { },
		complete(res) { },
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
	showModal,
	showToast,
	showLoading,
	_,
	debug,
};
