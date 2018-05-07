// pages/catagory/catagory.js
var app = getApp();
const { callApi } = require('../../utils/guzzu-utils.js');

Page({

	/**
   * 页面的初始数据
   */
	data: {
		tapIndex: 0,
		selected: '2'
	},

	/**
   * 生命周期函数--监听页面加载
   */
	onLoad: function (options) {
		var that = this;
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		console.log(wx.getSystemInfoSync().windowWidth);
		console.log(wx.getSystemInfoSync().windowHeight);
		var scrollHeight = wx.getSystemInfoSync().windowHeight / wx.getSystemInfoSync().windowWidth * 750;
		console.log(scrollHeight);
		this.setData({
			scrollHeight: scrollHeight - 170
		});

		callApi.get('shopping-malls/{smallid}/categories').then(function (res1) {
			console.log(res1);
			var categoryId = res1[that.data.tapIndex]._id;
			that.setData({
				category: res1,
				categoryId: categoryId
			});
			callApi.get('shopping-malls/{smallid}/categories/' + categoryId).then(function (res2) {
				console.log(res2);
				that.setData({
					categoryPage: res2
				});
			});
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
	btnNavLink: app.btnNavLink(),
	chooseLevel: function (e) {
		var that = this;
		this.setData({
			tapIndex: e.currentTarget.dataset.index
		});
		callApi.get('shopping-malls/{smallid}/categories').then(function (res1) {
			console.log(res1);
			var categoryId = res1[that.data.tapIndex]._id;
			that.setData({
				category: res1,
				categoryId: categoryId
			});
			callApi.get('shopping-malls/{smallid}/categories/' + categoryId).then(function (res2) {
				console.log(res2);
				that.setData({
					categoryPage: res2
				});
			});
		});
	}
});
