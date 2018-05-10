const _ = require('./lodash');

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
	let keyReg = /^price$|^originalPrice$/;
	if (_.isNumber(data) || _.isString(data)) {
		return (Number(data) / 100).toFixed(2);
	}
	if (_.isArray(data)) {
		data.forEach((item, i) => {
			if (_.isObject(item)) {
				priceFilter(data[i]);
			}
		});
	}
	if (_.isObject(data)) {
		_.forEach(data, (value, key) => {
			if (keyReg.test(key)) {
				data[key] = priceFilter(value);
				console.log(key, data[key]);
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
	let { globalData: { trans } } = getApp();
	let keys = ['title', 'content', 'cancelText', 'confirmText'];
	keys.forEach(key => {
		params[key] = _.get(trans, params[key]) || params[key];
	});
	wx.showModal(params);
};
module.exports = {
	formatTime,
	priceFilter,
	btnNavLink,
	showModal,
};
