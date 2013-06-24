/**
@fileOverview
Some additional array/object functions that lodash doesn't seem to have..

@module array
@class array

@toc
//public
1. findArrayIndex
2. sort2D
//private
2.5. subSort2D
*/

'use strict';

var self;

/**
@param {Object} opts
*/
function Array(opts) {
	self =this;
}

/**
Returns the index of an 2D []{} associative array when given the key & value to search for within the array
@toc 1.
@method findArrayIndex
@param {Array} array 2D array []{} to search
@param {String} key Object key to check value against
@param {Mixed} val To match key value against
@param {Object} [params]
	@param {Boolean} oneD True if it's a 1D array
*/
Array.prototype.findArrayIndex =function(array, key, val, params) {
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
};

/**
takes a multidimensional array & array index to sort by and returns the multidimensional array, now sorted by that array index
@toc 2.
@method sort2D
@param {Array} arrayUnsorted 2D array []{} of objects to sort
@param {Number} column Array index to sort by (note first one is 0)
@param {Object} [params]
	@param {String} [order] 'Desc' for reverse order sort
@return {Array} sortedArray input array of objects []{} but now sorted
*/
Array.prototype.sort2D =function(arrayUnsorted, column, params) {
	var tempArray =[];	//copy calHide array here to sort; then re-copy back into calHide array once sorted
	var array2D =[];
	var ii;
	for(ii =0; ii<arrayUnsorted.length; ii++)
	{
		tempArray[ii] =[];
		tempArray[ii] =arrayUnsorted[ii];
		array2D[ii] =[ii, tempArray[ii][column]];
	}

	array2D =subSort2D(array2D);		//function		- array2D will come out sorted

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
};

/**
@toc 2.5.
array has 2 elements: 1st is an identifier (for use to match later), 2nd gets sorted & keeps it's identifier with it
@return array1
*/
function subSort2D(array1)
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
}

module.exports = new Array({});