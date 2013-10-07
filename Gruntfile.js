/**
@todo
- add in jasmine node backend test running (replacing mocha)
- cssmin (can only min files that aren't already minified - i.e. do same process as with javascript - min custom ones first THEN concat?)

@module grunt
@class grunt

@toc
1. config versioning setup
2. load grunt plugins
3. init
4. setup variables
5. grunt.initConfig
6. register grunt tasks

NOTE: use "grunt --type=prod" to run production version
NOTE: use "grunt --config=test" to run with a 'config-test.json' file instead of the default 'config.json' file. You can change 'test' to whatever suffix you want. This allows creating multiple configurations and then running different ones as needed.

Usage:
The core call(s) to always do before commiting any changes:
`grunt` - builds, lints, concats, minifies files, runs tests, etc.
	- NOTE: since this runs the frontend Karma server tests, this will NOT auto-complete; use Ctrl+C to exit the task once it runs and you see the 'SUCCESS' message for all tests passing

Other calls (relatively in order of importantance / most used)
`grunt q` for quick compiles (doesn't run tests or build docs)
`grunt noMin` a quick compile that also builds main.js and main.css (instead of main-min versions) - good for debugging/development.
`grunt test-frontend` - runs Karma frontend tests
`grunt test` - runs ALL tests
`grunt docs` - generate YUIDoc auto documentation
`grunt test-backend` to just test backend
`grunt lint-backend` to just lint backend

Lint, concat, & minify (uglify) process (since ONLY want to lint & minify files that haven't already been minified BUT want concat ALL files (including already minified ones) into ONE final file)
1. lint all non-minified (i.e. custom built as opposed to 3rd party) files
2. minify these custom built files (this also concats them into one)
3. concat all the (now minified) files - the custom built one AND all existing (3rd party) minified ones

*/

'use strict';

var fs = require('fs');

/**
Config versioning setup and defaults
@toc 1.
*/

/**
Hardcoded versions that should match config.json versions - used to prevent grunt from running until config.json and npm install are up to date
Since config.json isn't under version control, if make (breaking) changes, config.json needs to be updated manually on each environment and without doing so can cause (serious) errors so this prevents that from happening.
Likewise, `npm install` must be run per server so this ensures packages are up to date.
So each time package.json or config.json is changed, increment the version both in config.json and here.

@property curVersions
@type Object
*/
var curVersions ={
	"cfg": "0.8",
	"pkg": "0.0.7"
};
// var configFile = require('./app/configs/config.json');
var configFile ='./app/configs/config.json';

/*
//path setting not working (on Windows at least) so don't use environment variables; just use a simpler (optional) config file that sets what config file to use
console.log("process.env['ENV_CONFIG']: "+process.env['ENV_CONFIG']);
if(process.env['ENV_CONFIG'] !==undefined) {
	configFile ='./app/configs/config-'+process.env['ENV_CONFIG']+'.json';
}
*/

//check to see if config_environment file exists and use it to load the appropriate config.json file if it does
var configFileEnv ='./config_environment.json';
if(fs.existsSync(configFileEnv)) {
	var cfgJsonEnv =require(configFileEnv);
	if(cfgJsonEnv && cfgJsonEnv !==undefined && cfgJsonEnv.environment !==undefined && cfgJsonEnv.environment.length >0) {
		configFile ='./app/configs/config-'+cfgJsonEnv.environment+'.json';
	}
}

var dirpath = __dirname;

module.exports = function(grunt) {

	/**
	Load grunt plugins
	@toc 2.
	*/
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    //grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-buildfiles');
	grunt.loadNpmTasks('grunt-jasmine-node');
	// grunt.loadNpmTasks('grunt-html2js');
	grunt.loadNpmTasks('grunt-angular-templates');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-parallel');
	

	/**
	Function that wraps everything to allow dynamically setting/changing grunt options and config later by grunt task. This init function is called once immediately (for using the default grunt options, config, and setup) and then may be called again AFTER updating grunt (command line) options.
	@toc 3.
	@method init
	*/
	function init(params) {
		/**
		Setup variables
		@toc 4.
		*/
		grunt.log.writeln('init');
		
		//allow changing config file based on comman line options
		if(grunt.option('config')) {
			// grunt.log.writeln('config: '+grunt.option('config'));
			configFile ='./app/configs/config-'+grunt.option('config')+'.json';
		}
		grunt.log.writeln('configFile: '+configFile);

		// var cfgJson = configFile;
		var cfgJson =require(configFile);
		// global.cfgJson = cfgJson;
		
		//get test config as well
		//insert a '.test' at the end of the config as the test config naming convention
		var configTestFile =configFile.slice(0, configFile.lastIndexOf('.'))+'.test'+configFile.slice(configFile.lastIndexOf('.'), configFile.length);
		var cfgTestJson =require(configTestFile);
		

		// hardcoded paths
		var protractorPath ='node_modules/protractor/bin/protractor';		//non-Windows
		if(cfgJson.operatingSystem !==undefined && cfgJson.operatingSystem =='windows') {
			protractorPath ='node_modules\\.bin\\protractor';		//Windows
		}
		
		var publicPathRelativeRoot ="app/src/";
		var buildfilesListObj = require('./'+publicPathRelativeRoot+'config/buildfilesList');
		var publicPathRelative = publicPathRelativeRoot;
		var publicPathRelativeDot = "./"+publicPathRelative;		//the "./" is necessary for some file paths to work in grunt tasks
		
		//relative to app/src folder (prepend this when using it)
		var pathsPhonegap ={
			android: "deploys/phonegap/platforms/android/assets/www",
			ios: "deploys/phonegap/platforms/ios/assets/www"
		};

		var serverPath = cfgJson.server.serverPath;
		var appPath = cfgJson.server.appPath;
		var staticPath = cfgJson.server.staticPath;

		//publicPathRelative will be prepended
		var buildDir ="build";
		var paths = {
			'concatJs':buildDir+"/main.js",
			'concatCss':buildDir+"/main.css",
			'minJs':buildDir+"/main-min.js",
			'minCss':buildDir+"/main-min.css"
		};
		var buildPath =publicPathRelative+buildDir;

		var config ={
			customMinifyFile:   buildPath+'/temp/custom.min.js',
			customFile:         buildPath+'/temp/custom.js'
			//concatFilesExt:    ['common/ext/*.js'],
			//concatFiles:       [],
			//will be built below as combination of concatFilesExt and customMinifiyFile
			//concatFilesMin:    []
		};

		//declare config that will be used more than once to keep code DRY
		var jsHintBackendConfig ={
			options: {
				//define jasmine test globals: http://pivotallabs.com/running-jshint-from-within-jasmine/
				globals: {
					after:      false,
					before:     false,
					afterEach:  false,
					beforeEach: false,
					//confirm:    false,
					//context:    false,
					describe:   false,
					expect:     false,
					it:         false,
					//jasmine: false,
					//JSHINT: false,
					//mostRecentAjaxRequest: false,
					//qq: false,
					//runs: false,
					spyOn:      false,
					spyOnEvent: false,
					waitsFor:   false,
					xdescribe:  false,
					xit:        false
				}
			},
			files: {
				src: ['app/*.js', 'app/test/**/*.js', 'app/modules/**/*.js', 'app/routes/**/*.js']
			}
		};

		//config.concatFilesMin =config.concatFilesExt.concat(config.customMinifyFile);
		//config.concatFiles =config.concatFilesExt.concat(config.customFile);

		/**
		Project configuration.
		@toc 5.
		*/
		grunt.initConfig({
			customMinifyFile:   config.customMinifyFile,
			customFile:         config.customFile,
			pkg:                grunt.file.readJSON('package.json'),
			//will be filled/created in buildfiles task
			lintFilesJs:        [],
			//cfgJson: grunt.file.readJSON('package.json'),
			cfgJson:            cfgJson,
			cfgTestJson:            cfgTestJson,
			//will be filled/created in buildfiles task
			filePathsJs:        '',
			//will be filled/created in buildfiles task
			filePathsCss:       '',
			filePathConcatJs:   staticPath+paths.concatJs,
			filePathConcatCss:  staticPath+paths.concatCss,
			filePathsJsNoPrefix:        '',		//will be filled/created in buildfiles task
			filePathsCssNoPrefix:        '',		//will be filled/created in buildfiles task
			filePathMinJs:      staticPath+paths.minJs,
			filePathMinCss:     staticPath+paths.minCss,
			// lessDirPathRoot:    cfgJson.less.dirPathRootPrefix+cfgJson.server.staticFilePath,
			lessDirPathRoot:    cfgJson.less.dirPathRootPrefix+staticPath,
			//lessDirPathRoot: '../'+cfgJson.serverPath,        //mobile phonegap
			serverPath:             serverPath,
			staticPath:             staticPath,
			publicPathRelativeRoot: publicPathRelativeRoot,
			publicPathRelative:     publicPathRelative,
			publicPathRelativeDot:  publicPathRelativeDot,
			buildPath:	buildPath,
			buildPathIndexHtml: staticPath+buildDir+'/',
			buildfiles: {
				// customMinifyFile:   config.customMinifyFile,
				buildfilesArray:    buildfilesListObj.files,
				configPaths: {
					//generic file lists for use elsewhere
					noPrefix: {
						// prefix: '',
						files: {
							js: ['filePathsJsNoPrefix'],
							css: ['filePathsCssNoPrefix']
						}
					},
					//index.html file paths (have the static path prefix for use in <link rel="stylesheet" > and <script> tags)
					indexFilePaths:{
						prefix: cfgJson.server.staticPath,
						files: {
							js: ['filePathsJs'],
							css: ['filePathsCss']
						}
					},
					//list of files to lint - will be stuffed into jshint grunt task variable(s)
					jshint:{
						prefix: publicPathRelativeDot,
						fileGroup: 'custom',
						files: {
							js: ['jshint.beforeconcat.files.src', 'jshint.beforeconcatQ.files.src']
						}
					},
					//list of js files to concatenate together - will be stuffed into concat grunt task variable(s)
					concatJsMin: {
						prefix: publicPathRelativeDot,
						fileGroup: 'ext',
						additionalFiles: [config.customMinifyFile],
						files: {
							js: ['concat.devJs.src']
						}
					},
					//list of css files to concat - will be stuffed into concat grunt task variable(s)
					concatCss: {
						prefix: publicPathRelativeDot,
						fileGroup: 'all',
						files: {
							css: ['concat.devCss.src']
						}
					},
					//list of files to uglify - will be stuffed into uglify grunt task variable(s)
					uglify:{
						prefix: publicPathRelativeDot,
						fileGroup: 'custom',
						uglify: true,
						files: {
							js: ['uglify.build.files']
						}
					},
					//list of html templates to join together to stuff in AngularJS $templateCache - will be stuffed into ngtemplates grunt task variable(s)
					templates: {
						prefix: publicPathRelativeDot,
						files: {
							html: ['ngtemplates.main.src']
						}
					},
					concatJsNoMin: {
						prefix: publicPathRelativeDot,
						fileGroup: 'all',
						files: {
							js: ['concat.devJsNoMin.src']
						}
					},
				},
				files: {
					indexHtml: {
						src:        publicPathRelative+"index-grunt.html",
						dest:       publicPathRelative+"index.html"
					},
					indexHtmlProd: {
						ifOpts: [{key:'type', val:'prod'}],		//pass in options via command line with `--type=prod`
						src:        publicPathRelative+"index-prod-grunt.html",
						dest:       publicPathRelative+"index.html"
					},
					indexHtmlPhonegap: {
						// ifOpts: [{key:'type', val:'prod'}, {key:'config', val:'phonegap'}],		//pass in options via command line with `--type=prod`
						ifOpts:	[{key: 'config', val:'phonegap'}],
						src:        publicPathRelative+"index-phonegap-grunt.html",
						dest:       publicPathRelative+"index.html"
					},
					//TriggerIO version - NOTE: for production builds this ALSO writes to index.html so this MUST be after the indexHtml task above since these writes overwrite each other!
					indexHtmlTriggerIO: {
						ifOpts:	[{key: 'config', val:'triggerio'}],
						src:        publicPathRelative+"index-triggerio-grunt.html",
						dest:       publicPathRelative+"index.html"
					},
					// touchHtml: {
						// src:        publicPathRelative+"partials/resources/touch-grunt.html",
						// dest:       publicPathRelative+"partials/resources/touch.html"
					// },
					// noTouchHtml: {
						// src:        publicPathRelative+"partials/resources/no-touch-grunt.html",
						// dest:       publicPathRelative+"partials/resources/no-touch.html"
					// },
					LGlobals: {
						src:        publicPathRelative+"modules/services/LGlobals-grunt.js",
						dest:       publicPathRelative+"modules/services/LGlobals.js"
					},
					karmaUnit: {
						src:        publicPathRelativeRoot+"config/karma.conf-grunt.js",
						dest:       publicPathRelativeRoot+"config/karma.conf.js"
					},
					less: {
						src:        publicPathRelative+"common/less/variables/_dir-paths.tpl",
						dest:       publicPathRelative+"common/less/variables/_dir-paths.less"
					},
					// scss: {
						// src:        publicPathRelative+"1scss/partials/_dir-paths.tpl",
						// dest:       publicPathRelative+"1scss/partials/_dir-paths.scss"
					// },
					protractorDefault: {
						src: publicPathRelative+"config/protractor.conf-grunt.js",
						dest: publicPathRelative+"config/protractor/protractor.conf.js"
					}
				}
			},
			concat: {
				devCss: {
					// will be filled via buildfiles task
					src:    [],
					dest:   publicPathRelativeDot+paths.concatCss
				},
				//min version
				devJs: {
					src:    [],		// will be filled via buildfiles task
					dest:   publicPathRelativeDot+paths.minJs
				},
				devJsNoMin: {
					src:    [],		  //will be filled via buildfiles task
					dest:   publicPathRelativeDot+paths.concatJs
				}
			},
			jshint: {
				options: {
					//force:          true,
					globalstrict:   true,
					//sub:            true,
					browser:        true,
					devel:          true,
					globals: {
						angular:    false,
						$:          false,
						FB:			false,
						moment:		false,
						Lawnchair: false,
						//@todo - fix this?
						globalPhoneGap: false,
						forge: false,
						Pikaday: false
					}
				},
				//beforeconcat: ['common/module.js', 'modules/**/*.js'],
				//beforeconcat: config.lintFiles,
				//filled via buildfiles task
				// beforeconcat:   [],
				beforeconcat:   {
					options: {
						force:	false
					},
					files: {
						src: []		//filled via buildfiles task
					}
				},
				//quick version - will not fail entire grunt process if there are lint errors
				beforeconcatQ:   {
					options: {
						force:	true
					},
					files: {
						src: []		//filled via buildfiles task
					}
				},
				//afterconcat:    ['<%= builddir %>/<%= pkg.name %>.js'],
				//quick version - will not fail entire grunt process if there are lint errors
				backendQ: {
					options: {
						force: true,
						node: true,
						loopfunc: true,
						globals: jsHintBackendConfig.options.globals
					},
					files: {
						src: jsHintBackendConfig.files.src
					}
				},
				backend: {
					options: {
						force: false,
						node: true,
						loopfunc: true,
						globals: jsHintBackendConfig.options.globals
					},
					files: {
						src: jsHintBackendConfig.files.src
					}
				}
			},
			uglify: {
				options: {
					//banner: '/*! <%= cfgJson.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
					mangle: false
				},
				build: {
					// filled via buildfiles task
					files:  {}
					/*
					src:    'src/<%= cfgJson.name %>.js',
					dest:   'build/<%= cfgJson.name %>.min.js'
					*/
				}
			},
			less: {
				development: {
					options: {
						//paths: ["assets/css"]
						//paths: ["1less"]
					},
					files: {
						"<%= buildPath %>/base.css": "<%= publicPathRelative %>common/less/_base.less"
						//publicPathRelative+"css/1compiled/base.css": publicPathRelative+"1less/base.less",
						//"public/css/1compiled/base.css":"public/1less/base.less",
						// "<%= buildPath %>/bootstrap.css":             "<%= publicPathRelative %>lib/twitter-bootstrap/bootstrap.less",      //twitter bootstrap
						// "<%= buildPath %>/bootstrap-responsive.css":  "<%= publicPathRelative %>lib/twitter-bootstrap/responsive.less"       //twitter bootstrap responsive
					}
				},
				production: {
					options: {
						//paths: ["assets/css"],
						yuicompress: true
					},
					files: {
						//"path/to/result.css": "path/to/source.less"
						"<%= buildPath %>/base.css": "<%= publicPathRelative %>common/less/_base.less"
					}
				}
			},
			karma: {
				unit: {
					configFile:     publicPathRelativeRoot+'config/karma.conf.js',
					singleRun: true,
					browsers: ['PhantomJS']
				}
				/*
				//e2e now handled with Protractor (which uses grunt-shell), NOT Karma
				e2e: {
					configFile:     publicPathRelativeRoot+'config/karma-e2e.conf.js',
					singleRun: true,
					browsers: ['PhantomJS']
				}
				*/
				/*
				unit: {
					options: {
						keepalive:      true,
						//singleRun:      true,
						configFile:     publicPathRelativeRoot+'config/karma.conf.js',
						//configFile:     'public/config/karma.conf.js',
						port:           9876,
						runnerPort:     9877
					}
				}
				*/
			},
			shell: {
				//e2e tests (with Protractor)
				protractor: {
					options: {
						stdout: true
					},
					command: protractorPath+' '+publicPathRelativeRoot+'config/protractor/protractor.conf.js'
				},
				/*
				foreverStop: {
					options: {
						stdout: true
					},
					command: "forever start run.js -m '"+cfgJson.app.name+" port "+cfgJson.server.port+"'"
				},
				forever: {
					options: {
						stdout: true
					},
					command: "forever restart run.js -m '"+cfgJson.app.name+" port "+cfgJson.server.port+"'"
				},
				foreverTest: {
					options: {
						stdout: true
					},
					command: "forever restart run.js config=test -m '"+cfgJson.app.name+" port "+cfgTestJson.server.port+"'"
				}
				*/
			},
			parallel: {
				sauce: {
					options: {
						grunt: true
					},
					tasks: [
						//add grunt tasks to run here (i.e. for Selenium SauceLabs tests to run in parallel)
					]
				}
			},
			forever: {
				options: {
					index: 'run.js',
					options: ["-m '"+cfgJson.app.name+" port "+cfgJson.server.port+"'"]
				}
			},
			yuidoc: {
				// NOTE: paths and outdir options (in yuidoc.json file AND/OR in options here) are apparently REQUIRED otherwise it doesn't work!
				backend:    grunt.file.readJSON('yuidoc-backend.json'),
				frontend:   grunt.file.readJSON('yuidoc-frontend.json')
			},
			jasmine_node: {
				// specNameMatcher: "./spec", // load only specs containing specNameMatcher
				// specNameMatcher: "./test", // load only specs containing specNameMatcher
				// projectRoot: "./",
				specNameMatcher: "*", // load only specs containing specNameMatcher
				projectRoot: "./app/test",
				requirejs: false,
				forceExit: true
				// jUnit: {
					// report: false,
					// savePath : "./app/test/reports/jasmine/",
					// useDotNotation: true,
					// consolidate: true
				// }
			},
			ngtemplates: {
				main: {
					options: {
						// base: 'app',
						// prepend: '/',
						base: 'app/src',
						prepend: staticPath,
						// module: 'templates-main'
						module: 'myApp'
					},
					// will be filled via buildfiles task
					src: [
						// 'app/src/modules/pages/header/header.html',
						// 'app/src/modules/pages/footer/footer.html',
						// 'app/src/modules/pages/events/events.html',
						// 'app/src/modules/pages/tribes/tribes.html'
						
						// 'app/src/**/*.html'
					],
					dest: "<%= buildPath %>/templates.js"
				}
			},
			//see here for example, it was confusing to me how to copy a folder recursively without having the src path automatically pre-pended.. http://stackoverflow.com/questions/13389952/flattening-of-file-tree-when-using-grunt-copy-task
			copy: {
				phonegapAndroid: {
					files: [
						{src: publicPathRelativeDot+'index.html', dest: publicPathRelativeDot+pathsPhonegap.android+'/index.html'},
						{src: publicPathRelativeDot+'build/main.css', dest: publicPathRelativeDot+pathsPhonegap.android+'/build/main.css'},
						{src: publicPathRelativeDot+'build/main.js', dest: publicPathRelativeDot+pathsPhonegap.android+'/build/main.js'},		//for development only
						{src: publicPathRelativeDot+'build/main-min.js', dest: publicPathRelativeDot+pathsPhonegap.android+'/build/main-min.js'},
						{src: publicPathRelativeDot+'build/templates.js', dest: publicPathRelativeDot+pathsPhonegap.android+'/build/templates.js'},
						{expand: true, cwd: publicPathRelativeDot+'common/font/', src: ['**'], dest: publicPathRelativeDot+pathsPhonegap.android+'/common/font/'},		//apparently it copies the folder(s) in the src path to the dest as well..
						{expand: true, cwd: publicPathRelativeDot+'common/img/', src: ['**'], dest: publicPathRelativeDot+pathsPhonegap.android+'/common/img/'}		//apparently it copies the folder(s) in the src path to the dest as well..
					]
				},
				phonegapIOS: {
					files: [
						{src: publicPathRelativeDot+'index.html', dest: publicPathRelativeDot+pathsPhonegap.ios+'/index.html'},
						{src: publicPathRelativeDot+'build/main.css', dest: publicPathRelativeDot+pathsPhonegap.ios+'/build/main.css'},
						{src: publicPathRelativeDot+'build/main.js', dest: publicPathRelativeDot+pathsPhonegap.ios+'/build/main.js'},		//for development only
						{src: publicPathRelativeDot+'build/main-min.js', dest: publicPathRelativeDot+pathsPhonegap.ios+'/build/main-min.js'},
						{src: publicPathRelativeDot+'build/templates.js', dest: publicPathRelativeDot+pathsPhonegap.ios+'/build/templates.js'},
						{expand: true, cwd: publicPathRelativeDot+'common/font/', src: ['**'], dest: publicPathRelativeDot+pathsPhonegap.ios+'/common/font/'},		//apparently it copies the folder(s) in the src path to the dest as well..
						{expand: true, cwd: publicPathRelativeDot+'common/img/', src: ['**'], dest: publicPathRelativeDot+pathsPhonegap.ios+'/common/img/'}		//apparently it copies the folder(s) in the src path to the dest as well..
					]
				}
			}
		});
		
		
		
		/**
		register/define grunt tasks
		@toc 6.
		*/
		grunt.registerTask('test-backend', ['jasmine_node']);
		
		grunt.registerTask('test-frontend', ['karma', 'shell:protractor']);

		grunt.registerTask('test', 'run all tests', function() {
			grunt.task.run(['test-backend', 'test-frontend']);
		});

		grunt.registerTask('docs', ['yuidoc']);

		grunt.registerTask('lint-backend', ['jshint:backend']);
		
		grunt.registerTask('build', ['buildfiles', 'ngtemplates:main', 'jshint:backend', 'jshint:beforeconcat', 'uglify:build', 'less:development', 'concat:devJs', 'concat:devCss']);

		// Default task(s).
		// grunt.registerTask('default', ['buildfiles', 'jshint:beforeconcat', 'uglify:build', 'less:development', 'concat:devJs', 'concat:devCss', 'jshint:backend', 'yuidoc', 'jasmine_node']);
		//grunt.registerTask('default', ['buildfiles', 'jshint:beforeconcat', 'uglify:build', 'less:development', 'concat:devJs', 'concat:devCss', 'jshint:backend', 'yuidoc']);
		grunt.registerTask('default', 'run default task', function() {
			//check to ensure config files and npm install are up to date
			var cfgVersion = (cfgJson.versions) ? cfgJson.versions.cfg : undefined;
			var pkgVersion = (cfgJson.versions) ? cfgJson.versions.pkg : undefined;
			var validVersion = true;

			if(cfgJson.versions.cfg !== curVersions.cfg) {
				grunt.log
					.error('ERROR config.json version mismatch: expected "%s", found "%s"', curVersions.cfg, cfgVersion)
					.subhead('please update config.json, then re-run\n');
				validVersion = false;
			}

			if(cfgJson.versions.pkg !== curVersions.pkg) {
				grunt.log
					.error('ERROR package.json version mismatch: expected "%s", found "%s"', curVersions.pkg, pkgVersion)
					.subhead('run npm install, update config.json, then re-run\n');
				validVersion = false;
			}

			if(validVersion) {
				// grunt.task.run(['buildfiles', 'ngtemplates:main', 'jshint:backend', 'jshint:beforeconcat', 'uglify:build', 'less:development', 'concat:devJs', 'concat:devCss', 'test']);
				grunt.task.run(['build', 'test']);
			} else {
				throw new Error('invalid project versions.');
			}
		});

		//quick version of default task testing/viewing quick changes
		grunt.registerTask('q', ['buildfiles', 'ngtemplates:main', 'jshint:backendQ', 'jshint:beforeconcatQ', 'uglify:build', 'less:development', 'concat:devJs', 'concat:devCss']);
		
		//Phonegap build
		grunt.registerTask('phonegap', 'run Phonegap task', function() {
			grunt.option('config', 'phonegap');
			grunt.option('type', 'prod');
			init({});		//re-init (since changed grunt options)
		
			grunt.task.run(['buildfiles', 'ngtemplates:main', 'uglify:build', 'less:development', 'concat:devJs', 'concat:devCss', 'copy:phonegapAndroid', 'copy:phonegapIOS']);
		});
		
		grunt.registerTask('noMin', ['buildfiles', 'ngtemplates:main', 'less:development', 'concat:devJsNoMin', 'concat:devCss']);
		
		//sauce labs tests
		grunt.registerTask('sauce', ['parallel:sauce']);
	
	}
	init({});		//initialize here for defaults (init may be called again later within a task)

};