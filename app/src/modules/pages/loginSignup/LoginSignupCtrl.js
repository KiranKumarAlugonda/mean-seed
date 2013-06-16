/**
@module ang-login
@main ang-login
@class ang-login-signup
*/

'use strict';

angular.module('myApp').controller('LoginSignupCtrl', ['$scope', function($scope) {
	/**
	@property $scope.loginPartVisible
	@type Boolean
	*/
	$scope.loginPartVisible =true;		//start with login visible
	/**
	@property $scope.signupPartVisible
	@type Boolean
	*/
	$scope.signupPartVisible =false;
	
	/**
	@property $scope.loginVisible
	@type Boolean
	*/
	$scope.loginVisible =false;
	/**
	@property $scope.signupVisible
	@type Boolean
	*/
	$scope.signupVisible =false;
	
	/**
	@method $scope.showLoginPart
	@param {String} type 'login' or 'signup'
	*/
	$scope.showLoginPart =function(type, params) {
		if(type =='login') {
			$scope.loginPartVisible =true;
			$scope.signupPartVisible =false;
		}
		else if(type =='signup') {
			$scope.signupPartVisible =true;
			$scope.loginPartVisible =false;
		}
	};
}]);