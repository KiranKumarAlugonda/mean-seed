'use strict';

describe('svcHttp', function(){
	var ctrl, scope ={}, $httpBackend, svcHttp;

	beforeEach(module('ngCookies'));
    beforeEach(module('svc'));
	
	beforeEach(inject(function($rootScope, $controller, $injector, _svcHttp_) {
		svcHttp =_svcHttp_;
		$httpBackend = $injector.get('$httpBackend');
		
		scope = $rootScope.$new();
	}));

	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	it('should login a user', function() {
		// $httpBackend.expectPOST('/api/auth/');
		// $httpBackend.when('POST', '/api/auth/').respond({result: true});
		// $httpBackend.when('POST', '/api/auth/').respond({ error:{code:500, msg:'bad request'} });
		$httpBackend.expectPOST('/api/auth/login').respond({result: true});
		// scope.$apply();

		var user;
		var loginVals ={
			email: 't@t.com',
			password: 'testing'
		};
		// var promise1 =svcHttp.go({method:'Auth.login'}, {data:loginVals}, {});
		var promise1 =svcHttp.go({}, {url:'auth/login', data:loginVals}, {});
		promise1.then(function(response) {
			user =response.result;
		});
		
		/*
		//@todo - can events be tested??
		var evt =false;
		scope.$on('evtAppalertAlert', function(evt, opts) {
			evt =true;
		});
		*/

		$httpBackend.flush();
		scope.$apply();
		scope.$digest();
		expect(user).toBe(true);
		//expect(user).not.toBeDefined();
		//expect(evt).toBe(true);
	});
});

