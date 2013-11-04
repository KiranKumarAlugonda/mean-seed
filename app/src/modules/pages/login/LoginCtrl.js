/**
@module ang-login
@class ang-login
@toc
//1. $scope.fbLogin
//2. $scope.googleLogin
*/

'use strict';

//function LoginCtrl($scope, svcHttp, LFBLogin, UserModel, LGlobals, $rootScope) {
angular.module('myApp').controller('LoginCtrl', ['$scope', 'svcHttp', 'UserModel', 'LGlobals', '$rootScope', 'svcSocialAuth',
function($scope, svcHttp, UserModel, LGlobals, $rootScope, svcSocialAuth) {
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
			var vals ={
				type: 'facebook',
				user: {},
				socialData: {
					id: data.facebook_id,
					token: data.access_token
				}
			};
			if(data.email) {
				vals.user.email =data.email;
			}
			var promise1 =svcHttp.go({}, {url:'auth/socialLogin', data:vals}, {}, {});
			promise1.then(function(response) {
				var user =response.result.user;
				UserModel.save(user);
				$rootScope.$broadcast('loginEvt', {'loggedIn': true, 'sess_id':user.sess_id, 'user_id':user._id});
			});
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
			var vals ={
				type: 'google',
				user: {},
				socialData: {
					id: data.google_id,
					token: data.access_token
				}
			};
			if(data.email) {
				vals.user.email =data.email;
			}
			var promise1 =svcHttp.go({}, {url:'auth/socialLogin', data:vals}, {}, {});
			promise1.then(function(response) {
				var user =response.result.user;
				UserModel.save(user);
				$rootScope.$broadcast('loginEvt', {'loggedIn': true, 'sess_id':user.sess_id, 'user_id':user._id});
			});
		}, function(data) {
			var dummy =1;
		});
	};

}]);