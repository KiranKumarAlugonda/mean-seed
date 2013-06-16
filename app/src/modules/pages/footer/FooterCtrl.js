/**
@module ang-layout
@class ang-footer
*/

'use strict';

angular.module('myApp').controller('FooterCtrl', ['$scope', 'svcNav', function($scope, svcNav) {
	$scope.nav ={};
	
	/**
	@param {Object} params
		@param {Object} nav
	*/
	$scope.$on('svcNavFooterUpdate', function(evt, params) {
		$scope.nav =params.nav.footer;
	});
	
	//init (since first load the $scope.$on may not be called)
	var nav =svcNav.getNav({});
	$scope.nav =nav.footer;
}]);