/**
Main entry point for starting the server application. Call from the command line to start the application:
`node run.js`
Alternate usage:
`node run.js config=test`
*/

'use strict';

//check for any command line arguments
var args =process.argv.splice(2);
var argsObj ={};
var obj1, xx;
args.forEach(function (val, index, array) {
	if(val.indexOf('=') >-1) {
		obj1 =val.split('=');
		// console.log('yes'+obj1[0]+" "+obj1[1]);
		argsObj[obj1[0]] =obj1[1];
	}
	// console.log(index + ': ' + val);
});
// for(xx in argsObj) {
	// console.log(xx+': '+argsObj[xx]);
// }

var env = 'normal';
var configFile = './configs/config.json';
//see if command line args for (test) config file
if(argsObj.config !==undefined) {
	if(argsObj.config =='test') {
		configFile ='./app/test/config.json';
		env = 'test';
	}
	else {
		configFile ='./configs/config-'+argsObj.config+'.json';
	}
}
console.log('configFile: '+configFile);
var cfg =require(configFile);

//save on global object for use throughout the app. Globals are generally bad practice but without doing this, would have to include the above code for checking command line arguments for which config file to use in EVERY file that needed the config (using 'require'). Or could pass the config information through to each successive function/file that needs it by calling an initializing function or specific function with the config info BUT that just seems to pass the problem down the line.. This doesn't seem like a better solution. 
global.cfgJson =cfg;
global.environment = env;

var dirpath = __dirname;
var app = require('./app')(cfg, dirpath);

app.run();
