'use strict';

describe('HeaderCtrl', function(){
	var ctrl, scope ={}, svcConfig;

	/*
	beforeEach(function(){
		headerCtrl = new HeaderCtrl(scope);
	});
	*/
	
	beforeEach(module('myApp'));
	beforeEach(module('svc'));
	
	beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, _svcConfig_) {
		/*
		$httpBackend = _$httpBackend_;
		$httpBackend.expectGET('phones/phones.json').
				respond([{name: 'Nexus S'}, {name: 'Motorola DROID'}]);
		*/
		
		svcConfig =_svcConfig_;
		scope = $rootScope.$new();
		ctrl = $controller('HeaderCtrl', {$scope: scope});
		
		//ctrl =new HeaderCtrl(scope);		//this does NOT work - gives a "cannot call method findArrayIndex of undefined"..
	}));
	
	it('should start with user logged out', function() {
		expect(svcConfig.state.loggedIn).toBe(false);
	});
});