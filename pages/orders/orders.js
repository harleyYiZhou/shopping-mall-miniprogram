// pages/order/order.js
var app = getApp();
Page({

	/**
   * 页面的初始数据
   */
	data: {
		orderStatus: [
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
				text: '待评价',
				selected: false
			},
			{
				text: '已完成',
				selected: false
			}
		],
		orderList: [
			{id: '123'}
		]
	},

	/**
   * 生命周期函数--监听页面加载
   */
	onLoad: function (options) {
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		this.setData({
			orderStatus: [
				{
					text: this.data.trans.allOrders,
					selected: true
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
					text: this.data.trans.finished,
					selected: false
				}
			]
		});
	},

	/**
   * 生命周期函数--监听页面初次渲染完成
   */
	onReady: function () {

	},

	/**
   * 生命周期函数--监听页面显示
   */
	onShow: function () {

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

	}
});
