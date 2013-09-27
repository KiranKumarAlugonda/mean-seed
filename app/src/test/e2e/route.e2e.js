'use strict';

describe("E2E: Testing Routes", function() {

	beforeEach(function() {
		// browser().navigateTo('/');
	});

	/*
	//@todo - not working
	it('should jump to the /home path when / is accessed', function() {
		browser().navigateTo('/');
		expect(browser().location().path()).toBe("/home");
	});
	*/
	
	//no login required routes
	it('should have a working /password-reset route', function() {
		browser().navigateTo('/password-reset');
		expect(browser().location().path()).toBe("/password-reset");
	});
	

	/*
	it('should have a working /login route', function() {
		browser().navigateTo('/login');
		expect(browser().location().path()).toBe("/login");
	});
	
	it('should have a working /logout route', function() {
		browser().navigateTo('/logout');
		expect(browser().location().path()).toBe("/logout");
	});
	
	it('should have a working /password-reset route', function() {
		browser().navigateTo('/password-reset');
		expect(browser().location().path()).toBe("/password-reset");
	});
	*/

});
