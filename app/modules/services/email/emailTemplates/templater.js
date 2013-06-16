'use strict';

var lodash = require('lodash');
var emailTemplates =false;

/**
Require necessary modules / dependencies.
NOTE: there's BOTH a windows and non-windows version so the try/catch block is used to avoid errors on Windows machines (assumed the production machine that can send email is non-windows so it just fails on windows)
*/
try {
    emailTemplates = require('email-templates');
} catch (err) {
	console.log('email-templates module not found - trying windows version');
	try {
		emailTemplates = require('email-templates-windows');
	} catch (err) {
		console.log('email-templates-windows module not found - won\'t work');
		//throw new Error('missing required email-templates module');
	}
}

/**
Responsible for rendering templates, providing default locals for templates, and mixing in runtime locals with defaults
@class Templater
@constructor
@param cfg {Object} configuration object
@param cfg.server {Object} server configuration object
@param cfg.server.domain {String} server domain (e.g. "example.com")
@param cfg.server.serverPath {String} root path of application (e.g. "/")
@param [cfg.server.port=''] {Integer} public facing server port (e.g. 80)
**/
module.exports = Templater;

function Templater(cfg){
    var self = this;

    this.templatesDir = __dirname + '/templates';

    this.publicServerUrl = (function(serverConfig){
        var url = serverConfig.domain;
        var port = (serverConfig.port) ? ':' + serverConfig.port : '';
        var path = serverConfig.serverPath;
        return url + port + path;
    })(cfg.server);

    self.templater = null;

    if( !emailTemplates ){
        console.log('missing node-email-templates package, cannot compile email templates');
    }

    // set catalog in a function so we have access to `this`
    this.setCatalog();
}

Templater.prototype.setCatalog = function(){
    /**
    Template catalog register for maintaining expected locals and defaults
    @property catalog
    @type Object
        @property catalog[templateName]
        @type Object
            @property catalog[templateName].locals
            @type Object
            @note default locals to use when not overridden
    **/
    this.catalog = {
        passwordReset: {
            locals: {
                email: '',
                reset_key: '',
                config: {
                    publicServerUrl: this.publicServerUrl,
                    emailKey: 'email',
                    resetKey: 'reset_key',
                    resetUrlPath: 'password-reset'
                }
            }
        },
        test: {
            locals: {
                name: {
                    first: 'First',
                    last: 'Last'
                }
            }
        }
    };
};

/**
Render template with locals
@method render
@async
@param templateName {String} template name corresponding to node-email-templates templates/ subfolder
@param local {Object} template local variables
@param renderCallback {Function} callback which receives the rendered template
@param renderCallback.err {String} render error
@param renderCallback.html {String} template's rendered html
@param renderCallback.text {String} template's rendered txt
**/
Templater.prototype.render = function(templateName, locals, renderCallback){
    var self = this;
    if( this.templater ){
        this.templater(templateName, locals, renderCallback);
    } else {
		if(!emailTemplates) {
			console.log('No emailTemplates - email will not be sent');
		}
		else {
			emailTemplates(this.templatesDir, function(err, template){
				if(err){
					console.log('Unable to initialize emailTemplates:', err);
					renderCallback(err);
				} else {
					// enable stateful reference to template function so we can reuse on next call
					self.templater = template;
					self.templater(templateName, locals, renderCallback);
				}
			});
		}
    }
};

/**
Merge runtime locals with template's default set of locals
@method loadLocals
@param templateName {String} template name as assigned in Templater.catalog
@param locals {Object} locals mixin object
@return {Object} locals mixed in with defaults for template
**/
Templater.prototype.loadLocals = function(templateName, locals){
    var defaults;
    if(this.catalog[templateName] && this.catalog[templateName].locals){
        defaults = lodash.cloneDeep( this.catalog[templateName].locals );
    } else {
        defaults = {};
    }

    return lodash.merge(defaults, locals || {});
};

