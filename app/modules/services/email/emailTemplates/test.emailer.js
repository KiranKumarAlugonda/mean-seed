'use strict';

/*
//@todo switch to jasmine
var assert      = require('chai').assert;
var async       = require('async');

var Emailer     = require('../');

describe('emailer', function(){
    var cfg = {
        server: {
            domain: 'localhost',
            serverPath: '/'
        },
        email: {
            from: 'Test <test@example.com>',
            transport: null
            // fill these in locally until master email is set up
            // transport: {
                // method: 'smtp',
                // opts: {
                    // service: 'Gmail',
                    // auth: {
                        // "user": "",
                        // "pass": ""
                    // }
                // }
            // }
        }
    };

    if( !cfg.email.transport ){
        console.log('\nWARNING: Cannot test email module due to missing transport options.');
        console.log('...skipping email module tests');
        return;
    }

    var emailer = new Emailer(cfg);

    describe('#templater.render()', function(){
        it('should render a template', function(done){
            var locals = { name: { first: 'Foo', last: 'Bar' } };
            emailer.templater.render('test', locals, function(err, html, text){
                assert.equal(text, 'Hi there Foo Bar.');
                done(err);
            });
        });
    });

    describe('#templater.loadLocals', function(){
        it('should mixin default template locals with passed in locals', function(){
            var templateName = 'passwordReset';
            var defaults = emailer.templater.loadLocals(templateName);

            assert.equal( defaults.email, '' );
            assert.equal( defaults.reset_key, '' );
            assert.equal( defaults.config.resetKey, 'reset_key' );
            assert.equal( defaults.config.resetUrlPath, 'password-reset' );

            var mixin = {
                email: 'foo@bar.com',
                reset_key: '1234abcd',
                config: {
                    resetKey: 'token',
                    resetUrlPath: 'login/reset'
                }
            };

            var locals = emailer.templater.loadLocals(templateName, mixin);

            assert.equal( locals.email, mixin.email );
            assert.equal( locals.reset_key, mixin.reset_key );
            assert.equal( locals.config.resetKey, mixin.config.resetKey );
            assert.equal( locals.config.resetUrlPath, mixin.config.resetUrlPath );
            assert.equal( locals.config.publicServerUrl, defaults.config.publicServerUrl );
        });
    });

    describe('#send()', function(){
        it('should send an email', function(done){
            emailer.send({
                from: cfg.email.from,
                to: 'dgilland@gmail.com',
                subject: 'Test',
                html: '<html><body>Hello World!</body></html>',
                text: 'Hello World!'
            }, done );
        });
    });

    describe('#sendTemplate()', function(){
        it('should send an email template', function(done){
            var emailParams = {
                to: 'dgilland@gmail.com',
                subject: 'Test'
            };

            var templateName = 'passwordReset';

            var templateParams = {
                email: emailParams.to,
                reset_key: '1234'
            };

            emailer.sendTemplate(templateName, emailParams, templateParams, done);
        });
    });

    after(function(done){
        emailer.transport.close();
        done();
    });
});
*/