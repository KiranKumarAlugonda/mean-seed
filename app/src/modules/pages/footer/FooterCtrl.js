/**
@module ang-layout
@class ang-footer
*/

'use strict';

angular.module('myApp').controller('FooterCtrl', ['$scope', 'svcNav', function($scope, svcNav) {
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
	$scope.$on('svcNavFooterUpdate', function(evt, params) {
		setNav(params.nav.footer, {});
	});
	
	//init (since first load the $scope.$on may not be called)
	var nav =svcNav.getNav({});
	setNav(nav.footer, {});
	
}]);