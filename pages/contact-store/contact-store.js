let guzzuUtils = require('../../utils/guzzu-utils');
const app = getApp();

Page({
	data: {
		store: null
	},
	onLoad(option) {
		let { storeId } = option;
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		guzzuUtils.callApi.get(`stores/${storeId}`).then((result) => {
			this.setData({
				store: result
			});
		});
	},
	tapStore() {
		let storeId = this.data.store._id;
		wx.navigateTo({
			url: '/pages/store/store?storeId=' + storeId
		});
	}
});
