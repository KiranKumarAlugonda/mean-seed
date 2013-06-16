'use strict';

describe('HomeCtrl', function(){
	var ctrl, scope ={};

	beforeEach(module('myApp'));
	beforeEach(module('LGlobalsModule'));		//all need LGlobals for LGlobals provider in app.js
	// beforeEach(module('lib'));
	
	beforeEach(inject(function($rootScope, $controller) {
		scope = $rootScope.$new();
		ctrl = $controller('HomeCtrl', {$scope: scope});
	}));

	it('should ...', function() {
	});
});