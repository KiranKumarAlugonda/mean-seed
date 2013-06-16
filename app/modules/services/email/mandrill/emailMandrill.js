/**
NOTE: this currently relies on global.cfgJson to exist and be set correctly
Uses config.json email properties (config.email) for configuration
@example config.email
{
    "from": "test@gmail.com",
	"from_name": "Admin",
    "mandrillApiKey": "lk2jlkfjasfd"
}

@fileOverview

@module emailMandrill
@class emailMandrill

@toc

@dependency
- global.cfgJson variable that has the config, which has an "email" key that's an object with the email configuration
*/

'use strict';

var cfg =global.cfgJson;

// var apiKey ='teiFjhKF9G7KDOIzZJ8TlQ';
var apiKey =cfg.email.mandrillApiKey;
//UPDATE: mandrill official api wasn't working - kept erroring.. so now using node-mandrill instead..
// var Mandrill = require('mandrill').Mandrill(apiKey);		//NOTE: heroku Mandrill documentation is WRONG - it's supposed to be 'mandrill-api', NOT 'mandrill'
// var Mandrill = require('mandrill-api').Mandrill(apiKey);
// var Mandrill = require('mandrill-api');
var mandrill = require('node-mandrill')(apiKey);

var self;
var templateGlobalVars ={};		//will be set in setTemplateVars function

/**
@param {Object} opts
*/
function EmailMandrill(opts) {
	self =this;
	setTemplateVars({});		//init
}

/**
@toc 1.
@method send
@param {Object} opts
	@param {Object} emailParams
		@param {String} to
		@param {String} subject
	@param {String} [template]
	@param {Object} [templateParams]
*/
EmailMandrill.prototype.send =function(opts) {
	// var html ="You got an email!";
	var html =formTemplateHtml(opts.template, opts.templateParams, {});
	var emailFrom =cfg.email.from;
	var emailFromName =cfg.email.from_name;
	/*
	//official Mandrill api NOT WORKING..
	// var m = new Mandrill();
	var m = Mandrill();
	m.messages.send({
		key: apiKey,
		async: false,
		message: {
			html: html,
			subject: opts.emailParams.subject,
			from_email: emailFrom,
			from_name: 'Admin',
			to: [
				{email: opts.emailParams.to}
			]
		}
	});
	*/
	
	mandrill('/messages/send', {
		message: {
			to: [{email: opts.emailParams.to}],
			from_email: emailFrom,
			from_name: emailFromName,
			subject: opts.emailParams.subject,
			text: html,
			html: html
		}
	}, function(error, response) {
		if (error) {	//uh oh, there was an error
			console.log( JSON.stringify(error) );
		}
		else {		//everything's good, lets see what mandrill said
			console.log('Email sent! '+JSON.stringify(response));
		}
	});
};

/**
*/
function setTemplateVars(params) {
	var serverConfig =cfg.server;
	var url = serverConfig.domain;
	var port = (serverConfig.port) ? ':' + serverConfig.port : '';
	var path = serverConfig.serverPath;
	templateGlobalVars.publicServerUrl =url + port + path;
}

/**
*/
function formTemplateHtml(template, templateParams, params) {
	var templateHtml ='';
	if(template =='passwordReset') {
		var vars ={
			email: templateParams.email,
			reset_key: templateParams.reset_key,
			config: {
				publicServerUrl: templateGlobalVars.publicServerUrl,
				emailKey: 'email',
				resetKey: 'reset_key',
				resetUrlPath: 'password-reset'
			}
		};
		templateHtml ="Your password reset key is "+vars.reset_key+
		"<br />"+
		"Go to http://"+vars.config.publicServerUrl+vars.config.resetUrlPath+"?"+vars.config.emailKey+"="+vars.email+"&"+vars.config.resetKey+"="+vars.reset_key+" to reset your password."+
		"<br />";
	}
	return templateHtml;
}

module.exports = new EmailMandrill({});