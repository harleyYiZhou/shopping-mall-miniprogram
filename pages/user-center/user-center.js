// pages/user-center/user-center.js
const app = getApp();
const { login } = require('../../utils/guzzu-utils.js');

Page({
	data: {
		selected: '3',
		userInfo: null,
	},
	onLoad: function (options) {
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
	},
	onReady: function () {
	},
	onShow: function () {
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
	/**
   * 生命周期函数--监听页面隐藏
   */
	onHide: function () {

	},

	/**
   * 生命周期函数--监听页面卸载
   */
	onUnload: function () {

	},

	/**
   * 页面相关事件处理函数--监听用户下拉动作
   */
	onPullDownRefresh: function () {

	},

	/**
   * 页面上拉触底事件的处理函数
   */
	onReachBottom: function () {

	},

	/**
   * 用户点击右上角分享
   */
	onShareAppMessage: function () {

	},
	btnNavLink: app.btnNavLink()
});
