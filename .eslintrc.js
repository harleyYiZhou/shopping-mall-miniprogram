module.exports = {
	'extends': 'guzzu',
	'globals': {
		'wx': true,
		'Page': true,
		'App': true,
		'getApp': true,
		'getCurrentPages': true
	},
	'rules': {
		'semi-style': [
			2,
			'last'
		],
		'space-before-function-paren': [
			2,
			{
				'anonymous': 'always',
				'named': 'never',
				'asyncArrow': 'always'
			}
		],
		'indent': [
			'error',
			'tab',
			{
				'SwitchCase': 1
			}
		],
		'comma-dangle': [
			'error',
			{
				'arrays': 'ignore',
				'objects': 'ignore',
				'imports': 'never',
				'exports': 'never',
				'functions': 'never'
			}
		],
		'no-extend-native': 0,
		'object-curly-spacing': [
			2,
			'always'
		],
	}
};
