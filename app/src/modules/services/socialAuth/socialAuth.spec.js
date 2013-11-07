//@todo
'use strict';

describe('svcSocialAuth', function(){
	var ctrl, scope ={}, $httpBackend, svcHttp, svcAuth, svcConfig, UserModel;

    beforeEach(module('svc'));
	
	beforeEach(inject(function($rootScope, $controller, $injector, _svcHttp_, _svcAuth_, _svcConfig_, _UserModel_) {
		svcHttp =_svcHttp_;
		svcAuth =_svcAuth_;
		svcConfig =_svcConfig_;
		UserModel =_UserModel_;
		$httpBackend = $injector.get('$httpBackend');
		
		scope = $rootScope.$new();
	}));

	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

});

