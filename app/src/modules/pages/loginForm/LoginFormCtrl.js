/**
@module ang-login
@class ang-login-form
*/

'use strict';

angular.module('myApp').controller('LoginFormCtrl', ['$scope', 'LGlobals', 'svcHttp', '$rootScope', 'UserModel', 'libAngular', '$location', function($scope, LGlobals, svcHttp, $rootScope, UserModel, libAngular, $location) {
	$scope.formVals = {};

	/**
	@method $scope.submitForm
	*/
	$scope.submitForm =function() {
		if($scope.loginForm.$valid || libAngular.formValid($scope.loginForm, {})) {
			$scope.$emit('evtAppalertAlert', {close:true});		//clear existing messages
			
			// var promise1 =svcHttp.go({method:'Auth.login'}, {data:$scope.formVals}, {});
			var promise1 =svcHttp.go({}, {url:'auth/login', data:$scope.formVals}, {});
			promise1.then(function(response) {
				var user =response.result.user;
				UserModel.save(user);
				$rootScope.$broadcast('loginEvt', {'loggedIn': true, 'sess_id':user.sess_id, 'user_id':user._id});
			});
		}
	};
	
	/**
	@property $scope.forgotPassVisible
	@type Boolean
	*/
	$scope.forgotPassVisible =false;
	/**
	@method $scope.forgotPass
	*/
	$scope.forgotPass =function(params) {
		$scope.forgotPassVisible =true;
		//if($scope.loginForm.email.$valid) {		//doesn't work with new form directive..
		if($scope.formVals.email !==undefined && $scope.formVals.email.length >1) {
			var promise =svcHttp.go({method:'Auth.forgotPassword'}, {data: {email:$scope.formVals.email} }, {});
			promise.then(function(response) {
				$location.url(LGlobals.dirPaths.appPathLocation+"password-reset");
			});
		}
		else {
			$scope.$emit('evtAppalertAlert', {type:'error', msg:'Enter your email above to reset your password'});
		}
	};
	
	/**
	@method $scope.toggleForgotPass
	*/
	$scope.toggleForgotPass =function(params) {
		if($scope.forgotPassVisible) {
			$scope.$emit('evtAppalertAlert', {close:true});		//clear existing messages
		}
		$scope.forgotPassVisible =!$scope.forgotPassVisible;
	};
}]);