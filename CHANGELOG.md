Version numbers correspond to `package.json` version (bower.json and config.json files are NOT necessarily in sync)

# 0.1.0
- update to AngularJS 1.2.0-rc.3
	- update / add in modularized angular packages (add to `buildfilesList.js` and to `app.js`)
		- ngSanitize
			- ng-bind-html-unsafe to ng-bind-html
		- ngRoute
		- ngMobile to ngTouch
		- ngAnimate
	- change $compileProvider.urlSanitizationWhitelist to $compileProvider.aHrefSanitizationWhitelist
	- add back in libAngular.formValid function since form .$valid not working again.. need to update/fix forminput directive?
- add bower frontend package/module management
	- convert the following to be from bower
		- angular