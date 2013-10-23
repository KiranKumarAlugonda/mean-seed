var inst ={
	/*
	Example: filePaths:{
		'js':[
			...
		],
		'css':[
			...
		],
	}
	*/
	files: {
		"css":
		{
			"dirs":
			{
				"build":"build",
				"lib":"lib"
			},
			"files":
			{
				"build":
				[
					// "bootstrap.css",
					// "bootstrap-responsive.css",
					"base.css",		//put this LAST to override bootstrap styles
				],
				"lib":[
					"angular-ui-build/angular-ui.min.css",
					"angular-lib-build/angular-lib.min.css",
					//"bootstrap/css/bootstrap.css",		//now using LESS to build bootstrap.css (included above)
					"jcrop/jquery.Jcrop.css",
					"pikaday/pikaday.css"
				]
			},
		},
		"js":
		{
			"dirs":
			{
				"bower":"bower_components",
				"lib":"lib",
				"common":"common",
				"pages":"modules/pages",
				"directives":"modules/directives",
				"services":"modules/services",
			},
			"dirsExt":['bower', 'lib'],		//lists all (external/3rd party) directories that are assumed to be already be "final" (linted, minimized) and thus won't be linted or minified (doing so can cause issues)
			"files":
			{
				"bower":[
					"angular/angular.min.js",
					"angular-route/angular-route.min.js",
					"angular-sanitize/angular-sanitize.min.js",
					"angular-touch/angular-touch.min.js",
					"angular-animate/angular-animate.min.js"
				],
				//jQuery must be loaded BEFORE Angular for some 3rd party plugins to work?? i.e. bootstrap-datepicker, bootstrap-timepicker??
				"lib":[
					"jquery/jquery-1.8.3.min.js",
					// "angular/angular.min.js",		//bower now
					// "angular/angular-sanitize.min.js",		//bower now
					// "angular/angular-mobile.min.js",		//bower now
					// "angular-ui-build/angular-ui.min.js",
					"angular-ui-build/angular-ui.js",
					"angular-lib-build/angular-lib.min.js",
					// "angular-lib-build/angular-lib.js",
					"angular-ui-bootstrap/ui-bootstrap-custom-0.4.0.min.js",
					"angular-ui-bootstrap/ui-bootstrap-custom-tpls-0.4.0.min.js",
					"jcrop/jquery.Jcrop.min.js",
					"jquery/jquery.mobile.events.js",
					"moment/moment.min.js",
					// "pikaday/pikaday.js",		//must be AFTER moment.js is included	//@todo - put this somewhere else and minify it
					"pikaday/pikaday-luke-edit.js",
					// "lawnchair/lawnchair.min.js"		//causes Karma SyntaxError
					// "lawnchair/lawnchair.js"		//causes Karma SyntaxError
					"lawnchair/lawnchair-edit.js"
					// "facebook/facebook.all.js"			//HUGE filesize (168kb) just for login - WASTE - try to shift to just using backend facebook calls?
				],
				"common":[
					"js/app.js",
				],
				"services":[
					"svc.js",
					"http/http.js",
					"auth/auth.js",
					"LGlobals.js",
					
					"storage/storage.js",
					
					"nav/nav.js",
					
					"socialAuth/socialAuth.js",

					"UserModel.js"
				],
				"directives":[
					"dtv.js",
					"appalert/appalert.js",
				],
				"pages":[
					"layout/LayoutCtrl.js",
					"header/HeaderCtrl.js",
					"footer/FooterCtrl.js",
					"home/HomeCtrl.js",
					"login/LoginCtrl.js",
					"loginSignup/LoginSignupCtrl.js",
					"logout/LogoutCtrl.js",
					"userDelete/UserDeleteCtrl.js",
					"passwordReset/PasswordResetCtrl.js",

					"loginForm/LoginFormCtrl.js",
					"signupForm/SignupFormCtrl.js",

					"test/TestCtrl.js",
					"design/DesignCtrl.js"
				],
			}
		},
		html: {
			dirs: {
				"pages":"modules/pages",
				"directives":"modules/directives",
				"services":"modules/services",
			},
			files: {
				pages: [
					'header/header.html',
					'footer/footer.html',
					'home/home.html',
					'login/login.html',
					'loginSignup/login-signup.html',
					'logout/logout.html',
					'userDelete/user-delete.html',
					'passwordReset/password-reset.html',
					'loginForm/login-form.html',
					'signupForm/signup-form.html',
					
					'test/test.html',
					'design/design.html'
				],
				directives: [
				],
				services: [
					'nav/header-centered/header-centered.html',
					'nav/footer-flex/footer-flex.html'
				]
			}
		}
	},

};
module.exports =inst;