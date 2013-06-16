'use strict';

describe('LoginSignupCtrl', function(){
	var ctrl, scope ={};

	beforeEach(module('myApp'));
	beforeEach(module('LGlobalsModule'));		//all need LGlobals for LGlobals provider in app.js
	beforeEach(module('lib'));
	
	beforeEach(inject(function($rootScope, $controller) {
		scope = $rootScope.$new();
		ctrl = $controller('LoginSignupCtrl', {$scope: scope});
	}));

	it('should start with login part visible', function() {
		expect(scope.loginPartVisible).toBe(true);
	});
});