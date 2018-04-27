module.exports = {
	language: {
		'zh': '简体中文',
		'en': 'English'
	},
	toArray (self) {
		let locale = getApp().globalData.locale;
		let i = 0;
		let index = 0;
		let langArr = [];
		for (let key in this.language) {
			key === locale && (index = i);
			langArr.push({
				type: key,
				name: this.language[key]
			});
			i++;
		}
		self.setData({
			language: langArr,
			index: index
		});
	},
	setLocale (code) {
		const app = getApp();
		app.globalData.locale = code;
		app.globalData.trans = require(`../locales/${code}`);
		wx.setStorage({
			key: 'locale',
			data: code
		});
	},
	/*
	*@param self ,当前page的this
	*@param { string } locale,语言类型
	*/
	langData (self) {
		const app = getApp();
		let locale = app.globalData.locale;
		let trans = app.globalData.trans;
		// 加载当前page语言数据
		let pages = getCurrentPages();
		let route = pages[pages.length - 1].route;
		route = route.slice(route.lastIndexOf('/') + 1);
		route = route.replace(/-(\w{1})/g, i => { return i[1].toUpperCase(); });
		const currLang = Object.assign({}, trans[route], trans['common']);
		self.setData({
			trans: currLang,
			locale: locale
		});
		if (currLang.navBarTitle) {
			wx.setNavigationBarTitle({
				title: currLang.navBarTitle
			});
		} else {
			wx.setNavigationBarTitle({
				title: 'GUZZU'
			});
		}
	}
};
