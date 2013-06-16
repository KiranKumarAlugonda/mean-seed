'use strict';

describe('SignupFormCtrl', function(){
	var ctrl, scope ={};

	beforeEach(module('myApp'));
	beforeEach(module('LGlobalsModule'));		//all need LGlobals for LGlobals provider in app.js
	beforeEach(module('lib'));
	beforeEach(module('UserModelModule'));
	
	beforeEach(inject(function($rootScope, $controller) {
		scope = $rootScope.$new();
		ctrl = $controller('SignupFormCtrl', {$scope: scope});
	}));

	it('should ...', function() {
	});
});