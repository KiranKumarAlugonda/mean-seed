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
