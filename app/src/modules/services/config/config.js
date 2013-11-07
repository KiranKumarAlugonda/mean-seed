/*
//0. init
//1. load
//2. save
*/

/*
holds state / app level properties (i.e. logged in status, session id, etc.) that are needed across multiple controllers/etc.
*/

'use strict';

angular.module('svc').
provider('svcConfig', function(){
	this.server ='';


	this.dirPaths ={
	'appPath':'/',
	'appPathLink':'/',
	'appPathLocation':'/',
	'staticPath': '/src/',
	'pagesPath': 'modules/pages/',			//need to prepend staticPath for use
	'rootPath': '/',
	//'serverUrl': "http://"+window.location.host+"/",
	'serverUrl': "http://localhost/",
	//'serverPath': "http://"+window.location.host+":/",
	'serverPath': "http://localhost:3001/",
	'publicPath': "http://localhost:3000/",
	'homeDirectory': false,
	'images':"common/img/",		//will have staticPath prepended to it
	'uploads':"uploads/",		//will have appPath prepended to it
	'ajaxUrlParts':{
		//'main':"http://"+window.location.host+":3000/"
		'main':"http://localhost:3000/"
	},
	'ajaxUrl':{
		'api':"http://localhost:3000/api/"
	},
	'useCorsUrls':{
		'all': 0
	}
	};
	this.emailDomain ="emailDomainHere.com";
	this.info ={
	'emailContact':'talk@',		//emailDomtain will be appended in init
	'emailNoReply':'noreply@',		//emailDomtain will be appended in init
	'appName':'AppNameHere',
	'appTitle':'Project',
	//'androidMarketLink':'http://play.google.com/store/apps/details?id=com.phonegap.x',
	'websiteLink':'http://domainHere.com/',
	'fbAppId':'195380783916970',
	//'fbPerms':"email,user_birthday,offline_access,publish_stream",
	'fbPerms':"email,user_birthday",
	'twitterHandle':'handleHere',
	'googleClientId':'486630891328.apps.googleusercontent.com',
	'timezone':{
		'name':'',
		'offset':'',
		'minutes':''
	}
	};

	//data / state storage
	this.data ={};
	this.state ={'loggedIn':false};
	
	//will hold the raw cfgJson object unaltered
	this.cfgJson ={};

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
			cfgJson: this.cfgJson,

			//1.
			/*
			@param
				mainKey =string of main key that matches a variable above, i.e.: 'state', 'date' (default)
			*/
			load: function(key, params) {
				var defaults ={'mainKey':'data'};
				params =angular.extend(defaults, params);
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
				params =angular.extend(defaults, params);
				this[params.mainKey][key] =value;
			}
		};
	};

	//0.
	this.init =function(params) {
		// this.dirPaths.images =this.dirPaths.appPath+this.dirPaths.images;
		this.dirPaths.images =this.dirPaths.staticPath+this.dirPaths.images;
		this.dirPaths.uploads =this.dirPaths.appPath+this.dirPaths.uploads;
		this.dirPaths.homeDirectory =this.dirPaths.serverUrl;

		this.info.emailContact +=this.emailDomain;
		this.info.emailNoReply +=this.emailDomain;
		
		//get timezone offset
		var getOffsetFromMinutes =function(minutesTotal, params) {
			var ret ={'z':'', 'minutes':minutesTotal};
			var posNegSwitch =false;		//not sure if should be "420" or "-420" so this toggles it..
			
			var posNeg ='+';
			if(posNegSwitch) {
				posNeg ='-';
				ret.minutes =ret.minutes *-1;
			}
			if(minutesTotal <0) {
				posNeg ='-';
				if(posNegSwitch) {
					posNeg ='+';
				}
				minutesTotal =minutesTotal *-1;		//force positive
			}
			var hours = Math.floor(minutesTotal /60).toString();
			var minutes =(minutesTotal %60).toString();
			if(hours.length ==1) {
				hours ='0'+hours;
			}
			if(minutes.length ==1) {
				minutes ='0'+minutes;
			}
			ret.z =posNeg+hours+':'+minutes;
			return ret;
		};
		
		var minutesTotal =new Date().getTimezoneOffset();
		var ret1 =getOffsetFromMinutes(minutesTotal, {});
		this.info.timezone.offset =ret1.z;
		this.info.timezone.minutes =ret1.minutes;
		
		/*
		var timezone = jstz.determine();
		this.info.timezone.name =timezone.name();
		//get offset
		var xx;
		for(xx in jstz.olson.timezones) {
			if(jstz.olson.timezones[xx] ==this.info.timezone.name) {
				var minutesTotal =xx.slice(0, xx.indexOf(','));
				this.info.timezone.offset =getOffsetFromMinutes(minutesTotal, {}).z;
				break;
			}
		}
		*/
		// console.log('timezone: '+this.info.timezone.name+' '+this.info.timezone.offset+' '+this.info.timezone.minutes);
		//end: get timezone offset
		
		
		
		
		
		this.cfgJson ={
			"versions":{
				"cfg":"0.81",
				"pkg":"0.0.7"
			},
			"env":"development",
			"operatingSystem":"windows",
			"forever":0,
			"app":{
				"name":"project",
				"title":"Project"
			},
			"platform":"",
			"server":{
				"domain":"localhost",
				"port":3000,
				"httpsPort":443,
				"socketPort":3001,
				"serverPath":"/",
				"appPath":"/",
				"staticFilePath":"/src/",
				"staticPath":"/src/"
			},
			"cors":{
				"domains":[
					"localhost"
				],
				"frontendUseCors":0
			},
			"db":{
				"fullURI":"",
				"host":"localhost",
				"port":27017,
				"database":"project",
				"username":false,
				"password":false
			},
			"logKey":"dev",
			"cookie":{
				"secret":"o@:&M<ZN PF(s.T)3?*;^1~TDjNE}=3xy$SpB7dE%dA-}fAn.b[RRU{cg+P#[):/"
			},
			"ssl":{
				"enabled":false,
				"key":"/etc/apache2/conf.d/ssl.key",
				"cert":"/etc/apache2/conf.d/ssl.crt"
			},
			"rpc":{
				"autoDoc":true,
				"autoDocUrl":"help"
			},
			"email":{
				"from":"Admin <admin@project.com>",
				"transport":{
					"sendmail":{
					}
				}
			},
			"sms":{
			},
			"facebook":{
				"appId":"195380783916970"
			},
			"less":{
				"dirPathRootPrefix":""
			},
			"google":{
				"clientId":"486630891328.apps.googleusercontent.com",
				"clientSecret":""
			},
			"sauceLabs":{
				"user":"",
				"key":""
			}
		};

		
		
		
		
	};

	this.init();		//call to init stuff
});