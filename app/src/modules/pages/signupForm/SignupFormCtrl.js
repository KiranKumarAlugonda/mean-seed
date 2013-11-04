/**
@module ang-login
@class ang-signup-form
*/

'use strict';

angular.module('myApp').controller('SignupFormCtrl', ['$scope', 'LGlobals', '$rootScope', 'UserModel', 'svcHttp',
function($scope, LGlobals, $rootScope, UserModel, svcHttp) {
	$scope.formVals = {};
	
	/**
	@method $scope.submitForm
	*/
	$scope.submitForm =function() {
		if($scope.signupForm.$valid) {
			if($scope.formVals.password_confirm !=$scope.formVals.password) {
				$scope.$emit('evtAppalertAlert', {type:'error', msg:'Passwords must match'});
			}
			else if($scope.formVals.name.indexOf(' ') <0) {
				$scope.$emit('evtAppalertAlert', {type:'error', msg:'Must enter a first and last name'});
			}
			else {
				var valid =true;
				$scope.$emit('evtAppalertAlert', {close:true});		//clear existing messages

				var vals ={
					email: $scope.formVals.email,
					password: $scope.formVals.password,
					password_confirm: $scope.formVals.password_confirm
				};
				//break into first & last name
				var minNameLength =2;
				//this isn't good enough since could have more than one space
				// var name =$scope.formVals.name.split(' ');
				// vals.first_name =name[0];
				// vals.last_name =name[1];
				
				var posSpace =$scope.formVals.name.indexOf(' ');		//we already know it has to have at least one space to get this far so don't have to check again here
				//put everything after first space as last name and remove leading and trailing whitespace from both first and last names
				vals.first_name =$scope.formVals.name.slice(0, posSpace).trim();
				vals.last_name =$scope.formVals.name.slice((posSpace+1), $scope.formVals.name.length).trim();
				
				if(vals.first_name.length <minNameLength || vals.last_name.length <minNameLength) {
					$scope.$emit('evtAppalertAlert', {type:'error', msg:'Must enter a first and last name of at least '+minNameLength+' characters each'});
					valid =false;
				}
				
				if($scope.formVals.phone_number) {
					vals.phone ={
						area_code: '',
						number: $scope.formVals.phone_number,
						confirmed: 0,
						primary: 1
					};
				}
				
				if(valid) {
					var promise1 =svcHttp.go({}, {url:'auth/create', data:vals}, {});
					promise1.then(function(response) {
						var user =response.result.user;
						UserModel.save(user);
						$rootScope.$broadcast('loginEvt', {'loggedIn': true, 'sess_id':user.sess_id, 'user_id':user._id});
					});
				}
			}
		}
	};
}]);