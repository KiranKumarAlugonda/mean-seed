/**
@module ang-login
@class ang-logout

@toc
1. clearData
*/

'use strict';

angular.module('myApp').controller('LogoutCtrl', ['$scope', '$location', '$cookieStore', 'svcHttp', 'UserModel', '$rootScope', 'svcStorage', function($scope, $location, $cookieStore, svcHttp, UserModel, $rootScope, svcStorage) {
	var user =UserModel.load();
	var sessId =$cookieStore.get('sess_id');
	
	var promise1 =svcHttp.go({}, {url: 'auth/logout', data: {user_id:user._id, sess_id:sessId}}, {suppressErrorAlert:true});
	promise1.then( function(data) {
		clearData({});
		$rootScope.$broadcast('loginEvt', {'loggedIn':false});
	}, function(data) {
		clearData({});
		//logout anyway..
		$rootScope.$broadcast('loginEvt', {'loggedIn':false});
	});
	
	/**
	Clear all (user) data - in javascript memory and localStorage. As more frontend / memory data is added, make sure to clear/destroy them here!
	@toc 1.
	@method clearData
	*/
	function clearData(params) {
		$cookieStore.remove('sess_id');
		$cookieStore.remove('user_id');
		UserModel.destroy();
		svcStorage.delete1();
		// svcStorage.delete1('user');		//the above wasn't working..
	}
}]);