'use strict';

angular.module('myApp').controller('TestCtrl', ['$scope', '$timeout', 'svcHttp', 'UserModel', 'LGlobals', '$location', function($scope, $timeout, svcHttp, UserModel, LGlobals, $location) {
	$scope.formVals ={
	};
	
	$scope.ngModelDatetimepicker ='';
	$scope.optsDatetimepicker ={
		pikaday: {
			//firstDay: 1,		//start on Monday
			showTime: true		//show timepicker as well
		}
	};
}]);