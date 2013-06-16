<%
var cfgJson = grunt.config('cfgJson');
%>
basePath = '../';

files = [
    JASMINE,
    JASMINE_ADAPTER,

	<%
var filePaths = grunt.config('filePathsJsNoPrefix');
for(var ii=0; ii<filePaths.length; ii++) {
    print('\t"' + filePaths[ii] + '",\n');
}
%>

	// 'lib/angular/angular-*.js',
    'test/lib/angular/angular-mocks.js',

    // 'test/unit/**/*.js',
	
    // Test-Specs
	'**/*.spec.js'
    // '**/spec.*.js'
];

autoWatch = true;

browsers =[];

junitReporter = {
    outputFile: 'test_out/unit.xml',
    suite: 'unit'
};
