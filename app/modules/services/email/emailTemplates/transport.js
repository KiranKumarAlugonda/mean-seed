'use strict';

var nodemailer = require('nodemailer');

// wrapper method around nodemailer.createTransport for configuring multiple transport services
var createTransport = function(method, options){
    var transMethod;
    var opts;

    switch(method){
    case 'smtp':
        transMethod = 'SMTP';
        opts = {
            service: options.service,
            auth: options.auth
        };
        break;
    case 'ses':
        transMethod = 'SES';
        opts = {
            AWSAccessKeyID: options.accessId,
            AWSSecretKey: options.secretKey
        };
        break;
    default:
        transMethod = 'sendmail';
        opts = {};
    }

    return nodemailer.createTransport(transMethod, opts);
};

/**
Initialized instance of nodemailer.createTransport()
@class Transport
**/
module.exports = function(options){
    return createTransport(options.method, options.opts);
};
