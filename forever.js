/**
Handles (re)starting the server. This is useful for continuous integration since AFTER building with grunt, we need to restart the server BEFORE running tests BUT forever -w (watch) doesn't work due to timing (it often doesn't restart in time/before the tests). So we need to manually do the following steps:
1. pull in & build new code (with github + grunt)
2. restart the server to use the new code (with forever)
3. run tests on the NEW code AFTER the server has been restarted (note we need to restart BOTH the regular and the TEST servers)
*/

'use strict';

var fs = require('fs');
// var forever = require('forever-monitor');
var forever =require('forever');

//get config
var configFile = './app/configs/config.json';

//check to see if config_environment file exists and use it to load the appropriate config.json file if it does
var configFileEnv ='./config_environment.json';
if(fs.existsSync(configFileEnv)) {
	var cfgJsonEnv =require(configFileEnv);
	if(cfgJsonEnv && cfgJsonEnv !==undefined && cfgJsonEnv.environment !==undefined && cfgJsonEnv.environment.length >0) {
		configFile ='./app/configs/config-'+cfgJsonEnv.environment+'.json';
	}
}

//insert a '.test' at the end of the config as the test config naming convention
var configTestFile =configFile.slice(0, configFile.lastIndexOf('.'))+'.test'+configFile.slice(configFile.lastIndexOf('.'), configFile.length);

var cfg =require(configFile);
var cfgTest =require(configTestFile);

console.log(cfg.app.name+' '+cfg.server.port+' '+cfgTest.server.port);

function init(params) {
	stop({});
}

function stop(params) {
	forever.list(false, function(err, data) {
		if(err) {
			console.log('Forever list error: '+err);
			start({});
		}
		else {
			// console.log('Forever data: '+JSON.stringify(data));
			var ii, xx, msg ='';
			for(ii =0; ii<data.length; ii++) {
				msg+='\nNEW ii: '+ii+'\n';
				for(xx in data[ii]) {
					msg+=xx+': '+data[ii][xx]+'\n';
				}
			}
			console.log(msg);
			start({});
		}
	});
}

function start(params) {
	//start app
	var opts =["-m '"+cfg.app.name+" port "+cfg.server.port+"'"];
	forever.startDaemon('run.js', {
		options: opts
	});
	
	//start test server
	var optsTest =["config=test", "-m '"+cfg.app.name+" port "+cfgTest.server.port+"'"];
	forever.startDaemon('run.js', {
		options: optsTest
	});
}

init({});