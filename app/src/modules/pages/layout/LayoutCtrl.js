/**
This controller is the main controller set on the <body> tag so is thus the parent controller for all other controllers in the app. So all other controllers inherit $scope properities defined here - notably: $scope.appPath, $scope.appPathLink, $scope.appPathLocation, $scope.appTitle.

There's 3 main div elements on the page: 1. header, 2. content, 3. footer

The "pages" array defines the pages and is used to set the layout and top level classes to apply to a given page using $scope.classes

@module ang-layout
@main ang-layout
@class ang-layout
*/

'use strict';

angular.module('myApp').controller('LayoutCtrl', ['$scope', 'libResize', 'LGlobals', '$location', 'libCookie', '$rootScope', 'libAngular', 'svcAuth', '$timeout',
 function($scope, libResize, LGlobals, $location, libCookie, $rootScope, libAngular, svcAuth, $timeout) {
	/**
	Most common and default use of appPath, which is set from LGlobals and is used to allow using absolute paths for ng-include and all other file structure / path references
	@property $scope.appPath
	@type String
	*/
	$scope.appPath =LGlobals.dirPaths.appPath;		//so all children can access this without having to set it in each one
	
	/**
	For use in <a ng-href=''> </a> tags in HTML partial files
	@property $scope.appPathLink
	@type String
	*/
	$scope.appPathLink =LGlobals.dirPaths.appPathLink;
	
	/**
	For use with $location.url(..) in javascript controller files
	@property $scope.appPathLocation
	@type String
	*/
	$scope.appPathLocation =LGlobals.dirPaths.appPathLocation;
	
	/**
	For use with displaying images that are located in the common/img folder (where all images should be) inside <img> tags in the HTML/partial. This is so all children controllers/partials (which is every one since LayoutCtrl is the parent controller to everything) can access this without having to set it in each one.
	@property $scope.appPathImg
	@type String
	@usage <img ng-src='{{appPathImg}}/ie-chrome-logo.png' />		<!-- assumes there's an image file named 'ie-chrome-logo.png' in the common/img folder -->
	*/
	$scope.appPathImg =LGlobals.dirPaths.appPath+'src/common/img';
	
	/**
	For use in referencing static files like partials
	@property $scope.staticPath
	@type String
	**/
	$scope.staticPath = LGlobals.dirPaths.staticPath;
	
	/**
	For use in referencing pages folders like partials
	@property $scope.pagesFullPath
	@type String
	**/
	$scope.pagesFullPath = LGlobals.dirPaths.staticPath+LGlobals.dirPaths.pagesPath;
	
	/**
	Stores the title of the application (as set in LGlobals) - can be used in (any) HTML partial files or javascript controller files
	@property $scope.appTitle
	@type String
	*/
	$scope.appTitle =LGlobals.info.appTitle;

	$scope.ids ={'header':'header', 'content':'content', 'footer':'footer'};
	/**
	Classes that will be applied to <body> tag and ids.content main page div in index.html - can be used to change layout and style based on the current page
	@property $scope.classes
	@type Object
	*/
	$scope.classes ={'loggedIn':'logged-out' , 'layout':'layout-login'};

	/**
	Used to dynamically set the min-height for the main content div element so the footer is always at the bottom of the page
	@property $scope.contentMinHeight
	@type Number
	*/
	$scope.contentMinHeight =0;
	

	/**
	Handles post login (or reverse for logout)
	- sets LGlobals.state.loggedIn
	- sets $scope.classes.loggedIn
	- sets (or clears for logout) cookies for session and user
	- redirects to the appropriate page if need be
	@method $scope.$on('loginEvt',..
	@param {Object} params
		@param {Boolean} [loggedIn] true if logged in
		@param {String} [sess_id] session id
		@param {String} [user_id] user id key
		@param {Boolean} [noRedirect] true to not change/page location
	*/
	$scope.$on('loginEvt', function(evt, params) {
		var appPath1 =LGlobals.dirPaths.appPath;
		//strip slashes for matching to ensure no single character mismatch issues
		var locPathMatch =$location.path().replace(/^[//]+/g, '');
		var appPath1Match =appPath1.replace(/^[//]/g, '');
		if(params.loggedIn) {
			$scope.classes.loggedIn ='logged-in';
			LGlobals.state.loggedIn =true;
			if(params.sess_id !==undefined) {
				libCookie.set('sess_id', params.sess_id, 1, {});
			}
			if(params.user_id !==undefined) {
				libCookie.set('user_id', params.user_id, 1, {});
			}
			if(params.noRedirect ===undefined || !params.noRedirect || (params.loggedIn && (locPathMatch ==appPath1Match+'login' || locPathMatch ==appPath1Match+'password-reset') ) ) {
				var page ='home';
				var redirect =false;
				if(svcAuth.data.redirectUrl) {
				//if(0) {
					if(svcAuth.data.redirectUrl.indexOf('login') <0 && svcAuth.data.redirectUrl.indexOf('password-reset') <0) {		//prevent infinite loop //UPDATE: android appends weird stuff in front so can't do exact match..
						page =svcAuth.data.redirectUrl;
						redirect =true;
					}
					svcAuth.data.redirectUrl =false;		//reset for next time
					libCookie.clear('redirectUrl', {});
				}
				//ensure page refreshes by adding param to end
				var ppAdd ='refresh=1';
				if(page.indexOf('?') >-1) {
					ppAdd ='&'+ppAdd;
				}
				else {
					ppAdd ='?'+ppAdd;
				}
				$location.url(LGlobals.dirPaths.appPathLocation+page+ppAdd);
			}
		}
		else {
			$scope.classes.loggedIn ='logged-out';
			LGlobals.state.loggedIn =false;
			if(params.noRedirect ===undefined || !params.noRedirect || (params.loggedIn && (locPathMatch ==appPath1Match+'login' || locPathMatch ==appPath1Match+'password-reset') ) ) {
				$location.url(LGlobals.dirPaths.appPathLocation+"home");
			}
		}
	});

	/*
	@param classPage =string of class to give to this page (i.e. 'main', 'product-rec', ..)
	*/
	$scope.$on('changeLayoutEvt', function(evt, classPage) {
		if(classPage) {
			$scope.classes.layout =classPage;
		}
		resize({'otherHeightEleIds':[$scope.ids.header, $scope.ids.content, $scope.ids.footer], 'minHeightEleId':$scope.ids.content});
	});

	//ensure footer is always below scroll line (i.e. on each resize)
	var evtName ="resizeFooterEvt";
	libResize.addCallback('footerResize', {'evtName':evtName, 'args':[]}, {});

	$scope.$on(evtName, function(evt) {
		resize({'otherHeightEleIds':[$scope.ids.header, $scope.ids.content, $scope.ids.footer], 'minHeightEleId':$scope.ids.content});
	});

	/**
	@method resize
	@param {Object} params
		@param {Array} otherHeightEleIds other ids on page that's used to figure out height / where top of footer should be
			NOTE: if footer id is removed from this list, then footer will start just below scroll line (which may be preferable in some cases, especially for taller footers)
		@param {String} minHeightEleId id of which element to set min-height to - to ensure footer is also below scroll line
	*/
	function resize(params) {
		if(document.getElementById(params.minHeightEleId)) {	//only run if page has loaded and elements exist
			//var totHeight =$(window).height();
			var totHeight =window.innerHeight;
			var nonFooterHeight =0;
			for(var ii=0; ii<params.otherHeightEleIds.length; ii++)
			{
				var curId =params.otherHeightEleIds[ii];
				if(curId !=params.minHeightEleId && document.getElementById(curId)) {
					//nonFooterHeight +=$("#"+curId).height();
					nonFooterHeight +=document.getElementById(curId).offsetHeight;
				}
			}
			//account for padding/margin of content element
			//@todo - remove jQuery.. but not sure how to reliably get padding & margin cross browser otherwise..
			var ele =$('#'+params.minHeightEleId);
			var marginPaddingHeight =ele.outerHeight() -ele.height();
			
			$scope.contentMinHeight =totHeight-nonFooterHeight -marginPaddingHeight;
			//$("#"+params.minHeightEleId).css({'min-height':$scope.contentMinHeight+"px"});
			document.getElementById(params.minHeightEleId).style.minHeight =$scope.contentMinHeight+"px";
			$scope.$broadcast('footerResize', $scope.contentMinHeight);		//broadcast in case any children elements want to set the min-height to this as well (since height 100% isn't really working... too tall sometimes..)
		}
	}

	//init
	var promise =libAngular.scopeLoaded({'idEle':$scope.ids.content});
	promise.then(function() {
		resize({'otherHeightEleIds':[$scope.ids.header, $scope.ids.content, $scope.ids.footer], 'minHeightEleId':$scope.ids.content});		//init min-height
	});
}]);