'use strict';

describe('svcAuth', function(){
	var ctrl, scope ={}, $httpBackend, svcHttp, svcAuth, svcStorage, svcConfig, $cookieStore, UserModel;

	beforeEach(module('ngCookies'));
	beforeEach(module('jrg'));
    beforeEach(module('svc'));
	
	beforeEach(inject(function($rootScope, $controller, $injector, _svcHttp_, _svcAuth_, _svcStorage_, _svcConfig_, _$cookieStore_, _UserModel_) {
		svcHttp =_svcHttp_;
		svcAuth =_svcAuth_;
		svcStorage =_svcStorage_;
		svcConfig =_svcConfig_;
		$cookieStore =_$cookieStore_;
		UserModel =_UserModel_;
		$httpBackend = $injector.get('$httpBackend');
		
		scope = $rootScope.$new();
	}));

	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	it('should not check login status api if cookie isn\'t set', function() {
		var user ={
			_id: '2382aca',
			email: 'test@gmail.com'
		};
		svcConfig.state.loggedIn =false;
		var promiseStorage =svcStorage.delete1();		//ensure no local storage
		promiseStorage.then(function(ret1) {
			$cookieStore.remove('user_id');
			$cookieStore.remove('sess_id');
			
			var promise1 =svcAuth.checkSess({});
			promise1.then(function(response) {
				expect(response.goTrig).toBe(true);
			});
			
			//get deferred to resolve
			scope.$apply();
			scope.$digest();
		});
	});

	it('should not check login status api if already logged in', function() {
		var user ={
			_id: '2382aca',
			email: 'test@gmail.com',
			sess_id: '38asdflke'
		};
		svcConfig.state.loggedIn =true;
		$cookieStore.put('user_id', user._id);
		$cookieStore.put('sess_id', user.sess_id);
		
		var promise1 =svcAuth.checkSess({});
		promise1.then(function(response) {
			expect(response.goTrig).toBe(true);
		});
		
		//get deferred to resolve
		scope.$apply();
		scope.$digest();
	});

	/*
	//@todo - get this to work - the promise for deleting localStorage isn't working so it's still set when go to svcAuth.checkSess function..
	it('should check login status api if state.loggedIn is false and user cookie is set', function() {
		console.log('state.loggedIn false, user cookie set');
		var user ={
			_id: 'lkek23',
			email: 't@t.com',
			sess_id: '3lkasdljf'
		};
		
		$httpBackend.expectPOST('/api/auth/active').respond({result: {user: user} });
		// $httpBackend.when('POST', '/api/auth/').respond({result: {user: user} });
		
		svcConfig.state.loggedIn =false;
		var promiseStorage =svcStorage.delete1();		//ensure no local storage
		console.log('yes');
		promiseStorage.then(function(ret1) {
			console.log('promiseStorage success');
			$cookieStore.put('user_id', user._id);
			$cookieStore.put('sess_id', user.sess_id);
			
			//TESTING
			var cookieSess =$cookieStore.get('sess_id');
			var cookieUser =$cookieStore.get('user_id');
			console.log('cookies: '+cookieSess+' '+cookieUser);
			//end: TESTING

			var promise1 =svcAuth.checkSess({});
			promise1.then(function(response) {
				expect(response.goTrig).toBe(false);
				//check to ensure user is saved properly in UserModel
				var userLoad =UserModel.load();
				expect(userLoad._id).toBeTruthy();
			});

			// $httpBackend.flush();
			scope.$apply();
			scope.$digest();
			$httpBackend.flush();		//ORDER MATTERS - can NOT do this above the scope.$digest/$apply!
		}, function(err) {
			console.log('promiseStorage err');
		});
	});
	*/
});

