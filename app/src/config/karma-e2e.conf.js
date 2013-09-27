module.exports = function (config) {
	config.set({
		basePath: '../',

		files: [
			'test/e2e/**/*.js'
		],

		frameworks: ['ng-scenario'],

		autoWatch: false,

		// browsers: ['Chrome'],
		browsers: [],

		singleRun: true,

		urlRoot: 'e2e/',
		
		proxies: {
			// '/': 'http://localhost:8000/'
			// '/': 'http://localhost:3000/'
			'/': 'http://localhost:3005/'		//run on the same port as the backend tests so only need to run ONE server
		},

		junitReporter: {
			outputFile: 'test_out/e2e.xml',
			suite: 'e2e'
		}
	});
};