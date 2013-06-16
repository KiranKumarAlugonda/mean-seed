/**
@module ang-login
@class ang-logout
*/

'use strict';

angular.module('myApp').controller('LogoutCtrl', ['$scope', 'LGlobals', '$location', 'libCookie', 'svcHttp', 'UserModel', '$rootScope', 'svcStorage', function($scope, LGlobals, $location, libCookie, svcHttp, UserModel, $rootScope, svcStorage) {
	var user =UserModel.load();
	var sessId =libCookie.get('sess_id', {});
	
	var promise1 =svcHttp.go({}, {url: 'auth/logout', data: {user_id:user._id, sess_id:sessId}}, {});
	promise1.then( function(data) {
		clearData({});
		$rootScope.$broadcast('loginEvt', {'loggedIn':false});
		//$location.url(LGlobals.dirPaths.appPathLocation+"login");
	}, function(data) {
		clearData({});
		//logout anyway..
		$rootScope.$broadcast('loginEvt', {'loggedIn':false});
		//$location.url(LGlobals.dirPaths.appPathLocation+"login");
	});
	
	function clearData(params) {
		libCookie.clear('sess_id', {});
		libCookie.clear('user_id', {});
		UserModel.destroy();
		svcStorage.delete1();
		// svcStorage.delete1('user');		//the above wasn't working..
	}
}]);