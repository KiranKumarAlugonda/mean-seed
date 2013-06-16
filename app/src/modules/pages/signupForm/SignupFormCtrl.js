/**
@module ang-login
@class ang-signup-form
*/

'use strict';

angular.module('myApp').controller('SignupFormCtrl', ['$scope', 'LGlobals', '$rootScope', 'UserModel', 'svcHttp', function($scope, LGlobals, $rootScope, UserModel, svcHttp) {
	$scope.formVals = {};
	
	/**
	@method $scope.submitForm
	*/
	$scope.submitForm =function() {
		if($scope.signupForm.$valid) {
			if($scope.formVals.password_confirm ==$scope.formVals.password) {
				$scope.$emit('evtAppalertAlert', {close:true});		//clear existing messages

				var vals ={
					email: $scope.formVals.email,
					password: $scope.formVals.password,
					password_confirm: $scope.formVals.password_confirm
				};
				//break into first & last name - @todo have the backend handle this and be able to take full names
				var name =$scope.formVals.name.split(' ');
				vals.first_name =name[0];
				vals.last_name =name[1];
				
				if($scope.formVals.phone_number) {
					vals.phone ={
						area_code: '',
						number: $scope.formVals.phone_number,
						confirmed: 0,
						primary: 1
					};
				}
				
				var promise1 =svcHttp.go({method:'Auth.create'}, {data:vals}, {});
				promise1.then(function(response) {
					var user =response.result.user;
					UserModel.save(user);
					$rootScope.$broadcast('loginEvt', {'loggedIn': true, 'sess_id':user.sess_id, 'user_id':user._id});
				});
			}
			else {
				$scope.$emit('evtAppalertAlert', {type:'error', msg:'Passwords must match'});
			}
		}
	};
}]);