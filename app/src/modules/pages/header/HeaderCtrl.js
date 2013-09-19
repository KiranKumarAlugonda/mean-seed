/**
@module ang-layout
@class ang-header
*/

'use strict';

angular.module('myApp').controller('HeaderCtrl', ['$scope', 'svcNav', function($scope, svcNav) {
	$scope.nav ={};
	
	$scope.classes ={
		cont: ''
	};
	
	/**
	@method setNav
	*/
	function setNav(nav, params) {
		if(nav !==undefined && nav) {		//avoid errors (on init??)
			$scope.nav =nav;
			if($scope.nav.classes !==undefined && $scope.nav.classes.cont !==undefined && $scope.nav.classes.cont =='hidden') {
				$scope.classes.cont =$scope.nav.classes.cont;
			}
			else {
				$scope.classes.cont ='';		//reset to default
			}
		}
	}
	
	/**
	@param {Object} params
		@param {Object} nav
	*/
	$scope.$on('svcNavHeaderUpdate', function(evt, params) {
		setNav(params.nav.header, {});
	});
	
	//init (since first load the $scope.$on may not be called)
	var nav =svcNav.getNav({});
	setNav(nav.header, {});
	
}]);