//angular.module('ui.config', []).value('ui.config', {});
angular.module('lib.services', []);
angular.module('lib', ['lib.services']);
/**
//TOC
//5. formValid
//4. scopeLoaded
//3. removeAngularKeys
//2. deleteEmptyFormVals
//1. cleanFormVals
*/

'use strict';

angular.module('lib.services').
factory('libAngular', ['libArray', '$q', '$timeout', function(libArray, $q, $timeout){
var inst ={

	//5.
	formValid: function(form, params) {
		var valid =true;
		for(var xx in form) {
			if(form[xx].$valid !==undefined && form[xx].$valid !==true) {
				valid =false;
				break;
			}
		}
		return valid;
	},
	
	//4.
	/*
	//Uses a supplied element id to do a timeout loop until that element exists/has length and then returns a promise. This resolves the timing issues that can occur if try to access DOM elements before they exist/are loaded
	NOTE: usually a better solution is to write a directive, whose linking function will only execute after it's been loaded so this becomes obsolete. But there may be some cases where this can be easier / a directive isn't worth it. Though from a performance standpoint, this does a continuous loop to check so is wasteful..
	@param params
		idEle =string of id for element to check if it exists yet
	EXAMPLE CALL:
	var promise =libAngular.scopeLoaded({'idEle':$scope.ids.content});
	promise.then(function() {
		//code here
	});
	*/
	scopeLoaded: function(params) {
		var deferred = $q.defer();
		var checkLoaded =function(params) {
			//if($("#"+params.idEle).length) {		//no jQuery
			if(document.getElementById(params.idEle)) {
				deferred.resolve({});
			}
			else {
				$timeout(function() {
					checkLoaded(params);
				}, 200);
			}
		};
		checkLoaded(params);
		return deferred.promise;
	},
	
	//3.
	/*
	Removes extra keys like $$hashKey that get added for scope management
	NOTE: this is an expensive function... makes 4 expensive calls - may be worth doing a more efficient way..?
	*/
	removeAngularKeys: function(array1, params) {
		var newArray =libArray.copyArray(array1, {});
		newArray =angular.toJson(newArray);
		newArray =angular.fromJson(newArray);		//this angular function strips them it seems
		newArray =this.deleteEmptyFormVals(newArray, {});
		return newArray;
	},

	//2.
	/*
	NOTE: assumes no nested (scalar) arrays (i.e. [][]); rather it assumes that each array [] is of an object/associate array and empty vals will be removed
	@param vals =object {} of form vals
	@return vals =object with empty objects in an array removed (i.e. [{},{}] will be [])
	*/
	deleteEmptyFormVals: function(vals, params) {
		if(typeof(vals) =='object') {
			//get rid of any angular added keys such as $hash
			vals =angular.toJson(vals);
			vals =angular.fromJson(vals);
			//go through vals and delete any empty vals in an array (it seems the only issue is for ng-repeat arrays [] of arrays {})
			for(var xx in vals) {
				if(vals[xx]) {		//it may be null
					if(libArray.isArray(vals[xx], {})) {
						var removeIndices =[];
						for(var ii=0; ii<vals[xx].length; ii++) {
							if(typeof(vals[xx][ii]) =='object') {
								var atLeastOne =false;
								for(var yy in vals[xx][ii]) {
									atLeastOne =true;
									break;
								}
								if(!atLeastOne) {
									removeIndices[removeIndices.length] =ii;
								}
							}
						}
						if(removeIndices.length >0) {
							vals[xx] =libArray.removeIndices(vals[xx], removeIndices, {});
						}
					}
					else if(typeof(vals[xx] =='object')) {		//recursively loop through all sub-arrays
						vals[xx] =this.deleteEmptyFormVals(vals[xx], {});
					}
				}
			}
		}
		return vals;
	},
	
	//1.
	cleanFormVals: function(array1, params) {
		if(libArray.isArray(array1, {})) {
			for(var ii=0; ii<array1.length; ii++) {
			}
		}
		else {
			for(var xx in array1) {
			}
		}
	}

};
return inst;
}]);
/**
//TOC
array remove (extends native javascript array functions)
//13. toAssociative
//12. toScalar
//11. overwrite
//10.75. setKeyVal
//10.5. setParentKeys
//10. evalArray
//9. isArray
//8. extend
//8.5. isEmpty
//7. convertStructure
//6. valExistsCheck
//6.5. keyExists
//4. copyArray
//3. sort2D
//3.5. subSort2D
//2. removeIndices
//1. findArrayIndex
*/

'use strict';

// Array Remove - By John Resig (MIT Licensed)
/*
// Remove the second item from the array
array.remove(1);
// Remove the second-to-last item from the array
array.remove(-2);
// Remove the second and third items from the array
array.remove(1,2);
// Remove the last and second-to-last items from the array
array.remove(-2,-1);
*/
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};


angular.module('lib.services').
factory('libArray', [function(){
var inst ={

	//13. toAssociative: takes a scalar array with associative array entries and a key that exists in each entry. Returns a new associative array.
	//The new array will have entries with the same data as the original. The specified key will be removed; the value found under that key will
	//be used as the key for that entry in the new array.
	//Note: This function doesn't make sense if the scalar entries are not associative array objects that share at least one key.
	//	Furthermore, the values in the scalar entries under the specified key must be distinct from one another, since these will become keys.
	//params
		//key				//String. Specify what key to use as the indentifier. Default: "x_key"
		
	//EX:
	// var scalar = [ {'x_key': 'aaa', 'val': 12, 'txt': 'blah'}, {'x_key': 'bbb', 'val':23, 'text':'blahblah'} ];
	//toAssociative(scalar, {'key': 'x_key'}) returns
	//	{ 'aaa': {'val': 12, 'txt':'blah'}, 'bbb': {'val': 23, 'text':'blahblah'} }

	toAssociative: function(scalar, params)
	{
		if(params === undefined)
		{
			params = {};
		}
		if(params.key === undefined)
		{
			params.key = "x_key";
		}
		
		var thisObj = this;
		var arr = {};
		
		for(var ii = 0; ii < scalar.length; ii++)
		{
			var xx = scalar[ii][params.key];
			arr[xx] = thisObj.copyArray(scalar[ii]);
			delete arr[xx][xx];
		}
		return arr;
	},

	//12. toScalar: takes an associative array. Returns a new scalar array.
	//Intended for use on associative arrays with object entries. In this case, the entries in the scalar array will be objects identical to the
	//entries in the original array, with the addition of a new key, "x_key", that remembers the entry's key in the associative array.
	//	If any entry is not an associative array object, that entry will be converted to an object with "x_key" and "x_data" properties, where x_data
	//	holds the original information.

	//params
		//key				//String. Specify your own key, which will take the place of "x_key". Default: "x_key"
		//data_key	//String. Specify your own key, which will take the place of "x_data". Default: "x_data"

	toScalar: function(arr, params)
	{
		if(params === undefined)
		{
			params = {};
		}
		if(params.key === undefined)
		{
			params.key = "x_key";
		}
		if(params.data_key === undefined)
		{
			params.data_key = "x_data";
		}
		
		var thisObj = this;
		var scalar = [];
		var counter = 0;
		
		for(var xx in arr)
		{
			scalar[counter] = {};
			
			if(typeof(arr[xx]) =="object")			//If the entry is an object
			{
				if(thisObj.isArray(arr[xx]))			//If the entry is a scalar array
				{
					scalar[counter][params.key] = xx;
					scalar[counter][params.data_key] = thisObj.copyArray(arr[xx]);
				}
				else															//If the entry is a non-scalar array
				{
					scalar[counter] = thisObj.copyArray(arr[xx]);
					scalar[counter][params.key] = xx;
				}
			}
			else				//If the entry is not an object at all
			{
				scalar[counter][params.key] = xx;
				scalar[counter][params.data_key] = arr[xx];
			}
			counter++;
		}
		
		return scalar;
	},

	//10.75.
	/*
	//sets the value of an array when given the array base and the keys to set
	@param arrayBase =array starting point (after which the array keys are added in)
	@param params
		keys (required) =dotNotation version of keys to add in order (i.e. 'header.title')
		noDotNotation =boolean true if keys is an array [] rather than a dot notation string
		val =value to set (could be an array or object)
	@return array {}
		arrayBase =array now with the new value set
		valid =1 if val was figured out; 0 if error
		msg =notes on what happened (i.e. error message if valid =0)
	//EXAMPLE:
	$scope.formVals ={
		'header':{
		},
	};
	//then to set the value of header.title (i.e. "Save Bears"), would do:
	evalArray($scope.formVals, {'keys':'header.title'});
	*/
	setKeyVal: function(arrayBase,  params) {
		var retArray ={'arrayBase':'', 'valid':1, 'msg':''};
		if(params.noDotNotation ===undefined || !params.noDotNotation) {
			params.keys =params.keys.split(".");
		}
		if(params.keys.length ==1) {
			arrayBase[params.keys[0]] =params.val;
		}
		else if(params.keys.length ==2) {
			arrayBase[params.keys[0]][params.keys[1]] =params.val;
		}
		else if(params.keys.length ==3) {
			arrayBase[params.keys[0]][params.keys[1]][params.keys[2]] =params.val;
		}
		else if(params.keys.length ==4) {
			arrayBase[params.keys[0]][params.keys[1]][params.keys[2]][params.keys[3]] =params.val;
		}
		else if(params.keys.length ==5) {
			arrayBase[params.keys[0]][params.keys[1]][params.keys[2]][params.keys[3]][params.keys[4]] =params.val;
		}
		else if(params.keys.length ==6) {
			arrayBase[params.keys[0]][params.keys[1]][params.keys[2]][params.keys[3]][params.keys[4]][params.keys[5]] =params.val;
		}
		else {
			retArray.valid =0;
			retArray.msg ='Too deep / too many keys; can only handle key length up to 6';
		}
		retArray.arrayBase =arrayBase;
		return retArray;
	},
	
	//10.5.
	/*
	@param arrayBase =array starting point (after which the array keys are added in)
	@param params
		keys (required) =dotNotation version of keys to add in order (i.e. 'header.title')
		noDotNotation =boolean true if keys is an array [] rather than a dot notation string
	@return array {}
		arrayBase =new arrayBase with any empty parent keys set to an empty object {}
		valid =1 if val was figured out; 0 if error
		msg =notes on what happened (i.e. error message if valid =0)
	EXAMPLE: if arrayBase =={} then calling this function with params.keys =='header.title':
		setParentKeys({}, {'keys':'header.title'});
		//returns: {}
			'arrayBase': {'header':{}}
			'valid':1
			'msg':''
	*/
	setParentKeys: function(arrayBase, params) {
		var retArray ={'arrayBase':'', 'valid':1, 'msg':''};
		if(params.noDotNotation ===undefined || !params.noDotNotation) {
			params.keys =params.keys.split(".");
		}
		var keys =params.keys;
		if(keys.length >1) {
			if(arrayBase[keys[0]] ===undefined) {
				arrayBase[keys[0]] ={};
			}
		}
		if(keys.length >2) {
			if(arrayBase[keys[0]][keys[1]] ===undefined) {
				arrayBase[keys[0]][keys[1]] ={};
			}
		}
		if(keys.length >3) {
			if(arrayBase[keys[0]][keys[1]][keys[2]] ===undefined) {
				arrayBase[keys[0]][keys[1]][keys[2]] ={};
			}
		}
		if(keys.length >4) {
			if(arrayBase[keys[0]][keys[1]][keys[2]][keys[3]] ===undefined) {
				arrayBase[keys[0]][keys[1]][keys[2]][keys[3]] ={};
			}
		}
		if(keys.length >5) {
			if(arrayBase[keys[0]][keys[1]][keys[2]][keys[3]][keys[4]] ===undefined) {
				arrayBase[keys[0]][keys[1]][keys[2]][keys[3]][keys[4]] ={};
			}
		}
		if(keys.length >6) {
			if(arrayBase[keys[0]][keys[1]][keys[2]][keys[3]][keys[4]][keys[5]] ===undefined) {
				arrayBase[keys[0]][keys[1]][keys[2]][keys[3]][keys[4]][keys[5]] ={};
			}
		}
		else {
			retArray.valid =0;
			retArray.msg ='Too deep / too many keys; can only handle key length up to 6';
		}
		retArray.arrayBase =arrayBase;
		return retArray;
	},
	
	//10.
	/*
	//returns the value of an array when given the array base and the keys to read
	@param arrayBase =array starting point (after which the array keys are added in)
	@param params
		keys (required) =dotNotation version of keys to add in order (i.e. 'header.title')
		noDotNotation =boolean true if keys is an array [] rather than a dot notation string
	@return array {}
		val =value of this array after the keys have been added
		valid =1 if val was figured out; 0 if error
		msg =notes on what happened (i.e. error message if valid =0)
	//EXAMPLE:
	$scope.formVals ={
		'header':{
			'title':'Save Bears',
		},
	};
	//then to get the value of header.title (i.e. "Save Bears"), would do:
	//WITH noDotNotation
	evalArray($scope.formVals, {'keys':['header', 'title']});
	//WITHOUT noDotNotation
	evalArray($scope.formVals, {'keys':'header.title'});
	*/
	evalArray: function(arrayBase, params) {
		var retArray ={'val':'', 'valid':1, 'msg':''};
		if(params.noDotNotation ===undefined || !params.noDotNotation) {
			params.keys =params.keys.split(".");
		}
		if(params.keys.length ==1) {
			if(arrayBase[params.keys[0]] !==undefined) {
				retArray.val =arrayBase[params.keys[0]];
			}
		}
		else if(params.keys.length ==2) {
			if(arrayBase[params.keys[0]] !==undefined) {
				retArray.val =arrayBase[params.keys[0]][params.keys[1]];
			}
		}
		else if(params.keys.length ==3) {
			if(arrayBase[params.keys[0]] !==undefined && arrayBase[params.keys[0]][params.keys[1]] !==undefined) {
				retArray.val =arrayBase[params.keys[0]][params.keys[1]][params.keys[2]];
			}
		}
		else if(params.keys.length ==4) {
			if(arrayBase[params.keys[0]] !==undefined && arrayBase[params.keys[0]][params.keys[1]] !==undefined && arrayBase[params.keys[0]][params.keys[1]][params.keys[2]] !==undefined) {
				retArray.val =arrayBase[params.keys[0]][params.keys[1]][params.keys[2]][params.keys[3]];
			}
		}
		else if(params.keys.length ==5) {
			if(arrayBase[params.keys[0]] !==undefined && arrayBase[params.keys[0]][params.keys[1]] !==undefined && arrayBase[params.keys[0]][params.keys[1]][params.keys[2]] !==undefined && arrayBase[params.keys[0]][params.keys[1]][params.keys[2]][params.keys[3]] !==undefined) {
				retArray.val =arrayBase[params.keys[0]][params.keys[1]][params.keys[2]][params.keys[3]][params.keys[4]];
			}
		}
		else if(params.keys.length ==6) {
			if(arrayBase[params.keys[0]] !==undefined && arrayBase[params.keys[0]][params.keys[1]] !==undefined && arrayBase[params.keys[0]][params.keys[1]][params.keys[2]] !==undefined && arrayBase[params.keys[0]][params.keys[1]][params.keys[2]][params.keys[3]] !==undefined && arrayBase[params.keys[0]][params.keys[1]][params.keys[2]][params.keys[3]][params.keys[4]] !==undefined) {
				retArray.val =arrayBase[params.keys[0]][params.keys[1]][params.keys[2]][params.keys[3]][params.keys[4]][params.keys[5]];
			}
		}
		else {
			retArray.valid =0;
			retArray.msg ='Too deep / too many keys; can only handle key length up to 6';
		}
		return retArray;
	},
	
	//9.
	/*
	distinguishes between an object/hash (i.e. {'key':'val'}) and (scalar) array (i.e. [1, 2, 3])
	*/
	isArray: function(array1, params) {
	/*	Cannot detect that a scalar array with an undefined first entry is an array
		if(typeof(array1) !='string' && (array1.length !=undefined && (typeof(array1) !='object' || array1[0] !=undefined || array1.length ===0)))	{		//have to ALSO check not object since it could be an object with a "length" key!... update - typeof is object sometimes for arrays??! so now checking array1[0] too/alternatively..
			return true;
		}
	*/
		if(Object.prototype.toString.apply(array1) === "[object Array]")
		{
			return true;
		}
		else {
			return false;
		}
	},
	
	//11.
	/*
	Takes two arrays. The first array is overwritten by values from the second. Entries in the first array not in the second are left untouched.
	Very similar to extend, but does respect nesting. Nested arrays will be overwritten.
	*/
	overwrite: function(oldArray, newArray, params)
	{
		if(!params)
		{	params ={};}
		
		var ii;
		var xx;
		var len1;
		var len2;
		var result;
		var temp;
		
		if(this.isArray(oldArray) && this.isArray(newArray))	//if both are scalar arrays
		{
			result = [];
			len1 = oldArray.length;
			len2 = newArray.length;
					
			for(ii=0; ii < len1; ii++)
			{
				if(newArray[ii] !== undefined)		//if the entry exists in the new array
				{
					if(typeof(newArray[ii]) =="object")		//new entry is array
					{
						result[ii] = this.copyArray(newArray[ii]);
					}
					else	//new entry is not array
					{
						result[ii] = newArray[ii];
					}
				}
				else		//not overwriting this entry
				{
					if(typeof(oldArray[ii]) =="object")		//if entry is array
					{
						result[ii] = this.copyArray(oldArray[ii]);
					}
					else	//not an array entry
					{
						result[ii] = oldArray[ii];
					}
				}
			}
		
			if(len2 > len1)		//if the new array is longer, need to keep going
			{
				for(ii = len1; ii < len2; ii++)
				{
					if(newArray[ii] !== undefined)
					{
						if(typeof(newArray[ii]) =="object")		//new entry is array
						{
							result[ii] = this.copyArray(newArray[ii]);
						}
						else
						{
							result[ii] = newArray[ii];
						}
					}
				}
			}
		}		//end: if scalar array
		else if(!(this.isArray(oldArray) || this.isArray(newArray))) //If neither is a scalar array
		{
			result = {};
			
			for(xx in oldArray)
			{
				if(newArray[xx] !== undefined)		//if the entry exists in the new array
				{
					if(typeof(newArray[xx]) =="object")		//new entry is array
					{
						result[xx] = this.copyArray(newArray[xx]);
					}
					else	//new entry is not array
					{
						result[xx] = newArray[xx];
					}
				}
				else		//not overwriting this entry
				{
					if(typeof(oldArray[xx]) =="object")		//if entry is array
					{
						result[xx] = this.copyArray(oldArray[xx]);
					}
					else	//not an array entry
					{
						result[xx] = oldArray[xx];
					}
				}
			}
			
			for(xx in newArray)		//now look for new keys in newArray
			{
				if(result[xx] === undefined)		//if we haven't already got this key
				{
					if(typeof(newArray[xx]) =="object")	//new entry is array
					{
						result[xx] = this.copyArray(newArray[xx]);
					}
					else		//new entry is not array
					{
						result[xx] = newArray[xx];
					}
				}
			}
		}
		else
		{
			console.log("Error in libArray.overwrite: Array structures do not match! Either both arrays must be scalar or both associative.");
		}
		return result;
	},
	
	//8.
	/*
	Takes two arrays. The first array is overwritten by values from the second. Entries in the first array not in the second are left untouched.
	NOTE: if a key in the newArray is undefined, the old array will be copied over into the newArray. BUT if the newArray is defined and blank, the resulting array will be the same as the newArray (i.e. no parts of the oldArray (which is longer) will be copied at all)
	Returns the result of this merging of arrays.
	The arrays must be either both associative or both scalar. This also applies to any nested arrays that are defined for both arrays.
	@param oldArray = array to be overwritten
	@param newArray = array used to overwrite values in oldArray
	@param params
	*/
	extend: function(oldArray, newArray, params)
	{
		var thisObj =this;
		if(!params)
		{	params ={};}
		
		//backwards compatibility - if blank array {} or [], just copy old array
		if(this.isArray(newArray) && newArray.length === 0)		//If the new array given is empty
		{
			return this.copyArray(oldArray);
		}
		else if(this.isEmpty(newArray) === true) {
			return this.copyArray(oldArray);
		}

		var recursor =function(oldArray, newArray, params)
		{
			var ii;
			var xx;
			var len1;
			var len2;
			var result;
			var temp;
			
			if(thisObj.isArray(oldArray) && thisObj.isArray(newArray))	//if both are scalar arrays
			{
				result = [];
				len1 = oldArray.length;
				len2 = newArray.length;
				
				if(len2 === 0)		//If the new array given is empty, overwrite the old array
				{
					return thisObj.copyArray(newArray);
				}
				else
				{			
					for(ii=0; ii < len1; ii++)
					{
						if(newArray[ii] !== undefined)		//if the entry exists in the new array
						{
							if(typeof(newArray[ii]) =="object")		//new entry is array
							{
								if(typeof(oldArray[ii]) =="object")	//old and new entry both arrays	
								{
									result[ii] = recursor(oldArray[ii], newArray[ii], params);
								}
								else	//new entry is array, old is not
								{
									result[ii] = thisObj.copyArray(newArray[ii]);
								}
							}
							else	//new entry is not array
							{
								result[ii] = newArray[ii];
							}
						}
						else		//not overwriting this entry
						{
							if(typeof(oldArray[ii]) =="object")		//if entry is array
							{
								result[ii] = thisObj.copyArray(oldArray[ii]);
							}
							else	//not an array entry
							{
								result[ii] = oldArray[ii];
							}
						}
					}
				
					if(len2 > len1)		//if the new array is longer, need to keep going
					{
						for(ii = len1; ii < len2; ii++)
						{
							if(newArray[ii] !== undefined)
							{
								if(typeof(newArray[ii]) =="object")		//new entry is array
								{
									result[ii] = thisObj.copyArray(newArray[ii]);
								}
								else
								{
									result[ii] = newArray[ii];
								}
							}
						}
					}
				}
			}		//end: if scalar array
			else if(!(thisObj.isArray(oldArray) || thisObj.isArray(newArray))) //If neither is a scalar array
			{
				result = {};
				
				//If the new array is empty, overwrite the old one.
				if(thisObj.isEmpty(newArray) === true)
				{
					return thisObj.copyArray(newArray);
				}
				
				for(xx in oldArray)
				{
					if(newArray[xx] !== undefined)		//if the entry exists in the new array
					{
						if(typeof(newArray[xx]) =="object")		//new entry is array
						{
							if(typeof(oldArray[xx]) =="object")	//old and new entry both arrays	
							{
								result[xx] = recursor(oldArray[xx], newArray[xx], params);
							}
							else	//new entry is array, old is not
							{
								result[xx] = thisObj.copyArray(newArray[xx]);
							}
						}
						else	//new entry is not array
						{
							result[xx] = newArray[xx];
						}
					}
					else		//not overwriting this entry
					{
						if(typeof(oldArray[xx]) =="object")		//if entry is array
						{
							result[xx] = thisObj.copyArray(oldArray[xx]);
						}
						else	//not an array entry
						{
							result[xx] = oldArray[xx];
						}
					}
				}
				
				for(xx in newArray)		//now look for new keys in newArray
				{
					if(result[xx] === undefined)		//if we haven't already got this key
					{
						if(typeof(newArray[xx]) =="object")	//new entry is array
						{
							result[xx] = thisObj.copyArray(newArray[xx]);
						}
						else		//new entry is not array
						{
							result[xx] = newArray[xx];
						}
					}
				}
			}
			else
			{
				console.log("Error in extendArray: Array structures do not match! Either both arrays must be scalar or both associative. This also applies to all sub-arrays that are defined in both arrays.");
			}
			return result;
		};
		return recursor(oldArray, newArray, params);		//init
	},
	
	//8.5.
	isEmpty: function(obj)
	{
		for(var key in obj) 
		{
			if (obj.hasOwnProperty(key)) 
			{
				return false;
			}
		}
		return true;
	},
	
	//7.
	/*
	takes selectVals array that may be incomplete (i.e. no 'name') or in a slightly different format and puts it into format: {val1:{'name':'name1', ..[potentially other params as well]}, val2:{}, .. }
	@param selectVals =array of options: {val1:{'name':'name1', ..[potentially other params as well]}, val2:{}, .. } OR new Array( {'value':'val1','name':'name1'}, {'value':'val2','name':'name2'} )
	@param params
	*/
	convertStructure: function(selectVals, params)
	{
		var thisObj =this;
		var xx;
		var finalArray ={};
		if(this.isArray(selectVals))		//scalar / non-associative array
		{
			finalArray ={};
			for(var ii=0; ii<selectVals.length; ii++)
			{
				if(typeof(selectVals[ii]) !="object")
				{
					val =selectVals[ii].toString();
					finalArray[val] ={'name':val};
				}
				else
				{
					var val =selectVals[ii].value;
					finalArray[val] ={};
					for(xx in selectVals[ii])
					{
						if(xx !='value')
						{
							finalArray[val][xx] =selectVals[ii][xx];
						}
					}
				}
			}
			return finalArray;
		}
		else
		{
			finalArray ={};
			for(xx in selectVals)
			{
				if(typeof(selectVals[xx]) !="object")
				{
					finalArray[xx] ={};
					//var trimmedVal =$.trim(selectVals[xx]);		//no jQuery
					var trimmedVal =selectVals[xx].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
					if(trimmedVal.length >0)
						finalArray[xx].name =selectVals[xx];
					else
						finalArray[xx].name =xx;
				}
				else
				{
					finalArray[xx] =thisObj.copyArray(selectVals[xx],{});
					var foundName =false;
					for(var yy in selectVals[xx])
					{
						if(yy =='name')
						{
							foundName=true;
							break;
						}
					}
					if(foundName ===false)		//add name
					{
						finalArray[xx].name =xx;
					}
				}
			}
			return finalArray;
		}
	},

	//6.
	/*!
	@param array1 =array to check in
	@param val =val to check for in array
	@param params
	@return boolean false if doesn't exist
	*/
	valExistsCheck: function(array1, val, params)
	{
		var iiDup;
		var duplicateVal =false;
		for(iiDup =0; iiDup<array1.length; iiDup++)
		{
			if(array1[iiDup] ==val)
			{
				duplicateVal =true;
				break;
			}
		}
		return duplicateVal;
	},
	
	//6.5.
	/*
	@param array1 =1D array []
	@param key =string of key to compare to array1 values
	@param params
	@return boolean true if key is one of the array values
	*/
	keyExists: function(array1, key, params) {
		var match =false;
		for(var ii=0; ii<array1.length; ii++) {
			if(array1[ii] ==key) {
				match =true;
				break;
			}
		}
		return match;
	},

	//4.
	/*!
	//TO DO - copying issue where scalar array is being converted to object..?
	By default, arrays/objects are assigned by REFERENCE rather than by value (so var newArray =oldArray means that if you update newArray later, it will update oldArray as well, which can lead to some big problems later). So this function makes a copy by VALUE of an array without these backwards overwriting issues
	Recursive function so can hog memory/performance easily so set "skip keys" when possible
	@param array1 =array/object to copy
	@param params
		skipKeys =1D array of keys to NOT copy (currently only for associative array - wouldn't make a ton of sense otherwise?)
	@return newArray =array/object that has been copied by value
	*/
	copyArray: function(array1, params)
	{
		var newArray, aa;
		if(!array1) {		//to avoid errors if null
			return array1;
		}
		if(!params)
			params ={};
		if(!params.skipKeys || params.skipKeys ===undefined)
			params.skipKeys =[];
		if(typeof(array1) !="object")		//in case it's not an array, just return itself (the value)
			return array1;
		if(this.isArray(array1))
		{
			newArray =[];
			for(aa=0; aa<array1.length; aa++)
			{
				if(array1[aa] && (typeof(array1[aa]) =="object"))
					newArray[aa] =this.copyArray(array1[aa], params);		//recursive call
				else
					newArray[aa] =array1[aa];
			}
		}
		else		//associative array)
		{
			newArray ={};
			for(aa in array1)
			{
				var goTrig =true;
				for(var ss =0; ss<params.skipKeys.length; ss++)
				{
					if(params.skipKeys[ss] ==aa)
					{
						goTrig =false;
						break;
					}
				}
				if(goTrig)
				{
					if(array1[aa] && (typeof(array1[aa]) =="object"))
						newArray[aa] =this.copyArray(array1[aa], params);		//recursive call
					else
						newArray[aa] =array1[aa];
				}
			}
		}
		return newArray;
	},
	
	//3.
	/*
	takes a multidimensional array & array index to sort by and returns the multidimensional array, now sorted by that array index
	@param arrayUnsorted =2D array to sort
	@param column =integer of array index to sort by (note first one is 0)
	@param params
		'order' ="desc" for reverse order sort
	@return sortedArray
	*/
	sort2D: function(arrayUnsorted, column, params)
	{
		var tempArray =[];	//copy calHide array here to sort; then re-copy back into calHide array once sorted
		var array2D =[];
		var ii;
		for(ii =0; ii<arrayUnsorted.length; ii++)
		{
			tempArray[ii] =[];
			tempArray[ii] =arrayUnsorted[ii];
			array2D[ii] =[ii, tempArray[ii][column]];
		}

		array2D =this.subSort2D(array2D);		//function		- array2D will come out sorted

		var sortedArray =[];
		var counter =0;
		if(params.order !==undefined && params.order =='desc')
		{
			for(ii=(array2D.length-1); ii>=0; ii--)
			{
				sortedArray[counter] =tempArray[array2D[ii][0]];
				counter++;
			}
		}
		else
		{
			for(ii =0; ii<array2D.length; ii++)
			{
				sortedArray[counter] =tempArray[array2D[ii][0]];
				counter++;
			}
		}
		
		return sortedArray;
	},

	//3.5.
	/*!
	//array has 2 elements: 1st is an identifier (for use to match later), 2nd gets sorted & keeps it's identifier with it
	@return array1
	*/
	subSort2D: function(array1)
	{
		var left;
		var right;
		var beg =[];
		var end =[];
		var pivot =[];
		pivot[0] =[];
		pivot[0][0] =[];
		pivot[0][1] =[];
		pivot[1] =[];
		pivot[1][0] =[];
		pivot[1][1] =[];
		var count =0;

		beg[0] =0;
		//end[0] =rosterLength-1;
		//end[0] =array1.length-1;
		end[0] =array1.length;		//CHANGE - not sure why... (array1 doesn't have a blank last index so don't have to subtract 1 anymore...)
		while(count>=0)
		{
			left =beg[count];
			right =end[count]-1;
			if(left <right)
			{
				pivot[0][1] =array1[left][1];
				pivot[0][0] =array1[left][0];
				while(left <right)
				{
					while((array1[right][1] >= pivot[0][1]) && (left <right))
					{
						right--;
					}
					if(left <right)
					{
						array1[left][0] =array1[right][0];
						array1[left][1] =array1[right][1];
						left++;
					}
					while((array1[left][1] <= pivot[0][1]) && (left <right))
					{
						left++;
					}
					if(left <right)
					{
						array1[right][0] =array1[left][0];
						array1[right][1] =array1[left][1];
						right--;
					}
				}
				array1[left][0] =pivot[0][0];
				array1[left][1] =pivot[0][1];
				beg[count+1] =left+1;
				end[count+1] =end[count];
				end[count] =left;
				count++;
			}
			else
			{
				count--;
			}
		}

		//var yes =1;		//dummy
		return array1;
	},

	//2.
	/*
	Removes indices from an array []
	@param array1 =array to remove indices from
	@param indices =1D array [] of indices to remove
	@param params
	@return 1D array [] of the new array without the indices that were to be removed
	*/
	removeIndices: function(array1, indices, params)
	{
		var newArray =[];
		var newArrayCounter =0;
		for(var ii=0; ii<array1.length; ii++)
		{
			var match =false;
			for(var jj=0; jj<indices.length; jj++)
			{
				if(indices[jj] ==ii)
				{
					match =true;
					break;
				}
			}
			if(!match)		//if don't want to remove it, copy over to new array
			{
				newArray[newArrayCounter] =this.copyArray(array1[ii]);
				newArrayCounter++;
			}
		}
		return newArray;
	},

	//1.
	/*
	Returns the index of an 2D []{} associative array when given the key & value to search for within the array
	@param array =2D array []{} to search
	@param key =associative key to check value against
	@param val
	@param params
		oneD =boolean true if it's a 1D array
	*/
	findArrayIndex: function(array, key, val, params)
	{
		var ii;
		//var index =false;		//index can be 0, which evaluates to false
		var index =-1;
		if(params.oneD)
		{
			for(ii=0; ii<array.length; ii++)
			{
				if(array[ii] ==val)
				{
					index =ii;
					break;
				}
			}
		}
		else
		{
			for(ii=0; ii<array.length; ii++)
			{
				if(array[ii][key] ==val)
				{
					index =ii;
					break;
				}
			}
		}
		return index;
	}

};
return inst;
}]);
/**

//TOC
*/

'use strict';

angular.module('lib.services').
provider('libCookie', [function(){

/*
	@param c_name =string of cookie name
	@param value =string of cookie value
	@param exdays =integer of num days until cookie expires OR null for noExpires
	@param params
	*/
	this.set =function(c_name,value,exdays,params) {
		var exdate=new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var c_value=escape(value) + ((exdays===null) ? "" : "; expires="+exdate.toUTCString()+"; path=/");
		document.cookie=c_name + "=" + c_value;
	};
	
	/*
	@param c_name =string of cookie name
	@param params
	*/
	this.clear =function(c_name,params) {
		document.cookie = encodeURIComponent(c_name) + "=deleted; expires=" + new Date(0).toUTCString()+"; path=/";
	};
	
	/*
	@param c_name =string of cookie name
	@param params
	*/
	this.get =function(c_name,params) {
		var ii,xx,yy,ARRcookies=document.cookie.split(";");
		for (ii=0;ii<ARRcookies.length;ii++)
		{
			xx=ARRcookies[ii].substr(0,ARRcookies[ii].indexOf("="));
			yy=ARRcookies[ii].substr(ARRcookies[ii].indexOf("=")+1);
			xx=xx.replace(/^\s+|\s+$/g,"");
			if(xx==c_name)
			{
				return unescape(yy);
			}
		}
		return false;
	};
	
	this.$get = function() {
		return {
			set: this.set,
			clear: this.clear,
			get: this.get
		};
	};

}]);
/**
Handles facebook login

@usage
1. call fbLoginInit with facebook app id (required) and permissions (optional) to initialize (only needs to be called once)
2. call preLoginFB with a callback event that will be $broadcast with the facebook user id and access token for the user who logged in (this can then be used on the backend, etc.)

@example
	//initialize with facebook app id
	libFacebookAuth.fbLoginInit({'fbAppId':'23234', 'fbPerms':'email,user_birthday,offline_access,publish_stream'});

	//do actual login
	var evtFBLogin ="evtFBLogin";
	$scope.fbLogin =function() {
		libFacebookAuth.preLoginFB({'callback':{'evtName':evtFBLogin, 'args':[]} });
	};
	
	// @param {Object} fbCookie
		// @param {String} accessToken
		// @param {String} userID
	$scope.$on(evtFBLogin, function(evt, fbCookie) {
		var vals ={'facebook_id':fbCookie.userID, 'access_token':fbCookie.accessToken};
		//do stuff here
	});

@toc
//0. init
//0.25. setFBOpts
//0.5. destroy
//1. fbLoginInit
//2. showFBLogin
//3.25. preLoginFB
//3.1. setFBLoginVars
//3. loginFB
*/

'use strict';

angular.module('lib.services').
factory('libFacebookAuth', ['libFxnCallback', '$rootScope', function(libFxnCallback, $rootScope) {
var inst ={

	inited: false,
	fbCookie: {},		//will store things such as access_token from facebook login
	alreadyFBInited: false,
	fbAppId: false,
	//fbPerms: "email,user_birthday,offline_access,publish_stream",
	fbPerms: "email,user_birthday",		//default - can be extended in setFBOpts function
	fbConnectTrig: false,
	
	/**
	@toc 0.
	@method init
	*/
	init: function(params)
	{
		this.inited =true;
	},
	
	/**
	Used to set facebook app id as well as requested permissions
	@toc 0.25.
	@method setFBOpts
	@param {String} fbId
	@param {Object} params
		@param {String} [fbPerms] String of permissions to request, i.e. "email,user_birthday,offline_access,publish_stream". Defaults to "email,user_birthday" otherwise
	*/
	setFBOpts: function(fbId, params) {
		this.fbAppId =fbId;
		if(params.fbPerms) {
			this.fbPerms =params.fbPerms;
		}
	},
	
	/**
	@toc 0.5.
	@method destroy
	*/
	destroy: function(params)
	{
		this.fbConnectTrig =false;
		this.alreadyFBInited =false;
		this.fbCookie ={};
		this.inited =false;
	},
	
	/**
	@toc 1.
	@method fbLoginInit
	@param {Object} params
		@param {String} fbAppId Facebook application id (required for login to work)
		@param {String} [fbPerms] String of permissions to request, i.e. "email,user_birthday,offline_access,publish_stream". Defaults to "email,user_birthday" otherwise
	*/
	fbLoginInit: function(params)
	{
		if(!this.inited) {
			this.init({});
		}
		if(params.fbAppId || params.fbPerms) {
			var fbAppId =false, ppSend ={};
			if(params.fbAppId) {
				fbAppId =params.fbAppId;
			}
			if(params.fbPerms) {
				ppSend.fbPerms =params.fbPerms;
			}
			this.setFBOpts(fbAppId, ppSend);
		}
		var thisObj =this;
		if(window.FB !==undefined && !this.alreadyFBInited) {
			this.alreadyFBInited =true;
			if(window.globalPhoneGap && globalPhoneGap) {
				if (typeof PhoneGap == 'undefined' && ((typeof cordova == 'undefined') && (typeof Cordova == 'undefined'))) alert('PhoneGap/Cordova variable does not exist. Check that you have included phonegap.js (or cordova.js) correctly');
				if (typeof PG == 'undefined' && typeof CDV =='undefined') alert('PG/CDV variable does not exist. Check that you have included pg-plugin-fb-connect.js (or cdv-plugin-fb-connect.js) correctly');
				if (typeof FB == 'undefined') alert('FB variable does not exist. Check that you have included the Facebook JS SDK file.');
				if(typeof CDV =='undefined')
					FB.init({ appId: thisObj.fbAppId, frictionlessRequests: true, nativeInterface: PG.FB });
				else
					FB.init({ appId: thisObj.fbAppId, frictionlessRequests: true, nativeInterface: CDV.FB });
			}
			else {
				FB.init({appId: thisObj.fbAppId, frictionlessRequests: true, status: true, cookie: true, xfbml: true});
			}
		}
	},
	
	/**
	@toc 2.
	@method showFBLogin
	@param params
		callback =array {} of: evtName, args
	*/
	showFBLogin: function(params)
	{
		var thisObj =this;
		params.FBLoggedOut =true;		//set this no matter what - just in case to force fb login dialog to come up
		var needToLogOut =false;
		if(this.fbConnectTrig) {		//log user out of facebook so they can re-log in (to confirm their account)
			FB.getLoginStatus(function(response) {
				if(response.authResponse) {
					needToLogOut =true;
				}
			});
			if(needToLogOut) {
				FB.logout(function(response){
					thisObj.preLoginFB(params);
				});
			}
		}
		if(!needToLogOut) {
			thisObj.preLoginFB(params);
		}
	},

	/**
	called when login button is clicked
	@toc 3.25.
	@method preLoginFB
	@param {Object} params
		alreadyLoggedIn =boolean true if already logged into FB (so clicking the button just logs in)
		callback
			evtName
			args =1D array of function args
		FBLoggedOut =boolean true if want to treat it as/force fb logged out (since FB.logout bug causes status to be connected even when user is logged out..
	*/
	preLoginFB: function(params)
	{
		var thisObj =this;
		var needToLogIn =true;
		if(params.alreadyLoggedIn) {
			needToLogIn =false;
		}
		else if(window.FB && params.FBLoggedOut ===undefined || !params.FBLoggedOut) {
			FB.getLoginStatus(function(response) {
				if(response.authResponse || response.session) {
					params.response =response;
					needToLogIn =false;
				}
			});
		}
		if(needToLogIn ===false) {
			this.loginFB(params);		//function
		}
		else {
			//alert("logging into FB");
			FB.login(function(response) {
				if(response.authResponse || response.session) {
					params.response =response;
					thisObj.loginFB(params);		//function
				}
			},
			{ scope: thisObj.fbPerms }		//update2: as of dec 12 2011, perms doesn't work with facebook.. need to use "scope" instead
			);
		}
	},

	/**
	@toc 3.1.
	@method setFBLoginVars
	@param params
		fbSessInfo =array of cookie data (from facebook, only necessary one is access_token (or may be accessToken))
	*/
	setFBLoginVars: function(params)
	{
		this.fbConnectTrig =true;
		//var map1 ={'uid':'userID', 'access_token':'accessToken', 'expires':'expiresIn'};
		var map1 ={'userID':'uid', 'accessToken':'access_token', 'expiresIn':'expires'};
		for(var xx in params.fbSessInfo) {
			this.fbCookie[xx] =params.fbSessInfo[xx];
			if(map1[xx]) {		//save both underscore and camel case versions
				this.fbCookie[map1[xx]] =params.fbSessInfo[xx];
			}
		}
	},

	/**
	@toc 3.
	@method loginFB
	@param params
		callback
			evtName
			args =1D array of function args
		response =FB response (in case need old sess info - i.e. for phoneGap..)
	*/
	loginFB: function(params)
	{
		var thisObj =this;
		var fbLoginVarsParams ={};
		var sessInfo ={};
		var xx;
		var dataString ='fbLogin=1';
		if((params.response && params.response.session) || (FB.getAuthResponse !==undefined && FB.getAuthResponse()))		//must put getAuthResponse call last since it may be undefined if coming from old phoneGap sdk.. (will throw error & break)
		{
			if(params.response && params.response.session)		//must check this first (see above - otherwise will error since getAuthResponse is not defined..
			{
				var sessInfoOld =params.response.session;
				sessInfo ={};
				//have to map sessInfo to new auth type
				//sess key vals: uid, access_token, expires, session_key, sig
				//auth response key vals: userID, accessToken, expiresIn, signedRequest
				var map1 ={'uid':'userID', 'access_token':'accessToken', 'expires':'expiresIn'};
				for(xx in sessInfoOld)
				{
					if(map1[xx])
						sessInfo[map1[xx]] =sessInfoOld[xx];
					else
						sessInfo[xx] =sessInfoOld[xx];
				}
			}
			else {
				sessInfo =FB.getAuthResponse();
			}
			dataString+='&fbUserId='+sessInfo.userID;
			for(xx in sessInfo)
			{
				dataString+='&fbCookie['+xx+']='+sessInfo[xx];
				fbLoginVarsParams[xx] =sessInfo[xx];
			}
		}
		
		this.setFBLoginVars({'fbSessInfo':fbLoginVarsParams});		//function
		
		var argsToAdd =[this.fbCookie];
		var args =libFxnCallback.formArgs({'args':params.callback.args, 'argsToAdd':argsToAdd});
		$rootScope.$broadcast(params.callback.evtName, args);
		if(!$rootScope.$$phase) {		//if not already in apply / in Angular world
			$rootScope.$apply();
		}
	}
	
	

};
return inst;
}]);
/**
@todo - substitute Modernizr for things that can be

Similar to modernizr but with some additional checks for devices, platforms, and versions

//TOC
//0. init
//1. html5Check
//1.25. checkInputTypes
//1.5. html5
//2. getBrowser
//3. getDevice
//4. update
*/

'use strict';

angular.module('lib.services').
factory('libFeatureSupported', ['libArray', function(libArray){
var inst ={

	html5Support: {'svg':false, 'localStorage':false, 'offline':false, 'history':false, 'webWorkers':false, 'dragNDrop':false, 'fileAPI':false, 'geolocation':false, 'inputTypes':{}, 'socket':true},
	//html5SupportCheck: false,
	browser: false,
	device: false,		//string, one of: 'android', 'iOS' CURRENTLY ONLY SUPPORTED FOR ANDROID & iOS
	deviceVersion: false,		//two-digit version (i.e. 2.3) CURRENTLY ONLY SUPPORTED FOR ANDROID
	touch: false,
	orientation: false,
	platforms: {'phonegap':false, 'facebook':false},
	inited: false,

	//0.
	/*
	@param params
		phonegap =boolean true if just want to (re)init phonegap (i.e. since it may not be ready when init is called first time)
	*/
	init: function(params)
	{
		this.inited =true;		//has to be at top to avoid endless loop when calling other functions in here
		var atLeastOne =false;
		for(var xx in params)
		{
			atLeastOne =true;
			break;
		}
		var defaults ={};
		if(atLeastOne) {		//set to false; the true ones will be reset to true
			defaults ={'html5':false, 'phonegap':false, 'device':false};
		}
		else {		//set to all true
			defaults ={'html5':true, 'phonegap':true, 'device':true};
		}
		//params =$.extend({}, defaults, params);
		params =libArray.extend(defaults, params, {});
		
		this.touch ="ontouchend" in document;
		//this.touch =true;		//TESTING
		this.orientation ="onorientationchange" in window;
		if(params.html5) {
			this.html5Check(params);
		}
		if(params.device) {
			this.device =this.getDevice({});
		}
		if(params.phonegap)
		{
			if(window.globalPhoneGap && globalPhoneGap) {
				this.platforms.phonegap =true;
			}
		}
		if(this.platforms.phonegap) {
			this.html5Support.socket =false;
		}
	},

	//1.
	/*
	runs initial check to see what features are supported
	*/
	html5Check: function(params)
	{
		if(!this.inited) {
			this.init({});
		}
		var e = document.createElement('div');
		e.innerHTML = '<svg></svg>';
		this.html5Support.svg =!!(window.SVGSVGElement && e.firstChild instanceof window.SVGSVGElement);
		//this.html5Support.svg =false;		//TESTING
		this.html5Support.dragNDrop ='draggable' in document.createElement('span');
		this.html5Support.fileAPI =typeof FileReader != 'undefined';
		this.html5Support.geolocation =!!navigator.geolocation;
		this.html5Support.history =!!(window.history && window.history.pushState);
		try {
			this.html5Support.localStorage ='localStorage' in window && window.localStorage !== null;
		} catch(err) {
			this.html5Support.localStorgae =false;
		}
		this.html5Support.offline =!!window.applicationCache;
		this.html5Support.webWorkers =!!window.Worker;
		/*
		if(this.html5Support.webWorkers)		//have to test the Firefox 8 domain error by actually attempting to create a new worker
		{
			try
			{
				var testWorker =new Worker(globalJSWebWorkersDirectory+"ajax.js");
				//if(testWorker)
				//	useWebworker =true;
			}
			catch(err)
			{
				this.html5Support.webWorkers =false;
				//useWebworker =false;
			}
		}
		*/
		var html ="";
		var alertIt =false;
		for(var xx in this.html5Support)
		{
			//if(1)
			//if(!this.html5Support[xx])
			if(0)
			{
				alertIt =true;
				html+=xx+": "+this.html5Support[xx]+" | ";
			}
		}
		if(alertIt ===true) {
			alert(html);
		}
		//check for input types
		this.checkInputTypes(params);
	},

	//1.25.
	checkInputTypes: function(params)
	{
		if(!this.inited) {
			this.init({});
		}
		var inputs = ['search', 'tel', 'url', 'email', 'datetime', 'date', 'month', 'week', 'time', 'datetime-local', 'number', 'color', 'range'],
		len = inputs.length;
		//var uiSupport = [];

		for(var ii = 0; ii < len; ii++)
		{
			var input = document.createElement('input');
			input.setAttribute('type', inputs[ii]);
			var notText = input.type !== 'text';
			this.html5Support.inputTypes[inputs[ii]] =false;

			if (notText && input.type !== 'search' && input.type !== 'tel')
			{
				input.value = 'testing';
				if (input.value !== 'testing')
				{
					//uiSupport.push(input.type);
					this.html5Support.inputTypes[inputs[ii]] =true;
					// console.log(uiSupport);
				}
			}
		}
	},

	//1.5.
	/*
	checks the supported list and return whether the currently checked feature is supported
	@param feature =string, matches key in html5Support array; i.e. 'svg', 'offline', 'webWorkers'
	@return boolean true if feature is supported, false otherwise
	*/
	html5: function(feature, params)
	{
		if(!this.inited) {
			this.init({});
		}
		var valid =false;
		if(this.html5Support[feature] !==undefined) {
			valid =this.html5Support[feature];
		}
		return valid;
	},

	//2.
	getBrowser: function(params)
	{
		if(!this.inited) {
			this.init({});
		}
		if(!this.browser)
		{
			this.browser ={};
			if(navigator.userAgent.match(/WebKit/)) {
				this.browser.type ='webkit';
			}
			else if(navigator.userAgent.match(/Firefox/)) {
				this.browser.type ='moz';
			}
			else {
				this.browser.type ='';
			}
		}
		return this.browser;
	},

	//3.
	getDevice: function(params)
	{
		if(!this.inited) {
			this.init({});
		}
		if(!this.device)
		{
			var ua = navigator.userAgent.toLowerCase();
			var isAndroid = ua.indexOf("android") > -1; //&& ua.indexOf("mobile");
			if(isAndroid)
			//if(1)		//TESTING
			{
				this.device ='android';
				this.deviceVersion = parseFloat(ua.slice(ua.indexOf("android")+8));
				//this.deviceVersion =2.3;		//TESTING
			}
			var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );
			if(iOS) {
				this.device ='iOS';
			}
		}
		//this.device ='android';		//TESTING
		return this.device;
	},

	//4.
	update: function(params)
	{
		if(!this.inited) {
			this.init({});
		}
		if(params.facebook) {
			this.platforms.facebook =true;
		}
	}

};
	inst.init();
return inst;
}]);
/**
//1. formArgs
//2. doCallback
*/

'use strict';

angular.module('lib.services').
factory('libFxnCallback', ['$rootScope', function($rootScope){
var inst ={

	//1.
	/*
	@param params
		args =array [] of original arguments
		argsToAdd =array [] of args to add
	*/
	formArgs: function(params) {
		if(params.args && params.args !==undefined)
		{
			if(params.args.length ===undefined)
				params.args =[params.args];
		}
		else
			params.args =[];
		if(!params.argsToAdd || params.argsToAdd ===undefined)
			params.argsToAdd =[];
		var args1 =params.args.concat(params.argsToAdd);
		if(args1.length ==1)
			args1 =args1[0];
		return args1;
	},
	
	//2.
	/*
	@param evtName
	@param args
	@param params
	*/
	doCallback: function(evtName, args, params) {
		if(!$rootScope.$$phase) {		//if not already in apply / in Angular world
			$rootScope.$apply(function() {
				$rootScope.$broadcast(evtName, args);
			});
		}
		else {
			$rootScope.$broadcast(evtName, args);
		}
	}

};
return inst;
}]);
/**
Handles google login

@todo
- contacts: handle paging (& querying) instead of returning ALL (currently 3000 max)
- once google fixes it's api, just use google plus people api to get current user's email..

@toc
//0. init
//0.25. setGoogleOpts
//0.5. destroy
//1. login
//1.5. loginCallback
//2. getContacts
//3. pullPrimary

@usage
1. call init with google client id (required) and scope/permissions (optional) to initialize (only needs to be called once)
2. call login with a callback event that will be $broadcast with the google credentials for the user who logged in

@example
	//initialize google auth with client id
	libGoogleAuth.init({'client_id':LGlobals.info.googleClientId, 'scope':'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email'});

	//do actual login
	var evtGoogleLogin ="evtGoogleLogin";
	$scope.googleLogin =function() {
		libGoogleAuth.login({'extraInfo':{'user_id':true, 'emails':true}, 'callback':{'evtName':evtGoogleLogin, 'args':[]} });
	};
	
	// @param {Object} googleInfo
		// @param {Object} token Fields directly returned from google, with the most important being access_token (but there are others not documented here - see google's documentation for full list)
			// @param {String} access_token
		// @param {Object} [extraInfo]
			// @param {String} [user_id]
			// @param {Array} [emails] Object for each email
				// @param {String} value The email address itself
				// @param {String?} type ?
				// @param {Boolean} primary True if this is the user's primary email address
			// @param {String} [emailPrimary] User's primary email address (convenience field extracted from emails array, if exists)
	$scope.$on(evtGoogleLogin, function(evt, googleInfo) {
		//do stuff here
	});
	
*/

'use strict';

angular.module('lib.services').
factory('libGoogleAuth', ['libFxnCallback', '$rootScope', '$http', '$q', function(libFxnCallback, $rootScope, $http, $q) {
var inst ={

	inited: false,
	token: {},		//will store token for future use / retrieval
	googleInfo: {
		'client_id':false,
		'scope': 'https://www.googleapis.com/auth/plus.login'
	},
	/**
	@property scopeMap Maps shorthand keys to the appropriate google url for that privilege
	@type Object
	*/
	scopeMap: {
		'login': 'https://www.googleapis.com/auth/plus.login',
		//'email': 'https://www.googleapis.com/auth/userinfo.email',
		'email': 'https://www.googleapis.com/auth/userinfo.email https://www.google.com/m8/feeds',		//NOTE: this currently does NOT seem to work BUT contacts api DOES return email.. lol.. so use that instead?! It requires an extra http request so is a bit slower, but at least it works..
		'contacts': 'https://www.google.com/m8/feeds'
	},
	
	/**
	@toc 0.
	@method init
	@param {Object} params
		@param {String} client_id Google client id (required for login to work)
		@param {String} [scope] Space delimited string of permissions to request, i.e. "https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email https://www.google.com/m8/feeds/". Defaults to "https://www.googleapis.com/auth/plus.login" otherwise
	*/
	init: function(params)
	{
		var thisObj =this;
		this.setGoogleOpts(params);
	},
	
	/**
	Used to set google client id as well as request permissions (scope)
	@toc 0.25.
	@method setGoogleOpts
	@param {Object} params
		@param {String} client_id Google client id (required for login to work)
		@param {String} [scope] Space delimited string of permissions to request, i.e. "https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email https://www.google.com/m8/feeds/". Defaults to "https://www.googleapis.com/auth/plus.login" otherwise
		@param {Array} [scopeHelp =[]] Shorthand names for scope privileges so you don't need to know the full url (they'll be mapped for you here). If BOTH scope and scopeHelp are passed in, they'll be joined (but duplicates won't be checked for so don't pass in duplicates!). Available keys are: 'login', 'email', 'contacts'
	*/
	setGoogleOpts: function(params) {
		//extend google info (client id, scope)
		var ii;
		//set client id
		if(params.client_id) {
			this.googleInfo.client_id =params.client_id;
		}
		
		//set scope (appending scope and scopeHelp map together, IF one or both are passed in)
		var scope ='';
		if(params.scope) {
			scope =params.scope;
		}
		else if(!params.scopeHelp) {		//set to default scope if NEITHER scope nor scopeHelp are set
			scope =this.googleInfo.scope;
		}
		if(params.scopeHelp) {
			var scopeMap =this.scopeMap;
			scope +=' ';		//ensure space at end of existing list
			for(ii=0; ii<params.scopeHelp.length; ii++) {
				if(scopeMap[params.scopeHelp[ii]]) {
					scope+=scopeMap[params.scopeHelp[ii]]+' ';
				}
			}
		}
		this.googleInfo.scope =scope;
	},
	
	/**
	@toc 0.5.
	@method destroy
	*/
	destroy: function(params)
	{
		this.googleInfo = {
			'client_id':false,
			'scope': 'https://www.googleapis.com/auth/plus.login'
		};
		this.token ={};
		this.inited =false;
	},
	
	/**
	@toc 1.
	@method login
	@param {Object} params
		@param {Object} extraInfo List of additional info to get from google such as user id (which oddly isn't returned from google authentication)
			@param {Boolean} user_id true to return user id as 'user_id' field
			@param {Boolean} emails true to return emails as 'emails' field - NOTE: this requires https://www.googleapis.com/auth/userinfo.email scope to be set on init. NOTE: this currently does NOT seem to work - emails field isn't coming back from Google no matter what (tried making my email publicly visible, tried in Google oAuth playground - always blank..)
		@param {Object} callback
			@param {String} evtName
			@param {Array} args
	*/
	login: function(params) {
		var thisObj =this;
		var config ={
			'scope':this.googleInfo.scope,
			'client_id':this.googleInfo.client_id
			//'immediate': true,
		};
		
		gapi.auth.authorize(config, function() {
			var googleToken =gapi.auth.getToken();
			thisObj.token =googleToken;		//save for later use
			params.returnVals ={'token':googleToken};		//values to pass back via callback in loginCallback function
			if(params.extraInfo !==undefined && params.extraInfo.user_id || params.extraInfo.emails) {
				//get google user id since it's not returned with authentication for some reason..
				$http.defaults.headers.common["X-Requested-With"] = undefined;		//for CORS to work
				var url ='https://www.googleapis.com/plus/v1/people/me' +'?access_token=' + encodeURIComponent(googleToken.access_token);
				$http.get(url)
				.success(function(data) {
					//email doesn't seem to be returned..?? even with scope set to access it.. oauth2 playground not evening returning it, even after I changed my email to be publicly visible...
					params.returnVals.extraInfo ={'user_id':data.id};
					if(params.extraInfo.emails) {
						params.returnVals.extraInfo.emails =false;		//default
						if(data.emails !==undefined) {
							params.returnVals.extraInfo.emails =data.emails;
							thisObj.loginCallback(params);
						}
						else {		//use contacts to get email, lol..
							var promise =thisObj.getContacts({'emailOnly':true});
							promise.then(function(data) {
								//put email in people api format for consistent return
								params.returnVals.extraInfo.emails =[
									{
										value: data.email,
										type: '',
										primary: true
									}
								];
								thisObj.loginCallback(params);
							}, function(data) {
								thisObj.loginCallback(params);
							});
						}
					}
					else {
						thisObj.loginCallback(params);
					}
				})
				.error(function(data) {
					console.log('error retrieving Google info');
					thisObj.loginCallback(params);
				});
			}
			else {
				thisObj.loginCallback(params);
			}
		});
	},
	
	/**
	@toc 1.5.
	@param {Object} params
		@param {Object} returnVals values to send back via callback (passed through as is)
		@param {Object} callback
			@param {String} evtName
			@param {Array} args
	@return {Object} returned via $rootScope.$broadcast event (pubSub)
		@param {Object} token Fields directly returned from google, with the most important being access_token (but there are others not documented here - see google's documentation for full list)
			@param {String} access_token
		@param {Object} [extraInfo]
			@param {String} [user_id]
			@param {Array} [emails] Object for each email
				@param {String} value The email address itself
				@param {String?} type ?
				@param {Boolean} primary True if this is the user's primary email address
			@param {String} [emailPrimary] User's primary email address (convenience field extracted from emails array, if exists)
	*/
	loginCallback: function(params) {
		var ii;
		//if have emails field, pull out the primary email field and return it as it's own key (for convenience)
		if(params.returnVals.extraInfo.emails && params.returnVals.extraInfo.emails.length >0) {
			var retVal =this.pullPrimary(params.returnVals.extraInfo.emails, {'valueKey':'value'});
			if(retVal) {
				params.returnVals.extraInfo.emailPrimary =retVal;
			}
			/*
			for(ii =0; ii<params.returnVals.extraInfo.emails.length; ii++) {
				if(params.returnVals.extraInfo.emails[ii].primary) {
					params.returnVals.extraInfo.emailPrimary =params.returnVals.extraInfo.emails[ii].value;
					break;
				}
			}
			*/
		}
		var argsToAdd =[params.returnVals];
		var args =libFxnCallback.formArgs({'args':params.callback.args, 'argsToAdd':argsToAdd});
		$rootScope.$broadcast(params.callback.evtName, args);
		if(!$rootScope.$$phase) {		//if not already in apply / in Angular world
			$rootScope.$apply();
		}
	},
	
	/**
	Get a user's google contacts (also used just to get the current user's email, which is NOT returned by google plus people api for some reason..)
	@toc 2.
	@method getContacts
	@param {Object} opts
		@param {Boolean} emailOnly true if only using this to get the current user's email (instead of actually getting contacts)
	@return promise with object for data on success or error. Structure depends on if it's emailOnly or not. emailOnly just returns an object with 'email' as the key.
		@param {Array} contacts For each contact, an object of:
			@param {String} name
			@param {String} email
			@param {String} phone
			//@param {String} image
	*/
	getContacts: function(opts) {
		if(!opts) {
			opts ={};
		}
		var thisObj =this;
		var deferred = $q.defer();
		var googleToken =this.token;
		//set max results		//@todo - handle paging (& querying) instead of returning ALL
		var maxResults =3000;		//set arbitrarily large
		if(opts.emailOnly) {		//don't care about contacts, just want current user's email
			maxResults =1;
		}
		$http.defaults.headers.common["X-Requested-With"] = undefined;		//for CORS to work
		//NOTE: this isn't well documented, but can use "alt=json" to return json instead of xml
		var url ='https://www.google.com/m8/feeds/contacts/default/full' +'?access_token=' + encodeURIComponent(googleToken.access_token) +'&alt=json&max-results='+maxResults;
		$http.get(url)
		.success(function(data) {
			if(opts.emailOnly) {
				deferred.resolve({'email':data.feed.id.$t});
			}
			else {
				/*
				return data structure:
				feed {Object}
					entry {Array} of each contact; each is an object with fields:
						gd$email {Array} of email addresses; each is an object of:
							address {String} the email address
							primary {String} of 'true' if the primary email address
							rel ?
						gd$phoneNumber {Array} of phone numbers; each is an object of:
							$t {String} the number
							rel ?
						link {Array} of link objects, including pictures. Each item is an object of: - UPDATE - images aren't showing up - may be behind authorization but not working from the app either.. so maybe these aren't profile images??
							href {String}
							type {String} 'image/*' for images
							rel ?
						title {Object} of user name
							$t {String} the actual name
				*/
				var ii, vals, tempVal;
				/**
				@property contacts Array of objects, one object of info for each contact
				@type Array of objects, each has fields:
					@param {String} name
					@param {String} email
					@param {String} phone
					//@param {String} image	- these may not be images? the links aren't working..
				*/
				var contacts =[];
				for(ii =0; ii<data.feed.entry.length; ii++) {
					//reset / set default vals for this contact
					vals ={
						'email':false,
						'name':false,
						'phone':false
						//'image':false
					};
					//get email
					if(data.feed.entry[ii].gd$email) {
						tempVal =thisObj.pullPrimary(data.feed.entry[ii].gd$email, {'valueKey':'address'});
						if(tempVal) {
							vals.email =tempVal;
						}
					}
					//get phone
					if(data.feed.entry[ii].gd$phoneNumber) {
						tempVal =thisObj.pullPrimary(data.feed.entry[ii].gd$phoneNumber, {'valueKey':'$t'});
						if(tempVal) {
							vals.phone =tempVal;
						}
					}
					//get name
					if(data.feed.entry[ii].title) {
						vals.name =data.feed.entry[ii].title.$t;
					}
					/*
					//get image
					if(data.feed.entry[ii].link) {
						tempVal =thisObj.pullPrimary(data.feed.entry[ii].link, {'valueKey':'href', 'matchKey':'type', 'matchVal':'image/*'});
						if(tempVal) {
							vals.image =tempVal;
						}
					}
					*/
					contacts[ii] =vals;
				}
				deferred.resolve({'contacts':contacts});
			}
		})
		.error(function(data) {
			var msg ='error retrieving Google contacts';
			console.log(msg);
			deferred.reject({'msg':msg});
		});
		
		return deferred.promise;
	},
	
	/**
	Helper function to find the "primary" item in an array of objects (i.e. get primary email
	@toc 3.
	@method pullPrimary
	@param {Array} items The items to iterate through and find the primary one. This should be an array of objects that has a "primary" boolean field
	@param {Object} [opts]
		@param {String} [valueKey ='value'] Which key in the object to extract for the primary item
		@param {String} [matchKey] Used in place of primary field default match; if set, then the check will be NOT on a "primary" field but on this field matching the 'matchVal' value
		@param {String} [matchVal] Paired with 'matchKey' for which array item to use (instead of matching on a boolean 'primary' field)
	@return {Mixed} value of primary item
	*/
	pullPrimary: function(items, opts) {
		var ii;
		var valueKey ='value';		//default
		var retVal =false;
		if(opts.valueKey) {
			valueKey =opts.valueKey;
		}
		var found =false;
		for(ii =0; ii<items.length; ii++) {
			if(opts.matchKey !==undefined && opts.matchVal !==undefined) {
				if(items[ii][opts.matchKey] !==undefined && items[ii][opts.matchKey] ==opts.matchVal) {
					retVal =items[ii][valueKey];
					found =true;
					break;
				}
			}
			else {
				if(items[ii].primary || items[ii].primary =='true') {
					retVal =items[ii][valueKey];
					found =true;
					break;
				}
			}
		}
		//if not found, just use the first item
		if(!found && items.length >0) {
			retVal =items[0][valueKey];
		}
		return retVal;
	}

};
return inst;
}]);
/**
//TOC
//0. init
//1. show
//2. close
//3. destroy
//4. resize
//5. scroll
*/

'use strict';

angular.module('lib.services').
factory('libLoading', [function(){
var inst ={

	inited: false,
	idPart: "libLoading",
	ids: {'bodyDiv':false, 'full':false, 'mini':false},		//will be set later since needs idPart

	//0.
	init: function(params)
	{
		var thisObj =this;
		if(!this.ids.bodyDiv) {
			this.ids.bodyDiv =this.idPart+"BodyDiv";
			this.ids.mini =this.idPart+"Mini";
			this.ids.full =this.idPart+"Full";
		}
		
		$(window).resize(function(){
			thisObj.resize();
		});
		$(window).scroll(function(){
			thisObj.scroll({});
		});
		this.inited =true;
	},
	
	//1.
	/*
	@param params
		callback =function to call after display loading (since need a timeout to ensure loading is painted/rendered BEFORE do the rest of the javascript)
		type =string, one of: 'mini' (default), 'full'
	*/
	show: function(params)
	{
		if(params ===undefined) {
			params ={};
		}
		var defaults ={'type':'mini'};
		//var defaults ={'type':'full'};
		params =$.extend({}, defaults, params);
		if(!this.inited) {
			this.init();
		}

		var divId =this.ids.bodyDiv;
		if(!$("#"+divId).length)
		{
			var html ="";
			html+="<div id='"+divId+"' class='l-loading-background'>";
			
			//mini
			html+="<div id='"+this.ids.mini+"' class='l-loading-background-inner'>";
			html+="<div class='l-loading-mini-background-inner'>";
			html +="<div class='l-loading-mini-icon'></div>";
			html+="</div>";
			html+="</div>";
			
			//full
			html+="<div id='"+this.ids.full+"' class='l-loading-background-inner'>";
			html+="<div class='l-loading-full-background-inner'>";
			//html+="Loading..";
			html +="<div class='l-loading-full-content'>Loading..</div>";
			html+="</div>";
			html+="</div>";
			
			html+="</div>";
			
			$("body").append(html);
		}
		$("#"+divId).show();
		if(params.type =='full') {
			$("#"+this.ids.full).show();
			$("#"+this.ids.mini).hide();
		}
		else {
			$("#"+this.ids.mini).show();
			$("#"+this.ids.full).hide();
		}
		this.resize();
		
		if(params.callback)
		{
			setTimeout(function(){
				params.callback();
			}, 40);
		}
	},

	//2.
	close: function(params)
	{
		var thisObj =this;
		var divId =thisObj.ids.bodyDiv;
		$("#"+divId).hide();
	},

	//3.
	destroy: function(params)
	{
		var divId =this.ids.bodyDiv;
		$("#"+divId).remove();
	},
	
	//4.
	resize:function(params) {
		var windowHeight =$(window).height();
		var windowWidth =$(window).width();
		var windowTop =$(window).scrollTop();
		$("#"+this.ids.bodyDiv).height(windowHeight);
		$("#"+this.ids.bodyDiv).width(windowWidth);
		$("#"+this.ids.bodyDiv).css({'top':windowTop+'px'});
	},
	
	//5.
	scroll:function(params) {
		var windowTop =$(window).scrollTop();
		$("#"+this.ids.bodyDiv).css({'top':windowTop+'px'});
	}

};
return inst;
}]);
/**
//0. init
//0.5. destroy
//1. resize
//2. addCallback
//2.5. removeCallback
*/

'use strict';

angular.module('lib.services').
factory('libResize', ['$rootScope', 'libFxnCallback', 'libArray', function($rootScope, libFxnCallback, libArray){
var inst ={

	callbacks: {},		//1D array of function callback info ({'evtName' =string of what event name to broadcast, 'args':[]}) to call on each resize
	timeout: false,

	//0.
	/*
	@param params
		timeout =int of milliseconds to wait between calling resize (for performance to avoid firing every millisecond)
	*/
	init: function(params)
	{
		var thisObj =this;
		var defaults ={'timeout':500};
		//params =$.extend({}, defaults, params);		//no jQuery
		params =libArray.extend(defaults, params, {});
		//$(window).resize(function(){		//no jQuery
		window.onresize =function() {
			if(!thisObj.timeout) {
				thisObj.timeout =setTimeout(function() {
					thisObj.resize({});
					clearTimeout(thisObj.timeout);
					thisObj.timeout =false;		//reset
				}, params.timeout);
			}
		//});
		};
	},
	
	//0.5.
	destroy: function(params)
	{
	},

	//1.
	resize: function(params)
	{
		var thisObj =this;
		var argsToAdd =[];
		for(var xx in this.callbacks)
		{
			var args =libFxnCallback.formArgs({'args':this.callbacks[xx].args, 'argsToAdd':argsToAdd});
			$rootScope.$broadcast(thisObj.callbacks[xx].evtName, args);
		}
		if(!$rootScope.$$phase) {		//if not already in apply / in Angular world
			$rootScope.$apply();
		}
		//LLoadContent.load({});		//init svg images
	},

	//2.
	/*
	@param fxnId =string of associative array key/instance id to use (need this for removing callback later)
	@param fxnInfo =//1D array of function callback info ({'evtName' =string of what event name to broadcast, 'args':[]}) to call on each resize
	@param params
	*/
	addCallback: function(fxnId, fxnInfo, params)
	{
		this.callbacks[fxnId] =fxnInfo;
	},

	//2.5.
	removeCallback: function(fxnId, params)
	{
		if(this.callbacks[fxnId] && this.callbacks[fxnId] !==undefined)
			delete this.callbacks[fxnId];
	}

};
inst.init();
return inst;
}]);
/**
//TOC
//5. parseUrl
//4. addFileSuffix
//3. escapeHtml
//1. trim
//2. random
*/

'use strict';

angular.module('lib.services').
factory('libString', ['libArray', function(libArray){
var inst ={

	/**
	Parses the url to retrieve GET params BEFORE $location.url() is available..
	Handles hash (#) for non HTML5 History support (so '#/' will be stripped off too - though this may be an AngularJS specific routing solution??)
	@toc 5.
	@method parseUrl
	@param {Object} params
		@param {String} url The full url to parse
		@param {String} [rootPath =''] The part to strip off the beginning of the url (i.e. 'static/public/')
	@return {Object} A parsed section of the current url, i.e. for a url of: 'http://localhost/static/public/home?p1=yes&p2=no'
		@param {String} page The current url WITHOUT url GET params and WITHOUT the root path, i.e. 'home'
		@param {String} queryParams The GET params, i.e. 'p1=yes&p2=no'
	*/
	parseUrl: function(params) {
		var ret ={page: '', queryParams: ''};
		var defaults ={rootPath: ''};
		var xx;
		for(xx in defaults) {
			if(params[xx] ===undefined) {
				params[xx] =defaults[xx];
			}
		}
		
		var appPath =params.rootPath;
		var curUrl =params.url;
		//strip off host info (in case rootPath is just '/', don't want to match the slash in the host/protocol info)
		var posSlashes =curUrl.indexOf('://');
		curUrl =curUrl.slice(posSlashes+3, curUrl.length);
		
		var pos1 =curUrl.indexOf(appPath);
		var curPage =curUrl.slice((pos1+appPath.length), curUrl.length);
		//handle non HTML5 history by stripping off leading '#/'
		var posHash =curPage.indexOf("#/");
		if(posHash >-1) {
			curPage =curPage.slice((posHash+2), curPage.length);
		}
		var posQuery =curPage.indexOf("?");
		var queryParams ='';
		if(posQuery >-1) {
			queryParams =curPage.slice((posQuery), curPage.length);
			curPage =curPage.slice(0, posQuery);
		}
		
		ret.page =curPage;
		ret.queryParams =queryParams;
		return ret;
	},
	
	//4.
	/*
	@param filename =string (i.e. 'test.jpg')
	@param suffix =string (i.e. '_crop')
	@return string of new filename with suffix (i.e. 'test_crop.jpg')
	//NOTE: if suffix already exists, it won't be re-added, i.e. "test_crop_crop.jpg" will NOT happen
	*/
	addFileSuffix: function(filename, suffix, params) {
		if(filename ===undefined || !filename || filename.indexOf(suffix) >-1) {		//if bad filename OR it already has suffix
			return filename;
		}
		else {
			var front =filename.substring(0, filename.lastIndexOf('.'));
			var end = filename.substring(filename.lastIndexOf('.'));
			return front + suffix + end;
		}
	}, 
	
	//3.
	escapeHtml: function(html, params) {
		var htmlNew =html
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
		return htmlNew;
	},
	
	//1.
	trim: function(string1, params) {
		return string1.replace(/^\s+|\s+$/g, "");
	},
	
	//2.
	/*
	//Generates a random string
	@param len =string of length of string to create
	@param pp
		type =string, one of: 'readable' if want only readable chars (i.e. no uppercase "I" and lowercase "l" and number "1", which can look the same); otherwise it uses the full range of characters
	*/
	random: function(len, pp) {
		var defaults ={'type':'full'};
		pp =libArray.extend(defaults, pp, {});
		var chars;
		if(pp.type =='full') {
			chars ="abcdefghijkmnopqrstuvwxyz023456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		}
		else if(pp.type =='readable') {
			chars ="abcdefghijkmnopqrstuvwxyz023456789";
		}
		var randString ='';
		for(var ii=0; ii<len; ii++) {
			randString+=chars.charAt(Math.floor(Math.random()*chars.length));
		}
		return randString;
	}

};
return inst;
}]);
/**
AngularJS 1.1.5 has an ng-swipe directive but it doesn't support up/down swipes and it's not working for me at all (even for left/right swipes) so this is a temporary directive + service to support swipes. It uses jQuery mobile events code for the actual swipe up/down/left/right handling and just calls those methods - so this is just a wrapper.

@dependency
jquery.mobile.events.js

//TOC
//1. setSwipe

@param {Object} scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html). REMEMBER: use snake-case when setting these on the partial!
	@param {Function} onswipe function to call on swiping

@param {Object} attrs REMEMBER: use snake-case when setting these on the partial! i.e. scroll-load='1' NOT scrollLoad='1'
	@param {String} directions Comma delimited list of one or more of 'left', 'right', 'up', 'down' directions to bind swipe events to. The direction will be passed into the onswipe function to differentiate among the different events/directions.
		@example 'left,right'
	
@example
partial / html:
	<div lib-swipe directions='left' onswipe='swipeIt'>

controller / js:
	@param {Object} params
		@param {String} direction One of 'left', 'right', 'up', 'down' for which event triggered this call
	$scope.swipeIt =function(params) {
		alert('swipe '+params.direction);
	};

*/

'use strict';

angular.module('lib.services')
.directive('libSwipe', ['libSwipe', function(libSwipe) {
	return {
		restrict: 'A',
		scope: {
			onswipe: '&'
		},
		compile: function(element, attrs) {
			//set id on element
			attrs.id ="libSwipe"+Math.random().toString(36).substring(7);
			element.attr('id', attrs.id);
			
			return function(scope, element, attrs) {
				var directions =attrs.directions.split(",");
				
				function setSwipe(curDirection) {
					// return function() {
						libSwipe.setSwipe(
							'#'+attrs.id,
							curDirection,
							{
								'fxn':function() {
									if(scope.onswipe !==undefined && scope.onswipe() !==undefined && typeof(scope.onswipe()) =='function') {		//ensure the function exists
										scope.onswipe()({'direction':curDirection});
									}
								}
							}
						);
					// };
				}
				
				var ii;
				for(ii =0; ii<directions.length; ii++) {
					setSwipe(directions[ii]);
				}
			};
		}
	};
}])
.factory('libSwipe', ['libFeatureSupported', function(libFeatureSupported){
var inst ={

	//1.
	/*
	@param selector =string, i.e. "#[id]", ".[class]"
	@param direction =string, one of: 'left', 'right', 'up', 'down'
	@param params
		fxn =function() to call on swipe
	*/
	setSwipe: function(selector, direction, params)
	{
		if(libFeatureSupported.touch && $(selector).length)
		{
			if(direction =='left')
			{
				$(selector).unbind('swipeleft');
				//$(selector).swipeleft(function(ee) {alert(selector+" left"); });
				$(selector).swipeleft(function(ee) {params.fxn(); });
			}
			else if(direction =='right')
			{
				$(selector).unbind('swiperight');
				$(selector).swiperight(function(ee) {params.fxn(); });
			}
			else if(direction =='up')
			{
				$(selector).unbind('swipeup');
				$(selector).swipeup(function(ee) {params.fxn(); });
			}
			else if(direction =='down')
			{
				$(selector).unbind('swipedown');
				$(selector).swipedown(function(ee) {params.fxn(); });
			}
		}
	}

};
return inst;
}]);