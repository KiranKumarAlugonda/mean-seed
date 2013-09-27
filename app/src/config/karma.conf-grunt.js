<%
var cfgJson = grunt.config('cfgJson');
%>

module.exports = function (config) {
	config.set({
		basePath: '../',

		files: [
			<%
			var filePaths = grunt.config('filePathsJsNoPrefix');
			for(var ii=0; ii<filePaths.length; ii++) {
				if(ii !=0) {
					print('\t\t\t');
				}
				print('"'+filePaths[ii] + '",\n');
			}
			%>
		
			// 'lib/angular/angular-*.js',
			'test/lib/angular/angular-mocks.js',

			// 'test/unit/**/*.js',
			
			// Test-Specs
			'**/*.spec.js'
			// '**/spec.*.js'
		],

		frameworks: ['jasmine'],

		autoWatch: true,

		// browsers: ['Chrome'],
		browsers: [],

		junitReporter: {
			outputFile: 'test_out/unit.xml',
			suite: 'unit'
		}
	});
};