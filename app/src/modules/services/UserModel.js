/*
//0. init
//0.5. destroy
//1. save
//2. load
*/

'use strict';

angular.module('UserModelModule', []).
factory('UserModel', ['libArray', 'svcStorage', function(libArray, svcStorage){
var inst ={

	data: {},

	//0.
	init: function(params)
	{
		this.data ={'_id':false};
	},

	//0.5.
	destroy: function(params)
	{
		this.data ={};
	},

	//1.
	/*
	@param data =array of user info to update
	*/
	save: function(data, params)
	{
		//this.data =$.extend({}, this.data, data);
		this.data =libArray.extend(this.data, data, {});
		svcStorage.save('user', this.data, {});
	},

	//2.
	load: function(key, params)
	{
		if(!key || key =='all')
			return this.data;
		else
			return this.data[key];
		return false;
	}

};
	inst.init();
return inst;
}]);