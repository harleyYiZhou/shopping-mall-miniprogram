// pages/product-detail/product-detail
const app = getApp();
const { callApi, session, addToShopCarInfo } = require('../../utils/guzzu-utils.js');
const { priceFilter, showModal, showToast } = require('../../utils/util');
const WxParse = require('../../utils/wxParse/wxParse.js');

Page({
	data: {
		gallery: null,
		hideShopPopup: true,
		buyNum: 1,
		showProductDetail: false,
		product: null,
		selectIndex: -1,
		optionSelected: false,
		showPopupOptions: false,
		terms: null,
	},
	onLoad(options) {
		let that = this;
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		let productId = options.productId;

		callApi.get(`products/${productId}?populate=store`).then(res => {
			priceFilter(res);
			console.log('product', res);
			let images = res.gallery.concat(res.image);
			let items = images.map(item => {
				return {
					image: item
				};
			});
			let imgHeight = items[0].image.medium.height;
			let imgWidth = items[0].image.medium.width;
			let swiperHeight = 750 / imgWidth * imgHeight;
			that.setData({
				product: res,
				gallery: {
					items,
					swiperHeight
				}
			});

			if (res.description) {
				WxParse.wxParse('description', 'html', res.description, that);
			}
			if (res.shippingDescription && res.shippingDescription.content) {
				WxParse.wxParse('shippingDescription', 'html', res.shippingDescription.content, that);
			}
			return callApi.get(`stores/${res.store._id}/profile`);
		}).then(res => {
			console.log('profile', res);
			that.setData({
				terms: res
			});
		}).catch(err => {
			console.error(err);
		});
	},

	onReady() {

	},

	onShow() {

	},
	bindchange(e) {
		// console.log(e.detail.current)
		this.setData({ current: e.detail.current });
	},
	showPopup() {
		this.setData({
			hideShopPopup: false
		});
		setTimeout(() => {
			this.setData({
				showPopupOptions: true
			});
		});
	},
	hideShopPopup() {
		this.setData({
			showPopupOptions: false
		});
		setTimeout(() => {
			this.setData({
				hideShopPopup: true
			});
		}, 300);
	},
	addToCart() {
		let { product, selectIndex, buyNum: quantity } = this.data;
		let productOptionId;
		let params = {
			storeId: product.store._id,
			productId: product._id,
			quantity,
		};
		let selectedInfo = {
			name: product.name,
			price: product.price
		};
		if (selectIndex > -1) {
			productOptionId = product.productOptions[selectIndex]._id;
			selectedInfo.name = product.productOptions[selectIndex].name;
			selectedInfo.price = product.productOptions[selectIndex].price;
		} else {
			if (product.productOptions && product.productOptions.length) {
				return this.showPopup();
			}
			params.quantity = 1;
		}

		if (productOptionId) {
			params.productOptionId = productOptionId;
		}
		session.check().then(res => {
			if (res) {
				return callApi.post('StoreCart.addItem', params, 400);
			}
			return addToShopCarInfo(Object.assign(params, selectedInfo));
		}).then(res => {
			let that = this;
			showToast({
				icon: 'none',
				title: `${selectedInfo.name}\n@{productDetail.addSuccess}`,
				complete() {
					that.hideShopPopup();
				}
			});
		}).catch(err => {
			console.error(err);
		});
	},
	numMinus() {
		if (this.data.buyNum > 1) {
			let num = this.data.buyNum;
			num -= 1;
			this.setData({
				buyNum: num
			});
		}
	},
	numAdd() {
		if (this.data.buyNum) {
			let num = this.data.buyNum;
			num += 1;
			this.setData({
				buyNum: num
			});
		}
	},
	changeNum(e) {
		let buyNum = 1;
		if (e.detail.value > 1) {
			buyNum = parseInt(e.detail.value);
		}
		this.setData({
			buyNum
		});
	},
	toStore(e) {
		let slug = e.currentTarget.dataset.slug;
		wx.navigateTo({
			url: '/pages/store/store?slug=' + slug
		});
	},
	toShoppingCart() {
		app.globalData.selected = '1';
		wx.reLaunch({
			url: '/pages/shopping-cart/shopping-cart'
		});
	},
	selectTap(e) {
		let selectIndex = e.currentTarget.dataset.index;
		if (selectIndex === this.data.selectIndex) {
			selectIndex = -1;
		}
		this.setData({
			selectIndex
		});
	},
	onReachBottom() {
		if (this.data.showProductDetail) {
			return;
		}
		this.setData({
			showProductDetail: true
		});
	},
});
