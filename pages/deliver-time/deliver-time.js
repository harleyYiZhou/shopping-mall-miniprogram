const { formatTime } = require('../../utils/util');

const app = getApp();
Page({

	/**
   * 页面的初始数据
   */
	data: {
		areaShipping: null,
		maxDaysInAdvance: 0,
		serviceHours: null,
		index: 0,
		weekday: [
			'周日', '周一', '周二', '周三', '周四', '周五', '周六'
		]
	},

	/**
   * 生命周期函数--监听页面加载
   */
	onLoad: function (options) {
		var that = this;
		if (!this.data.locale || this.data.locale !== app.globalData.locale) {
			app.translate.langData(this);
		}
		if (app.globalData.locale === 'en') {
			that.setData({
				weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
			});
		}

		var obj = JSON.parse(options.areaShipping);
		var date = new Date();
		that.setData({
			areaShipping: obj.areaShipping,
			maxDaysInAdvance: obj.areaShipping.maxDaysInAdvance,
			serviceHours: app.globalData.serviceHours
		});
		var serviceHoursByDay = {};
		for (var i in that.data.serviceHours) {
			// serviceHoursByDay.push(that.data.serviceHours[i])
			for (var j in that.data.serviceHours[i].weekdays) {
				var index = that.data.serviceHours[i].weekdays[j];
				serviceHoursByDay[index] = that.data.serviceHours[i];
			}
		}
		console.log(serviceHoursByDay);

		var avalableDays = [];
		for (var i = 0; i < that.data.maxDaysInAdvance; i++) {
			var targetDay = serviceHoursByDay[(date.getDay() + i) % 7];
			if (targetDay) {
				var begin = new Date(date.getTime() + i * 24 * 3600000);
				begin.setHours(targetDay.beginTime.hour);
				begin.setMinutes(targetDay.beginTime.minute);
				var end = new Date(date.getTime() + i * 24 * 3600000);
				end.setHours(targetDay.endTime.hour);
				end.setMinutes(targetDay.endTime.minute);

				avalableDays.push({
					beginTime: begin,
					endTime: end
				});
			}
		}

		console.log(avalableDays);
		var avalableDate = [];
		for (var i = 0; i < avalableDays.length; i++) {
			var weekday = avalableDays[i].beginTime.getDay();
			var month = avalableDays[i].beginTime.getMonth() + 1;
			var date = avalableDays[i].beginTime.getDate();
			var str = that.data.weekday[weekday] + ' ' + month + '-' + date;
			avalableDate.push(str);
		}
		that.setData({
			avalableDays: avalableDays,
			avalableDate: avalableDate
		});
		// 获取提前下单时间
		if (that.data.areaShipping.appointmentCondition.type) {
			var line = new Date();
			var condition = that.data.areaShipping.appointmentCondition;

			switch (condition.type) {
				case 'day':
					line.setDate(line.getDate() + condition.days);
					line.setHours(0);
					line.setMinutes(0);
					line.setSeconds(0);
					break;
				case 'hour':
					line.setHours(line.getHours() + condition.hours);
					break;
				case 'minute':
					line.setMinutes(line.getMinutes() + condition.minutes);
					break;
				default:
					break;
			}

			this.setData({
				line: line
			});
			console.log(this.data.line.getTime());
		}
		// 初始化时间列表
		that.changeAppointmentDay(that.data.index);
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

	bindPickerChange: function (e) {
		console.log('picker发送选择改变，携带值为', e.detail.value);
		this.setData({
			index: e.detail.value
		});
		this.changeAppointmentDay(this.data.index);
	},
	changeAppointmentDay: function (index) {
		var that = this;
		that.data.index = index;

		var begin = that.data.avalableDays[index].beginTime;
		var end = that.data.avalableDays[index].endTime;
		var hours = [];
		switch (that.data.areaShipping.timeSegmentation) {
			case 'day':
				console.log(formatTime(new Date(begin), 'h:m'));
				hours.push({
					date: formatTime(new Date(begin), 'M-D'),
					beginTime: formatTime(new Date(begin), 'h:m'),
					endTime: formatTime(new Date(end), 'h:m'),
					beginTimes: new Date(begin),
					endTimes: new Date(end),
					state: that.appointmentHourEnabled(end)
				});
				break;
			case 'part-of-day':
				hours = that.__separateTimeWithDayPart(begin, end);
				break;
			case 'hour':
				hours = that.__separateTimeWithFixedInterval(begin, end, 60 * 60 * 1000);
				break;
			case 'half-an-hour':
				hours = that.__separateTimeWithFixedInterval(begin, end, 30 * 60 * 1000);
				break;
			default:
				break;
		}

		that.setData({
			hours: hours
		});
		console.log(hours);
	},
	__separateTimeWithDayPart: function (beginTime, endTime) {
		var that = this;
		var beginTime = new Date(beginTime);
		var endTime = new Date(endTime);
		var output = [];
		while (beginTime.getTime() < endTime.getTime()) {
			var beginHour = beginTime.getHours();
			var o = {
				beginTime: new Date(beginTime),
				endTime: new Date(beginTime)
			};
			if (beginHour < 12) {
				o.endTime.setHours(12);
				o.endTime.setMinutes(0);
				var state = that.appointmentHourEnabled(o.endTime);
				output.push({
					date: formatTime(o.endTime, 'M-D'),
					beginTime: formatTime(o.beginTime, 'h:m'),
					endTime: formatTime(o.endTime, 'h:m'),
					beginTimes: new Date(beginTime),
					endTimes: new Date(o.endTime),
					state: state
				});

				beginTime.setHours(12);
				beginTime.setMinutes(0);
			} else if (beginHour < 18) {
				o.endTime.setHours(18);
				o.endTime.setMinutes(0);
				var state = that.appointmentHourEnabled(o.endTime);
				output.push({
					date: formatTime(o.endTime, 'M-D'),
					beginTime: formatTime(o.beginTime, 'h:m'),
					endTime: formatTime(o.endTime, 'h:m'),
					beginTimes: new Date(beginTime),
					endTimes: new Date(o.endTime),
					state: state
				});

				beginTime.setHours(18);
				beginTime.setMinutes(0);
			} else {
				o.endTime = new Date(endTime);
				var state = that.appointmentHourEnabled(o.endTime);
				output.push({
					date: formatTime(o.endTime, 'M-D'),
					beginTime: formatTime(o.beginTime, 'h:m'),
					endTime: formatTime(o.endTime, 'h:m'),
					beginTimes: new Date(beginTime),
					endTimes: new Date(o.endTime),
					state: state
				});
				beginTime = new Date(endTime);
			}
		}
		// Fix the end time of the last element
		if (output.length) {
			output[output.length - 1].endTime = formatTime(endTime, 'h:m');
		}

		return output;
	},
	__separateTimeWithFixedInterval: function (beginTime, endTime, interval) {
		var that = this;
		var output = [];
		beginTime = new Date(beginTime);
		endTime = new Date(endTime);
		while (beginTime.getTime() < endTime.getTime()) {
			output.push({
				date: formatTime(new Date(beginTime), 'M-D'),
				beginTime: formatTime(new Date(beginTime), 'h:m'),
				endTime: formatTime(new Date(beginTime.getTime() + interval), 'h:m'),
				beginTimes: new Date(new Date(beginTime.getTime())),
				endTimes: new Date(new Date(beginTime.getTime() + interval)),
				state: that.appointmentHourEnabled(new Date(new Date(beginTime.getTime() + interval)))
			});
			beginTime = new Date(beginTime.getTime() + interval);
		}
		// Fix the end time of the last element
		if (output.length) {
			output[output.length - 1].endTime = formatTime(new Date(endTime), 'h:m');
		}
		return output;
	},
	appointmentHourEnabled: function (time) {
		var endTime = time.getTime();
		console.log(endTime);
		return !!(
			endTime >= new Date() &&
      endTime >= this.data.line.getTime()
		);
	},
	selectDeliveyTime: function (event) {
		var selectTime = event.currentTarget.dataset.item;
		var beginTime = selectTime.beginTime;
		var endTime = selectTime.endTime;
		// var date=selectTime.endTimes.getMonths()+'-'+selectTime.endTimes.getDate();
		var date = selectTime.date;
		var str = date + ' ' + beginTime + '-' + endTime;
		var appointmentTime = {
			beginTime: selectTime.beginTimes,
			endTime: selectTime.endTimes
		};
		app.globalData.selectTime = str;
		app.globalData.appointmentTime = appointmentTime;
		wx.navigateBack();
	},
	getMonthDay: function (e) {
		var str = this.data.weekday[e.getDay()];
		return str;
	}
});
