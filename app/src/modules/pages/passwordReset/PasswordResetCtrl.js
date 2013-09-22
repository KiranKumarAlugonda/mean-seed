/**
@module ang-login
@class ang-password-reset
*/

'use strict';

angular.module('myApp').controller('PasswordResetCtrl', ['$scope', 'LGlobals', '$routeParams', '$location', 'svcHttp', 'libAngular', 'UserModel', function($scope, LGlobals, $routeParams, $location, svcHttp, libAngular, UserModel) {
	$scope.formVals = {};
	
	//see if email and/or password reset key is set in url
	if($routeParams.reset_key !==undefined) {
		$scope.formVals.password_reset_key =$routeParams.reset_key;
	}
	if($routeParams.email !==undefined) {
		$scope.formVals.email =$routeParams.email;
	}
	
	/**
	@method $scope.submitForm
	*/
	$scope.submitForm =function() {
		if(($scope.passResetForm.$valid || libAngular.formValid($scope.passResetForm, {})) && $scope.formVals.password ==$scope.formVals.password_confirm) {
			$scope.$emit('evtAppalertAlert', {close:true});		//clear existing messages
			
			$scope.formVals.reset_key =$scope.formVals.password_reset_key;
			var promise =svcHttp.go({}, {url:'auth/resetPassword', data:$scope.formVals}, {});
			promise.then(function(response) {
				// $location.url(LGlobals.dirPaths.appPathLocation+"home");
				var user =response.result.user;
				UserModel.save(user);
				$scope.$emit('loginEvt', {'loggedIn': true, 'sess_id':user.sess_id, 'user_id':user._id});
			});
		}
		else {
			$scope.$emit('evtAppalertAlert', {type:'error', msg:'Password must be at least 6 characters and passwords must match'});
		}
	};
	
}]);