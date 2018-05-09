// pages/product-detail/product-detail
const app = getApp();
const { callApi } = require('../../utils/guzzu-utils.js');
const _ = require('../../utils/lodash');
// const _ = require('lodash');

Page({
	data: {
		item:null,
		imageArr: [],
		footerhidden: false,
		hideShopPopup: true,
		buyNum: 1,
		showProductDetail: true,
		product: null,
		selection:1,
	},
	onLoad(options) {
		let that = this;
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		that.setData({
			productId: options.productId
		});
		callApi.get(`products/${that.data.productId }?populate=store`).then(res => {
			priceFilter(res);
			let images = res.gallery.concat(res.image);
			let items = images.map(item => {
				return {
					image:item
				}
			})
			let imgHeight =items[0].image.medium.height;
			let imgWidth =items[0].image.medium.width;
			let swiperHeight = 750 / imgWidth * imgHeight;
			that.setData({
				product: res,
				item: {
					items,
					swiperHeight
				}
			});
		});
	},

	onReady() {

	},

	onShow() {

	},
	imageLoad(e) {
		let height = 750 / e.detail.width * e.detail.height;
		this.setData({
			swiperHeight: height
		});
	},
	bindchange(e) {
		// console.log(e.detail.current)
		this.setData({ current: e.detail.current });
	},
	showPopup() {
		this.setData({
			hideShopPopup: false,
			footerhidden: true
		});
	},
	hideShopPopup() {
		this.setData({
			hideShopPopup: true,
			footerhidden: false
		});
	},
	labelItemTap(e) {
		let that = this;
		let childs = that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods;
		for (let i = 0; i < childs.length; i++) {
			that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[i].active = false;
		}
		// 设置当前选中状态
		that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[e.currentTarget.dataset.propertychildindex].active = true;
		that.setData({
			goodsDetail: that.data.goodsDetail
		});
	},
	numJianTap() {
		if (this.data.buyNum > 1) {
			let num = this.data.buyNum;
			num -= 1;
			this.setData({
				buyNum: num
			});
		}
	},
	numJiaTap() {
		if (this.data.buyNum) {
			let num = this.data.buyNum;
			num += 1;
			this.setData({
				buyNum: num
			});
		}
	},
	changeNum(e) {
		if (e.detail.value > 1) {
			console.log(e.detail.value);
			let num = parseInt(e.detail.value);
			this.setData({
				buyNum: num
			});
		} else {
			this.setData({
				buyNum: this.data.buyNum
			});
		}
	},
	toStore(e) {
		let slug = e.currentTarget.dataset.slug;
		wx.navigateTo({
			url: '/pages/store/store?slug=' + slug
		});
	},
	selectTap (e) {
		var selectIndex = e.currentTarget.dataset.index;
		this.setData({
			selectIndex
		});
		/*
		var list = this.data.goodsList.list;
		if (index !== '' && index != null) {
			list[parseInt(index)].active = !list[parseInt(index)].active;
			this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
		}
		*/
	},
	onReachBottom() {
		console.log(44);
		this.setData({
			showProductDetail: false
		});
	}
});

function priceFilter(data) {
	let keyReg = /^price$|^originalPrice$/;
	if (_.isNumber(data) || _.isString(data)) {
		return Number(data) / 100..toFixed(2);
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
			}
			if (_.isObject(value) || _.isArray(value)) {
				priceFilter(data[key]);
			}
		});
	}
}