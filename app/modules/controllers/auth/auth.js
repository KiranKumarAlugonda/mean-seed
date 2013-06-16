/**
Handles user authorization - signup, login, forgot password, etc.

@module auth
@class auth

@toc
public methods
1. create
5. login
8. logout
9. checkLogin
10. forgotPassword
11. resetPassword
12. changePassword
1.5. createGuest
1.6 formatAlternateContact
private methods
2. checkEmail
2.5 checkPhone
3. createActual
4. createPassword
6. loginActual
6.5. updateSession
7. checkPassword
*/

'use strict';

var crypto =require('crypto');
var moment = require('moment');
var Q = require('q');
var lodash = require('lodash');

var dependency =require('../../../dependency.js');
var pathParts =dependency.buildPaths(__dirname, {});

var Emailer =require(pathParts.services+'emailer/index.js');
var StringMod =require(pathParts.services+'string/string.js');
var MongoDBMod =require(pathParts.services+'mongodb/mongodb.js');
var UserMod =require(pathParts.controllers+'user/user.js');

//global values that will be set by passed in objects (to avoid having to require in every file)
// var db;
var self;

var defaults = {
	userFields: ['_id'],
	passwordEmail: {
		// this should be overridden
		subject: 'Password Reset Request',
		template: 'passwordReset'
	}
};

/**
@param {Object} options
	// @param {Object} db
	// @param {Object} Emailer
	// @param {Object} userMod
	// @param {Object} StringMod
	// @param {Object} MongoDBMod
*/
function Auth(options) {
	this.opts = lodash.merge({}, defaults, options||{});

	// this.userMod = this.opts.userMod;
	self = this;
	
	// db =this.opts.db;
	// Emailer = this.opts.Emailer;
	// StringMod =this.opts.StringMod;
	// MongoDBMod =this.opts.MongoDBMod;
}

/**
Creates a new user (user signup)
@toc 1.
@method create
@param {Object} data
	@param {String} email
	@param {String} password
	// @param {String} password_confirm
	@param {String} first_name
	@param {String} last_name
@param {Object} params
@return {Promise}
	@param {Object} user
**/
Auth.prototype.create = function(db, data, params)
{
	var deferred = Q.defer();
	var ret ={code:0, msg:'Auth.create '};
	
	// if(data.password !=data.password_confirm) {		//if passwords don't match
		// ret.msg ='Passwords must match';
		// deferred.reject(ret);
	// }
	//check email to ensure valid (no duplicates, etc.)
	if(data.status === undefined)
	{
		data.status = 'member';
	}
	
	data = self.formatAlternateContact(data, {});
	
	if(data.email !== undefined)
	{
		data.email =data.email.toLowerCase();		//case insensitive
		var promiseEmail =checkEmail(db, data.email, {});
		promiseEmail.then(
			function()
			{
				//if valid email, create the new user
				var promiseCreate =createActual(db, data, {});
				promiseCreate.then(
					function(ret1)
					{
						//also login the user that was just created (i.e. give them an active session)
						var promiseSession =updateSession(db, ret1.user, {});
						promiseSession.then(
							function(ret2)
							{
								ret1.user =ret2.user;
								deferred.resolve(ret1);
							},
							function(err)
							{
								deferred.reject(err);
							}
						);
					},
					function(err)
					{
						deferred.reject(err);
					}
				);
			},
			function(err)
			{
				deferred.reject(err);
			}
		);
	}
	else if(data.phone !== undefined)
	{
		var promisePhone =checkPhone(db, data.phone, {});
		promisePhone.then(
			function()
			{
				//if valid phone, create the new user
				var promiseCreate =createActual(db, data, {});
				promiseCreate.then(
					function(ret1)
					{
						//also login the user that was just created (i.e. give them an active session)
						var promiseSession =updateSession(db, ret1.user, {});
						promiseSession.then(
							function(ret2)
							{
								ret1.user =ret2.user;
								deferred.resolve(ret1);
							},
							function(err)
							{
								deferred.reject(err);
							}
						);
					},
					function(err)
					{
						deferred.reject(err);
					}
				);
			},
			function(err)
			{
				deferred.reject(err);
			}
		);
	}
	else
	{
		ret.code = 1;
		ret.msg += 'Error: No Email or Phone information given ';
		deferred.reject(ret);
	}
	return deferred.promise;
};

/**
Logs in a user
@toc 5.
@method login
@param {Object} data
	@param {String} email
	@param {String} password
@param {Object} params
@return {Promise}
	@param {Object} user
**/
Auth.prototype.login = function(db, data, params) {
	var deferred = Q.defer();
	var ret ={code:0, msg:'Auth.login '};
	
	data.email =data.email.toLowerCase();		//case insensitive
	db.user.findOne({email:data.email}, function(err, user) {
		if(err) {
			ret.msg +="db.user.findOne Error: "+err;
			deferred.reject(ret);
		}
		else if(!user) {
			ret.msg ="No user with email '"+data.email+"' exists";
			deferred.reject(ret);
		}
		else {
			var promiseLogin =loginActual(db, data, user, {});
			promiseLogin.then(function(ret1) {
				deferred.resolve(ret1);
			}, function(err) {
				deferred.reject(err);
			});
		}
	});
	
	return deferred.promise;
};

/**
Logs out a user
A session / user login is stored by a key pair of the user's id and a session id that gets set on each login and is destroyed on each logout. Both are used so a random string guess alone won't work. And because the session id changes on each logout, even if a user's credentials were discovered, all the user would have to do is re login or logout and then the old ones will be invalid.
@toc 8.
@method logout
@param {Object} data
	@param {String} user_id The id of the user to logout
@param {Object} params
@return {Promise}
	@param {Object} user
**/
Auth.prototype.logout = function(db, data, params) {
	var deferred = Q.defer();
	var ret ={code:0, msg:'Auth.logout '};
	
	db.user.update({_id: MongoDBMod.makeIds({'id': data.user_id}) }, {$set: {sess_id:''}}, function(err, user) {
		if(err) {
			ret.msg +='Error: '+err;
			deferred.reject(ret);
		}
		else if(!user) {
			ret.msg +='Invalid user ';
			deferred.reject(ret);
		}
		else if(user) {
			deferred.resolve(ret);
		}
	});
	
	return deferred.promise;
};

/**
Checks to see if a user is already logged in
A session / user login is stored by a key pair of the user's id and a session id that gets set on each login and is destroyed on each logout. Both are used so a random string guess alone won't work. And because the session id changes on each logout, even if a user's credentials were discovered, all the user would have to do is re login or logout and then the old ones will be invalid.
@toc 9.
@method checkLogin
@param {Object} data
	@param {String} user_id The id of the user to check login for
	@param {String} sess_id The id of the session
@param {Object} params
@return {Promise}
	@param {Object} user
**/
Auth.prototype.checkLogin = function(db, data, params) {
	var deferred = Q.defer();
	var ret ={code:0, msg:'Auth.checkLogin ', user:false};
	
	db.user.findOne({_id: MongoDBMod.makeIds({'id':data.user_id}), sess_id:data.sess_id}, function(err, user) {
		if(err) {
			ret.msg +='Error: '+err;
			deferred.reject(ret);
		}
		else if(!user) {
			ret.msg ="Invalid sess_id and user_id combination";
			deferred.reject(ret);
		}
		else if(user) {
			ret.user =user;
			deferred.resolve(ret);
		}
	});
	
	return deferred.promise;
};

/**
Creates and emails a reset key to the user
@toc 10.
@method forgotPassword
@param {Object} data
	@param {String} email The email of the user to reset the password for
@param {Object} params
@return {Promise}
	@param {Boolean} true on success
**/
Auth.prototype.forgotPassword = function(db, data, params) {
	var deferred = Q.defer();
	var ret ={code:0, msg:'Auth.forgotPassword '};
	
	data.email =data.email.toLowerCase();		//case insensitive
	db.user.findOne({email: data.email}, function(err, user) {
		if(err) {
			ret.msg +='Error: '+err;
			deferred.reject(ret);
		}
		else if(!user) {
			ret.msg ="No user exists with this email";
			deferred.reject(ret);
		}
		else {
			var resetKey =StringMod.random(6, {'type':'readable'});
			//use "user.email" to avoid ambiguity between whether passed in value was username (_id) or email
			db.user.update({email: user.email}, {$set: {'password_reset_key':resetKey}}, function(err, valid) {
				if(err) {
					ret.msg +='Error: '+err;
					deferred.reject(ret);
				}
				else if(!valid) {
					ret.msg +='Not valid';
					deferred.reject(ret);
				}
				else {
					// fire and forget; this is an async call, but we're not concerned with success
					// @todo: add logging for send failures
					if(Emailer){
						var emailParams = {
							to: user.email,
							subject: 'Forgot Password Reset'
						};
						var templateParams = {
							email: user.email,
							reset_key: resetKey
						};
						// Emailer.sendTemplate('passwordReset', emailParams, templateParams);
						Emailer.send({template: 'passwordReset', templateParams: templateParams, emailParams: emailParams});
						ret.msg ="Email sent with reset instructions!";
					} else {
						ret.msg ="WARNING: Auth module cannot send email since emailer is not configured";
					}
					deferred.resolve(ret);
				}
			});
		}
	});
	
	return deferred.promise;
};

/**
Resets password for a user. Also logs in user (gives an active session)
@toc 11.
@method resetPassword
@param {Object} data
	@param {String} email Email to identify which user to reset password for
	@param {String} reset_key To authorize user to reset password
	@param {String} password New password to set
@param {Object} params
@return {Promise}
	@param {Object} user
**/
Auth.prototype.resetPassword = function(db, data, params) {
	var deferred = Q.defer();
	var ret ={code:0, msg:'Auth.resetPassword ', user:false};
	
	data.email =data.email.toLowerCase();		//case insensitive
	db.user.findOne({email: data.email, password_reset_key:data.reset_key}, function(err, user) {
		if(err) {
			ret.msg +="Error: "+err;
			deferred.reject(ret);
		}
		else if(!user) {
			ret.msg ='Invalid email and reset key combination';
			deferred.reject(ret);
		}
		else {
			//update user password with new one
			var passFinal =createPassword(user.password_salt, data.password, {});
			var resetKey =StringMod.random(16, {});		//invalidate reset key so can't be used again
			//use "user.email" to avoid ambiguity between if params.email is username (_id) or email
			db.user.update({email: user.email}, {$set: {'password':passFinal, 'password_reset_key':resetKey}}, function(err, valid) {
				if(err) {
					ret.msg +='Error: '+err;
					deferred.reject(ret);
				}
				else if(!valid) {
					ret.msg +="Not valid";
					deferred.reject(ret);
				}
				else {
					//also login the user that was just created (i.e. give them an active session)
					var promiseSession =updateSession(db, user, {});
					promiseSession.then(function(retSess) {
						ret.user =retSess.user;
						deferred.resolve(ret);
					}, function(err) {
						deferred.reject(err);
					});
				}
			});
		}
	});
	
	return deferred.promise;
};

/**
Changes password for a user
@toc 12.
@method changePassword
@param {Object} data
	@param {String} user_id Identify user to change password for
	@param {String} current_password The user's current password (to authenticate)
	@param {String} new_password New password to set
@param {Object} params
@return {Promise}
	@param {Object} user
**/
Auth.prototype.changePassword = function(db, data, params) {
	var deferred = Q.defer();
	var ret ={code:0, msg:'Auth.changePassword ', user:false};
	
	db.user.findOne({ _id:MongoDBMod.makeIds({'id':data.user_id}) }, function(err, user) {
		if(err) {
			ret.msg +='Error: '+err;
			deferred.reject(ret);
		}
		else if(!user) {
			ret.msg +='No user - likely an invalid user_id';
			deferred.reject(ret);
		}
		else {
			var passFinal =createPassword(user.password_salt, data.new_password, {});
			db.user.update({_id:user._id}, {$set: {'password':passFinal}}, function(err, valid) {
				if(err) {
					ret.msg +='Error: '+err;
					deferred.reject(ret);
				}
				else if(!valid) {
					ret.msg +='Not valid';
					deferred.reject(ret);
				}
				else {
					ret.user =user;
					deferred.resolve(ret);
				}
			});
		}
	});
	
	return deferred.promise;
};

/**
Creates a guest user
@toc 1.5.
@method createGuest
@param {Object} guest New user object. Must contain an email field. May contain other user information.
	@param {String} email New user's email
@param {Object} params
@return {Promise}
	@param {Object} user
**/
Auth.prototype.createGuest = function(db, guest, params)
{	
	var deferred =Q.defer();
	var ret = {'code': 0, 'msg': 'Auth.createGuest ', 'user': {} };
	
	guest.password = StringMod.random(20, {});
	guest.status = 'guest';
	var creation_promise = self.create(db, guest, params);
	creation_promise.then(
		function(ret1)
		{
			ret.user = ret1.user;
			deferred.resolve(ret);
		},
		function(err)
		{
			deferred.reject(err);
		}
	);
	return deferred.promise;
};

/**
@toc 1.6.
Takes a user object. Appends the user's email to the user's email_alls and phone to phones_all, if they are defined and not already in those arrays.

@method formatAlternateContact
@param {Object} user The user object.
@return {Promise}
	@param {Object} user New, updated user object.
*/
Auth.prototype.formatAlternateContact = function(user, params)
{
	var ii;
	var found;
	
	if(user.email !== undefined)
	{
		if(user.emails_all === undefined)
		{
			user.emails_all = [ { 'email': user.email, 'confirmed': 0, 'primary': 1 } ];
		}
		else
		{
			found = false;
			for(ii = 0; ii < user.emails_all.length; ii++)
			{
				if(user.email == user.emails_all[ii].email)
				{
					found = true;
					ii = user.emails_all.length;
				}
			}
			if(found === false)
			{
				user.emails_all.push( { 'email': user.email, 'confirmed': 0, 'primary': 1 } );
			}
		}
	}
	
	if(user.phone !== undefined)
	{
		if(user.phones_all === undefined)
		{
			user.phones_all = [user.phone];
		}
		else
		{
			found = false;
			for(ii = 0; ii < user.phones_all.length; ii++)
			{
				if(user.phone.number == user.phones_all[ii].number)
				{
					found = true;
					ii = user.phones_all.length;
				}
			}
			if(found === false)
			{
				user.phones_all.push(user.phone);
			}
		}
	}
	
	return user;
};


/**
@toc 2.
@method checkEmail
@param {String} email The email to check (if already exists in database)
@param {Object} params
	@param {String} [user_id] In case of edit, this will allow the same email if it's this user's email already
@return {Promise}
	@param {Object} ret
		@param {Boolean} code 0 if email is okay to be used (i.e. doesn't already exist)
		@param {String} msg
*/
//Auth.prototype.checkEmail =function(email, params) {
function checkEmail(db, email, params) {
	var deferred =Q.defer();
	var ret ={code: 0, msg:'checkEmail '};
	
	var email_promise = UserMod.searchByEmail(db, {'email': email, 'fields': {'_id': 1} }, params);
	email_promise.then(
		function(ret1)
		{
			if(ret1.exists)
			{
				ret.code = 1;
				deferred.reject(ret);
			}
			else
			{
				ret.code = 0;
				deferred.resolve(ret);
			}
		},
		function(ret1)
		{
			console.log(ret1);
			deferred.reject(ret1);
		}
	);
	/*
	var email = data.email.toLowerCase();		//case insensitive
	db.user.findOne({email: email}, function(err, user) {
		if(err)
		{
			ret.msg +='Error: '+err;
			deferred.reject(ret);
		}
		else if(user) {
			if(params.user_id !==undefined && user._id ==params.user_id) {		//same user = valid
				deferred.resolve(ret);
			}
			else {
				ret.msg ="Email already exists";
				deferred.reject(ret);
			}
		}
		else {
			deferred.resolve(ret);
		}
	});
	*/
	return deferred.promise;
}

/**
@toc 2.
@method checkPhone
@param {String} phone The phone to check (if already exists in database)
@param {Object} params
	@param {String} [user_id] In case of edit, this will allow the same phone if it's this user's phone already
@return {Promise}
	@param {Object} ret
		@param {Boolean} code 0 if phone is okay to be used (i.e. doesn't already exist)
		@param {String} msg
*/
function checkPhone(db, phone, params)
{
	var deferred =Q.defer();
	var ret ={code: 0, msg:'checkPhone '};

	var phone_promise = UserMod.searchByPhone(db, {'phone': phone, 'fields': {'_id': 1} }, params);
	phone_promise.then(
		function(ret1)
		{
			if(ret1.exists)
			{
				ret.code = 1;
				deferred.reject(ret);
			}
			else
			{
				ret.code = 0;
				deferred.resolve(ret);
			}
		},
		function(ret1)
		{
			console.log(ret1);
			deferred.reject(ret1);
		}
	);
	
	return deferred.promise;
}

/**
@toc 3.
@method createActual
*/
function createActual(db, data, params) {
	var deferred =Q.defer();
	var ret ={code: 0, msg:'createActual ', user:false};
	
	data.password_salt =StringMod.random(16,{});
	data.password =createPassword(data.password_salt, data.password, {});
	delete data.password_confirm;
	data.sess_id =StringMod.random(16,{});
	data.signup = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
	db.user.insert(data, function(err, user) {
		if(err) {
			ret.msg +='Error: '+err;
			deferred.reject(ret);
		}
		else {
			user =user[0];		//return value is an array but just want the one we inserted as an object
			ret.user =user;
			deferred.resolve(ret);
		}
	});
	
	return deferred.promise;
}

/**
Creates an encrypted password from a salt and (user input / plain text) password
@toc 4.
@method createPassword
@param {String} salt
@param {String} password
@return {String} encrypted password
*/
function createPassword(salt, password, params) {
	var pass1 =crypto.createHash('sha1').update(salt+password).digest('hex');
	//console.log(salt+" "+password+" "+pass1);
	return pass1;
}

/**
Takes a user (looked up from the database) and user input password and then encrypts and compares that user input password to the actual password in the database. If a match, logs in the user and returns the user object
@toc 6.
@method loginActual
@param {Object} data
	@param {String} password User input NON-ENCRYPTED password (to encrypt with salt check against user password)
@param {Object} user User looked up from db (matched to email or other field to identify this user)
	@param {String} password ENCRYPTED form of password
	@param {String} password_salt Used to encrypt data.password for matching against user.password
@return {Promise}
	@param {Object} user User info IF successful login
*/
function loginActual(db, data, user, params) {
	var deferred =Q.defer();
	var ret ={code:0, msg:'loginActual: ', user:false};
	var validPass =checkPassword(data, user, params);
	if(!validPass) {
		ret.msg ="Invalid password";
		deferred.reject(ret);
	}
	else {
		var promiseSession =updateSession(db, user, {});
		promiseSession.then(function(ret1) {
			deferred.resolve(ret1);
		}, function(err) {
			deferred.reject(err);
		});
	}
	return deferred.promise;
}

/**
@toc 6.5.
@method updateSession
@param {Object} user User looked up from db (matched to email or other field to identify this user)
	@param {String} email Email of user to log in and update session
@return {Promise}
	@param {Object} user User info now with active session id (and last_login is updated as well)
*/
function updateSession(db, user, params) {
	var deferred =Q.defer();
	var ret ={code:0, msg:'updateSession: ', user:false};
	//update session info in database
	user.sess_id =StringMod.random(16,{});
	user.last_login =moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
	db.user.update({email:user.email}, {$set: {sess_id:user.sess_id, last_login:user.last_login} }, function(err, valid) {
		if(err) {
			ret.msg +='Error: '+err;
			deferred.reject(ret);
		}
		else if(!valid) {
			ret.msg +='Invalid query ';
			deferred.reject(ret);
		}
		else {
			ret.user =user;
			deferred.resolve(ret);
		}
	});
	return deferred.promise;
}

/**
@toc 7.
@method checkPassword
@param {Object} data
	@param {String} password User input NON-ENCRYPTED password (to encrypt with salt check against user password)
@param {Object} user User looked up from db (matched to email or other field to identify this user)
	@param {String} password ENCRYPTED form of password
	@param {String} password_salt Used to encrypt data.password for matching against user.password
@return {Boolean} True if passwords match
*/
function checkPassword(data, user, params) {
	var password =crypto.createHash('sha1').update(user.password_salt+data.password).digest('hex');
	if(password ==user.password) {		//match
		return true;
	}
	else {
		return false;
	}
}

module.exports = new Auth({});