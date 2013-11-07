/**
*/

'use strict';

angular.module('myApp').controller('SignupCtrl', ['$scope', 'svcHttp', 'UserModel', '$rootScope', function($scope, svcHttp, UserModel, $rootScope) {
	
	/**
	@method $scope.signup
	@param {Object} params
		@param {Object} vals The form input values to signup with
	@param {Function} callback
	*/
	$scope.signup =function(params, callback) {
		var promise1 =svcHttp.go({}, {url:'auth/create', data:params.vals}, {});
		promise1.then(function(response) {
			var user =response.result.user;
			UserModel.save(user);
			$rootScope.$broadcast('loginEvt', {'loggedIn': true, 'sess_id':user.sess_id, 'user_id':user._id});
			callback({});
		});
	};

}]);