//@todo
'use strict';

describe('svcSocialAuth', function(){
	var ctrl, scope ={}, $httpBackend, svcHttp, svcAuth, LGlobals, UserModel;

    beforeEach(module('svc'));
	beforeEach(module('LGlobalsModule'));
	beforeEach(module('UserModelModule'));
	
	beforeEach(inject(function($rootScope, $controller, $injector, _svcHttp_, _svcAuth_, _LGlobals_, _UserModel_) {
		svcHttp =_svcHttp_;
		svcAuth =_svcAuth_;
		LGlobals =_LGlobals_;
		UserModel =_UserModel_;
		$httpBackend = $injector.get('$httpBackend');
		
		scope = $rootScope.$new();
	}));

	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

});

