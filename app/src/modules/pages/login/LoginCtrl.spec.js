'use strict';

describe('LoginCtrl', function(){
	var ctrl, scope ={}, svcHttp, UserModel, LGlobals;

	beforeEach(module('myApp'));
	beforeEach(module('svc'));
	beforeEach(module('LGlobalsModule'));		//all need LGlobals for LGlobals provider in app.js
	beforeEach(module('UserModelModule'));
	beforeEach(module('lib'));
	
	beforeEach(inject(function($rootScope, $controller, _UserModel_, _LGlobals_) {
		LGlobals =_LGlobals_;
		UserModel =_UserModel_;
		scope = $rootScope.$new();
		ctrl = $controller('LoginCtrl', {$scope: scope});
	}));

	it('should ...', function() {
	});
});