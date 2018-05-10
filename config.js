const config = {
	MODE: 'development', // localhost development production
	PORT: {
		400: '4020',
		3002: '53002'
	},
	SERVE_URL: {
		localhost: 'http://localhost:',
		development: 'https://mp-dev.guzzu.cn',
		production: 'https://mp.guzzu.cn'
	},
	API_PREFIX: {
		400: '/api/2/',
		3002: '/v3/frontapi/'
	},
	'session_expire_seconds': 600,
	'INDEX_SLUG': 'guzzu-msite-index',
	'shoppingMallId': '5adedc43de3c90022eb25d3b'
};

module.exports = config;
