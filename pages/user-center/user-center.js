// pages/user-center/user-center.js
const app = getApp();
const { login, session } = require('../../utils/guzzu-utils.js');

Page({
	data: {
		selected: '3',
		userInfo: null,
	},
	onLoad(options) {
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
	},
	onReady() {
	},
	onShow() {
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		this.setData({
			selected: '3'
		});
		app.globalData.login.finally(() => {
			this.setData({
				userInfo: app.globalData.userInfo
			});
		});
	},
	toAccount() {
		app.globalData.login.finally(() => {
			if (app.globalData.userInfo) {
				wx.navigateTo({
					url: '/pages/account/account',
				});
			} else {
				login().then(() => {
					this.onShow();
				});
			}
		});
	},
	toOrders(e) {
		let { status = 0 } = e.currentTarget.dataset;
		wx.setStorageSync('status', status);
		if (session.checkSync()) {
			if (app.globalData.userInfo) {
				wx.navigateTo({
					url: `/pages/orders/orders?status=${status}`,
				});
			}
		}
	},
	/**
   * 生命周期函数--监听页面隐藏
   */
	onHide() {

	},

	/**
   * 生命周期函数--监听页面卸载
   */
	onUnload() {

	},

	/**
   * 页面相关事件处理函数--监听用户下拉动作
   */
	onPullDownRefresh() {

	},

	/**
   * 页面上拉触底事件的处理函数
   */
	onReachBottom() {

	},

	/**
   * 用户点击右上角分享
   */
	onShareAppMessage() {

	},
	btnNavLink: app.btnNavLink()
});
