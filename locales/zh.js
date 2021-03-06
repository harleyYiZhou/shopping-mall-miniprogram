module.exports = {
	common: {
		loading: '加载中',
		sessionExpired: '登录状态超时',
		reSignin: '是否重新登录？',
		signinSuccess: '登录成功',
		logoutSuccess: '退出成功',
		authorizeFail: '授权失败',
		retry: '是否尝试再次授权?',
		bindSuccess: '绑定成功',
		bindFail: '绑定失败',
		bindDeny: '用户不允许授权，请输入手机号码',
		newMobilephone: '新手机号是',
		invalidNum: '手机号码或验证码格式不正确',
		errorMsg: '未登录',
		error: '错误',
		error1: '订单：商品库存不足',
		unknownError: '未知错误！',
		more: '更多',
		showModal: {
			cancel: '取消',
			confirm: '确认',
			title: '提示'
		},
		tabBar: {
			homePage: '主页',
			cart: '购物车',
			myPage: '我的',
			store: '商铺',
			category: '分类'
		}
	},
	account: {
		navBarTitle: '账户信息',
		basicInf: '基础资料',
		image: '头像',
		accountId: '账号',
		name: '姓名',
		secretInf: '密保资料',
		phoneNum: '手机号',
		changepsw: '修改密码',
		logoutBtn: '登出',
		changeName: '修改姓名',
		language: '语言'
	},
	coupons: {
		navBarTitle: '优惠券',
		membershipCard: '会员卡',
		coupon: '优惠券',
		validForever: '一直有效',
	},
	userCenter: {
		orders: '我的订单',
		allOrder: '全部订单',
		manageAddress: '地址管理',
		pending: '待付款',
		unshipped: '待发货',
		shipped: '待收货',
		unComment: '待评价',
		refund: '退款订单',
		received: '已完成',
		myFavorite: '我的收藏',
		setting: '设置',
		service: '服务中心',
		coupon: '优惠券',
		membershipCard: '会员卡',
		signin: '未登录',
	},
	addAddress: {
		navBarTitle: 'Add address',
		updating: '提交中',
		updateFailed: '更新地址失败！',
		updateSuccess: '成功保存地址',
		infoNotComplete: '地址信息未填写完整，操作失败！',
		'edit': '编辑',
		'addShippingAddress': '新增收货地址'
	},
	addresses: {
		navBarTitle: '地址管理',
		updating: '提交中',
		updateFailed: '更新地址失败！',
		updateSuccess: '成功保存地址',
		infoNotComplete: '地址信息未填写完整，操作失败！',
		'edit': '编辑',
		'addShippingAddress': '新增收货地址'
	},
	bindPhone: {
		navBarTitle: 'Cart',
		title: '您的账号尚未绑定手机，请绑定手机',
		mobilePhone: '手机号码',
		getVerifyCode: '获取验证码',
		verifyCode: '验证码',
		bindPhone: '绑定手机',
		bindWechat: '绑定微信',
		phoneTips: '请输入手机号码',
		verifyCodeTips: '请输入验证码',
	},
	cart: {
		navBarTitle: '购物车',
		emptyCart: '购物车里目前没有商品',
		emptyCartHint: '请到店铺首页逛逛吧！',
		option: '选项',
		discount: '折扣',
		discountMinPurchase: '购物满',
		doMoneyOff: '减',
		doPercentageOff: '减',
		doFreeShipping: '免邮费',
		discountProducts: '折扣商品',
		subtotal: '小计',
		totalCost: '总计',
		goToPay: '前往结账',
		removeTitle: '移除商品',
		removeContent: '您确定要移除该商品吗？'
	},
	category: {
		navBarTitle: '分类',
		stores: '店铺',
		storeList: '店铺列表',

	},
	checkout: {
		navBarTitle: '确认订单',
		selectItem: '(--请选择--)',
		regularShipping: '普通配送',
		cityShipping: '同城配送',
		customerPickup: '上门自取',
		fullAddress: '收货地址',
		pickupDetail: '上门自取详细',
		selectAddress: '选择收货地址',
		submit: '提交订单',
		note: '买家留言',
		noShippingAddress: '您还没有可用的收货地址',
		addShippingAddress: '新增收货地址',
		option: '选项',
		discount: '折扣',
		discountMinPurchase: '购物满',
		doMoneyOff: '现金券',
		doFreeShipping: '免邮费',
		doPercentageOff: '折扣券',
		discountProducts: '折扣商品',
		subtotal: '小计',
		shippingCost: '运费',
		totalCost: '合计',
		optionalDiscount: '可选折扣',
		selectShop: '选择自提点',
		pickupName: '提货人姓名',
		mobilePhone: '电话',
		pickupLocation: '自提点',
		selectLocation: '选择自提点',
		areaDetail: '详细',
		minPurchase: '起送金额',
		deliveryFee: '配送费',
		deliveryTime: '预约时间',
		timeValue: '尽快送达',
		showShopPic: '查看店铺图片',
		maxDaysInAdvance: '预约时长',
		serviceHours: '配送时间',
		days: '天',
		weekdays: [
			'周日', '周一', '周二', '周三', '周四', '周五', '周六'
		],
		selectDeliverTime: '选择配送时间'
	},
	details: {},
	contactStore: {
		address: '店铺地址',
		email: '邮箱',
		phone: '电话',
		weibo: '微博',
		wechat: '微信'
	},
	favoriteProducts: {},
	index: {
		navBarTitle: ''
	},
	layout: {},
	order: {
		navBarTitle: '订单详情',
		refId: '订单号',
		wxpay: '微信支付',
		pendingHint1: '您还未支付订单，请在',
		pendingHint2: '分钟内完成支付。',
		'paidHint': '你已经完成支付，商家会尽快发货',
		'shipped': '卖家已发货',
		'shippedHint': '会自动确认收货',
		'received': '交易已完成，谢谢！',
		'shippingProvider': '快递公司',
		'trackingCode': '运单号',
		'trackShipping': '查看物流',
		'closeTrackShipping': '收起物流',
		'receiver': '收货人',
		'fullAddress': '收货地址',
		'option': '选项',
		'taxCost': '税款',
		'shippingCost': '运费',
		'totalCost': '订单合计',
		'createdAt': '创建时间',
		'paidAt': '付款时间',
		'transactionId': '付款交易号',
		'tradeNo': '付款交易号',
		'shippedAt': '发货时间',
		'refundedAt': '退款时间',
		'receivedAt': '成交时间',
		'totalRefunded': '退款合计',
		'refunded': '交易已退款',
		'expired': '交易已过期',
		'returnToList': '返回订单列表',
		'backToStore': '回到店铺首页', // Back to Store
		'contactStore': '联系商家',
		'reviewOrder': '评论订单',
		'requestRefund': '请求退款',
		'requestRefundReason': '申请退款原因',
		'refundAmount': '退款金额',
		'requestRefundHint': '您发起了退款请求，正在等待处理',
		'autoRefundHint': '若48小时内未处理，将自动退款到你的账户',
		'requestRefundTime': '请求时间',
		'rejectRefundRequestHint': '您的退款请求已被商家拒绝',
		'waiteRefundRequestHint': '退款请求成功,请等待商家处理',
		'rejectNote': '拒绝原因',
		'confirmReceipt': '确认收货',
		noShipping: '暂时没有物流信息',
		confirm: '提交',
		cancel: '取消',
		note: '买家留言',
		paySuccess: '付款成功',
	},
	orders: {
		navBarTitle: '我的订单',
		orders: '我的订单',
		allOrders: '全部',
		pending: '待付款',
		unshipped: '待发货',
		shipped: '待收货',
		received: '已收货',
		refId: '订单号',
		option: '选项',
		totalCost: '总金额',
		closed: '已完成',
		viewDetails: '详细',
		cancel: '取消订单',
		goToPay: '去支付',
		emptyCart: '暂无订单',
		emptyCartHint: '请到首页逛逛吧！',
		createdAt: '订单日期',
		willExpire: '订单即将关闭',
		refunding: '待退款',
	},
	pageLayout: {},
	productDetail: {
		navBarTitle: '商品详情',
		addSuccess: '成功加入购物车',
		aboutShipping: '运费说明',
		pricing: '定价',
		payment: '支付',
		shipping: '物流',
		returnRefund: '退换 / 退款',
		addToCart: '加入购物车',
		selectNone: '选项： 请选择颜色 型号 分类',
		selected: '已选： ',
		collect: '收藏',
		cart: '购物车',
		comment: '用户评价',
		upLoad: '上拉查看图文详情',
		buyNum: '购买数量'
	},
	selectAddress: {
		navBarTitle: '地址管理',
		updating: '提交中',
		updateFailed: '更新地址失败！',
		updateSuccess: '成功保存地址',
		infoNotComplete: '地址信息未填写完整，操作失败！',
		'edit': '编辑',
		'addShippingAddress': '新增收货地址',
		removeTitle: '移除地址',
		removeContent: '您确定要移除该地址吗？',

	},
	shareCampaignInstance: {},
	store: {
		navBarTitle: '店铺详情'
	},
	shoppingCart: {
		navBarTitle: '购物车',
		emptyCart: '购物车里目前没有商品',
		emptyCartHint: '去首页逛逛吧！',
		shop: 'GUZZU',
		edit: '编辑',
		complete: '完成',
		allSelect: '全选',
		option: '选项',
		discount: '折扣',
		discountMinPurchase: '购物满',
		doMoneyOff: '减',
		doPercentageOff: '减',
		doFreeShipping: '免邮费',
		discountProducts: '折扣商品',
		subtotal: '小计',
		totalCost: '总计',
		goToPay: '前往结账',
		backToStore: '返回上一级',
		removeTitle: '移除商品',
		removeAll: '全部移除',
		removeContent: '您确定要移除该商品吗？',
		error1: '订单：商品库存不足',
		invalidCart: '数据不正确，请刷新购物车',
	},
	storeCategories: {
		navBarTitle: '商品分类',
		collection: '商品分类'
	},
	updateAddress: {
		navBarTitle: '更新地址',
		updating: '提交中',
		updateFailed: '更新地址失败！',
		updateSuccess: '成功保存地址',
		infoNotComplete: '地址信息未填写完整，操作失败！',
		'updateShippingAddress': '编辑地址',
		'name': '收货人',
		'mobilePhone': '手机号码',
		'province': '省份',
		'city': '城市',
		'district': '县区',
		'streets': '街道',
		'address': '详细地址',
		phName: '请输入姓名',
		phMobilePhone: '请输入手机号码',
		phAddress: '请输入详细地址'
	},
	tabBar: ['主页', '分类', '购物车', '我的'],
};
