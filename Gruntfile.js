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
`grunt server` - runs Karma frontend tests (note this will keep the task running so use Ctrl+C to close when it's done. Also make sure to have a browser open to http://localhost:9876 for the tests to run)
`grunt test` - runs any other tests (i.e. backend tests)
`grunt docs` - generate YUIDoc auto documentation
`grunt test-backend` to just test backend
`grunt lint-backend` to just lint backend

Lint, concat, & minify (uglify) process (since ONLY want to lint & minify files that haven't already been minified BUT want concat ALL files (including already minified ones) into ONE final file)
1. lint all non-minified (i.e. custom built as opposed to 3rd party) files
2. minify these custom built files (this also concats them into one)
3. concat all the (now minified) files - the custom built one AND all existing (3rd party) minified ones

*/

'use strict';

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
	"cfg": "0.6",
	"pkg": "0.0.6"
};
// var configFile = require('./configs/config.json');
var configFile ='./configs/config.json';
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
			configFile ='./configs/config-'+grunt.option('config')+'.json';
		}
		grunt.log.writeln('configFile: '+configFile);

		// var cfgJson = configFile;
		var cfgJson =require(configFile);
		// global.cfgJson = cfgJson;

		// hardcoded paths
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
					}
					// scss: {
						// src:        publicPathRelative+"1scss/partials/_dir-paths.tpl",
						// dest:       publicPathRelative+"1scss/partials/_dir-paths.scss"
					// },
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
					options: {
						keepalive:      true,
						//singleRun:      true,
						configFile:     publicPathRelativeRoot+'config/karma.conf.js',
						//configFile:     'public/config/karma.conf.js',
						port:           9876,
						runnerPort:     9877
					}
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
		//grunt.registerTask('test', ['jasmine_node', 'karma']);		//karma tests stay open so need to be run on their own - backend tests moved to default task

		//start karma server
		grunt.registerTask('server', 'run karma server and tests', function() {
			grunt.log.subhead('Make sure you have a browser open to http://localhost:9876/\nYou can quit this task with `Ctrl+C` once the tests are complete.\n');
			grunt.task.run(['karma']);
		});

		grunt.registerTask('test', 'run (backend) tests', function() {
			grunt.task.run(['test-backend']);
		});

		grunt.registerTask('docs', ['yuidoc']);

		grunt.registerTask('lint-backend', ['jshint:backend']);

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
				grunt.task.run(['buildfiles', 'ngtemplates:main', 'jshint:backend', 'jshint:beforeconcat', 'uglify:build', 'less:development', 'concat:devJs', 'concat:devCss', 'test', 'server']);		//NOTE: 'server' task MUST be run last since it keeps running / never completes
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
	
	}
	init({});		//initialize here for defaults (init may be called again later within a task)

};