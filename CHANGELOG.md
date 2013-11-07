# 0.8.1
## Breaking Changes
- `LGlobals` service renamed to `svcConfig` and is a child of the `svc` module now
- `UserModel` service moved into `models` folder and is a child of the `models` module now
- (grouped) modules now declared in `app.js` (`dtv.js`, `svc.js` files removed)
- moved/modularized login and signup to their own pages and into directives
	- also made socialAuth directive

## Features
- svcHttp
	- Added `suppressErrorAlert` parameter to svcHttp.go call and used it for logout call so it doesn't show an error message if already logged out
	
## Bug Fixes
- facebook: added the facebook JS SDK file back in and updated angular-facebook-auth so FB login and signup works now. NOTE: this is a HUGE (170kb minified!) file so if you're NOT using Facebook, definitely REMOVE this file (from `buildfilesModules.json`)!
- google: added the google api JS file in and updated angular-google-auth so google login and signup works now.
- added in default 'testing' facebook and google api keys so facebook and google should work by default on localhost (will not work outside of localhost!)
	- NOTE: you should replace these keys (in `config.json`) to your own (you'll likely need one per domain)
- NOTE: `main-min.js` jumped up to around 400kb in size because of this - facebook (170kb) and google (33kb) comprise over 200kb (about half!) of this - mostly facebook!

	
# 0.8.0
## Breaking Changes
- Refactor Part 2: build process
	- updated to grunt-buildfiles v0.3.0 which includes a replacement/upgrade from `buildfilesList.js` to `buildfilesModules.json` and `buildfilesModuleGroups.json` for much more flexibility and modularity in defining builds.
		- Much easier to add or remove modules
		- External / 3rd party code can now be minified/uglified if it was not already - this lead to a (small) code size reduction so the total between ALL code (css, js, html templates) is under 300kb minified!
	- moved LESS to be built via grunt/buildfiles rather than `@import` directly in LESS files (`_base.less` is now generated from `_base-grunt.less`)


# 0.7.0

## Features
- Refactor Part 1: MODULARIZATION / BOWER DEPDENCIES, CODE SIZE REDUCTION! (see below for more)
	- removed Angular-UI and Angular-Lib (large libraries) and switched to more modularized approach where individual modules (directives and services) are added only AS NEEDED
	- jQuery removed completely (though jqLite built into AngularJS is still available of course)
	- in total, this has cut the javascript code size in HALF - now it's under 220kb minified!
	- NOTE: other new/converted modules can be found here: https://github.com/jackrabbitsgroup and just check <a href='http://sindresorhus.com/bower-components/'>bower components</a> in general and add modules as needed.
		- these are no longer included by default; add the ones you need if/when you need them and avoid the code bloat of having un-used modules/libraries
	
		
## Bug Fixes
- new angular-forminput directive fixes/removes `libAngular.formValid()` requirement on form submit so you no longer need this

## Breaking Changes
- MANY - the frontend has been refactored to be more modularized
	- removed modules / libraries
		- jQuery (just using jqLite built into AngularJS)
		- Angular-UI
		- Angular-lib
	- new, select/core Bower modules in place of old `ui` and `lib`
		- services
			- angular-string
			- angular-array
			- angular-facebook-auth
			- angular-google-auth
		- directives
			- angular-forminput
		- others
			- ngCookies

			

# 0.1.0

## Features
- update to AngularJS 1.2.0-rc.3
	- update / add in modularized angular packages (add to `buildfilesList.js` and to `app.js`)
		- ngSanitize
			- ng-bind-html-unsafe changed to ng-bind-html
		- ngRoute
		- ngMobile to ngTouch
		- ngAnimate
	- change $compileProvider.urlSanitizationWhitelist to $compileProvider.aHrefSanitizationWhitelist
	- add back in libAngular.formValid function since form .$valid not working again.. need to update/fix forminput directive?
- add bower frontend package/module management
	- convert the following to now be from bower
		- angular
		
## Bug Fixes

## Breaking Changes
- all form (js controller) `.$valid` checks must have `libAngular.formValid()` in addition/instead since `.$valid` will ALWAYS be false..
	- before:
	```
	if($scope.signupForm.$valid) {
		...
	}
	```
	
	- after:
	```
	if($scope.signupForm.$valid || libAngular.formValid($scope.signupForm, {})) {
		...
	}
	```
