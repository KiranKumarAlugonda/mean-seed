'use strict';

describe('LoginSignupCtrl', function(){
	var ctrl, scope ={};

	beforeEach(module('myApp'));
	beforeEach(module('svc'));		//all need svcConfig for svcConfig provider in app.js
	
	beforeEach(inject(function($rootScope, $controller) {
		scope = $rootScope.$new();
		ctrl = $controller('LoginSignupCtrl', {$scope: scope});
	}));

	it('should start with login part visible', function() {
		expect(scope.loginPartVisible).toBe(true);
	});
});