/**
@class socialAuth

@toc
//1. data
//2. checkAuthGoogle
//3. checkAuthFacebook
*/

'use strict';

angular.module('svc').
factory('svcSocialAuth', ['svcHttp', 'LGlobals', '$rootScope', '$q', 'libGoogleAuth', 'libFacebookAuth', 'UserModel', '$timeout',
function(svcHttp, LGlobals, $rootScope, $q, libGoogleAuth, libFacebookAuth, UserModel, $timeout) {
var inst ={

	/**
	@toc 1.
	*/
	data: {
		google: {
			access_token: false,
			google_id: false
		},
		facebook: {
			access_token: false,
			facebook_id: false
		}
	},
	
	/**
	Wraps libGoogleAuth service to check if user is already authenticated by google and if not, authenticate them. Either way, return a promise with the google authentication information upon completion
	@toc 2.
	@method checkAuthGoogle
	@param {Object} opts
	@return {Object} (via promise)
		@param {String} access_token google token for authenticated user
		@param {String} google_id Authenticated user's google id
		@param {String} [email] authenticated user's email address (not guaranteed to exist)
	@example
		var promise =svcSocialAuth.checkAuthGoogle({});
		promise.then(function(data) {
			//do stuff here
		}, function(data) {
			//handle error here
		});
	*/
	checkAuthGoogle: function(opts) {
		var thisObj =this;
		var deferred =$q.defer();
		if(this.data.google.access_token) {		//if already authenticated, just return
			deferred.resolve(thisObj.data.google);
		}
		else {		//have to authenticate
			//initialize google auth with client id
			//libGoogleAuth.init({'client_id':LGlobals.info.googleClientId, 'scope':'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email'});
			libGoogleAuth.init({'client_id':LGlobals.info.googleClientId, 'scopeHelp':['login', 'email', 'contacts'] });
			
			//handle actual google login
			var evtGoogleLogin ="evtGoogleLogin";
			libGoogleAuth.login({'extraInfo':{'user_id':true, 'emails':true}, 'callback':{'evtName':evtGoogleLogin, 'args':[]} });
			
			/**
			@toc
			@method $scope.$on(evtGoogleLogin,..
			@param {Object} googleInfo
				@param {Object} token
					@param {String} access_token
				@param {Object} extraInfo
					@param {String} user_id
					@param {String} emailPrimary
			*/
			$rootScope.$on(evtGoogleLogin, function(evt, googleInfo) {
				var vals ={
					'google_id':googleInfo.extraInfo.user_id,
					'access_token':googleInfo.token.access_token
				};
				if(googleInfo.extraInfo.emailPrimary) {
					vals.email =googleInfo.extraInfo.emailPrimary;
				}
				thisObj.data.google =vals;
				deferred.resolve(thisObj.data.google);
			});
		}
		
		return deferred.promise;
	},
	
	/**
	Wraps libFacebookAuth service to check if user is already authenticated by facebook and if not, authenticate them. Either way, return a promise with the facebook authentication information upon completion
	@toc 3.
	@method checkAuthFacebook
	@param {Object} opts
	@return {Object} (via promise)
		@param {String} access_token facebook token for authenticated user
		@param {String} facebook_id Authenticated user's facebook id
		@param {String} [email] authenticated user's email address (not guaranteed to exist)
	@example
		var promise =svcSocialAuth.checkAuthFacebook({});
		promise.then(function(data) {
			//do stuff here
		}, function(data) {
			//handle error here
		});
	*/
	checkAuthFacebook: function(opts) {
		var thisObj =this;
		var deferred =$q.defer();
		if(this.data.facebook.access_token) {		//if already authenticated, just return
			deferred.resolve(thisObj.data.facebook);
		}
		else {		//have to authenticate
			//initialize facebook auth with app id
			libFacebookAuth.fbLoginInit({'fbAppId':LGlobals.info.fbAppId, 'fbPerms':LGlobals.info.fbPerms});
			
			//$timeout(function() {
				//handle actual facebook login
				var evtFBLogin ="evtFBLogin";
				libFacebookAuth.preLoginFB({'callback':{'evtName':evtFBLogin, 'args':[]} });
				
				/**
				@toc
				@method $rootScope.$on(evtFBLogin,..
				@param {Object} fbCookie
					@param {String} accessToken
					@param {String} userID
				*/
				$rootScope.$on(evtFBLogin, function(evt, fbCookie) {
					//get facebook email
					FB.api('/me', function(response) {
						//alert(response.name);
						var vals ={'facebook_id':fbCookie.userID, 'access_token':fbCookie.accessToken, 'email':response.email};
						thisObj.data.facebook =vals;
						deferred.resolve(thisObj.data.facebook);
						//get back into angular world since this happens after FB.api call
						if(!$rootScope.$$phase) {
							$rootScope.$apply();
						}
					});
				});
			//}, 100);
		}
		
		return deferred.promise;
	}

};
return inst;
}]);