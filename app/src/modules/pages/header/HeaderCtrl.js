/**
@module ang-layout
@class ang-header
*/

'use strict';

angular.module('myApp').controller('HeaderCtrl', ['$scope', 'svcNav', function($scope, svcNav) {
	$scope.nav ={};
	
	/**
	@param {Object} params
		@param {Object} nav
	*/
	$scope.$on('svcNavHeaderUpdate', function(evt, params) {
		$scope.nav =params.nav.header;
	});
	
	//init (since first load the $scope.$on may not be called)
	var nav =svcNav.getNav({});
	$scope.nav =nav.header;
}]);