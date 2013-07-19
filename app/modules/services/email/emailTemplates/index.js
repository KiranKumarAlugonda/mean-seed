/**
NOTE: this currently relies on global.cfgJson to exist and be set correctly

NOTE: since there are TWO versions of this npm plugin,
can't add BOTH to package.json so to use this,
must FIRST install either "email-templates" or "email-templates-windows" from the command line, i.e.

Non-windows:
`npm install email-templates`

Windows:
(note this requires Microsoft Visual Studio C++ 2010 & potentially other dependencies so I've never actually used this,
I just use on non-Windows server for testing)
`npm install email-templates-windows`

@module emailTemplates

Uses node-email-templates npm plugin (which in turn uses nodemailer npm plugin) to send email.

Email is well formatted - inlines the CSS for you, etc.
    https://github.com/niftylettuce/node-email-templates
    https://github.com/andris9/Nodemailer

Uses config.json email properties (config.email) for configuring transport process
@example config.email - only ONE of the transport options should be set
{
    "from": "Admin <test@gmail.com>",
    "transport":{
        "ses": {
            "accessId": "AKIAJXW2SXRQFRMRVLEQ",
            "secretKey": "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"
        },
        "smtp":{
            "service": "Gmail",
            "auth": {
                "user": "test@gmail.com",
                "pass": "password"
            }
        },
        "sendmail":{
        }
    }
}

@dependency
- global.cfgJson variable that has the config, which has an "email" key that's an object with the email configuration
ONLY IF USING SENDMAIL (SES is recommended if using Amazon (AWS))
server dependency: IF using sendmail, sendmail must be installed & setup properly/functioning
    http://developernote.com/2012/07/how-i-configured-sendmail-for-php-on-ubuntu-server-12-04/
    http://stackoverflow.com/questions/10359437/sendmail-how-to-configure-sendmail-on-ubuntu
    http://www.seanbehan.com/using-sendmail-to-send-mail-on-ubuntu-box
**/

'use strict';

var Transport = require('./transport');
var Templater = require('./templater');

/**
@property transport
@type Transport

@property templater
@type Templater
**/
// function EmailTemplates(cfg){
function EmailTemplates(params){
	var cfg =global.cfgJson;
    this.fromEmail = cfg.email.from;

    this.transport = new Transport(cfg.email.transport);
    this.templater = new Templater(cfg);
}

/**
Wrapper for nodemailer.transport.sendMail
@method send
@param opts {Object} transport.sendMail() options
@param cb {Function} transport.sendMail() callback
@param cb.err {String} sendMail error message
@param cb.response {Object} sendMail response object
**/
EmailTemplates.prototype.send = function(opts, cb){
    var self = this;
    self.transport.sendMail(opts, function(err, response){
        self.transport.close();
		if(cb) {
			cb(err, response);
		}
    });
};

/**
Uses templates to form body of message and send an email using the given params below (specifcally 'to' and 'subject')
@method sendTemplate
@param templateName {String} Name of email template to use
@param emailParams {Object} sendMail specific params
    @param emailParams.to {String} Comma delimited string of email addresses
    @param emailParams.subject {string} Subject of email
    @param [emailParams.cc=''] {String} Comma delimited string of CC email addresses
    @param [emailParams.bcc=''] {String} Comma delimited string of BCC email addresses
@param [templateParams={}] {Object} Params to be filled into template (varies by email template type)
@param [cb] {Function} optional callback function called after email send or when an error occurs
@param [cb.err] {String} error message
@param [cb.response] {Object} email send response
**/
EmailTemplates.prototype.sendTemplate = function(templateName, emailParams, templateParams, cb){
    var self = this;

    if(typeof templateParams === 'function'){
        cb = templateParams;
    } else if(!cb) {
        // assign as noop function
        cb = function(){};
    }

    var locals = self.templater.loadLocals(templateName, templateParams);

    self.templater.render(templateName, locals, function(err, html, text){
        if(err){
            return cb(err);
        }

        var sendOpts = {
            from: self.fromEmail,
            to: emailParams.to,
            subject: emailParams.subject,
            html: html,
            //generateTextFromHTML: true,
            text: text
        };

        self.send(sendOpts, function(err, response){
            cb(err, response);
        });
    });
};

/**
Email module's public API
@method exports
@return {Object} Email object
**/
module.exports = new EmailTemplates({});