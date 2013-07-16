/**
@toc
1. setup - whitelist, appPath, html5Mode
2. generic / common routes
3. site-specific routes
4. catch-all 'otherwise' route

Declare app level module which depends on filters, and services.

Also handles setting HTML5 mode and handling routing (optionally checking login state first)

HTML5 mode true (for modern browsers) means no "#" in the url. HTML5 mode false (IE <10 and Android <4) has a "#/" in the url as a fallback for older browsers that don't support HTML5 History

The "resolve" block in the routes allows calling functions (that return a $q deferred promise) that will be executed BEFORE routing to the appropriate page/controller (this is often used for checking logged in state and updating routing accordingly - i.e. don't allow accessing pages that require login if the user isn't currently logged in)
@module ang-app
*/

'use strict';

angular.module('myApp', [
'ui',
'ui.bootstrap',
// 'templates-main',
'LGlobalsModule',	//todo - clean up / rename these
'dtv', 'svc',		//local / app specific directives and services (anything that can be used across apps should be added to an external directive or service library such as angular-ui, angular-lib)
'lib',
'UserModelModule'		//todo - clean up and make part of a "models" & localstorage service?
]).
config(['$routeProvider', '$locationProvider', 'LGlobalsProvider', '$compileProvider', function($routeProvider, $locationProvider, LGlobalsProvider, $compileProvider) {
	/**
	setup - whitelist, appPath, html5Mode
	@toc 1.
	*/
	$compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|content|geo|http?):/);		//otherwise ng-href links don't work on Android within TriggerIO: http://stackoverflow.com/questions/16130902/angular-js-and-trigger-io-cant-follow-a-link-on-android-that-works-on-ios
	
	var appPath =LGlobalsProvider.dirPaths.appPath;
	var staticPath = LGlobalsProvider.dirPaths.staticPath;

	//handle browsers with no html5 history api (AND Android <3 which checks as true but doesn't really fully support it..)
	var appPathRoute =appPath;
	var html5History =!!(window.history && window.history.pushState);		//actual check
	//android / browser sniffer 2nd check
	var ua = navigator.userAgent;
	if(typeof(globalPhoneGap) !="undefined" && globalPhoneGap ===true) {
		html5History =false;
	}
	else if( ua.indexOf("Android") >= 0 )
	{
		var androidversion = parseFloat(ua.slice(ua.indexOf("Android")+8));
		if (androidversion < 3)
		{
			html5History =false;
		}
	}
	// html5History =false;		//TESTING		//update: TriggerIO does NOT seem to work with html5 history so have to disable it..
	if(html5History) {
		$locationProvider.html5Mode(true);		//un comment this to use HTML5 History API (better BUT note that server must be configured to auto-redirect all requests to /index.html since this will create url paths that don't actually exist file-wise so I default it to off for initial testing / setup until server is configured properly to handle this)
	}
	else {		//update for route matching and forming
		appPathRoute ='/';
		LGlobalsProvider.dirPaths.appPathLink =LGlobalsProvider.dirPaths.appPathLink+"#/";
		LGlobalsProvider.dirPaths.appPathLocation ='';
	}
	
	var pagesPath =staticPath+'modules/pages/';

	
	/**
	Generic / common routes
	@toc 2.
	*/
	/*
	$routeProvider.when(appPathRoute+'home', {templateUrl: pagesPath+'home/home.html',
		resolve: {
			auth: function(svcAuth) {
				return svcAuth.checkSess({'noLoginRequired':true});
			}
		}
	});
	*/
	$routeProvider.when(appPathRoute+'home', {redirectTo: appPathRoute+'test'});
	
	$routeProvider.when(appPathRoute+'login', {templateUrl: pagesPath+'login/login.html',
		resolve: {
			auth: function(svcAuth) {
				return svcAuth.checkSess({'noLoginRequired':true});
			}
		}
	});
	$routeProvider.when(appPathRoute+'logout', {templateUrl: pagesPath+'logout/logout.html',
		resolve: {
			auth: function(svcAuth) {
				return svcAuth.checkSess({'noLoginRequired':true});
			}
		}
	});
	$routeProvider.when(appPathRoute+'password-reset', {templateUrl: pagesPath+'passwordReset/password-reset.html',
		resolve: {
			auth: function(svcAuth) {
				return svcAuth.checkSess({'noLoginRequired':true});
			}
		}
	});
	
	// $routeProvider.when(appPathRoute+'test', {templateUrl: pagesPath+'test/test.html'});
	$routeProvider.when(appPathRoute+'test', {templateUrl: pagesPath+'test/test.html',
		resolve: {
			auth: function(svcAuth) {
				return svcAuth.checkSess({noLoginRequired:true});
			}
		}
	});

	
	/**
	site-specific routes
	@toc 3.
	*/

	/**
	catch-all 'otherwise' route
	@toc 4.
	*/
	$routeProvider.otherwise({redirectTo: appPathRoute+'home'});
	
}]);