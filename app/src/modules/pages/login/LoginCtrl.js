/**
@module ang-login
@class ang-login
@toc
//1. $scope.fbLogin
//2. $scope.googleLogin
*/

'use strict';

//function LoginCtrl($scope, svcHttp, LFBLogin, UserModel, LGlobals, $rootScope) {
angular.module('myApp').controller('LoginCtrl', ['$scope', 'svcHttp', 'UserModel', 'LGlobals', '$rootScope', 'svcSocialAuth', 'libFacebookAuth', 'libGoogleAuth', function($scope, svcHttp, UserModel, LGlobals, $rootScope, svcSocialAuth, libFacebookAuth, libGoogleAuth) {
	/**
	@property $scope.signupVisible
	@type Boolean
	*/
	$scope.signupVisible =false;
	
	/**
	Facebook login handling (in LoginCtrl which is PARENT of LoginFormCtrl and SignupFormCtrl so can use this function for BOTH login and sign up)
	@toc 1.
	@method $scope.fbLogin
	*/
	$scope.fbLogin =function() {
		var promise =svcSocialAuth.checkAuthFacebook({});
		promise.then(function(data) {
			console.log(data.facebook_id);
			var dummy =1;
			//@todo
			/*
			var url =LGlobals.dirPaths.ajaxUrl.api+"user/loginFB";
			var promise =LHttp.query({'method':'jsonp', 'url':url, 'params':vals });
			promise.then( function(response) {
				var data =response.data;
				UserModel.save(data.user);
				$rootScope.$broadcast('loginEvt', {'loggedIn': true, 'sess_id':data.sess.sess_id, 'user_id':data.sess.user});
			});
			*/
		}, function(data) {
			var dummy =1;
		});
	};
	
	
	/**
	Google login handling (in LoginCtrl which is PARENT of LoginFormCtrl and SignupFormCtrl so can use this function for BOTH login and sign up)
	@toc 2.
	@method $scope.googleLogin
	*/
	$scope.googleLogin =function() {
		var promise =svcSocialAuth.checkAuthGoogle({});
		promise.then(function(data) {
			var vals =data;
			//@todo
		}, function(data) {
			var dummy =1;
		});
	};

}]);