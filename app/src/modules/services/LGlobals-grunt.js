/*
//0. init
//1. load
//2. save
*/

/*
holds state / app level properties (i.e. logged in status, session id, etc.) that are needed across multiple controllers/etc.
*/

'use strict';

angular.module('LGlobalsModule', []).
provider('LGlobals', function(){
	this.server ='';

<%
var cfgJson = grunt.config('cfgJson');
%>
	this.dirPaths ={
	'appPath':'<% print(cfgJson.server.appPath); %>',
	'appPathLink':'<% print(cfgJson.server.appPath); %>',
	'appPathLocation':'<% print(cfgJson.server.appPath); %>',
	'staticPath': '<% print(cfgJson.server.staticPath); %>',
	'pagesPath': 'modules/pages/',			//need to prepend staticPath for use
	'rootPath': '/',
	//'serverUrl': "http://"+window.location.host+"/",
	'serverUrl': "http://<% print(cfgJson.server.domain); %>/",
	//'serverPath': "http://"+window.location.host+":<% print(cfgJson.portSocketIO); %>/",
	'serverPath': "http://<% print(cfgJson.server.domain); %>:<% print(cfgJson.server.socketPort); %>/",
	'publicPath': "http://<% print(cfgJson.server.domain); %>:<% print(cfgJson.server.port); %>/",
	'homeDirectory': false,
	'images':"img/",		//will have appPath prepended to it
	'uploads':"uploads/",		//will have appPath prepended to it
	'ajaxUrlParts':{
		//'main':"http://"+window.location.host+":<% print(cfgJson.server.port); %>/"
		'main':"http://<% print(cfgJson.server.domain); %>:<% print(cfgJson.server.port); %>/"
	},
	'ajaxUrl':{
		'api':"http://<% print(cfgJson.server.domain); %>:<% print(cfgJson.server.port); %>/api/"
	},
	'useCorsUrls':{
		'all': <% print(cfgJson.cors.frontendUseCors); %>
	}
	};
	this.emailDomain ="emailDomainHere.com";
	this.info ={
	'emailContact':'talk@',		//emailDomtain will be appended in init
	'emailNoReply':'noreply@',		//emailDomtain will be appended in init
	'appName':'AppNameHere',
	'appTitle':'<% print(cfgJson.app.title); %>',
	//'androidMarketLink':'http://play.google.com/store/apps/details?id=com.phonegap.x',
	'websiteLink':'http://domainHere.com/',
	'fbAppId':'<% print(cfgJson.facebook.appId); %>',
	//'fbPerms':"email,user_birthday,offline_access,publish_stream",
	'fbPerms':"email,user_birthday",
	'twitterHandle':'handleHere',
	'googleClientId':'<% print(cfgJson.google.clientId); %>'
	};

	//data / state storage
	this.data ={};
	this.state ={'loggedIn':false};

	this.$get = function() {
		return {
			hosts: this.hosts,
			//serverInfo: this.serverInfo,
			//server: this.server,
			dirPaths: this.dirPaths,
			emailDomain: this.emailDomain,
			info: this.info,
			data: this.data,
			state: this.state,

			//1.
			/*
			@param
				mainKey =string of main key that matches a variable above, i.e.: 'state', 'date' (default)
			*/
			load: function(key, params) {
				var defaults ={'mainKey':'data'};
				params =$.extend({}, defaults, params);
				var val =false;
				if(this[params.mainKey][key] !==undefined)
					val =this[params.mainKey][key];
				return val;
			},

			//2.
			/*
			@param
				mainKey =string of main key that matches a variable above, i.e.: 'state', 'date' (default)
			*/
			save: function(key, value, params) {
				var defaults ={'mainKey':'data'};
				params =$.extend({}, defaults, params);
				this[params.mainKey][key] =value;
			}
		};
	};

	//0.
	this.init =function(params) {
		this.dirPaths.images =this.dirPaths.appPath+this.dirPaths.images;
		this.dirPaths.uploads =this.dirPaths.appPath+this.dirPaths.uploads;
		this.dirPaths.homeDirectory =this.dirPaths.serverUrl;

		this.info.emailContact +=this.emailDomain;
		this.info.emailNoReply +=this.emailDomain;
	};

	this.init();		//call to init stuff
});