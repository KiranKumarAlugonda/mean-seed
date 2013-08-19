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
	
	$scope.slides =[
		{
			image: 'http://placekitten.com/200/200',
			text: 'cat 1'
		},
		{
			image: 'http://placekitten.com/210/200',
			text: 'cat 2'
		},
		{
			image: 'http://placekitten.com/200/215',
			text: 'cat 3'
		}
	];
	
	$scope.optsCarousel ={
		curSlide: 0
	};
	
	function changeSlide() {
		$timeout(function() {
			if($scope.optsCarousel.curSlide >=($scope.slides.length-1)) {
				$scope.optsCarousel.curSlide =0;
			}
			else {
				$scope.optsCarousel.curSlide++;
			}
			changeSlide();		//call itself
		}, 2000);
	}
	
	changeSlide();
}]);