/**
NOTE: this currently relies on global.cfgJson to exist and be set correctly
Uses config.json sms properties (config.sms) for configuration
@example config.sms
{
	"twilio": {
		"from": "+15005550006",
		"account_sid": "asldkf1234",
		"auth_token": "lk2jlkfjasfd"
	}
}

@fileOverview

@module textTwilio
@class textTwilio

@toc

@dependency
- global.cfgJson variable that has the config, which has an "sms" key that's an object with the SMS Twilio configuration
*/

'use strict';

var cfg =global.cfgJson;

var accountSid = cfg.sms.twilio.account_sid;
var authToken = cfg.sms.twilio.auth_token;
var Twilio = require('twilio')(accountSid, authToken);

var self;

/**
@param {Object} opts
*/
function TextTwilio(opts) {
	self =this;
}

/**
@toc 1.
@method send
@param {Object} opts
	@param {Object} textParams
		@param {String} to
		@param {String} text
*/
TextTwilio.prototype.send =function(opts) {
	var to ='+'+opts.textParams.to;
	var vals ={
		body: opts.textParams.text,
		to: to,
		from: cfg.sms.twilio.from
	};
	Twilio.sms.messages.create(vals, function(err, message) {
		if(err) {
			console.log('Error sending Twilio SMS: '+err);
		}
		else {
			console.log('Twilio SMS success! '+message.sid+' number: '+to+' vals: '+JSON.stringify(vals));
		}
	});
};

module.exports = new TextTwilio({});