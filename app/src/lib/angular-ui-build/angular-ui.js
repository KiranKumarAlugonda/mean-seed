
angular.module('ui.config', []).value('ui.config', {});
angular.module('ui.filters', ['ui.config']);
angular.module('ui.directives', ['ui.config']);
angular.module('ui', ['ui.filters', 'ui.directives', 'ui.config']);

/**
 * Animates the injection of new DOM elements by simply creating the DOM with a class and then immediately removing it
 * Animations must be done using CSS3 transitions, but provide excellent flexibility
 *
 * @todo Add proper support for animating out
 * @param [options] {mixed} Can be an object with multiple options, or a string with the animation class
 *    class {string} the CSS class(es) to use. For example, 'ui-hide' might be an excellent alternative class.
 * @example <li ng-repeat="item in items" ui-animate=" 'ui-hide' ">{{item}}</li>
 */
angular.module('ui.directives').directive('uiAnimate', ['ui.config', '$timeout', function (uiConfig, $timeout) {
  var options = {};
  if (angular.isString(uiConfig.animate)) {
    options['class'] = uiConfig.animate;
  } else if (uiConfig.animate) {
    options = uiConfig.animate;
  }
  return {
    restrict: 'A', // supports using directive as element, attribute and class
    link: function ($scope, element, attrs) {
      var opts = {};
      if (attrs.uiAnimate) {
        opts = $scope.$eval(attrs.uiAnimate);
        if (angular.isString(opts)) {
          opts = {'class': opts};
        }
      }
      opts = angular.extend({'class': 'ui-animate'}, options, opts);

      element.addClass(opts['class']);
      $timeout(function () {
        element.removeClass(opts['class']);
      }, 20, false);
    }
  };
}]);


/*
*  AngularJs Fullcalendar Wrapper for the JQuery FullCalendar
*  API @ http://arshaw.com/fullcalendar/ 
*  
*  Angular Calendar Directive that takes in the [eventSources] nested array object as the ng-model and watches (eventSources.length + eventSources[i].length) for changes. 
*       Can also take in multiple event urls as a source object(s) and feed the events per view.
*       The calendar will watch any eventSource array and update itself when a delta is created  
*       An equalsTracker attrs has been added for use cases that would render the overall length tracker the same even though the events have changed to force updates.
*
*/

angular.module('ui.directives').directive('uiCalendar',['ui.config', '$parse', function (uiConfig,$parse) {
     uiConfig.uiCalendar = uiConfig.uiCalendar || {};       
     //returns calendar     
     return {
        require: 'ngModel',
        restrict: 'A',
          link: function(scope, elm, attrs, $timeout) {
            var sources = scope.$eval(attrs.ngModel);
            var tracker = 0;
            /* returns the length of all source arrays plus the length of eventSource itself */
            var getSources = function () {
              var equalsTracker = scope.$eval(attrs.equalsTracker);
              tracker = 0;
              angular.forEach(sources,function(value,key){
                if(angular.isArray(value)){
                  tracker += value.length;
                }
              });
               if(angular.isNumber(equalsTracker)){
                return tracker + sources.length + equalsTracker;
               }else{
                return tracker + sources.length;
              }
            };
            /* update the calendar with the correct options */
            function update() {
              //calendar object exposed on scope
              scope.calendar = elm.html('');
              var view = scope.calendar.fullCalendar('getView');
              if(view){
                view = view.name; //setting the default view to be whatever the current view is. This can be overwritten. 
              }
              /* If the calendar has options added then render them */
              var expression,
                options = {
                  defaultView : view,
                  eventSources: sources
                };
              if (attrs.uiCalendar) {
                expression = scope.$eval(attrs.uiCalendar);
              } else {
                expression = {};
              }
              angular.extend(options, uiConfig.uiCalendar, expression);
              scope.calendar.fullCalendar(options);
            }
            update();
              /* watches all eventSources */
              scope.$watch(getSources, function( newVal, oldVal )
              {
                update();
              });
         }
    };
}]);
/*global angular, CodeMirror, Error*/
/**
 * Binds a CodeMirror widget to a <textarea> element.
 */
angular.module('ui.directives').directive('uiCodemirror', ['ui.config', '$timeout', function (uiConfig, $timeout) {
	'use strict';

	var events = ["cursorActivity", "viewportChange", "gutterClick", "focus", "blur", "scroll", "update"];
	return {
		restrict:'A',
		require:'ngModel',
		link:function (scope, elm, attrs, ngModel) {
			var options, opts, onChange, deferCodeMirror, codeMirror;

			if (elm[0].type !== 'textarea') {
				throw new Error('uiCodemirror3 can only be applied to a textarea element');
			}

			options = uiConfig.codemirror || {};
			opts = angular.extend({}, options, scope.$eval(attrs.uiCodemirror));

			onChange = function (aEvent) {
				return function (instance, changeObj) {
					var newValue = instance.getValue();
					if (newValue !== ngModel.$viewValue) {
						ngModel.$setViewValue(newValue);
						scope.$apply();
					}
					if (typeof aEvent === "function")
						aEvent(instance, changeObj);
				};
			};

			deferCodeMirror = function () {
				codeMirror = CodeMirror.fromTextArea(elm[0], opts);
				codeMirror.on("change", onChange(opts.onChange));

				for (var i = 0, n = events.length, aEvent; i < n; ++i) {
					aEvent = opts["on" + events[i].charAt(0).toUpperCase() + events[i].slice(1)];
					if (aEvent === void 0) continue;
					if (typeof aEvent !== "function") continue;
					codeMirror.on(events[i], aEvent);
				}

				// CodeMirror expects a string, so make sure it gets one.
				// This does not change the model.
				ngModel.$formatters.push(function (value) {
					if (angular.isUndefined(value) || value === null) {
						return '';
					}
					else if (angular.isObject(value) || angular.isArray(value)) {
						throw new Error('ui-codemirror cannot use an object or an array as a model');
					}
					return value;
				});

				// Override the ngModelController $render method, which is what gets called when the model is updated.
				// This takes care of the synchronizing the codeMirror element with the underlying model, in the case that it is changed by something else.
				ngModel.$render = function () {
					codeMirror.setValue(ngModel.$viewValue);
				};

				// Watch ui-refresh and refresh the directive
				if (attrs.uiRefresh) {
					scope.$watch(attrs.uiRefresh, function(newVal, oldVal){
						// Skip the initial watch firing
						if (newVal !== oldVal)
							$timeout(codeMirror.refresh);
					});
				}
			};

			$timeout(deferCodeMirror);

		}
	};
}]);

/*
 Gives the ability to style currency based on its sign.
 */
angular.module('ui.directives').directive('uiCurrency', ['ui.config', 'currencyFilter' , function (uiConfig, currencyFilter) {
  var options = {
    pos: 'ui-currency-pos',
    neg: 'ui-currency-neg',
    zero: 'ui-currency-zero'
  };
  if (uiConfig.currency) {
    angular.extend(options, uiConfig.currency);
  }
  return {
    restrict: 'EAC',
    require: 'ngModel',
    link: function (scope, element, attrs, controller) {
      var opts, // instance-specific options
        renderview,
        value;

      opts = angular.extend({}, options, scope.$eval(attrs.uiCurrency));

      renderview = function (viewvalue) {
        var num;
        num = viewvalue * 1;
        element.toggleClass(opts.pos, (num > 0) );
        element.toggleClass(opts.neg, (num < 0) );
        element.toggleClass(opts.zero, (num === 0) );
        if (viewvalue === '') {
          element.text('');
        } else {
          element.text(currencyFilter(num, opts.symbol));
        }
        return true;
      };

      controller.$render = function () {
        value = controller.$viewValue;
        element.val(value);
        renderview(value);
      };

    }
  };
}]);

/*global angular */
/*
 jQuery UI Datepicker plugin wrapper

 @note If ≤ IE8 make sure you have a polyfill for Date.toISOString()
 @param [ui-date] {object} Options to pass to $.fn.datepicker() merged onto ui.config
 */

angular.module('ui.directives')

.directive('uiDate', ['ui.config', function (uiConfig) {
  'use strict';
  var options;
  options = {};
  if (angular.isObject(uiConfig.date)) {
    angular.extend(options, uiConfig.date);
  }
  return {
    require:'?ngModel',
    link:function (scope, element, attrs, controller) {
      var getOptions = function () {
        return angular.extend({}, uiConfig.date, scope.$eval(attrs.uiDate));
      };
      var initDateWidget = function () {
        var opts = getOptions();

        // If we have a controller (i.e. ngModelController) then wire it up
        if (controller) {
          var updateModel = function () {
            scope.$apply(function () {
              var date = element.datepicker("getDate");
              element.datepicker("setDate", element.val());
              controller.$setViewValue(date);
              element.blur();
            });
          };
          if (opts.onSelect) {
            // Caller has specified onSelect, so call this as well as updating the model
            var userHandler = opts.onSelect;
            opts.onSelect = function (value, picker) {
              updateModel();
              scope.$apply(function() {
                userHandler(value, picker);
              });
            };
          } else {
            // No onSelect already specified so just update the model
            opts.onSelect = updateModel;
          }
          // In case the user changes the text directly in the input box
          element.bind('change', updateModel);

          // Update the date picker when the model changes
          controller.$render = function () {
            var date = controller.$viewValue;
            if ( angular.isDefined(date) && date !== null && !angular.isDate(date) ) {
              throw new Error('ng-Model value must be a Date object - currently it is a ' + typeof date + ' - use ui-date-format to convert it from a string');
            }
            element.datepicker("setDate", date);
          };
        }
        // If we don't destroy the old one it doesn't update properly when the config changes
        element.datepicker('destroy');
        // Create the new datepicker widget
        element.datepicker(opts);
        if ( controller ) {
          // Force a render to override whatever is in the input text box
          controller.$render();
        }
      };
      // Watch for changes to the directives options
      scope.$watch(getOptions, initDateWidget, true);
    }
  };
}
])

.directive('uiDateFormat', ['ui.config', function(uiConfig) {
  var directive = {
    require:'ngModel',
    link: function(scope, element, attrs, modelCtrl) {
      var dateFormat = attrs.uiDateFormat || uiConfig.dateFormat;
      if ( dateFormat ) {
        // Use the datepicker with the attribute value as the dateFormat string to convert to and from a string
        modelCtrl.$formatters.push(function(value) {
          if (angular.isString(value) ) {
            return $.datepicker.parseDate(dateFormat, value);
          }
        });
        modelCtrl.$parsers.push(function(value){
          if (value) {
            return $.datepicker.formatDate(dateFormat, value);
          }
        });
      } else {
        // Default to ISO formatting
        modelCtrl.$formatters.push(function(value) {
          if (angular.isString(value) ) {
            return new Date(value);
          }
        });
        modelCtrl.$parsers.push(function(value){
          if (value) {
            return value.toISOString();
          }
        });
      }
    }
  };
  return directive;
}]);

/**
 * General-purpose Event binding. Bind any event not natively supported by Angular
 * Pass an object with keynames for events to ui-event
 * Allows $event object and $params object to be passed
 *
 * @example <input ui-event="{ focus : 'counter++', blur : 'someCallback()' }">
 * @example <input ui-event="{ myCustomEvent : 'myEventHandler($event, $params)'}">
 *
 * @param ui-event {string|object literal} The event to bind to as a string or a hash of events with their callbacks
 */
angular.module('ui.directives').directive('uiEvent', ['$parse',
  function ($parse) {
    return function (scope, elm, attrs) {
      var events = scope.$eval(attrs.uiEvent);
      angular.forEach(events, function (uiEvent, eventName) {
        var fn = $parse(uiEvent);
        elm.bind(eventName, function (evt) {
          var params = Array.prototype.slice.call(arguments);
          //Take out first paramater (event object);
          params = params.splice(1);
          scope.$apply(function () {
            fn(scope, {$event: evt, $params: params});
          });
        });
      });
    };
  }]);

/**
@todo
- add specific input type directives to be included here (checkbox, etc.)
- add more/customized validation

Adds consistent layout (inluding input labels) and styling to an input element so groups of inputs all look the same. Also adds validation. Basically makes it faster and easier to build forms by making it just 1 line of directive code in your partial (rather than several) to create a full, nice looking input.
This directive is typically NOT meant to be used with just one input by itself or for a group of inputs that do NOT have a lot in common - since the whole point of this directive is to make a GROUP of inputs look the same.

SUPPORTED INPUT TYPES:
text, password, textarea, select, multiSelect
NOT YET SUPPORTED INPUT TYPES:
checkbox, multiCheckbox, slider, image?

@toc
1. init
2. initSelect
3. initSelectModel
4. initSelectOpts
5. $scope.$watch('ngModel',..

scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html)
	@param {String} ngModel Variable for storing the input's value
	@param {Object} opts
		@param {Function} [ngChange] Will be called AFTER the value is updated
		@param {Object} [validationMessages] Key-value pairs of validation messages to display (i.e. {minlength: 'Too short!'} )
	@param {Array} [selectOpts] REQUIRED for 'select' type. These are options for the <select>. Each item is an object of:
		@param {String} val Value of this option. NOTE: this should be a STRING, not a number or int type variable. Values will be coerced to 'string' here but for performance and to ensure accurate display, pass these in as strings (i.e. 1 would become '1'). UPDATE: they may not actually have to be strings but this type coercion ensures the ngModel matches the options since 1 will not match '1' and then the select value won't be set properly. So basically types need to match so just keep everything in strings. Again, ngModel type coercion will be done here but it's best to be safe and just keep everything as strings.
		@param {String} name text/html to display for this option

attrs
	@param {String} [type ='text'] Input type, one of: 'text'
	@param {String} [class =''] Class to give to outermost element
	@param {String} [id ='[random string]'] Id for this input
	@param {String} [placeholder =''] Placeholder text for input (defaults to attrs.label if placeholder is not defined)
	@param {String} [label =''] Text for <label> (defaults to attrs.placeholder if label is not defined)
	@param {Number} [noLabel] Set to 1 to not show label
	

EXAMPLE usage:
partial / html:
<div ui-forminput opts='opts' ng-model='formVals.title'></div>

controller / js:
$scope.formVals ={
	'title':'test title here'
};
$scope.opts ={
	ngChange: function() {$scope.searchTasks({}); }
};

$scope.searchTasks =function() {
	//do something
};

//end: EXAMPLE usage
*/
angular.module('ui.directives').directive('uiForminput', ['ui.config', '$compile', '$http', '$timeout', function (uiConfig, $compile, $http, $timeout) {
  return {
		restrict: 'A',
		//NOTE: transclude and terminal don't play nice together and those plus priority are finicky; I don't really understand it, but in order for BOTH the $scope.form.$valid to be accurate AND the ngModel to carry through, need:
		//transclude: true, terminal: false
		transclude: true,	//NOTE: this does NOT work the same with "terminal" set, so after to use "transclude" function instead of ng-transclude..		//NOTE: this apparently is REQUIRED even if not using transclude..
		priority:100,		//we need this AND terminal - otherwise the form will not be $valid on submit (priority 100 so this will happen before ngModel)
		//terminal: true,		//can NOT be set otherwise ngModel value will be blank / not accurrate		//we need this AND priority - otherwise the form will not be $valid on submit
		scope: {
			ngModel:'=',
			// opts:'=?',		//not supported on stable releases of AngularJS yet (as of 2013.04.30)
			opts:'=',
			selectOpts:'='
		},
		require: '?^form',		//if we are in a form then we can access the formController (necessary for validation to work)

		compile: function(element, attrs, transclude) {
			if(!attrs.type) {
				attrs.type ='text';		//default
			}
			
			var defaults ={'noLabel':0};
			for(var xx in defaults) {
				if(attrs[xx] ===undefined) {
					attrs[xx] =defaults[xx];
				}
			}
			var attrsToInt =['noLabel'];
			for(var ii=0; ii<attrsToInt.length; ii++) {
				attrs[attrsToInt[ii]] =parseInt(attrs[attrsToInt[ii]], 10);
			}
			
			var classes =attrs.class || '';
			var placeholder =attrs.placeholder || attrs.label || '';
			var label =attrs.label || attrs.placeholder || '';
			
			//was going to try to put html in templates but since don't have access to scope in compile function, there's no way to set dynamic values, which is the whole point of this directive.. Plus it's better for performance to just have things here, even though it breaks the "separation of html and javascript" convention..
			// $http.get('template/' + template + '.html', {cache:$templateCache}).then(function(response) {
			// });
			var html ={
				label: '',
				input: '',
				validation: ''
			};
			if(label && !attrs.noLabel) {
				html.label ="<label>"+label+"</label>";
			}
			
			//copy over attributes
			var customAttrs ='';		//string of attrs to copy over to input
			var skipAttrs =['uiForminput', 'ngModel', 'label', 'type', 'placeholder', 'opts', 'name'];
			angular.forEach(attrs, function (value, key) {
				if (key.charAt(0) !== '$' && skipAttrs.indexOf(key) === -1) {
					customAttrs+=attrs.$attr[key];
					if(attrs[key]) {
						customAttrs+='='+attrs[key];
					}
					customAttrs+=' ';
				}
			});
			
			/**
			setting the name and scope variables can be a little tricky..
			- First I tried with name='"+attrs.name+"' but that doesn't work inside ng-repeat tags since there's only ONE compile function so ALL inputs have the SAME name (and id), which is no good
			- So we MUST reset unique attributes (the name/id) in the link function with a NEW (and this time ACTUALLY unique) value so then I used scope with name='{{name}}' and that worked to correctly ensure uniqueness BUT then the validation stopped working since the formCtrl is outdated and only has ONE '{{name}}' key..
			- So now we're setting BOTH a unique id up top here in the compile function (for the fromCtrl validation to work properly) AND then overwriting it in the link function AND overwriting the formCtrl keys as well.. This is the only way I could get BOTH unique name/id attributes AND get the validation to work (i.e. have formCtrl have the proper keys)..
			The `elementTag` variable set here is for .find() later in the link function for updating the name attribute on the proper element
			*/
			var uniqueName ="uiFormInput"+attrs.type+Math.random().toString(36).substring(7);
			var elementTag ='input';
			if(attrs.type =='text') {
				html.input ="<input class='ui-forminput-input' name='"+uniqueName+"' ng-model='ngModel' type='text' placeholder='"+placeholder+"' "+customAttrs+" />";
			}
			else if(attrs.type =='password') {
				html.input ="<input class='ui-forminput-input' name='"+uniqueName+"' ng-model='ngModel' type='password' placeholder='"+placeholder+"' "+customAttrs+" />";
			}
			else if(attrs.type =='textarea') {
				elementTag ='textarea';
				html.input ="<textarea class='ui-forminput-input' name='"+uniqueName+"' ng-model='ngModel' placeholder='"+placeholder+"' "+customAttrs+" ></textarea>";
			}
			else if(attrs.type =='select') {
				elementTag ='select';
				html.input ="<select class='ui-forminput-input' name='"+uniqueName+"' ng-model='ngModel' ng-change='onchange({})' "+customAttrs+" ng-options='opt.val as opt.name for opt in selectOpts'></select>";
			}
			else if(attrs.type =='multi-select') {
				elementTag ='div';
				html.input ="<div class='ui-forminput-input' name='"+uniqueName+"' ui-multiselect select-opts='selectOpts' ng-model='ngModel' config='opts'></div>";
			}
			
			//validation
			//'track by $id($index)' is required for Angular >= v1.1.4 otherwise will get a 'duplicates in a repeater are not allowed' error; see here for this solution: http://mutablethought.com/2013/04/25/angular-js-ng-repeat-no-longer-allowing-duplicates/
			html.validation ="<div class='ui-forminput-validation text-error' ng-repeat='(key, error) in field.$error track by $id($index)' ng-show='error && field.$dirty' class='help-inline'>{{opts1.validationMessages[key]}}</div>";
			
			var htmlFull ="<div class='ui-forminput-cont'><div class='ui-forminput'>"+html.label+html.input+"</div>"+html.validation+"</div>";
			element.replaceWith(htmlFull);
			
			return function(scope, element, attrs, formCtrl) {
			
				//if was in an ng-repeat, they'll have have the same compile function so have to set the id here, NOT in the compile function (otherwise they'd all be the same..)
				if(attrs.id ===undefined) {
					attrs.id ="uiFormInput"+attrs.type+Math.random().toString(36).substring(7);
				}
				if(!attrs.name) {
					attrs.name =attrs.id;
				}
				scope.id =attrs.id;
				scope.name =attrs.name;
				
				//update the OLD name with the NEW name
				element.find(elementTag+'.ui-forminput-input').attr('name', attrs.name);
				
				/*
				//NOT WORKING..
				//if was in an ng-repeat, they'll all have the same id's so need to re-write the html with new unique id's..
				if(scope.$parent.$index !=undefined) {		//ng-repeat has $parent.$index so use this to test
					var oldId =attrs.id;		//save for replacing later
					attrs.id ="uiFormInput"+attrs.type+Math.random().toString(36).substring(7);		//overwrite with new one (link function is run per each item so this will generate new id's for EACH instance, which is what we want to ensure uniqueness)
					
					var newHtml =element.html().replace(new RegExp(oldId,"gm"), attrs.id);
					element.html(newHtml);
					$compile($(element))(scope);
				}
				*/
				
				if(attrs.type =='multi-select') {
					$compile($(element))(scope);
				}
				
				//set up validation
				if(formCtrl) {
					//copy over the OLD unique name to the NEW unique name then delete the old one (since at this point, formCtrl is outdated/has bad info since the name of the input has CHANGED)
					formCtrl[attrs.name] =formCtrl[uniqueName];
					delete formCtrl[uniqueName];
					//set the scope.field value equal to the formCtrl input handle for validation to work
					scope.field =formCtrl[attrs.name];
				}
			};
		},
		controller: function($scope, $element, $attrs) {
			$scope.opts1 ={};		//can't use $scope.opts in case it's not defined/set otherwise get "Non-assignable model expression.." error..
			var defaultOpts ={
				validationMessages: {
					required: 'Required!',
					minlength: 'Too short!',
					maxlength: 'Too long!',
					pattern: 'Invalid characters!'
					// number: 'Must be a number!'		//not working
				}
			};
			if(!$scope.opts || $scope.opts ===undefined) {
				$scope.opts1 =defaultOpts;
			}
			else {		//extend defaults
				var xx;
				for(xx in defaultOpts) {
					$scope.opts1[xx] =defaultOpts[xx];
				}
			}
			
			
			if($scope.opts && $scope.opts.ngChange) {
				$scope.onchange =function(params) {
					//timeout first so the value is updated BEFORE change fires
					$timeout(function() {
						$scope.opts.ngChange();
					}, 50);
				};
			}
			
			
			/**
			@toc 1.
			@method init
			*/
			function init(params) {
				if($attrs.type =='select' || $attrs.type =='multiSelect') {
					initSelect({});
				}
			}
			
			/**
			<select> opts must be STRINGS otherwise they won't work properly (number values will just have 0, 1, 2, etc. as values). UPDATE: this may not actually be true - inspecting the HTML will always show "value='0'" "value='1'" for the select option values but they should still work properly. What IS important is that types match between the option values and the ngModel. Thus we're not type forcing ngModel to be a string to ensure they both match.
			@toc 2.
			@method initSelect
			*/
			function initSelect(params) {
				initSelectModel({});
				initSelectOpts({});
			}
			
			/**
			@toc 3.
			@method initSelectModel
			*/
			function initSelectModel(params) {
				if($scope.ngModel !==undefined && typeof($scope.ngModel) !=='string') {		//NOTE: MUST first check that ngModel is not undefined since otherwise converting to string will cause errors later
					$scope.ngModel =$scope.ngModel.toString();		//ensure BOTH ngModel and options are both strings
				}
			}
			
			/**
			@toc 4.
			@method initSelectOpts
			*/
			function initSelectOpts(params) {
				var ii;
				for(ii =0; ii<$scope.selectOpts.length; ii++) {
					if(typeof($scope.selectOpts[ii].val) =='number') {
						$scope.selectOpts[ii].val =$scope.selectOpts[ii].val.toString();
					}
					else {		//assume they're all the same format so if find one non-number, break (for performance reasons)
						// break;
						var dummy =1;		//breaking isn't a safe assumption - may have default string value and the rest are numbers..
					}
				}
			}
			
			/**
			@toc 5.
			*/
			$scope.$watch('ngModel', function(newVal, oldVal) {
				if(!angular.equals(oldVal, newVal)) {		//very important to do this for performance reasons since $watch runs all the time
					//if ngModel changes, have to ensure it's a string - otherwise the currently selected value will NOT be selected (it will just show the blank top option as selected)
					if($attrs.type =='select' || $attrs.type =='multiSelect') {
						initSelectModel({});
					}
				}
			});
			
			init({});		//init the first time
		}
	};
}])
;
/**

@toc

scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html)

attrs
	@param {String} iconClass Class to give to left side of button (this should refer to a CSS class that shows an image)
	@param {String} buttonText Text to show on the right side of the button

EXAMPLE usage:
partial / html:
<div ui-iconbutton icon-class='my-icon' button-text='Button Text!'></div>

controller / js:

//end: EXAMPLE usage
*/
angular.module('ui.directives').directive('uiIconbutton', ['ui.config', function (uiConfig) {
  return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			element.addClass('ui-iconbutton clearfix');
			var htmlText ="<div class='ui-iconbutton-icon "+attrs.iconClass+"'></div>"+
				"<div class='ui-iconbutton-text'>"+attrs.buttonText+"</div>";
			element.html(htmlText);
		}
	};
}])
;
/*
 * Defines the ui-if tag. This removes/adds an element from the dom depending on a condition
 * Originally created by @tigbro, for the @jquery-mobile-angular-adapter
 * https://github.com/tigbro/jquery-mobile-angular-adapter
 */
angular.module('ui.directives').directive('uiIf', [function () {
  return {
    transclude: 'element',
    priority: 1000,
    terminal: true,
    restrict: 'A',
    compile: function (element, attr, transclude) {
      return function (scope, element, attr) {

        var childElement;
        var childScope;
 
        scope.$watch(attr.uiIf, function (newValue) {
          if (childElement) {
            childElement.remove();
            childElement = undefined;
          }
          if (childScope) {
            childScope.$destroy();
            childScope = undefined;
          }

          if (newValue) {
            childScope = scope.$new();
            transclude(childScope, function (clone) {
              childElement = clone;
              element.after(clone);
            });
          }
        });
      };
    }
  };
}]);
/**
@todo
- do & document backend code
- make uploaded image show up on top of existing drop zone
- test (unit tests & manually w/ backend)
- theme / style
- modularize more (i.e. definitely put crop stuff in another directive)
	- move html into a template?
- document
- do crop
	- test


//TOC
//1. function checkFileType
//2. function getFileExtension
//3. $scope.fileSelected =function
//4. $scope.uploadFile =function
//5. function uploadProgress
//6. function uploadComplete
//6.25. function ajaxUploadComplete
//6.5. function afterComplete
//7. function uploadFailed
//8. function uploadCanceled


scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html)
	@param {String} ngModel Variable for storing the file name of the uploaded file
	@param {Object} opts
		@param {String} uploadPath Path to upload file to (backend script)
		@param {String} uploadDirectory Directory to store file in - NOTE: this must be relative to the ROOT of the server!!
		@param {Object} imageServerKeys Items that tell what keys hold the following info after returned from backend
			@param {String} imgFileName Key for variable that holds image file name / partial parth ONLY (not the full path; uploadDirectory variable will be prepended). This can have a folder as part of it - i.e. 'image1.jpg' OR 'original/image1.jpg'
			@param {Number} picHeight
			@param {Number} picWidth
			@param {String} imgFileNameCrop Key for variable that holds the file name of the newly cropped image. This can also have a folder in front of it - i.e. '200/image1.jpg'
		@param {Object} [serverParamNames] Form names to submit (so can interact with any server). Note, additional information will be passed back in "fileData" object and "cropOptions" object
			@param {String} [file ='file']
			@param {String} [byUrl ='fileData[fileUrl]']
		@param {String} [uploadCropPath] (required for cropping) Path to handle the cropping (backend script)
		@param {Object} [values]
			@param {String} dirPath Path where image is (to show a default / initial value image the ngModel value will be appended to this path (if these both exist))
			@param {String} src Filename (i.e. image.jpg)
		@param {Array} [fileTypes] 1D array [] of valid file types (i.e. ['png', 'jpg', 'jpeg', 'bmp', 'gif'])
		@param {Object} cropOptions Items with defaults for cropping
			@param {Boolean} [crop =true] True to allow cropping
			@param {Number} [cropAspectRatio =1] Number to indicate how to crop, 1 = square, 2 = twice as wide as tall, .5 =twice as tall as wide
			@param {Number} [cropMinHeight =100] Minimum pixel height for cropped version
			@param {Number} [cropMinWidth =100] Minimum pixel width for cropped version
			@param {Number} [cropMaxHeight =300] Max pixel height for cropped version
			@param {Number} [cropMaxWidth =300] Max pixel width for cropped version
			@param {String} [cropDuplicateSuffix ="_crop"] Suffix to add to image for the cropped version
		@param {Object} callbackInfo
			@param {String} evtName Angular event name to broadcast
			@param {Array} args Function arguments ('data' will be appended as additional argument to end)
		//standardAjaxForUrl =boolean true if want to use jquery/standard ajax for submitting url as opposed to form data

attrs
	@param {Number} [useUploadButton=0] True if want to show an upload button for confirming the upload (otherwise, as soon as picture is selected, it will be uploaded & shown for a preview)
	@param {String} [type =dragNDrop] What type of user interface - one of: 'dragNDrop', 'byUrl' (to paste a link from another website)
	@param {String} [htmlDisplay] Complete html for what to put in drag box
	@param {String} [htmlUrlInstructions] Complete html for what to put below upload by url input field
	@param {String} [htmlUploading] Html to display during upload INSTEAD of upload progress bar (i.e. in case backend is doing more than just uploading the image (heavy image process that takes many seconds) in which case the progress bar will only show the upload progress but backend may not be done yet..)

EXAMPLE usage:
partial / html:
<div ui-imageupload opts='uploadOpts' ng-model='image'></div>

controller / js:
$scope.image ='';
//NOTE: the $scope.$on evt is optional since using ngModel will automatically update this $scope value accordingly
var evtImageUpload ='TestCtrlImageUpload';
$scope.uploadOpts =
{
	//'type':'byUrl',
	'uploadPath':'/api/image/upload',
	'uploadDirectory':'/public/uploads',
	'uploadCropPath':'/api/image/crop',
	'callbackInfo':{'evtName':evtImageUpload, 'args':[{'var1':'yes'}]},
	'imageServerKeys':{'imgFileName':'fileNameSave', 'picHeight':'picHeight', 'picWidth':'picWidth', 'imgFileNameCrop':'newFileName'},		//hardcoded must match: server return data keys
	//'htmlDisplay':"<div class='ig-form-pic-upload'><div class='ig-form-pic-upload-button'>Select Photo</div></div>",
	'cropOptions': {'cropMaxHeight':500, 'cropMaxWidth':500},
	//'values':{'dirPath':'/uploads'},
};

//OPTIONAL
$scope.$on(evtImageUpload, function(evt, args) {
	//do extra post upload handling here..
	//$scope.formVals.image =args[1].imgFileName;
});

//end: EXAMPLE usage
*/
angular.module('ui.directives').directive('uiImageupload', ['ui.config', '$timeout', 'uiImageuploadData', function (uiConfig, $timeout, uiImageuploadData) {
  return {
		restrict: 'A',
		//transclude: true,
		scope: {
			opts:'=',
			ngModel:'='
		},

		compile: function(element, attrs) {
			var xx;
			var defaults ={'type':'dragNDrop', 'useUploadButton':'0', 'classes':{'dragText':'ui-imageupload-drag-text', 'orText':'ui-imageupload-or-text', 'uploadText':'ui-imageupload-upload-text', 'browseInput':'ui-imageupload-browse-input', 'browseButton':'ui-imageupload-browse-button', 'uploadButton':'ui-imageupload-upload-button'}, 'htmlUploading':'', 'showProgress':true};
			if(attrs.htmlUploading !==undefined) {
				defaults.showProgress =false;
			}

			for(xx in defaults) {
				if(attrs[xx] ===undefined) {
					if(typeof(defaults[xx]) =='object') {		//don't extend objects - will do that after this
						attrs[xx] ={};
					}
					else {
						attrs[xx] =defaults[xx];
					}
				}
			}
			for(xx in defaults.classes) {
				if(attrs.classes[xx] ===undefined) {
					attrs.classes[xx] =defaults.classes[xx];
				}
			}
		
			//convert to int
			var attrsToInt =['useUploadButton'];
			for(var ii=0; ii<attrsToInt.length; ii++) {
				attrs[attrsToInt[ii]] =parseInt(attrs[attrsToInt[ii]], 10);
			}
			
			if(attrs.id ===undefined) {
				attrs.id ="uiImageupload"+Math.random().toString(36).substring(7);
			}
			var fileTypeDisplay ="Image";
			var id1 =attrs.id;
			var ids ={
				'input':{
					'fileFake':id1+"FileFake",
					'file':id1+"File",
					'byUrl':id1+"ByUrl"
				},
				'progress':{
					'barInner':id1+"ProgressBarInner",
					'bar':id1+"ProgressBar"
				}
			};
			attrs.ids =ids;		//save for later
			//save in case need later / in service
			uiImageuploadData[id1] ={
				'ids':ids
			};
			
			var htmlDisplay, htmlUrlInstructions;
			if(attrs.htmlDisplay !==undefined)
			{
				htmlDisplay =attrs.htmlDisplay;
				htmlDisplay +="<input ng-model='fileFake' id='"+ids.input.fileFake+"' type='hidden' disabled=disabled name='fakeupload' />";		//add in fake input to avoid errors when trying to fill it later
			}
			else
			{
				htmlDisplay ="<span class='"+attrs.classes.dragText+"'>Drag "+fileTypeDisplay+" Here</span><br />";
				htmlDisplay+="<span class='"+attrs.classes.orText+"'>--OR--</span><br />";
				htmlDisplay+="<span class='"+attrs.classes.uploadText+"'>Upload File:</span><br />";
				htmlDisplay+="<input ng-model='fileFake' id='"+ids.input.fileFake+"' type='text' disabled=disabled name='fakeupload' class='"+attrs.classes.browseInput+"' /><span class='"+attrs.classes.browseButton+"'>Browse</span>";
			}
			if(attrs.htmlUrlInstructions !==undefined)
			{
				htmlUrlInstructions =attrs.htmlUrlInstructions;
			}
			else
			{
				htmlUrlInstructions ="<span class='ui-imageupload-by-url-instructions'>1. Right click an image on the web, 2. Choose \"Copy image URL\", 3. Paste it above!</span>";
			}
			
			//@todo - don't have access to cropOptions yet - in $scope..
			attrs.cropOptions ={
				'cropAspectRatio':1
			};
			var widthAspectDummyPercent =Math.floor(100 / attrs.cropOptions.cropAspectRatio);
			widthAspectDummyPercent =0;		//@todo - this doesn't seem to be working otherwise..
			
			var ngShow ={
				'dragNDrop':false,
				'uploadButton':false
			};
			if(attrs.type =='dragNDrop') {
				ngShow.dragNDrop =true;
				if(!attrs.useUploadButton) {
					ngShow.uploadButton =false;
				}
			}
			
			var html ="";
			html+="<div class='ui-imageupload-form-container'>";
			html+="<form class='ui-imageupload-form' enctype='multipart/form-data' method='post' action='{{uploadPath}}'>";
			
			html+="<div class='ui-imageupload-fake-input-container' ng-show='"+ngShow.dragNDrop+"'>";
			html+="<div class='ui-imageupload-fake-input-container-inner'>";
				html+="<div class='ui-imageupload-aspect-ratio-dummy' style='padding-top:"+widthAspectDummyPercent+"%;'></div>";
				html+="<div class='ui-imageupload-aspect-ratio-element'>";
					html+=htmlDisplay;
				html+="</div>";		//end: ui-imageupload-aspect-ratio-element
			html+="</div>";		//end: dragNDropContainerDisplay
			html+="<div class='ui-imageupload-picture-container' ng-show='{{show.pictureContainer}}'>";
			html+="<div class='ui-imageupload-aspect-ratio-dummy' style='padding-top:"+widthAspectDummyPercent+"%;'></div>";
			html+="<div class='ui-imageupload-aspect-ratio-element'>";
				html+="<div class='ui-imageupload-picture-container-img-outer'>";
					html+="<img class='ui-imageupload-picture-container-img' ng-src='{{imgSrc}}' />";
				html+="</div>";
				html+="</div>";		//end: ui-imageupload-aspect-ratio-element
			html+="</div>";		//end: picture container
			//html+="<input ng-model='file' type='file' name='"+ids.input.file+"' id='"+ids.input.file+"' class='ui-imageupload-input' ng-change='fileSelected({})' />";		//ng-change apparently doesn't work..  have to use onchange instead.. https://groups.google.com/forum/?fromgroups=#!topic/angular/er8Yci9hAto
			html+="<input ng-model='file' type='file' name='"+ids.input.file+"' id='"+ids.input.file+"' class='ui-imageupload-input' onchange='angular.element(this).scope().fileSelected({})' />";
			html+="<div class='ui-imageupload-picture-container-below' ng-show='{{show.pictureContainerBelow}}'>";
				html+="<div class='ui-imageupload-picture-crop-div'><span class='ui-imageupload-picture-crop-button'>Crop Thumbnail</span></div>";
				html+="<div class='ui-imageupload-picture-container-text'>Click or drag onto the picture to change images</div>";
			html+="</div>";
			html+="<div class='ui-imageupload-picture-crop-container'>";
			html+="</div>";
			//html+="<input type='hidden' name='"+inputIds.uploadDirectory+"' id='"+inputIds.uploadDirectory+"' value='"+uploadDirectory+"' />";		//not needed; can just send via form data when send the AJAX request
			html+="</div>";		//end: dragNDropContainer
			
			//if(attrs.type !='dragNDrop') {
			if(1) {
				html+="<div class='ui-imageupload-by-url-container' ng-hide='"+ngShow.dragNDrop+"'>";
				html+="<span class='ui-imageupload-by-url-text'>Upload From Other Website</span><br /><br />";
				html+="<input ng-model='fileByUrl' id='"+attrs.ids.input.byUrl+"' type='text' class='ui-imageupload-by-url-input' placeholder='Copy & Paste URL here' />";
				html+=htmlUrlInstructions;
				html+="</div>";		//end: byUrlContainer
			}
			
			html+="</form>";
			html+="<div class='ui-imageupload-upload-upload-button-container' ng-show='"+ngShow.uploadButton+"'><span class='"+attrs.classes.uploadButton+"' ng-click='uploadFile({})'>Upload</span></div>";
			html+="<div class='ui-imageupload-notify' ng-show='{{show.notify}}'>"+attrs.htmlUploading+"</div>";
			html+="<div id='"+attrs.ids.progress.bar+"' class='ui-imageupload-progress-bar'><div id='"+attrs.ids.progress.barInner+"' class='ui-imageupload-progress-bar-inner'>&nbsp;</div></div>";
			html+="<div>{{progressNumber}}</div>";
			html+="<div>{{fileInfo.name}}</div>";
			html+="<div>{{fileInfo.size}}</div>";
			html+="<div>{{fileInfo.type}}</div>";

			html+="</div>";		//end: form container
	
			element.replaceWith(html);
		},
		
		controller: function($scope, $element, $attrs) {
			var defaults ={'cropOptions':uiImageuploadData.cropOptionsDefault, 'serverParamNames':{'file':'file', 'byUrl':'fileData[fileUrl]'}, 'values':{}};
			if($scope.opts ===undefined) {
				$scope.opts ={};
			}
			for(var xx in defaults) {
				if($scope.opts[xx] ===undefined) {
					$scope.opts[xx] =defaults[xx];
				}
			}
			/*
			attrs.serverParamNames =$.extend({}, defaults.serverParamNames, params.serverParamNames);
			if(params.cropOptions !==undefined) {
				params.cropOptions =$.extend({}, defaults.cropOptions, params.cropOptions);
			}
			*/
			
			$scope.file ='';
			$scope.fileByUrl ='';
			$scope.imgSrc =$scope.opts.values.dirPath+$scope.opts.values.src;
			$scope.show ={
				'notify':false,
				'pictureContainer':false,
				'pictureContainerBelow':false
			};
			
			/**
			//1.
			@param params
				fileTypes =mixed: string of "image" OR 1D array [] of valid file types
			@return
				valid =boolean true if valid
				errorMsg =string of msg to display
			*/
			function checkFileType(fileName, params) {
				var returnArray ={'valid':true, 'errorMsg':''};
				var fileExtension =getFileExtension(fileName, params);
				if(params.fileTypes)
				{
					if(typeof(params.fileTypes) =='string')
					{
						if(params.fileTypes =='image')
						{
							params.fileTypes =['png', 'jpg', 'jpeg', 'bmp', 'gif'];
						}
						else
							params.fileTypes ='any';		//all will be valid
					}
					if(params.fileTypes !='any')
					{
						returnArray.valid =false;
						returnArray.errorMsg ="Allowed file types are: ";
						for(var ii=0; ii<params.fileTypes.length; ii++)
						{
							returnArray.errorMsg +=params.fileTypes[ii].toLowerCase();
							if(ii<(params.fileTypes.length-1))
								returnArray.errorMsg +=", ";
							if(params.fileTypes[ii].toLowerCase() ==fileExtension)
							{
								returnArray.valid =true;
								//break;		//don't break since want to complete error message
							}
						}
					}
				}
				return returnArray;
			}

			/**
			//2.
			*/
			function getFileExtension(fileName, params)
			{
				var ext =fileName.slice((fileName.lastIndexOf(".")+1), fileName.length).toLowerCase();
				return ext;
			}
			
			/**
			//3.
			*/
			$scope.fileSelected =function(params) {
				var file, retArray;
				if($attrs.type =='byUrl')
				{
					file =document.getElementById($attrs.ids.input.byUrl).value;
					//file =$scope.fileByUrl;		//not working?
					retArray =checkFileType(file, {'fileTypes':$scope.opts.fileTypes});
					if(!retArray.valid)		//invalid file type extension
					{
						document.getElementById($attrs.ids.input.byUrl).value ='';
						//$scope.fileByUrl ='';		//not working?
						alert(retArray.errorMsg);
					}
				}
				else		//drag n drop (regular file input)
				{
					file = document.getElementById($attrs.ids.input.file).files[0];
					//file = $scope.file;		//not working?
					if (file)
					{
						var fileSize = 0;
						if (file.size > 1024 * 1024)
							fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
						else
							fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';

						if(0)
						{
						document.getElementById(params.ids.fileName).innerHTML = 'Name: ' + file.name;
						document.getElementById(params.ids.fileSize).innerHTML = 'Size: ' + fileSize;
						document.getElementById(params.ids.fileType).innerHTML = 'Type: ' + file.type;
						}
					}
					if(file)
					{
						retArray =checkFileType(file.name, {'fileTypes':$scope.opts.fileTypes});
						if(!retArray.valid)		//invalid file type extension
						{
							document.getElementById($attrs.ids.input.file).value ='';
							//$scope.file ='';		//not working?
							alert(retArray.errorMsg);
						}
						else		//update fake file input (match with actual file input)
						{
							document.getElementById($attrs.ids.input.fileFake).value =document.getElementById($attrs.ids.input.file).value;
							//$scope.fileFake =$scope.file;		//not working?
						}
					}
				}
	
				//if not using upload button, immediately upload as well
				if(!$attrs.useUploadButton && $attrs.type =='dragNDrop') {
					$scope.uploadFile(params);
				}
			};
			
			/**
			//4.
			*/
			$scope.uploadFile =function(params) {
				var fileVal;
				if($attrs.htmlUploading) {
					$scope.show.notify =true;
				}
				if($attrs.fileUrl !==undefined) {
					fileVal =$attrs.fileUrl;
				}
				else if($attrs.type =='byUrl')
				{
					//LLoading.show({});
					fileVal =document.getElementById($attrs.ids.input.byUrl).value;
					//fileVal =$scope.fileByUrl;		//not working?
				}
				else {
					fileVal =document.getElementById($attrs.ids.input.file).value;
					//fileVal =$scope.file;		//not working?
				}
				//alert(fileVal);
				if(fileVal.length >0)
				{
					angular.element(document.getElementById($attrs.ids.progress.barInner)).css({'width':'0%'});
					if($attrs.showProgress) {
						var eleProgressBar =angular.element(document.getElementById($attrs.ids.progress.bar));
						eleProgressBar.removeClass('complete');
						eleProgressBar.addClass('loading');
					}
					else {
						//LLoading.show({});		//todo
					}
					
					var fd = new FormData();
					/*
					fd.append(params.inputIds.file, document.getElementById(params.inputIds.file).files[0]);
					fd.append(params.inputIds.uploadDirectory, params.uploadDirectory);
					*/
					if($attrs.type =='byUrl') {
						fd.append($scope.opts.serverParamNames.byUrl, fileVal);
					}
					else {
						fd.append($scope.opts.serverParamNames.file, document.getElementById($attrs.ids.input.file).files[0]);
						//fd.append($scope.opts.serverParamNames.file, $scope.file);		//not working?
					}
					fd.append('fileData[uploadDir]', $scope.opts.uploadDirectory);
					if($scope.opts.cropOptions !==undefined) {
						for(var xx in $scope.opts.cropOptions) {
							fd.append('cropOptions['+xx+']', $scope.opts.cropOptions[xx]);
						}
					}
					var sendInfo =fd;
					
					var xhr = new XMLHttpRequest();
					if($attrs.showProgress) {
						xhr.upload.addEventListener("progress", uploadProgress, false);
					}
					xhr.onload =function(ee){uploadComplete(ee, params); };
					//xhr.addEventListener("load", uploadComplete, false);
					xhr.onerror =function(ee){uploadFailed(ee, params); };		//doesn't seem to work..
					//xhr.addEventListener("error", uploadFailed, false);		//doesn't seem to work..
					xhr.addEventListener("abort", uploadCanceled, false);
					xhr.open("POST", $scope.opts.uploadPath);
					xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
					xhr.onreadystatechange =function(){
						if(xhr.readyState ==4 && xhr.status !=200)
						{
							uploadFailed('', params);
						}
					};
					xhr.send(sendInfo);
				
				}		//end: if(fileVal.length >0)
			};
			
			/**
			//5.
			*/
			function uploadProgress(evt) {
				if (evt.lengthComputable) {
					var percentComplete = Math.round(evt.loaded * 100 / evt.total);
					$scope.progressNumber =percentComplete.toString() + '%';
					document.getElementById($attrs.ids.progress.barInner).style.width = percentComplete.toString() +'%';
				}
				else {
					$scope.progressNumber = 'unable to compute';
				}
			}
			
			/**
			//6.
			@param params
				callback =array {'evtName':string, 'args':[]}
				uploadFileSimple =boolean true if no display
			*/
			function uploadComplete(evt, params) {
				/* This event is raised when the server send back a response */
				//alert(evt.target.responseText);
				
				document.getElementById($attrs.ids.progress.barInner).style.width = '100%';
				
				var ele1 =angular.element(document.getElementById($attrs.ids.progress.bar));
				ele1.addClass('complete');
				
				$scope.progressNumber ='';

				var data =$.parseJSON(evt.target.responseText);
				//if(params.closeOnComplete)
					//DPopupObj.destroy({});
				afterComplete(params, data);
			}
			
			/**
			//6.25.
			*/
			function ajaxUploadComplete(params, data) {
				if(typeof(data) =='string') {
					data =$.parseJSON(data);
				}
				afterComplete(params, data);
			}
			
			/**
			//6.5.
			*/
			function afterComplete(params, data) {
				//if(params.imageServerKeys !==undefined) {
				if(1) {
					//show uploaded image
					//thisObj.saveInstanceData(params.instanceId, data, params);
					var imgInfo ={};
					if(data[$scope.opts.imageServerKeys.imgFilePath] !==undefined) {
						imgInfo.imgSrc =data[$scope.opts];
						//thisObj.curData[params.instanceId][params.imageServerKeys.imgFilePath] =imgInfo.imgSrc;
					}
					else {
						imgInfo.imgSrc =$scope.opts.uploadDirectory+data[$scope.opts.imageServerKeys.imgFileName];
						//thisObj.curData[params.instanceId][params.imageServerKeys.imgFileName] =data[params.imageServerKeys.imgFileName];
					}
					//console.log("afterComplete: "+imgInfo.imgSrc);
					imgInfo.picHeight =data[$scope.opts.imageServerKeys.picHeight];
					imgInfo.picWidth =data[$scope.opts.imageServerKeys.picWidth];
					//thisObj.curData[params.instanceId][params.imageServerKeys.picHeight] =imgInfo.picHeight;
					//thisObj.curData[params.instanceId][params.imageServerKeys.picWidth] =imgInfo.picWidth;
					imgInfo.imgSrcCrop =imgInfo.imgSrc;
					imgInfo.picHeightCrop =imgInfo.picHeight;
					imgInfo.picWidthCrop =imgInfo.picWidth;
					if($scope.opts.cropOptions.crop) {
						var index1 =imgInfo.imgSrc.lastIndexOf('.');
						imgInfo.imgSrcCrop =imgInfo.imgSrc.slice(0, index1)+$scope.opts.cropOptions.cropDuplicateSuffix+imgInfo.imgSrc.slice(index1, imgInfo.imgSrc.length);
						imgInfo.picWidthCrop =$scope.opts.cropOptions.cropMaxWidth;
						imgInfo.picHeightCrop =$scope.opts.cropOptions.cropMaxHeight;
					}
					
					var img = new Image();
					img.onload = function() {
						$scope.imgSrc =img.src;
						params.imgInfo =imgInfo;		//for passing through
						imgInfo.picHeightCrop =img.height;
						imgInfo.picWidthCrop =img.width;
						/*
						//@todo??
						thisObj.fixImageSizing({'divId':params.instanceId, 'id':params.ids.pictureContainerImgOuter, 'imgInfo':{'height':imgInfo.picHeightCrop, 'width':imgInfo.picWidthCrop} }, thisObj.afterCompleteResizing, [params, data]);
						//call again after timeout just in case since sadly the above doesn't work... - //to do - fix so it ALWAYS works and doesn't use a timeout (or continues to loop until it's non-zero width?? / the image is displayed??)
						setTimeout(function() {
							thisObj.fixImageSizing({'divId':params.instanceId, 'id':params.ids.pictureContainerImgOuter, 'imgInfo':{'height':imgInfo.picHeightCrop, 'width':imgInfo.picWidthCrop} }, thisObj.afterCompleteResizing, [params, data]);
						}, 1000);
						*/
					};
					//img.src =imgInfo.imgSrcCrop+'?'+LString.random(8,{});		//ensure new image shows up
					img.src =imgInfo.imgSrcCrop;
					/*
					//@todo
					if(img.height ==0) {		//invalid url; try uploads path
						//update BOTH (regular and crop) paths to upload
						if($scope.opts.cropOptions.crop) {
							imgInfo.imgSrc =$scope.opts.uploadDirectory+data[$scope.opts.imageServerKeys.imgFileName];
							imgInfo.imgSrcCrop =$scope.opts.uploadDirectory+LString.addFileSuffix(data[$scope.opts.imageServerKeys.imgFileName], $scope.opts.cropOptions.cropDuplicateSuffix, {});
							var imgPath1 =imgInfo.imgSrcCrop+'?'+LString.random(8,{});
						}
						else {
							imgInfo.imgSrc =$scope.opts.uploadDirectory+data[$scope.opts.imageServerKeys.imgFileName];
							imgInfo.imgSrcCrop =$scope.opts.uploadDirectory+data[$scope.opts.imageServerKeys.imgFileName];
							var imgPath1 =imgInfo.imgSrcCrop+'?'+LString.random(8,{});
						}
						img.src =imgPath1;
					}
					*/
				}
				
				$scope.ngModel =data.imgFileName;		//set ngModel
				
				if($scope.opts.callbackInfo && ($scope.opts.callbackInfo ===undefined || !params.noCallback))
				{
					var args =$scope.opts.callbackInfo.args;
					args =args.concat(data);
					//$scope.$broadcast($scope.opts.callbackInfo.evtName, args);
					$scope.$emit($scope.opts.callbackInfo.evtName, args);
				}
				//LLoading.close({});
				$scope.show.notify =false;
				
				//ensure back in angular world so events fire now
				if(!$scope.$$phase) {
					$scope.$apply();
				}
			}
			
			/**
			//7.
			*/
			function uploadFailed(evt) {
				alert("There was an error attempting to upload the file. Please try again or try a different file.");
				//LLoading.close({});
			}

			/**
			//8.
			*/
			function uploadCanceled(evt) {
				alert("The upload has been canceled by the user or the browser dropped the connection.");
				//LLoading.close({});
			}
			
			//init({});		//init (called once when directive first loads)
		}
	};
}])
.factory('uiImageuploadData', ['ui.config', '$timeout', function (uiConfig, $timeout) {
var inst ={
	cropOptionsDefault: {'crop':true, 'cropAspectRatio':1, 'cropMinHeight':100, 'cropMinWidth':100, 'cropMaxHeight':300, 'cropMaxWidth':300, 'cropDuplicateSuffix':"_crop"},		//'cropAspectRatio' =integer (1 = square, 2 = twice as wide as tall, .5 =twice as tall as wide)
	cropCoords: {'x1':0, 'x2':0, 'y1':0, 'y2':0},		//will hold 1D associative array of x1, x2, y1, y2
	cropCurrentImageSrc: "",
	cropInfoEdit: {'JcropApi':false, 'cropping':false},
	curData: {}		//will hold info such as the current file path; one per instance id
};
return inst;
}])
;
/**
@todo
- allow optional scope attrs?? i.e. loadMore isn't really necesssary and the logic handles this but the directive throws an error if they're not defined and unit-testing fails.. so just need to figure out syntax / compiler way to allow this..


Uses one array and start / end indices (cursor) to set a combination of DOM elements, javascript data, and backend (AJAX) data to handle paging/infinite scroll loading of content (i.e. a list of objects)
	- handles paging / loading more when scroll to bottom
	- can be used with a backend lookup call to load more results (if "loadMore" attr/scope function is passed in)
		- loadMore function is called when have less than full results among current items stored in javascript, which happens 1 way:
			1. when scroll to end of page / load more results

//TOC
//10. add scroll handle to load more
//0.5. init
//0.75. resetItems
//1. setItems
//1.5. setItemsViewCursor
//2. scrollToMiddle
//5. 
//5.5. 
//6. $scope.loadMoreDir
//6.5. changePage
//7. getMoreItems
//8. addLoadMoreItems
//9. checkForScrollBar

scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html)
	REQUIRED
	@param items {Array} of any initial items to use
	@param itemsView {Array} of placeholder for final items to display in DOM
	@param opts {Object}
		@param cursors {Object} of start and end indices that tell where items are in the scheme of the entire (full) list so can handle loading more to start and/or end. A second object with 
			@param items {Object}
				@param start {Number}
				@param end {Number}
			@param itemsView {Object}
				@param current {Number} of what item to start on - this will correspond to the current page and then the start and end will be formed as 1 pageSize forward and 1 pageSize backward
		@param scrollId {String} of id for element to watch scrolling on (instead of using window/full page scroll bar OR the ui-infinitescroll-content element built in this directive as the default scroll div)
	@param loadMore =function to call to load more results (this should update $scope.items, which will then update in the directive via $watch). OR '0' if don't have loadMore function at all

attrs
	REQUIRED
	OPTIONAL
	scrollLoad =1 to do paging via scrolling as opposed to with "load more" button to click to load more. NOTE: if set, this you MUST either set pageScroll to 1 OR pass in a scrollId in opts.scrollId scope variable
		DEFAULT: 0
	pageScroll =1 to do paging via scrolling for entire window as opposed to a specific div (good for mobile / touch screens where only 1 scroll bar works well)
		DEFAULT: 0
	scrollBuffer =int of how much space from top or bottom to start switch the page
		DEFAULT: 50
	pageSize =int of how many results to show at a time (will load more in increments of pageSize as scroll down / click "more")
		DEFAULT: 10
	loadMorePageSize =int of how many results to load at a time - must be at least as large as pageSize (and typically should be at least 2 times as big as page size?? maybe not? just need to ensure never have to AJAX twice to display 1 page)
		DEFAULT: 20
	noStopLoadMore {Number} 1 to not set noMoreLoadMoreItems prev & next to true if don't have enough results returned from load more
		DEFAULT: 0
	@param {Number} [negativeLoad=0] 1 to try to load more even if at 0 cursor
	@param {Number} [animateScroll=0] 1 to animate when moving back to middle after load more from top or bottom
	@param {Number} [animateScrollDuration=1000] Number of milliseconds for scroll duration
	@param {Number} [itemHeight=0] Number of pixels for an item (if specified, this will keep the current item in the same spot after loading more - otherwise it will go to the middle after loading)
	@param {Number} [animateAfterItems=0] Number of items to slow pan through (to indicate to user that something has changed) AFTER jump to middle, etc.
	@param {Number} [animateAfterDuration=1000] Milliseconds for how long animation is for the after items animate
	@param {String} [noMoreResultsText =No More Results!] What to display when have no more items to load (i.e. at very bottom)


EXAMPLE usage:
@example 1 - defaults
partial / html:
	<div ui-infinitescroll items='usersList' items-view='users' load-more='loadMore' opts='scrollOpts'>
		<!-- custom display code to ng-repeat and display the results (items) goes below -->
		<div class='friends-user' ng-repeat='user in users'>
			{{user.name}}
		</div>
		<!-- end: custom display code -->
	</div>

controller / js:
	$scope.users =[];
	$scope.usersList =[];
	$scope.scrollOpts ={};
	
	//handle load more (callbacks)
	var itemsMore =[];
	for(var ii=0; ii<100; ii++) {
		itemsMore[ii] ={'_id':(ii+1), 'name':(ii+1)+'. Item #'+(ii+1)};
	}
	
	//@param params
	//	cursor =int of where to load from
	//	loadMorePageSize =int of how many to return
	$scope.loadMore =function(params, callback) {
		var results =itemsMore.slice(params.cursor, (params.cursor+params.loadMorePageSize));
		callback(results, {});
	};

	
@example 2 - page scrolling with negative loading (i.e. starting toward the end of a list then scrolling up to see previous entries)
partial / html:
	<div ui-infinitescroll items='usersList' items-view='users' load-more='loadMore' opts='scrollOpts' page-size='40' negative-load='1' scroll-load='1' page-scroll='1'>
		<!-- custom display code to ng-repeat and display the results (items) goes below -->
		<div class='friends-user' ng-repeat='user in users'>
			{{user.name}}
		</div>
		<!-- end: custom display code -->
	</div>

controller / js:
	$scope.scrollOpts ={};
	$scope.usersList =[];
	$scope.users =[];
	
	//handle load more (callbacks)
	var totItems =1000;
	var itemsMore =[];
	for(var ii=0; ii<totItems; ii++) {
		itemsMore[ii] ={'_id':(ii+1), 'name':(ii+1)+'. Item #'+(ii+1)};
	}
	//var offset =Math.floor(totItems/2);
	var offset =totItems-100;
	
	//@param params
	//	cursor =int of where to load from
	//	loadMorePageSize =int of how many to return
	$scope.loadMore =function(params, callback) {
		var results =itemsMore.slice(offset+params.cursor, (offset+params.cursor+params.loadMorePageSize));
		callback(results, {});
	};

//end: EXAMPLE usage
*/
angular.module('ui.directives').directive('uiInfinitescroll', ['ui.config', '$timeout', 'uiInfinitescrollData', function (uiConfig, $timeout, uiInfinitescrollData) {
  return {
		restrict: 'A',
		transclude: true,
		scope: {
			items: '=',
			itemsView: '=',
			opts:'=',
			//watchItemKeys:'=',		//note: this is not required & will throw an error if not set but it still works? @todo fix this so it's not required & doesn't throw error?
			loadMore:'&'
			//cursors: '='
		},

		compile: function(element, attrs) {
			var defaults ={'pageSize':10, 'scrollLoad':'0', 'loadMorePageSize':20, 'pageScroll':0, 'scrollBuffer':75, 'scrollBufferPercent':33, 'noStopLoadMore':0, 'negativeLoad':0, 'animateLoad':0, 'animateScrollDuration':1000, 'itemHeight':0, 'animateAfterItems':0, 'animateAfterDuration':1000, 'noMoreResultsText':'No More Results!'};
			for(var xx in defaults) {
				if(attrs[xx] ===undefined) {
					attrs[xx] =defaults[xx];
				}
			}
			//convert to int
			var attrsToInt =['pageSize', 'loadMorePageSize', 'scrollLoad', 'scrollBuffer', 'pageScroll', 'noStopLoadMore', 'negativeLoad', 'animateLoad', 'animateScrollDuration', 'itemHeight', 'animateAfterItems', 'animateAfterDuration'];
			for(var ii=0; ii<attrsToInt.length; ii++) {
				attrs[attrsToInt[ii]] =parseInt(attrs[attrsToInt[ii]], 10);
			}
			/*
			attrs.pageSize =parseInt(attrs.pageSize, 10);
			attrs.loadMorePageSize =parseInt(attrs.loadMorePageSize, 10);
			attrs.scrollLoad =parseInt(attrs.scrollLoad, 10);
			attrs.scrollBuffer =parseInt(attrs.scrollBuffer, 10);
			attrs.pageScroll =parseInt(attrs.pageScroll, 10);
			attrs.noStopLoadMore =parseInt(attrs.noStopLoadMore, 10);
			*/
			//ensure loadMorePageSize is at least as large as pageSize
			if(attrs.loadMorePageSize <attrs.pageSize) {
				attrs.loadMorePageSize =attrs.pageSize;
			}
			if(attrs.id ===undefined) {
				attrs.id ="uiInfinitescroll"+Math.random().toString(36).substring(7);
			}
			var id1 =attrs.id;
			attrs.ids ={
				'input':id1+"Input",
				'contentBottom':id1+"ContentBottom",
				'inputBelow':id1+"InputBelow",
				'scrollContent':id1+"ScrollContent"
			};
			
			var html="<div class='ui-infinitescroll'>"+
				"<div class='ui-infinitescroll-top'>"+
					//"<div>page: {{page}} cursors: items.start: {{opts.cursors.items.start}} items.end: {{opts.cursors.items.end}} itemsView.start: {{opts.cursors.itemsView.start}} itemsView.end: {{opts.cursors.itemsView.end}} itemsView.current: {{opts.cursors.itemsView.current}} items.length: {{items.length}}</div>"+		//TESTING
					//"<div>hasScrollbar: {{hasScrollbar}} | scrollLoad: {{scrollLoad}}</div>"+		//TESTING
					//"<div ng-show='itemsFiltered.length <1'>No matches</div>"+
					"<div ng-hide='(noMoreLoadMoreItems.prev) || (opts.cursors.itemsView.start <=0 && !negativeLoad) || (scrollLoad && hasScrollbar)' class='ui-infinitescroll-more' ng-click='loadMoreDir({\"prev\":true})'>Load More</div>"+
					//"<div ng-show='noMoreLoadMoreItemsPrev && queuedItemsPrev.length <1' class='ui-lookup-no-more'>No More Results!</div>"+
				"</div>"+
				"<div id='"+attrs.ids.scrollContent+"' class='ui-infinitescroll-content' ng-transclude></div>"+
				"<div id='"+attrs.ids.contentBottom+"'>"+
					"<div ng-hide='(noMoreLoadMoreItems.next && opts.cursors.itemsView.end >=opts.cursors.items.end) || (scrollLoad && hasScrollbar)' class='ui-infinitescroll-more' ng-click='loadMoreDir({})'>Load More</div>"+
					//"<div>page: {{page}} cursors: items.start: {{opts.cursors.items.start}} items.end: {{opts.cursors.items.end}} itemsView.start: {{opts.cursors.itemsView.start}} itemsView.end: {{opts.cursors.itemsView.end}} itemsView.current: {{opts.cursors.itemsView.current}} items.length: {{items.length}}</div>"+		//TESTING
					//"<div>scrollInfo: %fromTop: {{scrollInfo.percentTop}} %fromBot: {{scrollInfo.percentBottom}} pos: {{scrollInfo.scrollPos}} diff: {{scrollInfo.diff}} height: {{scrollInfo.scrollHeight}} viewportHeight: {{scrollInfo.viewportHeight}}</div>"+		//TESTING
					"<div ng-show='noMoreLoadMoreItems.next && opts.cursors.items.end <= opts.cursors.itemsView.end' class='ui-infinitescroll-no-more'>"+attrs.noMoreResultsText+"</div>"+
				"</div>"+
			"</div>";
				
			element.replaceWith(html);
		},
		
		controller: function($scope, $element, $attrs) {
			var defaultsOpts ={
				//'watchItemKeys':['main'],
				'cursors':{
					'items':{
						'start':0,
						'end':$scope.items.length
					},
					'itemsView':{
						'current':0
					}
				},
				'scrollId':false
			};
			if($scope.opts ===undefined) {
				$scope.opts ={};
			}
			for(var xx in defaultsOpts) {
				if($scope.opts[xx] ===undefined) {
					$scope.opts[xx] =defaultsOpts[xx];
				}
			}
			
			var scrollId =$attrs.ids.scrollContent;		//default
			if($scope.opts.scrollId) {
				scrollId =$scope.opts.scrollId;
			}
			
			$scope.negativeLoad =$attrs.negativeLoad;		//copy into scope
			//to allow / handle loading items below "0". The logic inside this directive (and arrays) can't/won't go below 0 so we'll just keep it at 0 and use this to keep track of what the "negative offset" is
			$scope.opts.cursors.negative =0;
			//$scope.cursorNegative =0;
			$scope.trigs ={'loading':false};
			//$scope.items =[];
			
			//boolean that will be set to true if (backend) has no more items (i.e. we're at the end of the list and can't load any more)
			$scope.noMoreLoadMoreItems ={
				'prev':false,
				'next':false
			};
			
			$scope.scrollLoad =$attrs.scrollLoad;
			
			//if scroll load style, ensure attrs.ids.scrollContent has scrollable styles (height & overflow)
			if($scope.scrollLoad) {
				if(!$attrs.pageScroll) {
					var ele1 =document.getElementById(scrollId);
					eleAng =angular.element(ele1);
					var height1 =eleAng.css('height');
					var overflow1 =eleAng.css('overflow');
					if(!height1 || !overflow1) {
						eleAng.addClass('ui-lookup-content-scroll');
					}
				}
				
				$scope.hasScrollbar =false;		//init
			}
			
			var timeoutInfo ={
				'scrolling':{
					'trig':false,
					'delay':750
				}
			};
			
			//10.
			//add scroll handle to load more
			if($attrs.scrollLoad) {
				//don't add right away (otherwise the initial load can duplicate load and jump around - need to let it initialize first)
				$timeout(function() {
					if($attrs.pageScroll) {
						if(1) {
							uiInfinitescrollData.addScrollEvt($attrs.id, {'attrs':$attrs, 'timeoutInfo':timeoutInfo, 'callback':function() {
								//console.log('window onscroll: id: '+$attrs.ids.scrollContent+' element: '+document.getElementById($attrs.ids.scrollContent));
								$timeout.cancel(timeoutInfo.scrolling.trig);
								timeoutInfo.scrolling.trig =$timeout(function() {
									//console.log('uiLookup timeout scrolling loading');
									var buffer =$attrs.scrollBuffer;
									var scrollPos =$(window).scrollTop();
									var scrollHeight =$(document).height();
									var viewportHeight =$(window).height();
									//console.log("pos: "+scrollPos+" height: "+scrollHeight+" height: "+viewportHeight);
									var percentTop =scrollPos /scrollHeight *100;
									var percentBottom =(scrollPos +viewportHeight) /scrollHeight *100;
									$scope.scrollInfo ={
										'scrollPos':scrollPos,
										'scrollHeight':scrollHeight,
										'viewportHeight':viewportHeight,
										'diff':(scrollHeight-viewportHeight-buffer),
										'percentTop':percentTop,
										'percentBottom':percentBottom
									};
									//if(scrollPos >=(scrollHeight-viewportHeight-buffer) || (percentBottom > (100-$attrs.scrollBufferPercent)) ) {
									if(scrollPos >5 && scrollPos >=(scrollHeight-viewportHeight-buffer)) {		//don't load more if 0 scrollPos (this specificlly fixes an initial double load issue)
										$scope.loadMoreDir({'noDelay':true, 'next':true});
									}
									//prev version
									//if(scrollPos <=buffer || (percentTop <$attrs.scrollBufferPercent) ) {
									if(scrollPos <=buffer ) {
										$scope.loadMoreDir({'noDelay':true, 'prev':true});
									}
								}, timeoutInfo.scrolling.delay);
							}
							});
						}
						else {
						window.onscroll =function() {
							timeoutInfo.scrolling.trig =$timeout(function() {
								var buffer =$attrs.scrollBuffer;
								var scrollPos =$(window).scrollTop();
								var scrollHeight =$(document).height();
								var viewportHeight =$(window).height();
								var percentTop =scrollPos /scrollHeight *100;
								var percentBottom =(scrollPos +viewportHeight) /scrollHeight *100;
								$scope.scrollInfo ={
									'scrollPos':scrollPos,
									'scrollHeight':scrollHeight,
									'viewportHeight':viewportHeight,
									'diff':(scrollHeight-viewportHeight-buffer),
									'percentTop':percentTop,
									'percentBottom':percentBottom
								};
								//if(scrollPos >=(scrollHeight-viewportHeight-buffer) || (percentBottom > (100-$attrs.scrollBufferPercent)) ) {
								if(scrollPos >5 && scrollPos >=(scrollHeight-viewportHeight-buffer)) {		//don't load more if 0 scrollPos (this specificlly fixes an initial double load issue)
									$scope.loadMoreDir({'noDelay':true, 'next':true});
								}
								//prev version
								//if(scrollPos <=buffer || (percentTop <$attrs.scrollBufferPercent) ) {
								if(scrollPos <=buffer ) {
									$scope.loadMoreDir({'noDelay':true, 'prev':true});
								}
							}, timeoutInfo.scrolling.delay);
						};
						}
					}
					else {
						document.getElementById(scrollId).onscroll =function() {
							$timeout.cancel(timeoutInfo.scrolling.trig);
							timeoutInfo.scrolling.trig =$timeout(function() {
								var buffer =$attrs.scrollBuffer;
								var ele =document.getElementById(scrollId);
								var scrollPos =ele.scrollTop;
								var scrollHeight =ele.scrollHeight;
								//var viewportHeight =$(ele).height();
								var viewportHeight =ele.clientHeight;
								if(scrollPos >=(scrollHeight-viewportHeight-buffer)) {
									$scope.loadMoreDir({'noDelay':true, 'next':true});
								}
								//prev version
								if(scrollPos <=buffer) {
									$scope.loadMoreDir({'noDelay':true, 'prev':true});
								}
							}, timeoutInfo.scrolling.delay);
						};
					}
				}, 1000);
			}
			
			//0.5.
			function init(params) {
				//$scope.page =1;		//will store what page (broken up by pageSize attr) we're on
				$scope.page =Math.floor($scope.opts.cursors.itemsView.current / $attrs.pageSize);
				setItemsViewCursor({});
				
				setItems({});
				if($scope.items.length <$attrs.pageSize*2) {		//load more externally if don't have enough
					$scope.loadMoreDir({});
				}
			}
			
			//0.75.
			function resetItems(params) {
				/*
				@todo
				$scope.page =1;		//reset
				checkForScrollBar({});
				$scope.noMoreLoadMoreItems =false;
				cursors ={
					//'extra':0,
				};
				cursors[$attrs.loadMoreItemsKey] =0;
				$scope.itemsRaw[$attrs.loadMoreItemsKey].items =[];
				document.getElementById(scrollId).scrollTop =0;
				*/
				var dummy =1;
			}
			
			//1.
			/**
			Updates viewable (DOM) items (sets the range)
			@param params
			*/
			function setItems(params) {
				var cursorSave, diff, height1;
				var ppSend ={};
				if($attrs.itemHeight) {		//save current cursor positions so can calculate change later
					height1 =$attrs.itemHeight;
					cursorsSave ={
						'start':$scope.opts.cursors.itemsView.start,
						'end':$scope.opts.cursors.itemsView.end
					};
				}
				$scope.opts.cursors.itemsView.end =$scope.page*$attrs.pageSize +$attrs.pageSize;
				setItemsViewCursor({});
				$scope.itemsView =$scope.items.slice($scope.opts.cursors.itemsView.start, $scope.opts.cursors.itemsView.end);
				
				if($attrs.itemHeight) {
					if(params.prev) {
						ppSend.prev =true;
						diff =cursorsSave.start -$scope.opts.cursors.itemsView.start;
					}
					else {
						ppSend.prev =false;
						diff =$scope.opts.cursors.itemsView.end -cursorsSave.end;
					}
					var diffHeight =diff*height1;
					if(diffHeight <0) {
						diffHeight =diffHeight *-1;
					}
					//alert('diffHeight: '+diffHeight);
					ppSend.diffHeight =diffHeight;
				}
				
				scrollToMiddle(ppSend);
				checkForScrollBar({});
			}
			
			//1.5.
			function setItemsViewCursor(params) {
				var end =$scope.page*$attrs.pageSize +$attrs.pageSize;
				if(end >$scope.items.length) {
					end =$scope.items.length;
				}
				$scope.opts.cursors.itemsView.end =end;
				var start =$scope.page*$attrs.pageSize -$attrs.pageSize;
				if(start <0) {
					start =0;
				}
				$scope.opts.cursors.itemsView.start =start;
			}
			
			/**
			//2.
			@param {Object} params
				@param {Boolean} [prev] True if loading a previous page (i.e. scrolling up)
				@param {Number} [diffHeight] Pixels of where to scroll to (instead of just going to middle)
				@param {Boolean} [alreadyTimedOut] true to avoid infinite loop if already waited for previous items to load
			*/
			function scrollToMiddle(params) {
				var scrollPos, scrollHeight, viewportHeight, middle, newMiddle;
				if($attrs.pageScroll) {
					if(0) {		//@todo - need a better solution than this.. see below
					//if($scope.opts.cursors.itemsView.start ==0) {		//if at top, just go to top (specifically this addresses a double initial load issue that causes the first time to show halfway down rather than at the top - could probably find a better fix - i.e. also check what the last cursor was at?)
						if($attrs.animateScroll) {
							$(window).animate({scrollTop: 0+'px'}, $attrs.animateScrollDuration);		//animate the scrolling
						}
						else {
							window.scrollTo(0, 0);
						}
					}
					else {
						scrollPos =$(window).scrollTop();
						scrollHeight =$(document).height();
						viewportHeight =$(window).height();
						middle =Math.floor((scrollHeight/2) -viewportHeight/2);
						
						if(params.diffHeight) {
							if(params.prev) {
								middle =params.diffHeight;
							}
							else {
								middle =scrollHeight -params.diffHeight -viewportHeight;
							}
						}
						
						//if on first pages without full content, need to wait until content is loaded first (NOTE - theoretically should ALWAYS wait for load content before re-scroll BUT if do, it's a bit jumpy so ONLY do it when necessary - otherwise using old data keeps it smooth as is a workaround..)
						if((params.alreadyTimedOut ===undefined || !params.alreadyTimedOut) && (middle >scrollHeight || scrollHeight <$attrs.itemHeight*$attrs.pageSize*2)) {
							$timeout(function() {
								params.alreadyTimedOut =true;
								scrollToMiddle(params);
							}, 100);
						}
						else {
							if($attrs.animateScroll) {
								$(window).animate({scrollTop: middle+'px'}, $attrs.animateScrollDuration);		//animate the scrolling
							}
							else {
								window.scrollTo(0, middle);
							}
							
							if($attrs.animateAfterItems) {
								if(params.prev) {
									newMiddle =middle -$attrs.itemHeight*$attrs.animateAfterItems;
								}
								else {
									newMiddle =middle +$attrs.itemHeight*$attrs.animateAfterItems;
								}
								$(window).animate({scrollTop: newMiddle+'px'}, $attrs.animateAfterDuration);		//animate the scrolling
							}
						}
					}
					//console.log('scrollPos: '+$(window).scrollTop());
				}
				else {
					if(0) {		//@todo - need a better solution than this.. see below
					//if($scope.opts.cursors.itemsView.start ==0) {		//if at top, just go to top (specifically this addresses a double initial load issue that causes the first time to show halfway down rather than at the top - could probably find a better fix - i.e. also check what the last cursor was at?)
						if($attrs.animateScroll) {
							$("#"+scrollId).animate({scrollTop: 0+'px'}, $attrs.animateScrollDuration);		//animate the scrolling
						}
						else {
							document.getElementById(scrollId).scrollTop =0;
						}
					}
					else {
						var ele =document.getElementById(scrollId);
						scrollPos =ele.scrollTop;
						scrollHeight =ele.scrollHeight;
						//viewportHeight =$(ele).height();
						viewportHeight =ele.clientHeight;
						middle =Math.floor((scrollHeight/2) -viewportHeight/2);
						
						if(params.diffHeight) {
							if(params.prev) {
								middle =params.diffHeight;
							}
							else {
								//middle =scrollHeight -params.diffHeight +viewportHeight -$attrs.itemHeight;
								//middle =scrollHeight -params.diffHeight -$attrs.itemHeight;
								middle =scrollHeight -params.diffHeight -viewportHeight;
							}
						}
						
						//if on first pages without full content, need to wait until content is loaded first (NOTE - theoretically should ALWAYS wait for load content before re-scroll BUT if do, it's a bit jumpy so ONLY do it when necessary - otherwise using old data keeps it smooth as is a workaround..)
						//console.log('scrollHeight: '+scrollHeight+' 2 pages items height: '+$attrs.itemHeight*$attrs.pageSize*2);
						if((params.alreadyTimedOut ===undefined || !params.alreadyTimedOut) && (middle >scrollHeight || scrollHeight <$attrs.itemHeight*$attrs.pageSize*2)) {
							//console.log('middle: '+middle+' scrollHeight: '+scrollHeight);
							$timeout(function() {
								params.alreadyTimedOut =true;
								scrollToMiddle(params);
							}, 100);
						}
						else {
							if($attrs.animateScroll) {
								$("#"+scrollId).animate({scrollTop: middle+'px'}, $attrs.animateScrollDuration);		//animate the scrolling
							}
							else {
								document.getElementById(scrollId).scrollTop =middle;
							}
							
							if($attrs.animateAfterItems) {
								if(params.prev) {
									newMiddle =middle -$attrs.itemHeight*$attrs.animateAfterItems;
								}
								else {
									newMiddle =middle +$attrs.itemHeight*$attrs.animateAfterItems;
								}
								$("#"+scrollId).animate({scrollTop: newMiddle+'px'}, $attrs.animateAfterDuration);		//animate the scrolling
							}
						}
					}
					//console.log('scrollPos: '+ele.scrollTop);
				}
			}
			
			//5.
			/*
			//doesn't work - have to watch a sub array piece
			$scope.$watch('itemsRaw', function(newVal, oldVal) {
				if(!angular.equals(oldVal, newVal)) {		//very important to do this for performance reasons since $watch runs all the time
					formItems({});
				}
			});
			*/
			if(0) {
			//@todo ?
			//for(var xx in $scope.itemsRaw) {
			for(var ii =0; ii<$scope.opts.watchItemKeys.length; ii++) {
				xx =$scope.opts.watchItemKeys[ii];
				//$scope.$watch('itemsRaw', function(newVal, oldVal) {
				//$scope.$watch('itemsRaw['+xx+'].items[0]', function(newVal, oldVal) {
				//$scope.$watch('itemsRaw.extra.items[0]', function(newVal, oldVal) {
				//$scope.$watch('itemsRaw.extra', function(newVal, oldVal) {
				//$scope.$watch('itemsRaw.'+xx, function(newVal, oldVal) {
				$scope.$watch('itemsRaw.'+xx+'.items', function(newVal, oldVal) {
					if(!angular.equals(oldVal, newVal)) {		//very important to do this for performance reasons since $watch runs all the time
						if($scope.totFilteredItems <$scope.page*$attrs.pageSize) {		//if only on first page, reset (otherwise load more button / triggers will be set to false since there's no more in queue / from backend)
							resetItems({});
						}
						formItems({});
						/*
						if($scope.queuedItems.length <$attrs.pageSize && $scope.totFilteredItems <$scope.page*$attrs.pageSize) {		//load more externally if don't have enough
							$scope.loadMoreDir({});
						}
						*/
					}
				});
			}
			}
			
			/*
			//@todo ?
			//5.5. $watch not firing all the time... @todo figure out & fix this.. (also this will reform ALL instances - should pass in an instance id - which means the directive would have to pass an instance back somehow..)
			$scope.$on('uiLookupReformItems', function(evt, params) {
				formItems({});
			});
			*/
			
			//6.
			/*
			Starts the load more process - checks if need to load more (may already have more items in the existing javascript items array, in which case can just load more internally) and IF need to load more external items, sets a timeout to do so (for performance to avoid rapid firing external calls)
				This is paired with the getMoreItems function below - which handles actually getting the items AFTER the timeout
			@param params
				noDelay =boolean true to skip the timeout before loading more (i.e. if coming from scroll, in which case already have waited)
			*/
			$scope.loadMoreDir =function(params) {
				var getMoreItemsTrig =false;
				if(params.prev) {
					//if have more items left, decrement page & show them
					if(($scope.opts.cursors.items.start ===0 && $scope.opts.cursors.itemsView.start !==0) || $scope.opts.cursors.items.start < ($scope.opts.cursors.itemsView.start -$attrs.pageSize)) {
						changePage({'prev':true});
					}
					else {
						getMoreItemsTrig =true;
						//set timeout to get more from backend if function has been given for how to do so
						params.noDelay =true;		//never want to timeout here? Handle that outside this function (should only have on search and on scroll and it's already handled there?)
						getMoreItems({'prev':true});
					}
				}
				else {
					//if have more items left, increment page & show them
					if($scope.opts.cursors.items.end > ($scope.opts.cursors.itemsView.end +$attrs.pageSize) || ($scope.noMoreLoadMoreItems.next && $scope.opts.cursors.items.end >$scope.opts.cursors.itemsView.end) ) {
						changePage({'next':true});
					}
					else {
						getMoreItemsTrig =true;
						//set timeout to get more from backend if function has been given for how to do so
						params.noDelay =true;		//never want to timeout here? Handle that outside this function (should only have on search and on scroll and it's already handled there?)
						getMoreItems({'next':true});
					}
				}
			};
			
			//6.5.
			/**
			@param params
				prev {Boolean} true if loading previous (i.e. scrolling toward beginning)
			*/
			function changePage(params) {
				if(params.prev) {
					$scope.page--;
				}
				else {
					$scope.page++;
				}
				setItems(params);
			}
			
			//7.
			/*
			Handles loading items from the queue and calling the external loadMore function to pre-fill the queue for the next page (this is the function that runs AFTER the timeout set in $scope.loadMoreDir function)
			If have items in queue, they're added to itemsRaw and then formItems is re-called to re-form filtered items & update display
			@param params
				prev
				next
			*/
			function getMoreItems(params) {
				var loadPageSize, cursor;
				if($scope.loadMore !==undefined && $scope.loadMore() !==undefined && typeof($scope.loadMore()) =='function') {		//this is an optional scope attr so don't assume it exists
					var ppTemp ={};
					if(params.prev) {
						ppTemp.prev =true;
						if(($scope.opts.cursors.items.start >0 || $scope.negativeLoad) && !$scope.noMoreLoadMoreItems.prev) {		//only try to load more if have more left to load
							loadPageSize =$attrs.loadMorePageSize;
							cursor =$scope.opts.cursors.items.start +$scope.opts.cursors.negative -loadPageSize;
							$scope.loadMore()({'cursor':cursor, 'loadMorePageSize':loadPageSize, 'searchText':''}, function(results, ppCustom) {
								addLoadMoreItems(results, ppCustom, ppTemp);
							});
						}
					}
					else {
						ppTemp.next =true;
						if(!$scope.noMoreLoadMoreItems.next) {		//only try to load more if have more left to load
							loadPageSize =$attrs.loadMorePageSize;
							cursor =$scope.opts.cursors.items.end;
							$scope.loadMore()({'cursor':cursor, 'loadMorePageSize':loadPageSize, 'searchText':''}, function(results, ppCustom) {
								addLoadMoreItems(results, ppCustom, ppTemp);
							});
						}
					}
				}
			}
			
			//8.
			/*
			This is the callback function that is called from the outer (non-directive) controller with the externally loaded items. These items are added to the queue and the cursor is updated accordingly.
				- Additionally, the noMoreLoadMoreItems trigger is set if the returned results are less than the loadMorePageSize
				- Also, it immediately will load from queue if the current page isn't full yet (if params.partialLoad & params.numToFillCurPage are set)
			@param results =array [] of items (will be appended to queue)
			@param ppCustom =params returned from callback
			@param params
				prev {Boolean}
				next {Boolean}
			*/
			function addLoadMoreItems(results, ppCustom, params) {
				if(results.length >0) {
					if(params.prev) {
						$scope.items =results.concat($scope.items);
						//shift page number up accordingly since added items to beginning
						$scope.page +=Math.ceil(results.length /$attrs.pageSize);
						$scope.opts.cursors.items.start -=results.length;		//don't just add $attrs.loadMorePageSize in case there weren't enough items on the backend (i.e. results could be LESS than this)
						//if negative, reset to 0 and increment opts.cursors.negative
						if($scope.opts.cursors.items.start <0) {
							$scope.opts.cursors.negative -=$scope.opts.cursors.items.start*-1;
							$scope.opts.cursors.items.end += ($scope.opts.cursors.items.start *-1);		//have to push up items.end the same amount we're removing from items.start
							$scope.opts.cursors.items.start =0;
						}
					}
					else {
						$scope.items =$scope.items.concat(results);
						$scope.opts.cursors.items.end +=results.length;		//don't just add $attrs.loadMorePageSize in case there weren't enough items on the backend (i.e. results could be LESS than this)
					}
					
					changePage(params);
				}
				else {
					if( (params.prev && $scope.opts.cursors.items.start < $scope.opts.cursors.itemsView.start) || (params.next && $scope.opts.cursors.items.end > $scope.opts.cursors.itemsView.end)) {		//display last ones from javascript
						changePage(params);
					}
				}
				
				//if don't have enough results, assume backend is done so are out of items
				if(!$attrs.noStopLoadMore) {
				//if(0) {
					if(results.length <$attrs.loadMorePageSize || (params.loadPageSize !==undefined && results.length <params.loadPageSize)) {
						if(params.prev) {
							$scope.noMoreLoadMoreItems.prev =true;
						}
						else {
							$scope.noMoreLoadMoreItems.next =true;
						}
					}
				}
			}
			
			//9.
			function checkForScrollBar(params) {
				var scrollHeight, scrollPos, viewportHeight;
				if($scope.scrollLoad) {
					$timeout(function() {		//need timeout to wait for items to load / display so scroll height is correct
						if($attrs.pageScroll) {
							//scrollPos =$(window).scrollTop();
							scrollHeight =$(document).height();
							viewportHeight =$(window).height();
							//console.log("pos: "+scrollPos+" height: "+scrollHeight+" height: "+viewportHeight);
							if(scrollHeight >viewportHeight) {
								$scope.hasScrollbar =true;
							}
							else {
								$scope.hasScrollbar =false;
							}
						}
						else {
							var ele =document.getElementById(scrollId);
							//scrollPos =ele.scrollTop;
							scrollHeight =ele.scrollHeight;
							viewportHeight =ele.clientHeight;
							//console.log('checkForScrollBar scrollHeight: '+scrollHeight+' viewportHeight: '+viewportHeight);
							if(scrollHeight >viewportHeight) {
								$scope.hasScrollbar =true;
							}
							else {
								$scope.hasScrollbar =false;
							}
						}
					}, 100);
				}
			}
			
			init({});		//init (called once when directive first loads)
		}
	};
}])
.factory('uiInfinitescrollData', ['ui.config', '$timeout', function (uiConfig, $timeout) {
var inst ={
	data: {},		//each key is a unique form id and each of those holds current data/info
	inited: false,
	
	/**
	*/
	windowScroll: function(instId, data, params) {
		data.callback({});
	},
	
	/**
	*/
	removeScrollEvt: function(instId, params) {
		if(this.data[instId] !==undefined) {
			delete this.data[instId];
		}
	},
	
	/**
	@param {String} instId Unique key for this scrolling event (so don't have multiple events firing on the same element/page and so can cancel/remove the event listeners when destroyed)
	@param {Object} params
		@param {Object} attrs Pass through of attrs of directive (more than what's detailed below - see directive above for what attributes it has)
			@param {Number} pageScroll 1 if want to use window / full page scroll (otherwise will scroll based on an element id)
	*/
	addScrollEvt: function(instId, params) {
		var thisObj =this;
		if(!this.inited) {
			window.onscroll =function() {
				for(var xx in thisObj.data) {
					//see if infinite scroll element is still defined / on page (remove event listener otherwise)
					if(document.getElementById(thisObj.data[xx].attrs.ids.scrollContent)) {
						thisObj.windowScroll(xx, thisObj.data[xx], {});
					}
					else {		//remove
						thisObj.removeScrollEvt(xx, {});
					}
				}
			};
		}
		this.inited =true;

		thisObj.data[params.attrs.id] =params;
	}
	
};
return inst;
}])
;
/**
 * General-purpose jQuery wrapper. Simply pass the plugin name as the expression.
 *
 * It is possible to specify a default set of parameters for each jQuery plugin.
 * Under the jq key, namespace each plugin by that which will be passed to ui-jq.
 * Unfortunately, at this time you can only pre-define the first parameter.
 * @example { jq : { datepicker : { showOn:'click' } } }
 *
 * @param ui-jq {string} The $elm.[pluginName]() to call.
 * @param [ui-options] {mixed} Expression to be evaluated and passed as options to the function
 *     Multiple parameters can be separated by commas
 * @param [ui-refresh] {expression} Watch expression and refire plugin on changes
 *
 * @example <input ui-jq="datepicker" ui-options="{showOn:'click'},secondParameter,thirdParameter" ui-refresh="iChange">
 */
angular.module('ui.directives').directive('uiJq', ['ui.config', '$timeout', function uiJqInjectingFunction(uiConfig, $timeout) {

  return {
    restrict: 'A',
    compile: function uiJqCompilingFunction(tElm, tAttrs) {

      if (!angular.isFunction(tElm[tAttrs.uiJq])) {
        throw new Error('ui-jq: The "' + tAttrs.uiJq + '" function does not exist');
      }
      var options = uiConfig.jq && uiConfig.jq[tAttrs.uiJq];

      return function uiJqLinkingFunction(scope, elm, attrs) {

        var linkOptions = [];

        // If ui-options are passed, merge (or override) them onto global defaults and pass to the jQuery method
        if (attrs.uiOptions) {
          linkOptions = scope.$eval('[' + attrs.uiOptions + ']');
          if (angular.isObject(options) && angular.isObject(linkOptions[0])) {
            linkOptions[0] = angular.extend({}, options, linkOptions[0]);
          }
        } else if (options) {
          linkOptions = [options];
        }
        // If change compatibility is enabled, the form input's "change" event will trigger an "input" event
        if (attrs.ngModel && elm.is('select,input,textarea')) {
          elm.on('change', function() {
            elm.trigger('input');
          });
        }

        // Call jQuery method and pass relevant options
        function callPlugin() {
          $timeout(function() {
            elm[attrs.uiJq].apply(elm, linkOptions);
          }, 0, false);
        }

        // If ui-refresh is used, re-fire the the method upon every change
        if (attrs.uiRefresh) {
          scope.$watch(attrs.uiRefresh, function(newVal) {
            callPlugin();
          });
        }
        callPlugin();
      };
    }
  };
}]);

angular.module('ui.directives').factory('keypressHelper', ['$parse', function keypress($parse){
  var keysByCode = {
    8: 'backspace',
    9: 'tab',
    13: 'enter',
    27: 'esc',
    32: 'space',
    33: 'pageup',
    34: 'pagedown',
    35: 'end',
    36: 'home',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    45: 'insert',
    46: 'delete'
  };

  var capitaliseFirstLetter = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return function(mode, scope, elm, attrs) {
    var params, combinations = [];
    params = scope.$eval(attrs['ui'+capitaliseFirstLetter(mode)]);

    // Prepare combinations for simple checking
    angular.forEach(params, function (v, k) {
      var combination, expression;
      expression = $parse(v);

      angular.forEach(k.split(' '), function(variation) {
        combination = {
          expression: expression,
          keys: {}
        };
        angular.forEach(variation.split('-'), function (value) {
          combination.keys[value] = true;
        });
        combinations.push(combination);
      });
    });

    // Check only matching of pressed keys one of the conditions
    elm.bind(mode, function (event) {
      // No need to do that inside the cycle
      var altPressed = event.metaKey || event.altKey;
      var ctrlPressed = event.ctrlKey;
      var shiftPressed = event.shiftKey;
      var keyCode = event.keyCode;

      // normalize keycodes
      if (mode === 'keypress' && !shiftPressed && keyCode >= 97 && keyCode <= 122) {
        keyCode = keyCode - 32;
      }

      // Iterate over prepared combinations
      angular.forEach(combinations, function (combination) {

        var mainKeyPressed = (combination.keys[keysByCode[event.keyCode]] || combination.keys[event.keyCode.toString()]) || false;

        var altRequired = combination.keys.alt || false;
        var ctrlRequired = combination.keys.ctrl || false;
        var shiftRequired = combination.keys.shift || false;

        if (
          mainKeyPressed &&
          ( altRequired == altPressed ) &&
          ( ctrlRequired == ctrlPressed ) &&
          ( shiftRequired == shiftPressed )
        ) {
          // Run the function
          scope.$apply(function () {
            combination.expression(scope, { '$event': event });
          });
        }
      });
    });
  };
}]);

/**
 * Bind one or more handlers to particular keys or their combination
 * @param hash {mixed} keyBindings Can be an object or string where keybinding expression of keys or keys combinations and AngularJS Exspressions are set. Object syntax: "{ keys1: expression1 [, keys2: expression2 [ , ... ]]}". String syntax: ""expression1 on keys1 [ and expression2 on keys2 [ and ... ]]"". Expression is an AngularJS Expression, and key(s) are dash-separated combinations of keys and modifiers (one or many, if any. Order does not matter). Supported modifiers are 'ctrl', 'shift', 'alt' and key can be used either via its keyCode (13 for Return) or name. Named keys are 'backspace', 'tab', 'enter', 'esc', 'space', 'pageup', 'pagedown', 'end', 'home', 'left', 'up', 'right', 'down', 'insert', 'delete'.
 * @example <input ui-keypress="{enter:'x = 1', 'ctrl-shift-space':'foo()', 'shift-13':'bar()'}" /> <input ui-keypress="foo = 2 on ctrl-13 and bar('hello') on shift-esc" />
 **/
angular.module('ui.directives').directive('uiKeydown', ['keypressHelper', function(keypressHelper){
  return {
    link: function (scope, elm, attrs) {
      keypressHelper('keydown', scope, elm, attrs);
    }
  };
}]);

angular.module('ui.directives').directive('uiKeypress', ['keypressHelper', function(keypressHelper){
  return {
    link: function (scope, elm, attrs) {
      keypressHelper('keypress', scope, elm, attrs);
    }
  };
}]);

angular.module('ui.directives').directive('uiKeyup', ['keypressHelper', function(keypressHelper){
  return {
    link: function (scope, elm, attrs) {
      keypressHelper('keyup', scope, elm, attrs);
    }
  };
}]);
/**
Uses one associative array (raw data) to build a concatenated scalar (final/display) array of items to search / filter.
	Adds upon ng-filter directive with the following features:
	- handles paging / loading more when scroll to bottom
	- can be used with a backend lookup call to load more results (if "loadMore" attr/scope function is passed in)
		- loadMore function is called when have less than full results among current filtered items stored in javascript, which happens 1 of 2 ways:
			1. when scroll to end of page / load more results
			2. when change search text
	- NOTE: a queue is used to pre-fill the NEXT page's content so more results should always appear fast since the next page's items should already be in javascript by the time "load more" is clicked (i.e. the AJAX / external call is done right AFTER the previous page is loaded rather than right before the new page is loaded)

//TOC
//0.5. init
//1. formItems
//2. $scope.filterItems
//3. $scope.clickInput
//4. $scope.changeInput
//5. $scope.$watch('itemsRaw',..
//6. $scope.loadMoreDir
//7. getMoreItems
//8. addLoadMoreItems
//9. checkForScrollBar

@param {Object} scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html). REMEMBER: use snake-case when setting these on the partial!
	@param {Array} itemsRaw array of arrays {}, one per each "type". Each type must contain an "items" field that's a scalar array of the items for this type
		NOTE: itemsRaw MUST have this structure and at least the 'main' key
		@example
		{
			'main':{
				'items':[
					{'first':'john', 'last':'smith'},
					{'first':'joe', 'last':'bob'},
					..
				],
			}
			'extra':{
				'items':[
					{'first':'sally', 'last':'sue'},
					{'first':'barbara', 'last':'ann'},
					..
				],
			}
		}
	@param {Array} itemsFiltered array placeholder for where the final, concatenated items will be stored; this is the array that will actually be displayed and searched through and is a combination of the itemsRaw[type].items arrays
	@param {Array} filterFields all fields in each items array to search for match
		@example ['first', 'last', 'header.title']
			NOTE: 'header.title' will search in header['title'] if filterFieldsDotNotation is set to true. Otherwise it will look in a NON-NESTED key that has a "." as part of it
				i.e. array['header.title'] VS array['header']['title']
	@param {Object} opts ={} Additional scope variables that can be used
		@param {String} [searchText =''] text to search for (will be used as ng-model for input)
		@param {Array} [watchItemKeys ='main'] keys to $watch; if these are updated in $scope (i.e. outside the directive), it will re-form itemsFiltered in the directive
	@param {Function} loadMore function to call to load more results (this should update $scope.itemsRaw, which will then update in the directive via $watch). OR '0' if don't have loadMore function at all

@param {Object} attrs REMEMBER: use snake-case when setting these on the partial! i.e. scroll-load='1' NOT scrollLoad='1'
	@param {Boolean} [filterFieldsDotNotation =true] true to change all periods to sub array's (i.e. so 'header.title' as a filterField would search in header['title'] for a match)
	@param {Number} [scrollLoad =0] 1 to do paging via scrolling
	@param {Number} [pageScroll =0] 1 to do paging via scrolling for entire window as opposed to a specific div (good for mobile / touch screens where only 1 scroll bar works well)
	@param {Number} [pageSize =10] how many results to show at a time (will load more in increments of pageSize as scroll down / click "more")
	@param {Number} [loadMorePageSize =20] how many results to load (& thus store in queue) at a time - must be at least as large as pageSize (and typically should be at least 2 times as big as page size?? maybe not? just need to ensure never have to AJAX twice to display 1 page)
	@param {String} [loadMoreItemsKey ='extra'] matches a key in the itemsRaw array - this is where items from backend will be loaded into
	@param {String} [placeholder ='search'] input search placeholder
	@param {Number} [minSearchLength =2] The minimum number of characters for which to actually search/filter the results (for performance - low number of characters still lead to lots of results)
	@param {Number} [minSearchShowAll =1] 1 to show ALL items if search term is below the minSearchLength and 0 to show NONE (no items) if below the minSearchLength
	@param {String} [classInput =''] Style class to apply to input element
	@param {String} [classInputCont =''] Style class to apply to input container element


EXAMPLE usage:
partial / html:
	<div ui-lookup items-raw='usersRaw' items-filtered='users' filter-fields='filterFields' load-more='loadMore' opts='opts'>
		<!-- custom display code to ng-repeat and display the results (items-filtered) goes below -->
		<div class='friends-user' ng-repeat='user in users'>
			{{user.name}}
		</div>
		<!-- end: custom display code -->
	</div>

controller / js:
	$scope.opts ={};
	$scope.filterFields =['name'];
	$scope.users =[];
	$scope.usersRaw ={
		'main':{
			'items':[
				{'_id':'d1', 'name':'john smith'},
				{'_id':'d2', 'name':'joe bob'},
				{'_id':'d3', 'name':'joe james'},
				{'_id':'d4', 'name':'ron artest'},
				{'_id':'d5', 'name':'kobe bryant'},
				{'_id':'d6', 'name':'steve balls'},
			],
		},
		'extra':{
			'items':[
			],
		},
	};
	
	//handle load more (callbacks)
	var itemsMore =
	[
		{'_id':'l1', 'name':'sean battier'},
		{'_id':'l2', 'name':'lebron james'},
		{'_id':'l3', 'name':'dwayne wade'},
		{'_id':'l4', 'name':'rajon rondo'},
		{'_id':'l5', 'name':'kevin garnett'},
		{'_id':'l6', 'name':'ray allen'},
		{'_id':'l7', 'name':'dwight howard'},
		{'_id':'l8', 'name':'pau gasol'},
	];
	
	//@param params
	//	@param {String} searchText
	//	@param {Number} cursor Where to load from
	//	@param {Number} loadMorePageSize How many to return
	$scope.loadMore =function(params, callback) {
		var results =itemsMore.slice(params.cursor, (params.cursor+params.loadMorePageSize));
		callback(results, {});
	};

//end: EXAMPLE usage
*/
angular.module('ui.directives').directive('uiLookup', ['ui.config', '$filter', '$timeout', function (uiConfig, $filter, $timeout) {

	/**
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
	function evalArray(arrayBase, params) {
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
	}
	
  return {
		restrict: 'A',
		transclude: true,
		scope: {
			itemsRaw: '=',
			itemsFiltered: '=',
			filterFields:'=',
			loadMore:'&',
			opts: '='
		},

		compile: function(element, attrs) {
			var defaults ={'pageSize':10, 'placeholder':'search', 'scrollLoad':'0', 'loadMorePageSize':20, 'loadMoreItemsKey':'extra', 'filterFieldsDotNotation':true, 'pageScroll':0, minSearchLength: 2, minSearchShowAll:1, classInput:'', classInputCont:''};
			for(var xx in defaults) {
				if(attrs[xx] ===undefined) {
					attrs[xx] =defaults[xx];
				}
			}
			//convert to int
			var attrsToInt =['pageSize', 'loadMorePageSize', 'scrollLoad', 'minSearchLength', 'minSearchShowAll'];
			for(var ii=0; ii<attrsToInt.length; ii++) {
				attrs[attrsToInt[ii]] =parseInt(attrs[attrsToInt[ii]], 10);
			}
			//ensure loadMorePageSize is at least as large as pageSize
			if(attrs.loadMorePageSize <attrs.pageSize) {
				attrs.loadMorePageSize =attrs.pageSize;
			}
			if(attrs.id ===undefined) {
				attrs.id ="uiLookup"+Math.random().toString(36).substring(7);
			}
			var id1 =attrs.id;
			attrs.ids ={
				'input':id1+"Input",
				'contentBottom':id1+"ContentBottom",
				'inputBelow':id1+"InputBelow",
				'scrollContent':id1+"ScrollContent"
			};
			
			var html="<div class='ui-lookup'>"+
				"<div class='ui-lookup-top'>"+
					"<div class='ui-lookup-input-div "+attrs.classInputCont+"'>"+
						"<input type='text' ng-change='changeInput({})' placeholder='"+attrs.placeholder+"' class='ui-lookup-input "+attrs.classInput+"' ng-model='opts.searchText' ng-click='clickInput({})' />"+
					"</div>"+
					//"<div>page: {{page}} totFilteredItems: {{totFilteredItems}} queuedItems: {{queuedItems.length}}</div>"+		//TESTING
					//"<div>hasScrollbar: {{hasScrollbar}} | scrollLoad: {{scrollLoad}}</div>"+		//TESTING
					"<div class='text-warning' ng-show='!trigs.loading && itemsFiltered.length <1 && opts.searchText.length >=minSearchLength'>No matches</div>"+
				"</div>"+
				"<div id='"+attrs.ids.scrollContent+"' class='ui-lookup-content' ng-transclude></div>"+
				"<div id='"+attrs.ids.contentBottom+"'>"+
					"<div ng-hide='trigs.loading || (noMoreLoadMoreItems && queuedItems.length <1) || (scrollLoad && hasScrollbar)' class='ui-lookup-more btn-link' ng-click='loadMoreDir({})'>Load More</div>"+
					"<div class='text-warning' ng-show='trigs.loading && opts.searchText.length >=minSearchLength'>Loading..</div>"+
					"<div ng-show='!trigs.loading && noMoreLoadMoreItems && queuedItems.length <1 && opts.searchText.length >=minSearchLength' class='ui-lookup-no-more muted'>No More Results!</div>"+
				"</div>"+
			"</div>";
				
			element.replaceWith(html);
		},
		
		controller: function($scope, $element, $attrs) {
			var defaults ={
			};
			for(var xx in defaults) {
				if($scope[xx] ===undefined) {
					$scope[xx] =defaults[xx];
				}
			}
			
			if($scope.opts ===undefined) {
				$scope.opts ={};
			}
			var defaultOpts ={
				searchText: '',
				watchItemKeys: ['main']
			};
			$scope.opts =angular.extend(defaultOpts, $scope.opts);
			
			//copy some attributes onto scope for use in html
			$scope.minSearchLength =$attrs.minSearchLength;

			$scope.trigs ={'loading':false};
			$scope.items =[];
			$scope.page =1;		//will store what page (broken up by pageSize attr) we're on
			$scope.totFilteredItems =0;
			$scope.queuedItems =[];		//will hold load more items (i.e. from backend) so can always load at least a page ahead and be fast; i.e. when need to display more items, will just load them from queue (without AJAXing / talking to backend) and THEN after displaying (& removing from queue) the new items, IF still don't have enough for the NEXT page, THEN go to backend to preload the next page's worth of items. This way the AJAXing happens AFTER each page is loaded so it should be ready for the next page as opposed to BEFORE (in which case there's a lag while waiting for the items to return)
			var cursors ={		//will hold cursors for items to know where to append to / load more from
				//'extra':0,
			};
			cursors[$attrs.loadMoreItemsKey] =0;
			if($scope.itemsRaw[$attrs.loadMoreItemsKey] ===undefined) {
				$scope.itemsRaw[$attrs.loadMoreItemsKey] ={
					'items':[]
				};
			}
			$scope.itemsRaw[$attrs.loadMoreItemsKey].items =[];
			$scope.noMoreLoadMoreItems =false;		//boolean that will be set to true if (backend) has no more items (i.e. we're at the end of the list and can't load any more)
			$scope.scrollLoad =$attrs.scrollLoad;
			
			//if scroll load style, ensure attrs.ids.scrollContent has scrollable styles (height & overflow)
			if($scope.scrollLoad) {
				if(!$attrs.pageScroll) {
					var ele1 =document.getElementById($attrs.ids.scrollContent);
					eleAng =angular.element(ele1);
					var height1 =eleAng.css('height');
					var overflow1 =eleAng.css('overflow');
					if(!height1 || !overflow1) {
						eleAng.addClass('ui-lookup-content-scroll');
					}
				}
				
				$scope.hasScrollbar =false;		//init
			}
			
			$scope.testFxn =function(params) {
				alert("test");
			};
			
			var timeoutInfo ={
				'search': {
					'trig':false,
					'delay':750
				},
				'scrolling':{
					'trig':false,
					'delay':750
				}
			};
			
			/*
			var keycodes ={
				'enter':13,
			};
			
			$("#"+attrs.ids.input).keyup(function(evt) {
				$scope.keyupInput(evt, {});
			});
			*/
			
			//add scroll handle to load more
			if($attrs.scrollLoad) {
				if($attrs.pageScroll) {
					window.onscroll =function() {
						$timeout.cancel(timeoutInfo.scrolling.trig);
						timeoutInfo.scrolling.trig =$timeout(function() {
							//console.log('uiLookup timeout scrolling loading');
							var buffer =25;
							var scrollPos =$(window).scrollTop();
							var scrollHeight =$(document).height();
							var viewportHeight =$(window).height();
							//console.log("pos: "+scrollPos+" height: "+scrollHeight+" height: "+viewportHeight);
							if(scrollPos >=(scrollHeight-viewportHeight-buffer)) {
								$scope.loadMoreDir({'noDelay':true, 'next':true});
							}
							//prev version
							if(scrollPos <=buffer) {
								$scope.loadMoreDir({'noDelay':true, 'prev':true});
							}
						}, timeoutInfo.scrolling.delay);
					};
				}
				else {
					document.getElementById($attrs.ids.scrollContent).onscroll =function() {
						$timeout.cancel(timeoutInfo.scrolling.trig);
						$timeout.cancel(timeoutInfo.search.trig);
						timeoutInfo.scrolling.trig =$timeout(function() {
							//console.log('uiLookup timeout scrolling loading');
							var buffer =25;
							var ele =document.getElementById($attrs.ids.scrollContent);
							var scrollPos =ele.scrollTop;
							var scrollHeight =ele.scrollHeight;
							//var height1 =$(ele).height();
							var height1 =ele.clientHeight;
							//console.log("pos: "+scrollPos+" height: "+scrollHeight+" height: "+height1);
							if(scrollPos >=(scrollHeight-height1-buffer)) {
								$scope.loadMoreDir({'noDelay':true});
							}
						}, timeoutInfo.scrolling.delay);
					};
				}
			}
			
			//0.5.
			function init(params) {
				formItems({});
				if($scope.queuedItems.length <$attrs.pageSize && $scope.totFilteredItems <$scope.page*$attrs.pageSize) {		//load more externally if don't have enough
					$scope.loadMoreDir({});
				}
			}
			
			//0.75.
			function resetItems(params) {
				$scope.page =1;		//reset
				checkForScrollBar({});
				$scope.noMoreLoadMoreItems =false;
				$scope.queuedItems =[];
				cursors ={
					//'extra':0,
				};
				cursors[$attrs.loadMoreItemsKey] =0;
				$scope.itemsRaw[$attrs.loadMoreItemsKey].items =[];
				document.getElementById($attrs.ids.scrollContent).scrollTop =0;
				//$("#"+$attrs.ids.scrollContent).scrollTop(0);
			}
			
			//1.
			/*
			concats all types in itemsRaw into a final set of items to be selected from / displayed
			@param params
				OPTIONAL
				keys =array [] of which itemsRaw keys to copy over; otherwise all will be copied over
			*/
			function formItems(params) {
				var keys;
				if(params.keys !==undefined) {
					keys =params.keys;
				}
				else {		//copy them all
					keys =[];
					var counter =0;
					for(var xx in $scope.itemsRaw) {
						keys[counter] =xx;
						counter++;
					}
				}
				$scope.items =[];		//reset first
				for(var ii =0; ii<keys.length; ii++) {
					$scope.items =$scope.items.concat($scope.itemsRaw[keys[ii]].items);
				}
				
				$scope.filterItems({});		//search / re-filter
			}
			
			//2.
			$scope.filterItems =function(params) {
				//$scope.itemsFiltered =$filter('filter')($scope.items, {name:$scope.opts.searchText});
				var curItem =false;
				var searchText1 =$scope.opts.searchText.toLowerCase();
				if(searchText1.length <$attrs.minSearchLength) {
					if($attrs.minSearchShowAll) {		//show all
						$scope.itemsFiltered =$scope.items;
					}
					else {		//show none
						$scope.itemsFiltered =[];
					}
				}
				else {		//filter
					$scope.itemsFiltered =$filter('filter')($scope.items, function(item) {
						var match =false;
						var curItem;
						for(var ii=0; ii<$scope.filterFields.length; ii++) {
							if($attrs.filterFieldsDotNotation && $scope.filterFields[ii].indexOf('.') >-1) {
								var retArray1 =evalArray(item, {'keys':$scope.filterFields[ii]});
								if(retArray1.val !==undefined) {
									curItem =retArray1.val;
								}
								else {
									curItem =false;
								}
							}
							else {
								if(item[$scope.filterFields[ii]] !==undefined) {
									curItem =item[$scope.filterFields[ii]];
								}
								else {
									curItem =false;
								}
							}
							if(curItem) {
								curItem =curItem.toLowerCase();
								if(curItem.indexOf(searchText1) >-1) {
									match =true;
									break;
								}
							}
						}
						return match;
					});
				}
				$scope.totFilteredItems =$scope.itemsFiltered.length;
				$scope.itemsFiltered =$scope.itemsFiltered.slice(0, $scope.page*$attrs.pageSize);
				checkForScrollBar({});
			};
			
			//3.
			$scope.clickInput =function(params) {
				$scope.filterItems({});
			};
			
			//4.
			$scope.changeInput =function(params) {
				resetItems({});
				//$scope.filterItems({});
				formItems({});
				//reset timeout
				if(timeoutInfo.search.trig) {
					$timeout.cancel(timeoutInfo.search.trig);
				}
				//set timeout if don't have full items
				if($scope.totFilteredItems <$scope.page*$attrs.pageSize) {
					//show loading
					$scope.trigs.loading =true;
					// if(!$scope.$$phase) {
						// $scope.$apply();
					// }
					timeoutInfo.search.trig =$timeout(function() {
						getMoreItems({});
					}, timeoutInfo.search.delay);
				}
			};
			
			//5.
			/*
			//doesn't work - have to watch a sub array piece
			$scope.$watch('itemsRaw', function(newVal, oldVal) {
				if(!angular.equals(oldVal, newVal)) {		//very important to do this for performance reasons since $watch runs all the time
					formItems({});
				}
			});
			*/
			//for(var xx in $scope.itemsRaw) {
			for(var ii =0; ii<$scope.opts.watchItemKeys.length; ii++) {
				xx =$scope.opts.watchItemKeys[ii];
				//$scope.$watch('itemsRaw', function(newVal, oldVal) {
				//$scope.$watch('itemsRaw['+xx+'].items[0]', function(newVal, oldVal) {
				//$scope.$watch('itemsRaw.extra.items[0]', function(newVal, oldVal) {
				//$scope.$watch('itemsRaw.extra', function(newVal, oldVal) {
				//$scope.$watch('itemsRaw.'+xx, function(newVal, oldVal) {
				$scope.$watch('itemsRaw.'+xx+'.items', function(newVal, oldVal) {
					if(!angular.equals(oldVal, newVal)) {		//very important to do this for performance reasons since $watch runs all the time
						if($scope.totFilteredItems <$scope.page*$attrs.pageSize) {		//if only on first page, reset (otherwise load more button / triggers will be set to false since there's no more in queue / from backend)
							resetItems({});
						}
						formItems({});
						/*
						if($scope.queuedItems.length <$attrs.pageSize && $scope.totFilteredItems <$scope.page*$attrs.pageSize) {		//load more externally if don't have enough
							$scope.loadMoreDir({});
						}
						*/
					}
				});
			}
			
			//5.5. $watch not firing all the time... @todo figure out & fix this.. (also this will reform ALL instances - should pass in an instance id - which means the directive would have to pass an instance back somehow..)
			$scope.$on('uiLookupReformItems', function(evt, params) {
				formItems({});
			});
			
			//6.
			/*
			Starts the load more process - checks if need to load more (may already have more items in the existing javascript filtered items array, in which case can just load more internally) and IF need to load more external items, sets a timeout to do so (for performance to avoid rapid firing external calls)
				This is paired with the getMoreItems function below - which handles actually getting the items AFTER the timeout
			@param params
				noDelay =boolean true to skip the timeout before loading more (i.e. if coming from scroll, in which case already have waited)
			*/
			$scope.loadMoreDir =function(params) {
				var getMoreItemsTrig =false;
				//if have more filtered items left, increment page & show them
				if($scope.totFilteredItems >$scope.page*$attrs.pageSize) {
					//if this next NEXT page will be less than full, get more items (i.e. from backend) to fill queue
					if($scope.totFilteredItems <($scope.page+2)*$attrs.pageSize) {
						getMoreItemsTrig =true;
					}
					$scope.page++;
					//checkForScrollBar({});
					$scope.filterItems({});
				}
				else {
					getMoreItemsTrig =true;
				}
				//set timeout to get more from backend if function has been given for how to do so
				params.noDelay =true;		//never want to timeout here? Handle that outside this function (should only have on search and on scroll and it's already handled there?)
				if(getMoreItemsTrig) {
					if(params.noDelay) {
						getMoreItems({});
					}
					else {
						$scope.trigs.loading =true;
						// if(!$scope.$$phase) {
							// $scope.$apply();
						// }
						timeoutInfo.search.trig =$timeout(function() {
							getMoreItems({});
						}, timeoutInfo.search.delay);
					}
				}
			};
			
			//7.
			/*
			Handles loading items from the queue and calling the external loadMore function to pre-fill the queue for the next page (this is the function that runs AFTER the timeout set in $scope.loadMoreDir function)
			If have items in queue, they're added to itemsRaw and then formItems is re-called to re-form filtered items & update display
			*/
			function getMoreItems(params) {
				if($scope.loadMore !==undefined && $scope.loadMore() !==undefined && typeof($scope.loadMore()) =='function') {		//this is an optional scope attr so don't assume it exists
					/*
					$scope.loadMore();
					*/
					var retQueue =addItemsFromQueue({});
					var ppTemp ={};
					if(!retQueue.pageFilled) {
						ppTemp.partialLoad =true;
						ppTemp.numToFillCurPage =$attrs.pageSize-retQueue.numItemsAdded;
						if($scope.page*$attrs.pageSize >$scope.totFilteredItems && $scope.totFilteredItems >(($scope.page-1)*$attrs.pageSize)) {		//if have page partially filled by filtered items (but not completely blank), have to subtract that as well
							ppTemp.numToFillCurPage -=$scope.page*$attrs.pageSize -$scope.totFilteredItems;
						}
					}
					//if AFTER loading items from queue, remaining items are less than pageSize, NOW load more (i.e. AJAX to backend) to re-populate queue
					if($scope.queuedItems.length <$attrs.pageSize) {
						if(!$scope.noMoreLoadMoreItems) {		//only try to load more if have more left to load
							var loadPageSize =$attrs.loadMorePageSize;
							if(ppTemp.partialLoad) {		//need to load extra since need to immediately fill the existing page first
								if(loadPageSize <($attrs.pageSize+ppTemp.numToFillCurPage)) {
									loadPageSize =$attrs.pageSize+ppTemp.numToFillCurPage;
									ppTemp.loadPageSize =loadPageSize;
								}
							}
							$scope.loadMore()({'cursor':cursors[$attrs.loadMoreItemsKey], 'loadMorePageSize':loadPageSize, 'searchText':$scope.opts.searchText}, function(results, ppCustom) {
								addLoadMoreItems(results, ppCustom, ppTemp);
							});
						}
					}
				}
			}
			
			//7.5.
			/*
			@param params
				OPTIONAL
				numToAdd =int of number of items to pull from queue (if not set, will take a full page's worth or the number left in queue, whichever is greater)
				partialLoad =boolean true if just filling the existing page (don't increment page counter)
			@return array {}
				pageFilled =boolean if had enough items in queue to fill the current page (otherwise need to add more immediately to fill it)
				numItemsAdded =int of how many items were added from query
			*/
			function addItemsFromQueue(params) {
				var numFromQueue;
				var retArray ={'pageFilled':false, 'numItemsAdded':0};
				//add items from queue (if exists)
				if($scope.queuedItems.length >0) {
					if(params.numToAdd) {
						numFromQueue =params.numToAdd;
						if($scope.queuedItems.length <numFromQueue) {
							numFromQueue =$scope.queuedItems.length;
						}
					}
					else if($scope.queuedItems.length >=$attrs.pageSize) {
						numFromQueue =$attrs.pageSize;
						retArray.pageFilled =true;
					}
					else {
						numFromQueue =$scope.queuedItems.length;
					}
					retArray.numItemsAdded =numFromQueue;
					//add to itemsRaw then update filtered items
					$scope.itemsRaw[$attrs.loadMoreItemsKey].items =$scope.itemsRaw[$attrs.loadMoreItemsKey].items.concat($scope.queuedItems.slice(0, numFromQueue));
					if(params.partialLoad ===undefined || !params.partialLoad || numFromQueue ==$attrs.pageSize) {		//partial load can be set if need to load a new page so may still need to increment page if loading same number of items as page size
						$scope.page++;
						//checkForScrollBar({});
					}
					formItems({});
					//remove from queue
					$scope.queuedItems =$scope.queuedItems.slice(numFromQueue, $scope.queuedItems.length);
				}
				return retArray;
			}
			
			//8.
			/*
			This is the callback function that is called from the outer (non-directive) controller with the externally loaded items. These items are added to the queue and the cursor is updated accordingly.
				- Additionally, the noMoreLoadMoreItems trigger is set if the returned results are less than the loadMorePageSize
				- Also, it immediately will load from queue if the current page isn't full yet (if params.partialLoad & params.numToFillCurPage are set)
			@param results =array [] of items (will be appended to queue)
			@param ppCustom =params returned from callback
			@param params
				partialLoad =boolean true if need to immediately fill the current page
				numToFillCurPage =int of how many to immediately load from queue
				loadPageSize =int of how many were attempted to be loaded externally (may be larger than $attrs.loadMorePageSize if are doing a partial load as well as the next page load)
			*/
			function addLoadMoreItems(results, ppCustom, params) {
				//$scope.queuedItems.push(results);		//doesn't work - nests array too deep; use concat instead..
				$scope.queuedItems =$scope.queuedItems.concat(results);
				cursors[$attrs.loadMoreItemsKey] +=results.length;		//don't just add $attrs.loadMorePageSize in case there weren't enough items on the backend (i.e. results could be LESS than this)
				//if don't have enough results, assume backend is done so are out of items
				if(results.length <$attrs.loadMorePageSize || (params.loadPageSize !==undefined && results.length <params.loadPageSize)) {
					$scope.noMoreLoadMoreItems =true;
				}
				//if current page isn't full, immediately pull some from queue
				if(params.partialLoad) {
					var retQueue =addItemsFromQueue({'partialLoad':true, 'numToAdd':params.numToFillCurPage});
				}
				$scope.trigs.loading =false;		//reset
			}
			
			//9.
			function checkForScrollBar(params) {
				if($scope.scrollLoad) {
					$timeout(function() {		//need timeout to wait for items to load / display so scroll height is correct
						var scrollHeight;
						if($attrs.pageScroll) {
							//var scrollPos =$(window).scrollTop();
							scrollHeight =$(document).height();
							var viewportHeight =$(window).height();
							//console.log("pos: "+scrollPos+" height: "+scrollHeight+" height: "+height1);
							if(scrollHeight >viewportHeight) {
								$scope.hasScrollbar =true;
							}
							else {
								$scope.hasScrollbar =false;
							}
						}
						else {
							var ele =document.getElementById($attrs.ids.scrollContent);
							//var scrollPos =ele.scrollTop;
							scrollHeight =ele.scrollHeight;
							var height1 =ele.clientHeight;
							//console.log('checkForScrollBar scrollHeight: '+scrollHeight+' height1: '+height1);
							if(scrollHeight >height1) {
								$scope.hasScrollbar =true;
							}
							else {
								$scope.hasScrollbar =false;
							}
						}
					}, 100);
				}
			}
			
			init({});		//init (called once when directive first loads)
		}
	};
}]);
(function () {
  var app = angular.module('ui.directives');

  //Setup map events from a google map object to trigger on a given element too,
  //then we just use ui-event to catch events from an element
  function bindMapEvents(scope, eventsStr, googleObject, element) {
    angular.forEach(eventsStr.split(' '), function (eventName) {
      //Prefix all googlemap events with 'map-', so eg 'click' 
      //for the googlemap doesn't interfere with a normal 'click' event
      var $event = { type: 'map-' + eventName };
      google.maps.event.addListener(googleObject, eventName, function (evt) {
        element.triggerHandler(angular.extend({}, $event, evt));
        //We create an $apply if it isn't happening. we need better support for this
        //We don't want to use timeout because tons of these events fire at once,
        //and we only need one $apply
        if (!scope.$$phase) scope.$apply();
      });
    });
  }

  app.directive('uiMap',
    ['ui.config', '$parse', function (uiConfig, $parse) {

      var mapEvents = 'bounds_changed center_changed click dblclick drag dragend ' +
        'dragstart heading_changed idle maptypeid_changed mousemove mouseout ' +
        'mouseover projection_changed resize rightclick tilesloaded tilt_changed ' +
        'zoom_changed';
      var options = uiConfig.map || {};

      return {
        restrict: 'A',
        //doesn't work as E for unknown reason
        link: function (scope, elm, attrs) {
          var opts = angular.extend({}, options, scope.$eval(attrs.uiOptions));
          var map = new google.maps.Map(elm[0], opts);
          var model = $parse(attrs.uiMap);

          //Set scope variable for the map
          model.assign(scope, map);

          bindMapEvents(scope, mapEvents, map, elm);
        }
      };
    }]);

  app.directive('uiMapInfoWindow',
    ['ui.config', '$parse', '$compile', function (uiConfig, $parse, $compile) {

      var infoWindowEvents = 'closeclick content_change domready ' +
        'position_changed zindex_changed';
      var options = uiConfig.mapInfoWindow || {};

      return {
        link: function (scope, elm, attrs) {
          var opts = angular.extend({}, options, scope.$eval(attrs.uiOptions));
          opts.content = elm[0];
          var model = $parse(attrs.uiMapInfoWindow);
          var infoWindow = model(scope);

          if (!infoWindow) {
            infoWindow = new google.maps.InfoWindow(opts);
            model.assign(scope, infoWindow);
          }

          bindMapEvents(scope, infoWindowEvents, infoWindow, elm);

          /* The info window's contents dont' need to be on the dom anymore,
           google maps has them stored.  So we just replace the infowindow element
           with an empty div. (we don't just straight remove it from the dom because
           straight removing things from the dom can mess up angular) */
          elm.replaceWith('<div></div>');

          //Decorate infoWindow.open to $compile contents before opening
          var _open = infoWindow.open;
          infoWindow.open = function open(a1, a2, a3, a4, a5, a6) {
            $compile(elm.contents())(scope);
            _open.call(infoWindow, a1, a2, a3, a4, a5, a6);
          };
        }
      };
    }]);

  /* 
   * Map overlay directives all work the same. Take map marker for example
   * <ui-map-marker="myMarker"> will $watch 'myMarker' and each time it changes,
   * it will hook up myMarker's events to the directive dom element.  Then
   * ui-event will be able to catch all of myMarker's events. Super simple.
   */
  function mapOverlayDirective(directiveName, events) {
    app.directive(directiveName, [function () {
      return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
          scope.$watch(attrs[directiveName], function (newObject) {
            bindMapEvents(scope, events, newObject, elm);
          });
        }
      };
    }]);
  }

  mapOverlayDirective('uiMapMarker',
    'animation_changed click clickable_changed cursor_changed ' +
      'dblclick drag dragend draggable_changed dragstart flat_changed icon_changed ' +
      'mousedown mouseout mouseover mouseup position_changed rightclick ' +
      'shadow_changed shape_changed title_changed visible_changed zindex_changed');

  mapOverlayDirective('uiMapPolyline',
    'click dblclick mousedown mousemove mouseout mouseover mouseup rightclick');

  mapOverlayDirective('uiMapPolygon',
    'click dblclick mousedown mousemove mouseout mouseover mouseup rightclick');

  mapOverlayDirective('uiMapRectangle',
    'bounds_changed click dblclick mousedown mousemove mouseout mouseover ' +
      'mouseup rightclick');

  mapOverlayDirective('uiMapCircle',
    'center_changed click dblclick mousedown mousemove ' +
      'mouseout mouseover mouseup radius_changed rightclick');

  mapOverlayDirective('uiMapGroundOverlay',
    'click dblclick');

})();
/*
 Attaches input mask onto input element
 */
angular.module('ui.directives').directive('uiMask', [
  function () {
    var maskDefinitions = {
      '9': /\d/,
      'A': /[a-zA-Z]/,
      '*': /[a-zA-Z0-9]/
    };
    return {
      priority: 100,
      require: 'ngModel',
      restrict: 'A',
      link: function (scope, iElement, iAttrs, controller) {
        var maskProcessed = false, eventsBound = false,
            maskCaretMap, maskPatterns, maskPlaceholder,
            value, valueMasked, isValid,
            // Vars for initializing/uninitializing
            originalPlaceholder = iAttrs.placeholder,
            originalMaxlength   = iAttrs.maxlength,
            // Vars used exclusively in eventHandler()
            oldValue, oldValueUnmasked, oldCaretPosition, oldSelectionLength;

        iAttrs.$observe('uiMask', initialize);
        controller.$formatters.push(formatter);
        controller.$parsers.push(parser);

        function initialize(maskAttr) {
          if (!angular.isDefined(maskAttr))
            return uninitialize();
          processRawMask(maskAttr);
          if (!maskProcessed)
            return uninitialize();
          initializeElement();
          bindEventListeners();
        }

        function uninitialize() {
          maskProcessed = false;
          unbindEventListeners();

          if (angular.isDefined(originalPlaceholder))
            iElement.attr('placeholder', originalPlaceholder);
          else
            iElement.removeAttr('placeholder');

          if (angular.isDefined(originalMaxlength))
            iElement.attr('maxlength', originalMaxlength);
          else
            iElement.removeAttr('maxlength');

          return false;
        }

        function processRawMask(mask) {
          var characterCount = 0;
          maskCaretMap       = [];
          maskPatterns       = [];
          maskPlaceholder    = '';

          // If mask is an array, it's a complex mask!
          if (mask instanceof Array) {
            angular.forEach(mask, function(item, i) {
              if (item instanceof RegExp) {
                maskCaretMap.push(characterCount++);
                maskPlaceholder += '_';
                maskPatterns.push(item);
              }
              else if (typeof item == 'string') {
                angular.forEach(item.split(''), function(chr, i) {
                  maskPlaceholder += chr;
                  characterCount++;
                });
              }
            });
          }
          // Otherwise it's a simple mask
          else if (typeof mask === 'string') {
            angular.forEach(mask.split(''), function(chr, i) {
              if (maskDefinitions[chr]) {
                maskCaretMap.push(characterCount);
                maskPlaceholder += '_';
                maskPatterns.push(maskDefinitions[chr]);
              }
              else
                maskPlaceholder += chr;
              characterCount++;
            });
          }
          // Caret position immediately following last position is valid.
          maskCaretMap.push(maskCaretMap.slice().pop() + 1);
          maskProcessed = maskCaretMap.length > 1 ? true : false;
        }

        function initializeElement() {
          value               = oldValueUnmasked = unmaskValue(controller.$viewValue || '');
          valueMasked         = oldValue         = maskValue(value);
          isValid             = validateValue(value);
          if (iAttrs.maxlength) // Double maxlength to allow pasting new val at end of mask
            iElement.attr('maxlength', maskCaretMap[maskCaretMap.length-1]*2);
          iElement.attr('placeholder', maskPlaceholder);
          iElement.val(isValid && value.length ? valueMasked : '');
        }

        function bindEventListeners() {
          if (eventsBound)
            return true;
          iElement.bind('blur', blurHandler);
          iElement.bind('input propertychange keyup click mouseout', eventHandler);
          eventsBound = true;
        }

        function unbindEventListeners() {
          if (!eventsBound)
            return true;
          iElement.unbind('blur', blurHandler);
          iElement.unbind('input', eventHandler);
          iElement.unbind('propertychange', eventHandler);
          iElement.unbind('keyup', eventHandler);
          iElement.unbind('click', eventHandler);
          iElement.unbind('mouseout', eventHandler);
          eventsBound = false;
        }

        function formatter(modelValue) {
          if (!maskProcessed)
            return modelValue;
          value   = unmaskValue(modelValue || '');
          isValid = validateValue(value);
          controller.$setValidity('mask', isValid);
          return isValid ? maskValue(value) : undefined;
        }

        function parser(viewValue) {
          if (!maskProcessed)
            return viewValue;
          value   = unmaskValue(viewValue || '');
          isValid = validateValue(value);
          controller.$setValidity('mask', isValid);
          if (value === '' && controller.$error.required !== undefined)
            controller.$setValidity('required', false);
          return isValid ? value : undefined;
        }

        function validateValue(value) {
          // Zero-length value validity is ngRequired's determination
          return value.length ? value.length === maskCaretMap.length - 1 : true;
        }

        function unmaskValue(value) {
          var valueUnmasked    = '',
              maskPatternCopys = maskPatterns.slice();
          angular.forEach(value.toString().split(''), function(chr, i) {
            if (maskPatternCopys.length && maskPatternCopys[0].test(chr)) {
              valueUnmasked += chr;
              maskPatternCopys.shift();
            }
          });
          return valueUnmasked;
        }

        function maskValue(unmaskedValue) {
          var valueMasked      = '',
              maskCaretMapCopy = maskCaretMap.slice();
          angular.forEach(maskPlaceholder.split(''), function(chr, i) {
            if (unmaskedValue.length && i === maskCaretMapCopy[0]) {
              valueMasked  += unmaskedValue.charAt(0) || '_';
              unmaskedValue = unmaskedValue.substr(1);
              maskCaretMapCopy.shift(); }
            else
              valueMasked += chr;
          });
          return valueMasked;
        }

        function blurHandler(e) {
          oldCaretPosition   = 0;
          oldSelectionLength = 0;
          if (!isValid || value.length === 0) {
            valueMasked = '';
            iElement.val('');
            scope.$apply(function() {
              controller.$setViewValue('');
            });
          }
        }

        function eventHandler(e) {
          // Allows more efficient minification
          var eventWhich = e.which,
              eventType  = e.type;

          // Prevent shift and ctrl from mucking with old values
          if (eventWhich == 16 || eventWhich == 91) return true;

          var elem            = iElement,
              val             = elem.val(),
              valOld          = oldValue,
              valMasked,
              valUnmasked     = unmaskValue(val),
              valUnmaskedOld  = oldValueUnmasked,

              caretPos        = getCaretPosition(this) || 0,
              caretPosOld     = oldCaretPosition || 0,
              caretPosDelta   = caretPos - caretPosOld,
              caretPosMin     = maskCaretMap[0],
              caretPosMax     = maskCaretMap[valUnmasked.length] || maskCaretMap.slice().shift(),

              selectionLen    = getSelectionLength(this),
              selectionLenOld = oldSelectionLength || 0,
              isSelected      = selectionLen > 0,
              wasSelected     = selectionLenOld > 0,

                                                                // Case: Typing a character to overwrite a selection
              isAddition      = (val.length > valOld.length) || (selectionLenOld && val.length >  valOld.length - selectionLenOld),
                                                                // Case: Delete and backspace behave identically on a selection
              isDeletion      = (val.length < valOld.length) || (selectionLenOld && val.length == valOld.length - selectionLenOld),
              isSelection     = (eventWhich >= 37 && eventWhich <= 40) && e.shiftKey, // Arrow key codes

              isKeyLeftArrow  = eventWhich == 37,
                                                    // Necessary due to "input" event not providing a key code
              isKeyBackspace  = eventWhich == 8  || (eventType != 'keyup' && isDeletion && (caretPosDelta === -1)),
              isKeyDelete     = eventWhich == 46 || (eventType != 'keyup' && isDeletion && (caretPosDelta === 0 ) && !wasSelected),

              // Handles cases where caret is moved and placed in front of invalid maskCaretMap position. Logic below
              // ensures that, on click or leftward caret placement, caret is moved leftward until directly right of
              // non-mask character. Also applied to click since users are (arguably) more likely to backspace
              // a character when clicking within a filled input.
              caretBumpBack   = (isKeyLeftArrow || isKeyBackspace || eventType == 'click') && caretPos > caretPosMin;

          oldSelectionLength  = selectionLen;

          // These events don't require any action
          if (eventType == 'mouseout' || isSelection || (isSelected && (eventType == 'click' || eventType == 'keyup')))
            return true;

          // Value Handling
          // ==============

          // User attempted to delete but raw value was unaffected--correct this grievous offense
          if ((eventType == 'input' || eventType == 'propertychange') && isDeletion && !wasSelected && valUnmasked === valUnmaskedOld) {
            while (isKeyBackspace && caretPos > 0 && !isValidCaretPosition(caretPos))
              caretPos--;
            while (isKeyDelete && caretPos < maskPlaceholder.length && maskCaretMap.indexOf(caretPos) == -1)
              caretPos++;
            var charIndex = maskCaretMap.indexOf(caretPos);
            // Strip out non-mask character that user would have deleted if mask hadn't been in the way.
            valUnmasked = valUnmasked.substring(0, charIndex) + valUnmasked.substring(charIndex + 1);
          }

          // Update values
          valMasked        = maskValue(valUnmasked);
          oldValue         = valMasked;
          oldValueUnmasked = valUnmasked;
          elem.val(valMasked);

          // Caret Repositioning
          // ===================

          // Ensure that typing always places caret ahead of typed character in cases where the first char of
          // the input is a mask char and the caret is placed at the 0 position.
          if (isAddition && (caretPos <= caretPosMin))
            caretPos = caretPosMin + 1;

          if (caretBumpBack)
            caretPos--;

          // Make sure caret is within min and max position limits
          caretPos = caretPos > caretPosMax ? caretPosMax : caretPos < caretPosMin ? caretPosMin : caretPos;

          // Scoot the caret back or forth until it's in a non-mask position and within min/max position limits
          while (!isValidCaretPosition(caretPos) && caretPos > caretPosMin && caretPos < caretPosMax)
            caretPos += caretBumpBack ? -1 : 1;

          if ((caretBumpBack && caretPos < caretPosMax) || (isAddition && !isValidCaretPosition(caretPosOld)))
            caretPos++;

          oldCaretPosition = caretPos;
          setCaretPosition(this, caretPos);
        }

        function isValidCaretPosition(pos) { return maskCaretMap.indexOf(pos) > -1; }

        function getCaretPosition(input) {
          if (input.selectionStart !== undefined)
            return input.selectionStart;
          else if (document.selection) {
            // Curse you IE
            input.focus();
            var selection = document.selection.createRange();
            selection.moveStart('character', -input.value.length);
            return selection.text.length;
          }
        }

        function setCaretPosition(input, pos) {
          if (input.setSelectionRange) {
            input.focus();
            input.setSelectionRange(pos,pos); }
          else if (input.createTextRange) {
            // Curse you IE
            var range = input.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
          }
        }

        function getSelectionLength(input) {
          if (input.selectionStart !== undefined)
            return (input.selectionEnd - input.selectionStart);
          if (document.selection)
            return (document.selection.createRange().text.length);
        }

        // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/indexOf
        if (!Array.prototype.indexOf) {
          Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
            "use strict";
            if (this === null) {
              throw new TypeError();
            }
            var t = Object(this);
            var len = t.length >>> 0;
            if (len === 0) {
              return -1;
            }
            var n = 0;
            if (arguments.length > 1) {
              n = Number(arguments[1]);
              if (n != n) { // shortcut for verifying if it's NaN
                n = 0;
              } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
              }
            }
            if (n >= len) {
              return -1;
            }
            var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
            for (; k < len; k++) {
              if (k in t && t[k] === searchElement) {
                return k;
              }
            }
            return -1;
          };
        }

      }
    };
  }
]);

/**
@todo2:
- load more / calling function to load more opts & then update them (i.e. when scroll to bottom or click "more")
	- use timeout for searching more & auto search more if result isn't found in default/javascript/local opts

USAGE functions:
//to update options after it's been written / initialized:		//NOTE: this should NOT be necessary anymore as $watch is being used on opts
$scope.$broadcast('uiMultiselectUpdateOpts', {'id':'select1', 'opts':optsNew});


Table of Contents
controller
//0. init vars, etc.
//15. $scope.focusInput
//16. $scope.keyupInput
//14. selectOpts
//11. filterOpts
//13. $scope.keydownInput
//6. $scope.clickInput
//7. $scope.selectOpt
//8. $scope.removeOpt
//8.5. removeDisplayOpt
//9. $scope.$on('uiMultiselectUpdateOpts',..
//10. formOpts
//12. $scope.createNewOpt
	//12.5. createNewCheck
//0.5. init part 2 (after functions are declared) - select default options, etc.
//0.75. $scope.$watch('ngModel',.. - to update selected values on change
//0.8. $scope.$watch('selectOpts',..

uiMultiselectData service
//1. init
//2. toggleDropdown
//3. getFocusCoords
//4. blurInput
//5. mouseInDiv


@param {Object} scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html). REMEMBER: use snake-case when setting these on the partial!
	@param {Array} selectOpts options; each item is an object of:
		@param {String} val Value of this option
		@param {String} name text/html to display for this option
	@param {Mixed} ngModel
	@param {Object} config
		@param {Number} [createNew =0] int 1 or 0; 1 to allow creating a new option from what the user typed IF it doesn't already exist

@param {Object} attrs REMEMBER: use snake-case when setting these on the partial! i.e. scroll-load='1' NOT scrollLoad='1'
	@param {String} [id] Id for this element (required to use uiMultiselectUpdateOpts event to update options)
	@param {String} [placeholder] text/prompt to show in input box
	@param {Number} [minLengthCreate =1] how many characters are required to be a valid new option
	@param {String} [onChangeEvt] event to broadcast on change (or remove) options


EXAMPLE usage:
partial / html:
	<div ui-multiselect id='select1' select-opts='selectOpts' ng-model='selectVals' config='config'></div>

controller / js:
	$scope.selectVals =[];
	$scope.config ={};
	$scope.selectOpts =[
		{'val':1, 'name':'one'},
		{'val':2, 'name':'two'},
		{'val':3, 'name':'three'},
		{'val':4, 'name':'four'},
		{'val':5, 'name':'five'}
	];
	
	//to update options - NOTE: this must be done AFTER $scope is loaded - the below must be wrapped inside a callback or timeout so the $scope has time to load
	$timeout(function() {
		var optsNew =[
			{'val':1, 'name':'yes'},
			{'val':2, 'name':'no'},
			{'val':3, 'name':'maybe'}
		];
		// $scope.$broadcast('uiMultiselectUpdateOpts', {'id':'select1', 'opts':optsNew});		//OUTDATED but still works
		$scope.selectOpts =optsNew;
	}, 500);

//end: EXAMPLE usage
*/

angular.module('ui.directives').directive('uiMultiselect', ['ui.config', 'uiMultiselectData', 'uiLibArray', '$timeout', '$filter', function (uiConfig, uiMultiselectData, libArray, $timeout, $filter) {

	return {
		priority: 100,		//must be below 500 to work with lFormInput directive
		scope: {
			selectOpts:'=',
			ngModel:'=',
			config:'='
		},

		compile: function(element, attrs) {
			var defaultsAttrs ={'placeholder':'Type to search', 'minLengthCreate':1,
				'debug':false		//true to show console.log messages
			};
			//attrs =angular.extend(defaultsAttrs, attrs);
			//attrs =libArray.extend(defaultsAttrs, attrs, {});
			//attrs =$.extend({}, defaultsAttrs, attrs);
			for(var xx in defaultsAttrs) {
				if(attrs[xx] ===undefined) {
					attrs[xx] =defaultsAttrs[xx];
				}
			}
			
			//NOTE: must set id's using the scope since if use attrs.id(s) here and this directive is inside an ng-repeat, all instances will have the SAME id and this isn't allowed and will break things! It took a long time to figure out the right syntax and combination of compile, link, & controller function (as well as $timeout usage) to get this all to work (unique id's to be set, events to get registered properly on the correct id's, ng-repeat for filteredOpts to show up (doing $compile a 2nd time in the link function breaks the ng-repeat here..) etc.)
			var html ="<div>";
			html+="<div id='{{id}}' class='ui-multiselect'>";
				html+="<div id='{{ids.displayBox}}' class='ui-multiselect-display-box' ng-click='focusInput({})'>"+
					"<div id='{{ids.selectedOpts}}' class='ui-multiselect-selected-opts'>"+
						"<div ng-repeat='opt in selectedOpts' class='ui-multiselect-selected-opt'><div class='ui-multiselect-selected-opt-remove' ng-click='removeOpt(opt, {})'>X</div> {{opt.name}}</div>"+
					"</div>"+
					"<div class='ui-multiselect-input-div'>"+
						// "<input id='{{ids.input}}' type='text' ng-change='filterOpts({})' placeholder='"+attrs.placeholder+"' class='ui-multiselect-input' ng-model='modelInput' ng-click='clickInput({})' ui-keyup='{\"tab\":\"keyupInput({})\"}' />"+
						"<input id='{{ids.input}}' type='text' ng-change='filterOpts({})' placeholder='"+attrs.placeholder+"' class='ui-multiselect-input' ng-model='modelInput' ng-click='clickInput({})' />"+
					"</div>"+
				"</div>"+
				"<div class='ui-multiselect-dropdown-cont'>"+
					"<div id='{{ids.dropdown}}' class='ui-multiselect-dropdown'>";
						//html+="<div class='ui-multiselect-dropdown-opt' ng-repeat='opt in opts | filter:{name:modelInput, selected:\"0\"}' ng-click='selectOpt(opt, {})'>{{opt.name}}</div>";
						html+="<div class='ui-multiselect-dropdown-opt' ng-repeat='opt in filteredOpts' ng-click='selectOpt(opt, {})'>{{opt.name}}</div>";
						// html+="filteredOpts.length: {{filteredOpts.length}}";
						html+="<div class='ui-multiselect-dropdown-opt' ng-show='config1.createNew && createNewAllowed && filteredOpts.length <1' ng-click='createNewOpt({})'>[Create New]</div>"+
						"<div class='ui-multiselect-dropdown-opt' ng-show='loadingOpt'>Loading..</div>";
					//opts will be built and stuff by writeOpts function later
					html+="</div>";
				html+="</div>";
			html+="</div>";
			html+="</div>";
			element.replaceWith(html);
			

			return function(scope, element, attrs, ngModel) {
				var xx;		//used in for loops later
				var defaultsAttrs ={'placeholder':'Type to search', 'minLengthCreate':1,
					'debug':false		//true to show console.log messages
				};
				//attrs =angular.extend(defaultsAttrs, attrs);
				//attrs =libArray.extend(defaultsAttrs, attrs, {});
				//attrs =$.extend({}, defaultsAttrs, attrs);
				for(xx in defaultsAttrs) {
					if(attrs[xx] ===undefined) {
						attrs[xx] =defaultsAttrs[xx];
					}
				}
				
				//IMPORTANT: set id's HERE (AFTER compile function) to ensure they're UNIQUE in case this directive is in an ng-repeat!!!
				// var oldId =attrs.id;
				attrs.id ="uiMultiselect"+Math.random().toString(36).substring(7);
				
				attrs.ids ={
					'displayBox':attrs.id+"DisplayBox",
					'input':attrs.id+"Input",
					'dropdown':attrs.id+"Dropdown",
					'selectedOpts':attrs.id+"SelectedOpts",
					'selectedOpt':attrs.id+"SelectedOpt",
					'remove':attrs.id+"Remove",
					'opt':attrs.id+"Opt"
				};
				
				//put on scope since that's how id's are actually given to the elements (this is the ONLY way I could get this work and to have unique id's inside an ng-repeat..)
				scope.id =attrs.id;
				scope.ids =attrs.ids;
				
				uiMultiselectData.data[attrs.id] ={
					'ids':attrs.ids,
					'opts':{},		//NOTE: options are passed in as [] but converted to object / associative array here
					'blurCoords':{'left':-1, 'right':-1, 'top':-1, 'bottom':-1},
					'skipBlur':false,		//trigger to avoid immediate close for things like clicking the input
					//'ngModel':attrs.ngModel,
					//'scope':scope,
					//'ngModel':ngModel,
					'lastSearchVal':'',		//default to blank
					'attrs':attrs,
					'maxWrite':25		//int of how many to stop writing after (for performance, rest are still searchable)
				};
				
				uiMultiselectData.init({});
				
				
				
				//used to be in controller but timing is off and controller seems to be executed BEFORE this link function so the attrs.id is not updated yet... so had to move everything from the controller into the link function..
				//0. init vars, etc.
				
				scope.config1 ={};		//can't use scope.config in case it's not defined/set otherwise get "Non-assignable model expression.." error..
				var defaultConfig ={
					createNew: 0
				};
				if(!scope.config || scope.config ===undefined) {
					scope.config1 =defaultConfig;
				}
				else {		//extend defaults
					for(xx in defaultConfig) {
						if(scope.config[xx] ===undefined) {
							scope.config1[xx] =defaultConfig[xx];
						}
						else {
							scope.config1[xx] =scope.config[xx];
						}
					}
				}
			
				if(scope.ngModel ===undefined) {
					scope.ngModel =[];
				}
				else if(typeof(scope.ngModel) =='string') {		//convert to array
					scope.ngModel =[scope.ngModel];
				}
				if(scope.options ===undefined) {
					scope.options ={};
				}
				scope.modelInput ='';
				scope.loadingOpt =false;
				scope.createNewAllowed =true;		//will be true if create new is currently allowed (i.e. if no duplicate options that already exist with the current input value)
				
				var keycodes ={
					'enter':13,
					'tab':9
				};
				
				//define timings for $timeout's, which must be precise to work properly (so events fire in the correct order)
				//@todo - fix this so it works 100% of the time - sometimes the options dropdown will close 
				var evtTimings ={
					'selectOptBlurReset':225,		//must be LONGER than onBlurDelay to keep options displayed after select one
					'clickInputBlurReset':225,
					'onBlurDelay':125		//this must be long enough to ensure the selectOpts click function fires BEFORE this (otherwise the options dropdown will close BEFORE the click event fires and the option will NOT be selected at all..
				};
				
				/**
				Form object {} of all options by category; start with just one - the default select opts. This is to allow multiple different types of opts to be used/loaded (i.e. when loading more results from AJAX or when user creates a new option) so can differentiate them and append to/update or show only certain categories of options. All these categories are later merged into one scope.opts array for actual use.
				@property optsList
				@type Object
				*/
				var optsList ={
					'default':libArray.copyArray(scope.selectOpts, {})
				};
				
				/**
				@property scope.opts A list of ALL options (combines all optsList categories into one final array of all options). Also adds a few extra key properties to each option, such as "selected". Each item is an object with the following properties detailed below.
					@param {Mixed} val The value of the option
					@param {String} name The display value (the text to display)
					@param {String} selected "0" if this option is not selected, "1" if this option is currently selected
				@type Array
				*/
				scope.opts =[];
				
				/**
				@property scope.filteredOpts The subset of scope.opts that match the search criteria AND are not already selected. These are formed in the scope.filterOpts function.
				@type Array
				*/
				scope.filteredOpts =[];
				
				/**
				@property scope.selectedOpts The displayed selected options (a subset of 
				@type Array
				*/
				scope.selectedOpts =[];		//start with none selected

				
				
				//need timeout otherwise element isn't defined yet and events won't be registered..
				$timeout(function() {
					//get focus coords for toggling dropdown on blur and then hide dropdown
					// console.log('setting focus, blur, etc. id: '+attrs.id+' uiMultiselectData.data[attrs.id].ids.input: '+uiMultiselectData.data[attrs.id].ids.input);
					uiMultiselectData.getFocusCoords(attrs.id, {});		//BEFORE dropdown is hidden, get coords so can handle blur
					uiMultiselectData.toggleDropdown(attrs.id, {'hide':true});		//start dropdown hidden
					
					//UPDATE2 - keyup wasn't working since TAB doesn't fire keyup reliably..
					//UPDATE: 2013.05.13 - using keyup to handle tab character since TAB will ALWAYS be for a blur so don't need to worry about the timing issues - can just close it immediately
					//trying to get blur to work but timing seems tricky - firing in wrong order (blur is going before click input..) so need timeout to fix the order
					$("#"+uiMultiselectData.data[attrs.id].ids.input).blur(function(evt) {
						$timeout(function() {
							if(!uiMultiselectData.data[attrs.id].skipBlur) {		//only blur if not trying to skip it
								if(attrs.debug) {
									console.log('skipBlur: '+uiMultiselectData.data[attrs.id].skipBlur);
								}
								uiMultiselectData.blurInput(attrs.id, {});
							}
						}, evtTimings.onBlurDelay);
					});
					
					$("#"+uiMultiselectData.data[attrs.id].ids.input).keyup(function(evt) {
						//if(evt.keyCode ==keycodes.tab) {		//if tab character, blur the options
						if(0) {		//UPDATE: 2013.05.13 - TAB character doesn't seem to consistently fire.. but blur does.. so use blur instead..
							if(attrs.debug) {
								console.log('skipBlur: '+uiMultiselectData.data[attrs.id].skipBlur);
							}
							uiMultiselectData.blurInput(attrs.id, {});
						}
						else {		//handle other key inputs (i.e. enter key to select option)
							scope.keydownInput(evt, {});
						}
					});
				}, 50);
				
				
				/*
				//15.5.
				scope.blurInput =function(params) {
					$("#"+uiMultiselectData.data[attrs.id].ids.input).blur();
				};
				
				scope.$on('uiMultiselectBlur', function(evt, params) {
					console.log('uiMultiselectBlur '+attrs.id);
					uiMultiselectData.blurInput(attrs.id, {});
				});
				*/
				
				//15.
				scope.focusInput =function(params) {
					$("#"+uiMultiselectData.data[attrs.id].ids.input).focus();
					scope.clickInput({});
				};
				
				/**
				UPDATE: 2013.05.13 - does NOT work all the time so no longer using it. When had another form on the page this wouldn't fire at all.. ui-keypress may have a bug??!
				Handles hitting tab on input to blur it
				@toc 16.
				@method scope.keyupInput
				@param {Object} params
				*/
				/*
				scope.keyupInput =function(params) {
					console.log('keyupTabInput');
					if(!uiMultiselectData.data[attrs.id].skipBlur) {
						uiMultiselectData.blurInput(attrs.id, {});
					}
				};
				*/
				
				
				//14.
				/*
				@param optsArray =array [] of option values to select (will go through al the options and match the values to them then call the "selectOpt" function for each one that's matched)
				@param params
				*/
				function selectOpts(optsArray, params) {
					for(var ii=0; ii<optsArray.length; ii++) {
						for(var xx in optsList) {		//go through each type and search for match (break once get the first one)
							var index1 =libArray.findArrayIndex(optsList[xx], 'val', optsArray[ii], {});
							if(index1 >-1) {		//found it
								scope.selectOpt(optsList[xx][index1], {});
								break;		//don't bother searching the other option types
							}
						}
					}
				}
				
				/**
				Removes either all or a subset of selected values (and updates display as well to remove options)
				@toc 17.
				@method removeOpts
				@param {Object}
					@param {Array} [valsToRemove] The values of the options to remove (i.e. that match scope.ngModel)
					@param {Boolean} [displayOnly] True to only remove the option from the selected array / DOM (i.e. if coming from an ngModel $watch call and the ngModel has already been updated, in which case ONLY want to update the display values as the model has already been updated)
					// @param {Boolean} [all] True to remove ALL selected values (based on scope.ngModel) and displayed options
				*/
				function removeOpts(params) {
					var defaults ={
						displayOnly: false
					};
					//extend defaults
					var xx;
					for(xx in defaults) {
						if(params[xx] ===undefined) {
							params[xx] =defaults[xx];
						}
					}
					if(params.valsToRemove !==undefined && params.valsToRemove.length >0) {
						var ii;
						for(ii =0; ii<params.valsToRemove.length; ii++) {
							//find full opt object in scope.opts
							var index1 =libArray.findArrayIndex(scope.opts, 'val', params.valsToRemove[ii], {});
							if(index1 >-1) {		//if found, remove it. It's important to pass in the full option from scope.opts
								if(params.displayOnly) {
									removeDisplayOpt(scope.opts[index1], {bulkRemove: true});
								}
								else {
									scope.removeOpt(scope.opts[index1], {bulkRemove: true});
								}
							}
						}
						//re-filter now that all options are updated
						scope.filterOpts({});
					}
				}
				
				//13.
				scope.keydownInput =function(evt, params) {
					if(evt.keyCode ==keycodes.enter) {
						//alert("enter");
						if(scope.filteredOpts.length >0) {		//select first one
							scope.selectOpt(scope.filteredOpts[0], {});
						}
						else if(scope.config1.createNew) {		//create new
							scope.createNewOpt({});
						}
					}
				};
				
				//11.
				scope.filterOpts =function(params) {
					scope.filteredOpts =$filter('filter')(scope.opts, {name:scope.modelInput, selected:"0"});
					if(scope.filteredOpts.length <1) {
						if(scope.config1.createNew && createNewCheck({}) ) {
							scope.createNewAllowed =true;
						}
						else {
							scope.createNewAllowed =false;
						}
					}
				};
				
				//6.
				scope.clickInput =function(params) {
					scope.filterOpts({});
					uiMultiselectData.data[attrs.id].skipBlur =true;		//avoid immediate closing from document click handler
					uiMultiselectData.toggleDropdown(attrs.id, {'show':true});
					//fail safe to clear skip blur trigger (sometimes it doesn't get immediately called..)
					$timeout(function() {
						uiMultiselectData.data[attrs.id].skipBlur =false;		//reset
						if(attrs.debug) {
							console.log('clickInput skipBlur reset, skipBlur: '+uiMultiselectData.data[attrs.id].skipBlur);
						}
					}, evtTimings.clickInputBlurReset);
				};
				
				//7.
				scope.selectOpt =function(opt, params) {
					var valChanged =false;		//track if something actually changed (other than just display)
					//alert(opt.name);
					uiMultiselectData.data[attrs.id].skipBlur =true;		//avoid immediate closing from document click handler
					if(attrs.debug) {
						console.log('selectOpt. skipBlur: '+uiMultiselectData.data[attrs.id].skipBlur);
					}
					$timeout(function() {
						uiMultiselectData.data[attrs.id].skipBlur =false;		//reset
						if(attrs.debug) {
							console.log('selectOpt skipBlur reset, skipBlur: '+uiMultiselectData.data[attrs.id].skipBlur);
						}
					}, evtTimings.selectOptBlurReset);
					var index1;
					index1 =libArray.findArrayIndex(scope.ngModel, '', opt.val, {'oneD':true});
					if(index1 <0) {
						scope.ngModel.push(opt.val);
						valChanged =true;
					}
					//check opt display separately (i.e. if initing values)
					//var index1 =libArray.findArrayIndex(scope.selectedOpts, '', opt.val, {'oneD':true});
					index1 =libArray.findArrayIndex(scope.selectedOpts, 'val', opt.val, {});
					if(index1 <0) {
						opt.selected ="1";
						scope.selectedOpts.push(opt);
					}
					//reset search key & refocus on input
					scope.modelInput ='';		//reset
					$("#"+uiMultiselectData.data[attrs.id].ids.input).focus();
					//uiMultiselectData.toggleDropdown(attrs.id, {'show':true});
					scope.filterOpts({});
					if(valChanged) {
						if(attrs.onChangeEvt !==undefined) {
							scope.$emit(attrs.onChangeEvt, {'val':scope.ngModel});
						}
					}
				};
				
				/**
				@toc 8.
				@param {Object} opt Object with option info. This MUST be a subset (one particular option item) of scope.opts as it's properties will be directly updated and are expected to update the scope.opts array accordingly.
					@param {Mixed} val Value to remove
				@param {Object} params
					@param {Boolean} bulkRemove True if this function is being called in a loop so just want to remove the option and do the bare minimum (i.e. for performance, won't call scope.filterOpts each time - the calling function will be responsible for calling this ONCE at the end of the loop)
				*/
				scope.removeOpt =function(opt, params) {
					var valChanged =false;
					var index1;
					index1 =libArray.findArrayIndex(scope.ngModel, '', opt.val, {'oneD':true});
					if(index1 >-1) {
						valChanged =true;
						scope.ngModel.remove(index1);
						
						removeDisplayOpt(opt, params);
					}
					
					if(valChanged) {
						if(attrs.onChangeEvt !==undefined) {
							scope.$emit(attrs.onChangeEvt, {'val':scope.ngModel});
						}
					}
				};
				
				/**
				This removes a (selected) option from the scope.selectedOpts array (thus updating the DOM). It also re-filters the options by calling scope.filterOpts
				@toc 8.5.
				@method removeDisplayOpt
				@param {Object} opt Object with option info. This MUST be a subset (one particular option item) of scope.opts as it's properties will be directly updated and are expected to update the scope.opts array accordingly.
					@param {Mixed} val Value to remove
				@param {Object} params
					@param {Boolean} bulkRemove True if this function is being called in a loop so just want to remove the option and do the bare minimum (i.e. for performance, won't call scope.filterOpts each time - the calling function will be responsible for calling this ONCE at the end of the loop)
				*/
				function removeDisplayOpt(opt, params) {
					opt.selected ="0";
					//remove from selected opts array
					index1 =libArray.findArrayIndex(scope.selectedOpts, 'val', opt.val, {});
					if(index1 >-1) {
						scope.selectedOpts.remove(index1);
					}
					if(params.bulkRemove ===undefined || !params.bulkRemove) {
						scope.filterOpts({});
					}
				}
				
				//9.
				/*
				@param params
					id (required) =instance id for this directive (to indentify which select to update opts for); must match the "id" attribute declared on this directive
					opts (required) =array []{} of opts to update/add
					type (defaults to 'default') =string of which optsList to add/update these to
					replace (default true) =boolean true if these new opts will overwrite existing ones of this type (if false, they'll just be appended to the existing ones - NOTE: new opts should not conflict with existing ones; don't pass in any duplicates as these are NOT checked for here)
				*/
				scope.$on('uiMultiselectUpdateOpts', function(evt, params) {
					if(params.id ==attrs.id) {		//scope.$on will be called on EVERY instance BUT only want to update ONE of them
						var defaults ={'type':'default', 'replace':true};
						params =angular.extend(defaults, params);
						if(optsList[params.type] ===undefined || params.replace ===true) {
							optsList[params.type] =params.opts;
						}
						else {
							optsList[params.type] =optsList[params.type].concat(params.opts);
						}
						formOpts({});		//re-form opts with the new ones
						selectOpts(scope.ngModel, {});
					}
				});
				
				//10.
				/*
				concats all types in optsList into a final set of options to be selected from / displayed
				@param params
					//unselectAll =boolean true to unselect all opts as well
					keys (optional) =array [] of which optsList keys to copy over; otherwise all will be copied over
				*/
				function formOpts(params) {
					var keys, ii;
					if(params.keys !==undefined) {
						keys =params.keys;
					}
					else {		//copy them all
						keys =[];
						var counter =0;
						for(var xx in optsList) {
							keys[counter] =xx;
							counter++;
						}
					}
					scope.opts =[];		//reset first
					for(ii =0; ii<keys.length; ii++) {
						scope.opts =scope.opts.concat(optsList[keys[ii]]);
					}
					
					//add some keys to each opt
					for(ii =0; ii<scope.opts.length; ii++) {
						var index1 =libArray.findArrayIndex(scope.selectedOpts, 'val', scope.opts[ii].val, {});
						if(index1 <0) {		//if not selected
							scope.opts[ii].selected ="0";		//start visible
						}
					}
				}
				
				//12.
				scope.createNewOpt =function(params) {
					if(createNewCheck({})) {
						if(optsList.created ===undefined) {
							optsList.created =[];
						}
						//var curIndex =optsList.created.length;
						var newOpt ={'val':scope.modelInput, 'name':scope.modelInput, 'selected':'0'};
						optsList.created[optsList.created.length] =newOpt;
						formOpts({});		//re-form opts with the new ones
						//select this opt
						scope.selectOpt(newOpt, {});
					}
				};
				
				//12.5.
				function createNewCheck(params) {
					var valid =false;
					var val =scope.modelInput;
					if(val.length >=attrs.minLengthCreate) {
						//make sure this value doesn't already exist
						var index1 =libArray.findArrayIndex(scope.opts, 'val', val, {});
						if(index1 <0) {		//if doesn't already exist
							valid =true;
						}
					}
					return valid;
				}
				
				//0.5.
				//copy default (passed in) opts to final / combined (searchable) opts
				formOpts({});
				//select default opts
				selectOpts(scope.ngModel, {});
				
				//0.75.
				scope.$watch('ngModel', function(newVal, oldVal) {
					//if(newVal !=oldVal) {
					//if(1) {		//comparing equality on arrays doesn't work well..
					if(!angular.equals(oldVal, newVal)) {		//very important to do this for performance reasons since $watch runs all the time
						removeOpts({valsToRemove: oldVal, displayOnly:true});		//remove old values first
						selectOpts(scope.ngModel, {});
					}
				});
				
				//0.8.
				scope.$watch('selectOpts', function(newVal, oldVal) {
					if(!angular.equals(oldVal, newVal)) {		//very important to do this for performance reasons since $watch runs all the time
						optsList['default'] =newVal;
						formOpts({});		//re-form opts with the new ones
						selectOpts(scope.ngModel, {});
					}
				});
			};
		}
		
		/*
		controller: function($scope, $element, $attrs, $transclude) {
			
		}
		*/
	};
}])
.factory('uiMultiselectData', ['uiLibArray', '$rootScope', function(libArray, $rootScope) {
var inst ={
	data: {}, //data object for each select is created in compile function above - one per instance id
	
	timeout:{
		'searchOpts': {
			'trig':false,
			'delay':250
		}
	},
	
	inited:false,
	
	//1.
	init: function(params) {
		if(!this.inited) {
			var thisObj =this;
			$(document).click(function(evt) {
				for(var xx in thisObj.data) {
					var instId =xx;
					if(thisObj.data[instId].blurCoords.top >-1) {		//if it's been initialized
						if(!thisObj.mouseInDiv(evt, '', {'coords':thisObj.data[instId].blurCoords})) {
							//alert("document click out: "+ee.pageX+" "+ee.pageY);
							thisObj.blurInput(instId, {});
						}
					}
				}
			});
			
			this.inited =true;
		}
	},
	
	//2.
	/*
	@param params
		hide =boolean true to hide it
		show =boolean true to show it
	*/
	toggleDropdown: function(instId, params) {
		var id1 =this.data[instId].ids.dropdown;
		var ele =document.getElementById(id1);
		if(params.hide ===true) {
			angular.element(ele).addClass('hidden');
			// $("#"+id1).addClass('hidden');
		}
		else {
			angular.element(ele).removeClass('hidden');
			// $("#"+id1).removeClass('hidden');
		}
	},
	
	//3.
	getFocusCoords: function(instId, params) {
		var ids ={'displayBox':this.data[instId].ids.displayBox, 'dropdown':this.data[instId].ids.dropdown};
		var eles ={};
		eles.displayBox =$("#"+this.data[instId].ids.displayBox);
		eles.dropdown =$("#"+this.data[instId].ids.dropdown);
		
		this.toggleDropdown(instId, {'show':true});		//required otherwise sometimes it won't be correct..

		var top1 =0, left1 =0, right1 =0, bottom1 =0;
		if(!eles.displayBox.offset() || !eles.dropdown.offset()) {
			console.log('getFocusCoords offset() null..');		//is null in Testacular...
		}
		else {
			top1 =eles.displayBox.offset().top;
			left1 =eles.displayBox.offset().left;
			//bottom1 =0;
			bottom1 =eles.dropdown.offset().top +eles.dropdown.outerHeight();
			right1 =left1 +eles.displayBox.outerWidth();
		}
		
		this.data[instId].blurCoords ={'left':left1, 'right':right1, 'top':top1, 'bottom':bottom1};
		//console.log("blur coords: left: "+this.data[instId].blurCoords.left+" right: "+this.data[instId].blurCoords.right+" top: "+this.data[instId].blurCoords.top+" bottom: "+this.data[instId].blurCoords.bottom);

		this.toggleDropdown(instId, {'hide':true});		//revert
	},
	
	//4.
	blurInput: function(instId, params) {
		if(!this.data[instId].skipBlur) {
			//console.debug('blurring '+instId);
			this.toggleDropdown(instId, {'hide':true});
			if(this.data[instId].attrs.debug) {
				console.log('blurInput reset, skipBlur: '+this.data[instId].skipBlur);
			}
		}
		// this.data[instId].skipBlur =false;		//reset
		// if(this.data[instId].attrs.debug) {
			// console.log('blurInput reset, skipBlur: '+this.data[instId].skipBlur);
		// }
	},
	
	//5.
	/*
	//Figure out if the mouse is within the area of the input and/or dropdown at the time of this event (usually a click/touch)
	@param ee =dom event
	@param instId
	@param params
		coords =1D array of 'left', 'top', 'right', 'bottom' (all integers of pixel positions)
	@return boolean true if mouse is in div/coords
	*/
	mouseInDiv: function(ee, instId, params) {
		var coords;
		if(params.coords)
			coords =params.coords;
		else
		{
			var left1 =$("#"+instId).offset().left;
			var top1 =$("#"+instId).offset().top;
			var bottom1 =top1+$("#"+instId).height();
			var right1 =left1+$("#"+instId).width();
			coords ={'left':left1, 'top':top1, 'bottom':bottom1, 'right':right1};
		}
		//if(1)		//doesn't work - ee doesn't have a pageX & pageY from blur
		if(ee.pageX >=coords.left && ee.pageX <=coords.right && ee.pageY >=coords.top && ee.pageY <=coords.bottom)
		{
			return true;
		}
		else
		{
			//alert(inputId+" COORDS: "+coords['left']+" "+ee.pageX+" "+coords['right']+" "+coords['top']+" "+ee.pageY+" "+coords['bottom']);
			return false;
		}
	}
};
return inst;
}])
.factory('uiLibArray', [function() {
var inst ={

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
}])
;
/**
 * Add a clear button to form inputs to reset their value
 */
angular.module('ui.directives').directive('uiReset', ['ui.config', function (uiConfig) {
  var resetValue = null;
  if (uiConfig.reset !== undefined)
      resetValue = uiConfig.reset;
  return {
    require: 'ngModel',
    link: function (scope, elm, attrs, ctrl) {
      var aElement;
      aElement = angular.element('<a class="ui-reset" />');
      elm.wrap('<span class="ui-resetwrap" />').after(aElement);
      aElement.bind('click', function (e) {
        e.preventDefault();
        scope.$apply(function () {
          if (attrs.uiReset)
            ctrl.$setViewValue(scope.$eval(attrs.uiReset));
          else
            ctrl.$setViewValue(resetValue);
          ctrl.$render();
        });
      });
    }
  };
}]);

/**
 * Set a $uiRoute boolean to see if the current route matches
 */
angular.module('ui.directives').directive('uiRoute', ['$location', '$parse', function ($location, $parse) {
  return {
    restrict: 'AC',
    compile: function(tElement, tAttrs) {
      var useProperty;
      if (tAttrs.uiRoute) {
        useProperty = 'uiRoute';
      } else if (tAttrs.ngHref) {
        useProperty = 'ngHref';
      } else if (tAttrs.href) {
        useProperty = 'href';
      } else {
        throw new Error('uiRoute missing a route or href property on ' + tElement[0]);
      }
      return function ($scope, elm, attrs) {
        var modelSetter = $parse(attrs.ngModel || attrs.routeModel || '$uiRoute').assign;
        var watcher = angular.noop;

        // Used by href and ngHref
        function staticWatcher(newVal) {
          if ((hash = newVal.indexOf('#')) > -1)
            newVal = newVal.substr(hash + 1);
          watcher = function watchHref() {
            modelSetter($scope, ($location.path().indexOf(newVal) > -1));
          };
          watcher();
        }
        // Used by uiRoute
        function regexWatcher(newVal) {
          if ((hash = newVal.indexOf('#')) > -1)
            newVal = newVal.substr(hash + 1);
          watcher = function watchRegex() {
            var regexp = new RegExp('^' + newVal + '$', ['i']);
            modelSetter($scope, regexp.test($location.path()));
          };
          watcher();
        }

        switch (useProperty) {
          case 'uiRoute':
            // if uiRoute={{}} this will be undefined, otherwise it will have a value and $observe() never gets triggered
            if (attrs.uiRoute)
              regexWatcher(attrs.uiRoute);
            else
              attrs.$observe('uiRoute', regexWatcher);
            break;
          case 'ngHref':
            // Setup watcher() every time ngHref changes
            if (attrs.ngHref)
              staticWatcher(attrs.ngHref);
            else
              attrs.$observe('ngHref', staticWatcher);
            break;
          case 'href':
            // Setup watcher()
            staticWatcher(attrs.href);
        }

        $scope.$on('$routeChangeSuccess', function(){
          watcher();
        });
      };
    }
  };
}]);

/*global angular, $, document*/
/**
 * Adds a 'ui-scrollfix' class to the element when the page scrolls past it's position.
 * @param [offset] {int} optional Y-offset to override the detected offset.
 *   Takes 300 (absolute) or -300 or +300 (relative to detected)
 */
angular.module('ui.directives').directive('uiScrollfix', ['$window', function ($window) {
  'use strict';
  return {
    link: function (scope, elm, attrs) {
      var top = elm.offset().top;
      if (!attrs.uiScrollfix) {
        attrs.uiScrollfix = top;
      } else {
        // chartAt is generally faster than indexOf: http://jsperf.com/indexof-vs-chartat
        if (attrs.uiScrollfix.charAt(0) === '-') {
          attrs.uiScrollfix = top - attrs.uiScrollfix.substr(1);
        } else if (attrs.uiScrollfix.charAt(0) === '+') {
          attrs.uiScrollfix = top + parseFloat(attrs.uiScrollfix.substr(1));
        }
      }
      angular.element($window).on('scroll.ui-scrollfix', function () {
        // if pageYOffset is defined use it, otherwise use other crap for IE
        var offset;
        if (angular.isDefined($window.pageYOffset)) {
          offset = $window.pageYOffset;
        } else {
          var iebody = (document.compatMode && document.compatMode !== "BackCompat") ? document.documentElement : document.body;
          offset = iebody.scrollTop;
        }
        if (!elm.hasClass('ui-scrollfix') && offset > attrs.uiScrollfix) {
          elm.addClass('ui-scrollfix');
        } else if (elm.hasClass('ui-scrollfix') && offset < attrs.uiScrollfix) {
          elm.removeClass('ui-scrollfix');
        }
      });
    }
  };
}]);

/**
 * Enhanced Select2 Dropmenus
 *
 * @AJAX Mode - When in this mode, your value will be an object (or array of objects) of the data used by Select2
 *     This change is so that you do not have to do an additional query yourself on top of Select2's own query
 * @params [options] {object} The configuration options passed to $.fn.select2(). Refer to the documentation
 */
angular.module('ui.directives').directive('uiSelect2', ['ui.config', '$timeout', function (uiConfig, $timeout) {
  var options = {};
  if (uiConfig.select2) {
    angular.extend(options, uiConfig.select2);
  }
  return {
    require: '?ngModel',
    compile: function (tElm, tAttrs) {
      var watch,
        repeatOption,
        repeatAttr,
        isSelect = tElm.is('select'),
        isMultiple = (tAttrs.multiple !== undefined);

      // Enable watching of the options dataset if in use
      if (tElm.is('select')) {
        repeatOption = tElm.find('option[ng-repeat], option[data-ng-repeat]');

        if (repeatOption.length) {
          repeatAttr = repeatOption.attr('ng-repeat') || repeatOption.attr('data-ng-repeat');
          watch = jQuery.trim(repeatAttr.split('|')[0]).split(' ').pop();
        }
      }

      return function (scope, elm, attrs, controller) {
        // instance-specific options
        var opts = angular.extend({}, options, scope.$eval(attrs.uiSelect2));

        if (isSelect) {
          // Use <select multiple> instead
          delete opts.multiple;
          delete opts.initSelection;
        } else if (isMultiple) {
          opts.multiple = true;
        }

        if (controller) {
          // Watch the model for programmatic changes
          controller.$render = function () {
            if (isSelect) {
              elm.select2('val', controller.$viewValue);
            } else {
              if (isMultiple) {
                if (!controller.$viewValue) {
                  elm.select2('data', []);
                } else if (angular.isArray(controller.$viewValue)) {
                  elm.select2('data', controller.$viewValue);
                } else {
                  elm.select2('val', controller.$viewValue);
                }
              } else {
                if (angular.isObject(controller.$viewValue)) {
                  elm.select2('data', controller.$viewValue);
                } else if (!controller.$viewValue) {
                  elm.select2('data', null);
                } else {
                  elm.select2('val', controller.$viewValue);
                }
              }
            }
          };

          // Watch the options dataset for changes
          if (watch) {
            scope.$watch(watch, function (newVal, oldVal, scope) {
              if (!newVal) return;
              // Delayed so that the options have time to be rendered
              $timeout(function () {
                elm.select2('val', controller.$viewValue);
                // Refresh angular to remove the superfluous option
                elm.trigger('change');
              });
            });
          }

          if (!isSelect) {
            // Set the view and model value and update the angular template manually for the ajax/multiple select2.
            elm.bind("change", function () {
              scope.$apply(function () {
                controller.$setViewValue(elm.select2('data'));
              });
            });

            if (opts.initSelection) {
              var initSelection = opts.initSelection;
              opts.initSelection = function (element, callback) {
                initSelection(element, function (value) {
                  controller.$setViewValue(value);
                  callback(value);
                });
              };
            }
          }
        }

        attrs.$observe('disabled', function (value) {
          elm.select2(value && 'disable' || 'enable');
        });

        if (attrs.ngMultiple) {
          scope.$watch(attrs.ngMultiple, function(newVal) {
            elm.select2(opts);
          });
        }

        // Set initial value since Angular doesn't
        //elm.val(scope.$eval(attrs.ngModel));

        // Initialize the plugin late so that the injected DOM does not disrupt the template compiler
        $timeout(function () {
          elm.select2(opts);

          // Set initial value - I'm not sure about this but it seems to need to be there
          elm.val(controller.$viewValue);
          // important!
          controller.$render();

          // Not sure if I should just check for !isSelect OR if I should check for 'tags' key
          if (!opts.initSelection && !isSelect)
            controller.$setViewValue(elm.select2('data'));
        });
      };
    }
  };
}]);

/**
 * uiShow Directive
 *
 * Adds a 'ui-show' class to the element instead of display:block
 * Created to allow tighter control  of CSS without bulkier directives
 *
 * @param expression {boolean} evaluated expression to determine if the class should be added
 */
angular.module('ui.directives').directive('uiShow', [function () {
  return function (scope, elm, attrs) {
    scope.$watch(attrs.uiShow, function (newVal, oldVal) {
      if (newVal) {
        elm.addClass('ui-show');
      } else {
        elm.removeClass('ui-show');
      }
    });
  };
}])

/**
 * uiHide Directive
 *
 * Adds a 'ui-hide' class to the element instead of display:block
 * Created to allow tighter control  of CSS without bulkier directives
 *
 * @param expression {boolean} evaluated expression to determine if the class should be added
 */
  .directive('uiHide', [function () {
  return function (scope, elm, attrs) {
    scope.$watch(attrs.uiHide, function (newVal, oldVal) {
      if (newVal) {
        elm.addClass('ui-hide');
      } else {
        elm.removeClass('ui-hide');
      }
    });
  };
}])

/**
 * uiToggle Directive
 *
 * Adds a class 'ui-show' if true, and a 'ui-hide' if false to the element instead of display:block/display:none
 * Created to allow tighter control  of CSS without bulkier directives. This also allows you to override the
 * default visibility of the element using either class.
 *
 * @param expression {boolean} evaluated expression to determine if the class should be added
 */
  .directive('uiToggle', [function () {
  return function (scope, elm, attrs) {
    scope.$watch(attrs.uiToggle, function (newVal, oldVal) {
      if (newVal) {
        elm.removeClass('ui-hide').addClass('ui-show');
      } else {
        elm.removeClass('ui-show').addClass('ui-hide');
      }
    });
  };
}]);

/*
Slider directive

Creates a slider on the page.
Example Calls:
	HTML:
			<ui-slider slider-id = 'my-slider' slider-handle-variable = 'my_var'> </ui-slider>
			<ui-slider slider-id = 'my-slider' slider-handle-variable = 'my_var' slider-opts = 'opts'> </ui-slider>

	JAVASCRIPT:
		This is an example of a full slider-opts object, with every field defined and set to its default value. You can and should remove unneeded keys.
		This object would be defined in the controller of the html creating the slider.
		I recommend copying and pasting this object into your controller. Then you can change its name, adjust values, and delete keys you don't need.
	
	$scope.opts = 
	{
		'num_handles': 1,
		'slider_min': 0,
		'slider_max': 100,
		'precision': 0,
		'scale_string': '[1, 1]',
		'zero_method': 'newton',
		'increment': 0,
		'user_values': '',
		'evt_mouseup': '',
		'slider_moveable': true,
		'use_array': true,
		'rotate': 0,
		'bar_container_class': 'ui-slider-bar',
		'left_bg_class': 'ui-slider-bar-active',
		'interior_bg_class': 'ui-slider-bar-active',
		'right_bg_class': 'ui-slider-bar-inactive',
		'handle_class': 'ui-slider-bar-handle',
		'handle_html': '<div class = "ui-slider-bar-handle-inner"></div>',
		'units_pre': '',
		'units_post': '',
		'use_ticks': false,
		'ticks_values': [slider_min, slider_max],
		'ticks_class': 'ui-slider-ticks',
		'ticks_values_container_class': 'ui-slider-ticks-values-container',
		'ticks_value_class': 'ui-slider-ticks-value',
	};


****************************************************************************
READING VALUES
Option 1: Variable
Use the variable you specified for slider-handle-variable

Option 2: Event
To read a value from the slider with an event, you must know the slider_id. This is necessary since there may be multiple sliders in the same parent element.
To read a value from a single handle, you must know the handle's index. If you do not give an index, you will receive the first (leftmost) handle's value.
Handles are zero-indexed, and arranged in increasing order from left to right.

The following sample code would get the value of the 3rd handle from the left (index 2).

var evtReadSliderValue = 'evtSliderGetValue' + slider_id;
$scope.$broadcast(evtReadSliderValue, {'handle' : 2});					//tell directive to report the third handle's value

var evtReceiveSliderValue = 'evtSliderReturnValue' + slider_id;
$scope.$on(evtReceiveSliderValue, function(evt, params) {				//Listen for the directive's response
	var handle_value = params.value;															//The directive will return {'value' : val}
 });

To read all handle values, you need only the slider_id. The directive will return a scalar array of the handle values.
The array will be arranged in order of the handles, which should be in ascending order for the values.
This method always returns an array, even if there's only one handle, and even if you have set opts.use_array = 'false'

Sample code:
var evtReadAllSliderValues = 'evtSliderGetAllValues' + slider_id;
$scope.$broadcast(evtReadAllSliderValues, {});											//tell directive to report all values

var evtReceiveAllSliderValues = 'evtSliderReturnAllValues' + slider_id;
$scope.$on(evtReceiveAllSliderValues, function(evt, params) {				//Listen for the directive's response
	var values_array = params.values;																	//The directive will return {'values' : [num1, num2, num3... ]}
});

Option 3: Mouseup event
You can specify an opts.evt_mouseup name. If defined, an event with this name will fire whenever a handle finishes moving.
The event will come with a params object containing the value of the most recently moved handle, among other things.
See evt_mouseup in the documentation below for more details.


****************************************************************************
SETTING VALUES FROM JAVASCRIPT
To set a value on the slider, you must know the slider_id, just as with reading values.

Be careful when setting values; do not count on the directive for error checking.
Handles should stay in order; do not place the 4th handle to the left of the 3rd, for example.
Handles should be set to a valid slider value. Do not set a handle to a value outside the slider's range.
For increment sliders, be wary of placing a handle at a position that is not a valid increment.
Failing to abide by these rules will probably not cause any fatal errors, but could easily result in display problems.

The directive will auto-correct the handle if the user tries to place it outside its order or outside the slider.
The directive will not prevent you from manually setting a handle not on a valid increment, but doing so may or may not cause minor issues.

Option 1 (Recommended): Use the event.
Sample Code: Sets the leftmost handle to the value 29.3
var evtSetSliderValue = 'evtSliderSetValue' + slider_id;
$scope.$broadcast(evtSetSliderValue, {'handle' : 0, 'value' :29.3});

Option 2 (Not Recommended): Use the handle-variable you gave when defining the slider and re-init.
Ordinarily, the handle-variable should be treated as read-only. However, if you manually adjust the variable's values and then
	immediately initialize the slider, the handles should adjust accordingly. In general this method will be very inefficient; use only
	if you intend to re-initialize the slider anyway, and want to change the handles while you're at it.
	
Option 3: Prefill your variable
If your handle-variable already contains values when the slider is first built, those values will be used to position the handles.

****************************************************************************
RE-INITIALIZE THE SLIDER
To reset and reconstruct the slider, you must know the slider_id. Broadcast the event as in the sample code.
	You should re-initialize the slider after adjusting any of the slider-opts in your controller. Otherwise, your changes
	will not take effect. Re-initializing can also solve angular timing issues, if the directive was called before values were correctly
	interpolated.
	Be aware that handles will be reset upon initialization to match the values in your specified handle-variable.
	If you wish to change a slider-option back to its default, you must either manually set it to its default value or delete the key from
	the options array.
	Note: The slider will re-initialize itself if it detects a change to its ID.

Sample Code:
	var evtInitSlider = 'evtInitSlider' + slider_id;
	$scope.$broadcast(evtInitSlider, {});

When the slider is finished initializing, it will emit an event that you can listen for as follows:

	var evtSliderInitialized = 'evtSliderInitialized' + slider_id;
	$scope.$on(evtSliderInitialized, function(evt, params)
	{
		//params
			//values			//Array of the slider's values
			//id					//String. This slider's id
	});



****************************************************************************
 A slider is composed of several elements, with the following structure. This particular example has two handles (a range slider):
	<div>							the container div. Holds the whole slider.
		<div>							the slider-bar div. Holds the actual slider itself.
			<div>						The slider itself. Will be as wide as the slider-bar div.
				<div></div>				the background-left div. The area to the left of the slider's leftmost handle.
				<div></div>				A handle div. This is the leftmost handle.
				<div></div>				Another handle.
				<div></div>				the background-interior div. The area between slider handles.
				<div></div>				the background-right div. The area to the right of the slider's rightmost handle.
				<div>
					<div></div>				A tick on the slider
					<div></div>				Another tick
				</div>
			<div>
		</div>
		<div>							Tick Values container
			<div></div>					A tick value
			<div></div>					A tick value
		</div>
	</div>


The slider may be defined using the following attributes:

REQUIRED attributes:
slider-id: A string. Use it to distinguish this slider from others when reading or writing handle values.
	Note: This will be the id of the slider's container div.
	Will also be used to create ids for the slider's handles so that jQuery events can be bound to them.
	Ex: slider-id = 'slider1'
	
slider-handle-variable: A name of a variable in the parent scope. This variable will be filled with a scalar array of the values of the handles on the slider.
	Handles are zero-indexed and increase from left to right. Even if there is only one handle, this will still be an ARRAY by default (see the use_array attribute).
	The binding is bi-directional, i.e. changing the variable in the parent will alter a corresponding array in the slider's scope. However, I strongly recommend
	that users treat the parent's variable as read-only, since changing it yourself will almost certainly not have the effect you intended in the slider, and could
	potentially cause errors (unless you re-initialize the slider immediately). If you wish to change a slider value, use the method outlined under SETTING VALUES above instead.
	Problems could result if this attribute is not specified for two or more sliders with the same immediate parent scope. Thus, this attribute is required.
		The variable may be pre-filled with an array of default values, which will then be used to start the handles at the given positions. Be sure the values are valid.
		Due to timing issues, however, I'm not necessarily convinced that this will always work as intended.
		It certainly WON'T work if the variable is filled via a timeout or some other delay. It needs to be pre-filled before the directive linking function is called.
		Upon initializing the slider, the handles will be set to the values stored in this variable. Beware of this when re-initializing the slider yourself.
	Ex: slider-handle-variable = 'my_var'. Then, in the parent controller, you will have access to the first handle's value as $scope.my_var[0]. Default: 'handle_values'.

OPTIONAL attributes:
	These should be keys in an object set to the 'slider-opts' attribute.
	It is highly recommended that you define this object in your javascript controller, rather than directly in the html.
	Defining it in html still works, but you may run into trouble with special character exception errors when using certain attributes (like handle_html).
	Furthermore, defining it in html causes angular to fire thousands of digests whenever the user interacts with the slider.
	This doesn't cause errors, but it's not good for performance. It also overflows the console's error log, which is annoying.

num_handles: Number of handles for the slider to have. A positive integer. May be input as number or string.
	Ex: num_handles : '2'. Default: '1'
	
slider_min: Minimum value for the slider. A number. May be input as number or string.
	Ex: slider_min : '25.5'. Default: '0'
	
slider_max: Maximum value for the slider. A number. May be input as number or string.
	Ex: slider_max: '74'. Default: '100'

precision: Integer. Tells the slider how far past the decimal point to go when displaying/reporting values. Affects internal accuracy. Negative values allowed.
	May be input as number or string.
	A precision of 2 would cause 1.236 to be stored and reported as 1.24. A precision of -2 would cause 1234 to be stored and reported as 1200.
	Ex: precision: '2'. Default: '0'
	Protip: You can use this attribute to create continuous-motion sliders with power-of-ten increments.

scale_string: A ~ delimited STRING of arrays specifying the function to use to map the position on the slider to a value on the slider.
Use this attribute to define non-linear continuous sliders. Meaningless for increment sliders.
The function should be a non-decreasing mathematical function passing through (0, 0) and (1, 1), where the first coordinate represents
the slider's left% as a decimal (a number between 0 and 1, with 0 being the left edge of the slider, 1 being the right edge of the slider)
and the second represents the slider's values, linearly mapped to the interval [0, 1], with 0 = slider_min, 1 = slider_max.
Input format: "[coefficient, exponent]~[coefficient, exponent]~..."
Example: [1, .5] defines the function f(x) = 1 * x^(.5), which in turn means the slider progresses through values more quickly on the left than on the right,
	with the halfway point at 25% of the slider's length. The default is a linear slider: f(x) = x
	Limitations: Can only use polynomial functions. Non-integer exponents are allowed. Negative exponents are not allowed (would cause division-by-zero error).
	Again, be sure that your function goes through (0, 0) and (1, 1), and is never decreasing on [0, 1], or your slider will not make sense!
	Note - a strictly non-increasing function on [0, 1] passing through (0, 1) and (1, 0) would also be valid*.
		*Protip: Use such a function to place the maximum on the left and the minimum on the right.
		Mathematician's Protip: If you must use a non-polynomial function, use that function's Taylor series. If you don't understand Taylor series, hire a math major.
	Ex: scale_string: '[1, 2]'. Default: '[1, 1]'
	
zero_method: String, either "newton" or "bisection". Defines what method to use when converting a slider value to a left% on the slider using the given scale polynomial.
	The default behavior is "newton": Newton's method is used to find a zero. If it fails, the bisection method is then used.
	Newton's method is generally significantly faster, but may fail for certain polynomials. The bisection method is slower, but guaranteed to succeed if your slider's
	polynomial satisfies the criteria above, namely: non-decreasing continuous and passing through (0, 0) and (1, 1), or non-increasing continuous and passing through
	(0, 1) and (1, 0).
	If Newton's method is consistently failing for your function (an error message will be displayed in the console each time it fails), you can set this attribute
	to "bisection" to skip Newton's method and go straight to bisection, for a performance boost.
	Ex: zero_method: 'bisection'. Default: 'newton'
	
increment: A positive number. May be input as number or string.
	If this attribute is set, the handles on the slider will snap to increments of this number,
	disallowing intermediate values.
	The increments are determined starting from the leftmost point of the slider (slider_min).
	The maximum point of the slider need not be one of these increments.
	If this attribute is set, the scale_string attribute is meaningless.
	If this attribute is not set, the slider will be continous.
	Make sure you have the resolution to correctly display all your increments! You can't fit 1000 points on a slider that's only 100 pixels wide.
	Ex: slider-increment = '2'. Default: '0' (continuous)

user_values: A scalar array [] of values for the slider. If this attribute is specified, the slider automatically becomes an increment slider,
	with the values in the array evenly spread out along it, in their given order.
	Note: The increment, slider_min, slider_max, scale_string, and precision attributes are meaningless if this attribute is set.
	There are several ways to define the entries of this array:
		1) Make the entries the values. Ex: user_values: [25, 83, 'Stephen Colbert', 'Johnny']
		2) Make the entry an object with a 'val' property. Ex: user_values: [{'val': 25}, {'val': 83}, {'val': 'Stephen Colbert'}, {'val': 'Johnny'}]
		3) Make the entry an object with 'val' and 'name' properties. Ex: user_values: [{'val': 25, 'name': "Twenty-five"}, {'val': 1230, 'name':"12:30PM"}]
	The 'val' property is what will be returned to the user whenever they look up a value. The 'name' property is what the slider will write to the page when
	displaying a value on its own.
	Regardless of the input format, all entries will be internally converted to the third format. If 'name' is undefined, 'val' is used as the 'name'.
	Each entry is independent. You may use any of the three formats for an entry, regardless of the format used for neighboring entries.
	Ex: user_values: '[25, {'val': 1230, 'name':"12:30PM"}, "Stephen Colbert", {'val': "Johnny"}]. This would create a slider with 4 increments. Default: ''

evt_mouseup: Name of an event to fire when a handle is released, so you can listen for it with $scope.$on elsewhere.
	Also fires after the user clicks the slider to move a handle.
	Ex: evt_mouseup: 'evtHandleStop'. Default: '' (no event fires)
	When fired, the event will come with a params object holding the following information:
		params
			num_handles				//Integer. Number of handles on this slider
			id								//String. ID of the slider
			handle						//Index of the most recently moved handle.
			value							//New value of the handle

slider_moveable: Boolean. True iff there is a chance that the slider may move about the page. May be input as boolean or string.
This is very important because moving the handles depends on the position of the mouse. When the slider is first touched, jquery is used to determine
the slider's width and horizontal offsets, so that the mouse's coordinates can be translated to a position on the slider.
If at any time after the initial definition of these offsets, the slider's position or width on the page changes, then the offsets need to be reset.
So, if this value is set to true, the slider will recalculate the offsets every time the user interacts with the slider.
Set this value to false (for a small efficiency boost) only if you are sure that the slider (and its containing div) will not move around.
Note: Re-initializing the slider will cause the offsets to be recalculated regardless. You may be able to use this to your advantage.
	Ex: slider_moveable: 'false'.	Default: 'true'

use_array: Boolean. False iff the slider should treat single-handle sliders as a special case, returning the value rather than a single-element array of values.
	Do NOT set this attribute to 'false' if the slider has more than one handle!! This would make no sense and could also cause errors.
	May be input as boolean or string.
	Ex: use_array: 'false'. Default: 'true'

rotate: Number between -180 and 180. Defines how the slider should be rotated. May be input as number or string.
	0 degrees is the default, unrotated. Angles increase counterclockwise: 90 degrees would make the sldier vertical, with what was the left edge at the top.
	The entire slider gets rotated, including any text.
	Ex: rotate: 45. Default: 0
	
bar_container_class: Class for the slider bar container. The (inner) width of this element will determine the width of the slider.
	Note: If you set this attribute, the container will have 0 height unless you give it a height.
	Ex: bar_container_class : 'my-slider-bar'. Default: 'ui-slider-bar'
	
left_bg_class: Class for the slider area to the left of the leftmost handle. Use to style said area.
	Ex: left_bg_class : 'my-slider-left-area'. Default: 'ui-slider-bar-active'

interior_bg_class: Class for the slider area between handles. Use to style said area (does not exist if only one handle)
	Ex: interior_bg_class: 'my-slider-interior-area'. Default: 'ui-slider-bar-active'
	Protip: Use nth-of-type selectors to target individual interior areas if there are 3 or more handles.

right_bg_class: Class for the slider area to the right of the rightmost handle. Use to style said area.
	Ex: right_bg_class: 'my-slider-right-area'. Default: 'ui-slider-bar-inactive'

handle_class: class for the handles. Use to style them.
	Ex: handle_class: 'my-slider-handles'. Default: 'ui-slider-bar-handle'
	Protip: Use nth-of-type selectors to target individual handles.
	Note: If you're going to use your own handle styles, I strongly recommend giving the handles "margin-left: -Xpx;",
		where X is half the handle's width. This will align the middle of the handle with the value it represents.

handle_html: A string of html. Use this attribute to put something inside a handle.
 By default, the same html will be placed in each handle. However, you may specify different html for each handle by using a ~ delimited string.
 Limitations: Can only use plain html - no angular directives or scope variables allowed, unless they are evaluated before being sent to this directive.
	Exception: A handle's value can be displayed using '$$value'
	Ex: handle_html: '<div class = "my-handle-interior"> </div>'						//This html is applied to every single handle
	Ex: handle_html: '<div> 1 </div>~<div> 2 </div>'												//First handle has a 1 in it, second has a 2. Any additional handles have no inner html.
	Ex: handle_html: '<div> $$value </div>'																	//Each handle will have its value displayed inside itself.
	Default: '<div class = "ui-slider-bar-handle-inner"></div>'
	
units_pre: String, placed before values that the slider writes to the page.
Does not affect values returned to the user.
	Ex: units_pre: '$'. Default: ''

units_post: String, placed immediately after values that the slider writes to the page.
Does not affect values returned to the user.
	Ex: units_post: ' meters/second'. Default: ''
		
use_ticks: Boolean. True iff ticks should be shown. May be input as boolean or string.
	Ex: use_ticks: 'true'. Default: 'false'

ticks_values: Array of slider values at which to display ticks, and what to display at that tick. Meaningless if use_ticks is false.
	There are several ways to define the entries of this array, precisely as with user_values:
		1) Make the entries the values. Ex: ticks_values: [25, 83, 47, 100]
		2) Make the entry an object with a 'val' property. Ex: ticks_values: [{'val': 25}, {'val': 83}, {'val': 47}, {'val': 100}]
		3) Make the entry an object with 'val' and 'name' properties. Ex: ticks_values: [{'val': 25, 'name': "Twenty-five"}, {'val': 83, 'name':"83 m/s"}]
	In the first and second case, the value displayed below the tick will be the value itself prefixed by units_pre and suffixed by units_post.
	In the third case, the value displayed below the tick will be exactly the 'name'.
	The user is responsible	for ensuring that each 'value' exists on the slider,
	particularly in the case of increment sliders and sliders with user-defined values.
	By default, the slider's minimum value and maximum value will be the only ticks shown.
	Note: It is recommended (but not necessary) that the values in this array be sorted from least (leftmost) to greatest (rightmost).
	This will keep the html in a logical order, so that nth-child selectors on the ticks' classes will make more sense.
	Ex: ticks_values:[0, 25, 50, 75, 100]. Default: [slider_min, slider_max]

ticks_class: String. Class name for the ticks divs. Use to style them.
	A tick is just a div. Its left edge is at the position of the specified value, inside the slider.
	Protip: Use nth-of-type selectors to target individual ticks.
	Ex: ticks_class: 'my-slider-ticks'. Default: 'ui-slider-ticks'

ticks_values_container_class: String. Class name for the div containing the tick values. This div has position:relative and is placed immediately
	after the slider in the html, meaning it is on top of the slider itself.
	Ex: ticks_values_container_class: 'my-slider-ticks-container'. Default: 'ui-slider-ticks-values-container'
	
ticks_value_class: String. Class name for the tick values divs. Use to style them.
	These divs are absolutely positioned with their left edge aligned with the tick.
	The default class gives them large widths, transparent backgrounds, top, negative margin-left (half the width), and text-align:center in order
	to ensure that the value is centered below the tick. Therefore, if you use your own class,
	be aware that you will have to re-position the values yourself.
	Protip: Use nth-of-type selectors to target individual ticks.
	Protip: Use negative 'top' css to place the tick values above the slider.
	Ex: ticks_min_class: 'my-slider-ticks-value'. Default: 'ui-slider-ticks-value'
*/

angular.module('ui.directives').directive('uiSlider', ['uiPolynomial', 'uiSliderService', function(uiPolynomial, uiSliderService)
{
	var template_html = '';

	template_html += "<div id = '{{slider_id}}' ng-mousemove = 'mousemoveHandler($event); $event.preventDefault()' class = '{{container_class}}'>";
		
		template_html += "<div ng-click = 'barClickHandler($event)' class = '{{bar_container_class}}' style = '{{bar_container_style}}'>";
			template_html += "<div id = '{{slider_id}}SliderBar' style = '{{slider_bar_style}}'>";
				template_html += "<div class = '{{left_bg_class}}' style = 'width:{{left_bg_width}}%; {{left_bg_style}}'> </div>";
				template_html += "<div ng-repeat = 'handle in handles' id = '{{slider_id}}Handle{{$index}}' ng-mousedown = 'startHandleDrag($index); $event.preventDefault()' class = '{{handle_class}}' style = 'z-index: {{handle.zindex}}; left: {{handle.left}}%; {{handle_style}}' ng-bind-html-unsafe = 'handle.innerhtml'></div>";
				template_html += "<div ng-repeat = 'interior in interiors' class = '{{interior_bg_class}}' style = 'left: {{interior.left}}%; width: {{interior.width}}%; {{interior_bg_style}}'> </div>";
				template_html += "<div class = '{{right_bg_class}}' style = 'width:{{right_bg_width}}%; {{right_bg_style}}'> </div>";
				template_html += "<div>";			//Dummy div to wrap ticks, so nth-of-type selectors will work (they ought to work without the wrapper, but don't)
					template_html += "<div ng-repeat = 'tick in ticks' class = '{{ticks_class}}' style = 'position: absolute; left:{{tick.left}}%;'> </div>";		//If use_ticks not true, scope.ticks will be empty. Thus we don't need an ng-show here.
				template_html += "</div>";
			template_html += "</div>";
			
			template_html += "<div class = '{{ticks_values_container_class}}' style = 'position: relative;' ng-show = 'use_ticks'>";
				template_html += "<div ng-repeat = 'tick in ticks' class = '{{ticks_value_class}}' style = 'position: absolute; left:{{tick.left}}%;'> {{tick.name}} </div>";
			template_html += "</div>";
		template_html += "</div>";
	template_html += "</div>";
	
	
	return {
		restrict: 'E',
		priority: 0,
		scope: {
			'handle_values': '=sliderHandleVariable',
			'slider_id': '@sliderId',
			'slider_opts': '=sliderOpts'
		},
		replace: true,
		template: template_html,
		
		link: function(scope, element, attrs)
		{
			//variables
			var ii;
			var xx;
			var defaults;
			var building_slider;			//Boolean. True iff the slider is being built.
			var building_queued;			//Boolean. True iff the slider needs to be rebuilt again.
			var initial_values;				//If the user put an array of values in their sliderHandleVariable, then initial_values will remember
												//those values and set the slider's handles accordingly by default.
												//If the user did not pre-fill their handle variable, initial_values will be boolean false.
			var scale_function_poly;	//A non-decreasing mathematical function passing through (0, 0) and (1, 1),
											//where the first coordinate represents the slider's left% as a decimal
											//and the second represents the slider's value, with 0 = slider_min, 1 = slider_max,
											//represented as a polynomial abstract data type.
			var cur_handle;				//Index of handle currently being dragged.
			var dragging;				//Boolean. True iff we're dragging a handle.
			var slider_offset;			//the x and y offsets of the slider bar. Needed when translating the mouse's position to a slider position.
				//slider_offset.x
				//slider_offset.y
			var slider_width;			//the width of the slider bar. Needed when translating the mouse's position to a slider position.
			var slider_init;			//Boolean. True iff the slider_offset and slider_width values have been set.
			var increments;				//Array of valid values for an increment slider
				//increments[ii]
					//left					//Number in [0, 100]. The left value for this increment (as % of slider width).
					//value					//Number in [scope.slider_min, scope.slider_max]. The value of this increment on the slider.
			var user_values_flag;		//Boolean. True iff the user has specified values to put on the slider
			var rotate_radians;			//Number. Slider's angle of rotation, converted to radians.
			
			/*
			scope variables.
			
			scope.handles							Array containing handle information
				scope.handles[ii]
					zindex							Z-index for this handle. The leftmost handle will have the highest z-index.
														When handles are near the slider's left edge, this trend is reversed; the rightmost handle has the higher z-index.
					left							Number between 0 and 100. The handle's % left on the slider.
					value							The value of the handle. A number between scope.slider_min and scope.slider_max. Directly related to the 'left' value.
					display_value					The value that gets displayed. Only different from 'value' for sliders with specific user-defined values.
					return_value					The value that gets returned. Only different from 'display_value' if the user defines it as such in user_values
					innerhtml						Html to place inside the handle.
					html_string						Raw html string (uninterpolated) to put in handle. Equal to innerhtml iff value_in_handle === false
					value_in_handle					Boolean. True iff the innerhtml has a '$$value' tag to interpolate.
					
			scope.interiors							Array containing info for the interior divs, between the handles. This array depends entirely on the handles.
				scope.interiors[ii]
					left								Number in [0, 100]. Left position of this interior div (as % of slider).
					width								Number in [0, 100]. Width of this interior div (as % of slider).
					
			scope.handle_values						Array of handle values, linked to a variable in the parent controller.
				scope.handle_values[ii]				Will be identical to scope.handles[ii].display_value
			
			The following variables represent user inputs. See the documentation above for more info.
			The variable names here correspond to keys in scope.slider_opts
			
				scope.num_handles						Number of handles on the slider
				scope.slider_min						Minimum value of the slider
				scope.slider_max						Max value of the slider
				scope.left_bg_class						Class for slider area left of the leftmost handle
				scope.interior_bg_class					Class for slider area b/w handles
				scope.right_bg_class					Class for slider area right of rightmost handle
				scope.bar_container_class				Class for the slider bar container div
				scope.handle_class						Class for the handles
				scope.units_pre							Text placed before slider values
				scope.units_post						Text placed after slider values
				scope.use_ticks							Boolean. True iff the min/max values are displayed
				scope.ticks_values						Array of values at which to place ticks
				scope.ticks_class						Class for each tick div.
				scope.ticks_values_container_class		Class for tick values container div
				scope.ticks_value_class					Class for each tick value div
				scope.increment							Value to increment by, for increment sliders.
				scope.precision							Integer. Decimal precision to use when storing and reporting values.
				scope.evt_mouseup						Name of event to broadcast after a handle stops moving
				scope.slider_moveable					Boolean. True iff the slider may change location relative to the window
				scope.user_values						Array of values for the slider.
				scope.handle_html						Html string to put inside handles
				scope.scale_string						~ delimited polynomial string. Defines slider's scale function
				scope.zero_method						String defining which method to use to find a zero.
				scope.use_array							Boolean. True iff the handle values are reported as an array.
			
			scope.slider_bar_style
			scope.left_bg_style
			scope.interior_bg_style			Holds necessary styles for the slider, backgrounds and handles. (ie. 'position:absolute;', etc.)
			scope.right_bg_style
			scope.handle_style
			
			scope.left_bg_width				Number in [0, 100]. Width of left background div (as % of slider).
			scope.right_bg_width			Number in [0, 100]. Width of right background div (as % of slider).
			
			scope.startHandleDrag			Mousedown handler for handles. Starts dragging the handle.
			scope.mousemoveHandler			Mousemove handler for the slider container.
			scope.endHandleDrag				Mouseup handler for the slider container. Ends any handle dragging.
			scope.ticks						Array of ticks on the slider
				scope.ticks[ii]
					val							Value on the slider where this tick should go
					name						String to display for this tick
					left						Number in [0, 100]. The left value for this tick (as % of slider width).
			scope.user_info_show			Boolean. True iff the user-defined info section is shown. Default: false.
			scope.user_info_html			String of html, converted from info_html, defining the user-defined info section.
			
			*/
			
			//Define defaults
			
			defaults = 
			{
				'num_handles': 1,
				'slider_min': 0,
				'slider_max': 100,
				'precision': 0,
				'scale_string': '[1, 1]',
				'zero_method': 'newton',
				'increment': 0,
				'user_values': '',
				'evt_mouseup': '',
				'slider_moveable': true,
				'use_array': true,
				'rotate': 0,
				'bar_container_class': 'ui-slider-bar',
				'left_bg_class': 'ui-slider-bar-active',
				'interior_bg_class': 'ui-slider-bar-active',
				'right_bg_class': 'ui-slider-bar-inactive',
				'handle_class': 'ui-slider-bar-handle',
				'handle_html': '<div class = "ui-slider-bar-handle-inner"></div>',
				'units_pre': '',
				'units_post': '',
				'use_ticks': false,
				'ticks_values': 'placeholder',		//Placeholder special value
				'ticks_class': 'ui-slider-ticks',
				'ticks_values_container_class': 'ui-slider-ticks-values-container',
				'ticks_value_class': 'ui-slider-ticks-value'
			};
			
			//Init the event name variables here so we don't get undefined reference errors. Will be properly set later.
			var evt_get_value = '';
			var evt_return_value = '';
			var evt_get_all_values = '';
			var evt_return_all_values = '';
			var evt_set_value = '';
			var evt_init_slider = '';
			var evt_init_slider_finished = '';
			
			scale_function_poly = uiPolynomial.stringToPoly('[1, 1]');	//Init to identity, avoid undefined errors.
			
			
			//Initialize and build the slider. Can't allow values to change during computation.
			//	If an attempt is made to re-init the slider while it is in the process of building,
			//	building_queued will be set to true, and the slider will re-init again upon completion.
			//	This may be somewhat inefficient, but it is the only realistic and reliable way to ensure there are no fatal errors.
			var initSlider = function()
			{
				building_slider = true;
				building_queued = false;
				
				//Fill info
				for(var xx in defaults)
				{
					if(scope.slider_opts[xx] === undefined)
					{
						scope[xx] = defaults[xx];
					}
					else
					{
						scope[xx] = scope.slider_opts[xx];
					}
				}
				
				if(scope.ticks_values == 'placeholder')		//If this wasn't set by the user
				{
					//Define the default. Can't put this is the defaults array because it depends on the user's min and max values.
					if(scope.user_values.length > 0)
					{
						scope.ticks_values = [scope.user_values[0], scope.user_values[scope.user_values.length - 1]];
					}
					else
					{
						scope.ticks_values = [scope.slider_min, scope.slider_max];
					}
				}
				
				nameInterfaceEvents();						//Set the event names
				uiSliderService.register(scope.slider_id, endHandleDrag);		//Register the slider with the service
				
				scope.initial_values = false;
				if(scope.handle_values === undefined)
				{
					scope.use_array = parseBoolean(scope.use_array, defaults.use_array);	//Must parse before using.
					if(scope.use_array === false)		//Arbitrarily treat single handle as special case, to bypass 1-element array.
					{
						scope.handle_values = '';		//init to empty string in this case
					}
					else
					{
						scope.handle_values = [];
					}
				}
				else
				{
					//Arbitrarily treat single handle as special case, to bypass 1-element array.
					if(isArray(scope.handle_values) === false)	//Check for array here; use_array may not be correctly defined yet, and the user ought to have it in the format they intend to use.
					{
						scope.initial_values = scope.handle_values;
					}
					else
					{
						if(scope.handle_values.length !== undefined && scope.handle_values.length > 0)		//User may have initialized to empty array; initial_values should be left false in this case.
						{
							//copy handle_values
							var array_copy = [];
							for(ii = 0; ii < scope.handle_values.length; ii++)
							{
								array_copy[ii] = scope.handle_values[ii];
							}
							scope.initial_values = array_copy;
						}
					}
				}
				
				//Call the helpers to build the slider
				parseData();
				setStyles();
				setHandles();
				if(scope.use_ticks === true)		//Form ticks if necessary. Do nothing if the ticks are hidden.
				{
					setTicks();
				}
				setJqueryTouch();
				
				building_slider = false;
				//If an attempt was made to re-init the slider while it was building, re-init now.
				if(building_queued === true)
				{
					initSlider();
				}
				else
				{
					scope.$emit(evt_init_slider_finished, {'id':scope.slider_id, 'values':scope.handle_values});
				}
			};
			
			//Setup Functions
			
			var parseData = function()
			{
				//Parse numbers
				
				scope.num_handles = parseInt(scope.num_handles, 10);
				scope.slider_min = parseFloat(scope.slider_min);
				scope.slider_max = parseFloat(scope.slider_max);
				scope.increment = parseFloat(scope.increment);
				scope.precision = parseInt(scope.precision, 10);
				scope.rotate = reRangeAngle(parseFloat(scope.rotate));
				
				//Parse Booleans
				scope.slider_moveable = parseBoolean(scope.slider_moveable, defaults.slider_moveable);
				scope.use_array = parseBoolean(scope.use_array, defaults.use_array);
				
				user_values_flag = false;
				//If set, parse values and re-define other values
				if(scope.user_values !== '' && scope.user_values !== undefined)
				{
					user_values_flag = true;
					for(ii = 0; ii < scope.user_values.length; ii++)
					{
						if(scope.user_values[ii].val === undefined)		//If val is undefined, then the entry itself is the value.
						{
							var temp_val = scope.user_values[ii];
							scope.user_values[ii] = {'val':temp_val, 'name':temp_val};
						}
						else if(scope.user_values[ii].name === undefined)
						{
							scope.user_values[ii].name = scope.user_values[ii].val;
						}
					}					
					
					//set up slider numbers so that the value on the slider corresponds to the index of the appropriate value in user_values
					scope.slider_min = 0;
					scope.slider_max = scope.user_values.length - 1;
					scope.increment = 1;
					scope.precision = 0;
				}
				
				//Initialize variables
				scope.left_bg_width = 0;
				scope.right_bg_width = 0;
				cur_handle = 0;
				dragging = false;
				scope.recent_dragging = false;
				scope.handles = [];
				scope.interiors = [];
				scope.ticks = [];
				increments = [];
				slider_offset = {'x': 0, 'y': 0};			//Init to 0; will set later
				slider_width = 100;							//Init to 100; will set later
				slider_init = false;
				rotate_radians = scope.rotate * (2 * Math.PI / 360);
				
				//Compute slope of slider and slope of perpendicular. Conceptually it makes more sense to compute this
				//at the same time that we set the slider offsets, but that code may be run many times, and these won't change.
				//Thus, it's more efficient to compute these now.
				if(scope.rotate !== 0 && scope.rotate !== 90 && scope.rotate !== -90 && scope.rotate !== 180)
				{
					//Ignore slopes for horizontal and vertical sliders, because they produce division-by-zero error.
					slider_offset.m1 = Math.tan(rotate_radians);
					slider_offset.m2 = (-1 / slider_offset.m1);
				}
				
				//Parse scale, form scale function
				if(scope.increment === 0)								//If not increment slider, re-form scale polynomial
				{
					scale_function_poly = uiPolynomial.stringToPoly(scope.scale_string);
				}
				
			};	//end parseData
			
			//Boolean parser helper - string to boolean.
			var parseBoolean = function(bool, default_val)
			{
				if(bool == 'false' || bool === false)
				{
					return false;
				}
				else if(bool == 'true' || bool === true)
				{
					return true;
				}
				else
				{
					return default_val;
				}
			};
			
			
			var setStyles = function()
			{			
				//Setup needed bar styles
				scope.slider_bar_style = 'position:relative; width:100%;';
				scope.left_bg_style = 'position:absolute; left:0%;';				//width varies depending on handle position; define separately.
				scope.interior_bg_style = 'position:absolute;';						//left, width varies depending on handles; define separately.
				scope.right_bg_style = 'position:absolute; right:0%;';				//width varies depending on handle position; define separately.
				scope.handle_style = 'position:absolute;';
				var ro = 'rotate(' + scope.rotate + 'deg); ';
				scope.bar_container_style = '-moz-transform:' + ro + '-webkit-transform:' + ro + '-o-transform:' + ro + '-ms-transform:' + ro + 'transform:' + ro;
				
			};	//End setStyles
			
			
			var setHandles = function()
			{
				//Set up handles
				//Parse handle html, fill handle_htmls array with html for each handle.
				var handle_htmls;
				
				if(scope.handle_html.indexOf('~') != -1)		//If the user specified individual html for each handle
				{
					handle_htmls = scope.handle_html.split('~');
					for(ii = handle_htmls.length; ii < scope.num_handles; ii++)
					{
						handle_htmls[ii] = '';			//Blank out the rest of the array if necessary
					}
				}
				else
				{
					//Either scope.handle_html is the default, or it is the user-defined html. Either way, it should be applied to every handle.
					handle_htmls = [];
					for(ii = 0; ii < scope.num_handles; ii++)
					{
						handle_htmls[ii] = scope.handle_html;
					}
				}
				
				//Now fill scope.handles
				for(ii = 0; ii < scope.num_handles; ii++)
				{
					var left_val;
					if(scope.num_handles == 1)		//Need to check this case to avoid division by zero.
					{
						left_val = 0;
						scope.right_bg_width = 100;		//Also, in this case, there is no handle on the right, so the right background does not have 0 width. Might as well update it here.
					}
					else
					{
						left_val = (100 / (scope.num_handles - 1)) * ii;		//Start the handles evenly spread out on the bar
					}
					
					var value_in_handle = false;
					if(handle_htmls[ii].indexOf('$$value') != -1)
					{
						value_in_handle = true;
					}
					
					scope.handles[ii] =
					{
						'zindex' : 10,							//placeholder value
						'left' : left_val,
						'value' : calculate_value(left_val),						//Calculate value based on position
						'html_string': handle_htmls[ii],
						'value_in_handle': value_in_handle
					};
					if(user_values_flag === false)
					{
						scope.handles[ii].display_value = scope.handles[ii].value;
						scope.handles[ii].return_value = scope.handles[ii].value;
					}
					else
					{
						scope.handles[ii].display_value = scope.user_values[scope.handles[ii].value].name;
						scope.handles[ii].return_value = scope.user_values[scope.handles[ii].value].val;
					}
					
					
					if(scope.use_array === false)		//Arbitrarily treat single handle as special case, to bypass 1-element array.
					{
						scope.handle_values = scope.handles[ii].return_value;		//link to parent scope variable
					}
					else
					{
						scope.handle_values[ii] = scope.handles[ii].return_value;	//link to parent scope variable	
					}					
					update_zindex(ii);			//Set the zindex field properly
					
					//set innerhtml field
					if(scope.handles[ii].value_in_handle === true)		//Interpolate innerhtml if necessary
					{
						parseHandleHtml(ii);
					}
					else
					{
						scope.handles[ii].innerhtml = scope.handles[ii].html_string;
					}
				}
				
				//Set up interiors - must define them now, before we try to move any handles
				for(ii = 0; ii < scope.num_handles - 1; ii++)
				{
					scope.interiors[ii] = 
					{
						'left' : scope.handles[ii].left,	//interior div has same left position as handle on its left
						'width' : scope.handles[ii+1].left - scope.handles[ii].left
					};
				}
				
				//Set up increments if necessary
				if(scope.increment !== 0 && scope.increment !== undefined)		//If this is an increment slider
				{
					var cur_val = scope.slider_min;
					for(ii=0; cur_val < scope.slider_max; ii++)
					{
						increments[ii] = {};
						increments[ii].value = cur_val;
						increments[ii].left = calculate_left(cur_val);
						cur_val += scope.increment;
					}
					increments[ii] = {};
					increments[ii].value = scope.slider_max;
					increments[ii].left = 100;
					
					if(scope.initial_values === false)		//If the user pre-filled their values, don't bother with this section, we're going to move every handle again anyway.
					{
						//Now, move each handle to the nearest valid increment
						
						//Cannot simply use findNearestIncrement and moveHandle, because this might try to move a handle beyond its adjacent handles.
						//We must move the handles in order of which is closest to its nearest increment
						//Recall that, at this point, the handles are evenly spaced along the slider.
					
					
						var distances_to_increment = [];
						for(ii = 0; ii < scope.num_handles; ii++)
						{
							var new_left = findNearestIncrement(scope.handles[ii].left);
							distances_to_increment[ii] = 
							{
								'handle' : ii,
								'distance' : Math.abs(scope.handles[ii].left - new_left),
								'new_left' : new_left
							};
						}
						
						distances_to_increment.sort(function(a, b)
						{
							if(a.distance < b.distance)
							{
								return -1;
							}
							else if(b.distance < a.distance)
							{
								return 1;
							}
							else
							{
								return 0;
							}
						});
						
						
						for(ii = 0; ii < scope.num_handles; ii++)
						{
							moveHandle(distances_to_increment[ii].handle, distances_to_increment[ii].new_left);
						}
					}
				}
				
				if(scope.initial_values === false)	//Requires '===' test here. Equality in js is weird: ([0] != false) returns false!
				{}		//Do nothing
				else	//If the user pre-filled their handle values, need to move the handles accordingly.
				{
					if(evt_set_value === '' || evt_set_value === undefined)
					{
						nameInterfaceEvents();	//Make sure the event name is set.
					}
				
					for(ii=0; ii < scope.num_handles; ii++)		//Go through each handle, set it using the normal set function, just like set event listener
					{
						if(scope.use_array === false)
						{
							setHandleValue(ii, scope.initial_values);
						}
						else
						{
							setHandleValue(ii, scope.initial_values[ii]);
						}
					}
				}
			};		//End setHandles

			
			//setTicks: fills scope.ticks with necessary information. Requires setHandles to have run first.
			var setTicks = function()
			{
				for(var ii = 0; ii < scope.ticks_values.length; ii++)
				{
					if(scope.ticks_values[ii].val === undefined)		//If val is undefined, then the entry itself is the value.
					{
						scope.ticks[ii] = {'val':scope.ticks_values[ii], 'name': scope.units_pre + scope.ticks_values[ii] + scope.units_post};
					}
					else if(scope.ticks_values[ii].name === undefined)	//If val defined, name undefined
					{
						scope.ticks[ii] = {'val':scope.ticks_values[ii].val, 'name': scope.units_pre + scope.ticks_values[ii].val + scope.units_post};
					}
					else		//Both val and name defined
					{
						scope.ticks[ii] = {'val':scope.ticks_values[ii].val, 'name': scope.ticks_values[ii].name};
					}
					
					//Calculate this tick's left %
					var new_left;
				
					if(user_values_flag === true)
					{
						var index;
						var jj;
						//Find the tick value in the user_values array to get the index of the appropriate increment where this tick should be placed
						for(jj = 0; jj < scope.user_values.length; jj++)
						{
							if(scope.user_values[jj].val.toString() == scope.ticks[ii].val.toString())
							{
								index = jj;
								jj = scope.user_values.length;	//Stop looping
							}
						}
					
						new_left = increments[index].left;
					}
					else
					{
						new_left = calculate_left(scope.ticks[ii].val);	//No user-defined values; calculate left normally.
					}
					
					scope.ticks[ii].left = new_left;
				}
				
			};	//End setTicks
			
			
			var setJqueryTouch = function()
			{			
				//initTouch: Function wrapper for timeout - waits until angular applies ids to elements, then sets up jquery touch events
				var initTouch = function()
				{
					if($('#' + scope.slider_id + 'Handle' + 0).length <= 0)
					{
						setTimeout(function()
						{
							scope.$apply(function()
							{
								initTouch();
							});
						}, 500);
					}
					else
					{
						for(ii = 0; ii < scope.num_handles; ii++)
						{
							(function(index)			//wrap in anonymous function to get a local copy of the counter
							{
								var handle_ele = $('#' + scope.slider_id + 'Handle' + index);
								handle_ele.unbind('touchstart');		//Remove any previous events before adding a new one
								handle_ele.bind('touchstart', function()
								{
									scope.$apply(function()
									{
										scope.startHandleDrag(index);
									});
								});
							})(ii);
						}
						
						var slider_ele = $('#' + scope.slider_id);
						slider_ele.unbind('touchmove');				//Remove any previous events before adding a new one
						slider_ele.bind('touchmove', function(event)
						{
							event.preventDefault();					//? Maybe prevents default phone touchmove stuff, like scrolling?
							var touch = event.originalEvent;		//? Apparently Iphones do weird stuff; make sure we have original event.
							scope.$apply(function()
							{
								scope.mousemoveHandler(touch);
							});
						});
					}
				};
				
				initTouch();
			};	//End setJqueryTouch
			
			
			//End Setup Functions
			
			//Functions
			
			//*******************************************************************************************
			//calculate_value: takes a handle's left % and returns the corresponding value on the slider
			//	Inverse of calculate_left
			var calculate_value = function(left)
			{
				return fixPrecision((scope.slider_min + ((scope.slider_max - scope.slider_min) * uiPolynomial.evalPoly(scale_function_poly, (left / 100)))), scope.precision);
			};

			
			//*******************************************************************************************
			//invert_value: takes a value on the slider (normalized to the interval [0,1]) and finds the
			//corresponding left decimal as defined by scale_function_poly
			var invert_value = function(value)
			{
				var ret2;
				
				var zero_poly = uiPolynomial.subPoly(scale_function_poly, uiPolynomial.buildPoly([value], [0]));	//The scale polynomial, minus the value in question. This poly has a zero at the x-value we're looking for.
				
				if(scope.zero_method != 'bisection')
				{
					//Try newton's method first. If it fails, fall back on bisection method.
					
					//guess the given value, since this will result in instant success for linear sliders, which are the default.
					var ret1 = uiPolynomial.findPolyZeroNewton({'poly': zero_poly, 'guess': value});
					
					if(ret1.err)
					{
						//Newton's method failed. Try bisection method, which is generally slower but guaranteed to work in our situation.
						ret2 = uiPolynomial.findPolyZeroBisection({'poly': zero_poly, 'a': 0, 'b': 1 });
						return ret2.val;
					}
					else
					{
						return ret1.val;
					}
				}
				else
				{
					//Skip newton's method, go straight to bisection.
					ret2 = uiPolynomial.findPolyZeroBisection({'poly': zero_poly, 'a': 0, 'b': 1 });
					return ret2.val;
				}
			};
			
			//*******************************************************************************************
			//calculate_left: takes a handle's value and returns the corresponding left% on the slider
			//	Inverse of calculate_value
			var calculate_left = function(value)
			{
				return (invert_value((value - scope.slider_min) / (scope.slider_max - scope.slider_min)) * 100);
			};
			
			
			//*******************************************************************************************
			//update_backgrounds: takes the index of a handle in scope.handles and reforms the values of the background divs to the left and right of that handle.
				//Should be called whenever a handle moves.
			var update_backgrounds = function(index)
			{
				//If there is an interior div to the left of the handle, update it
				if(index !== 0)
				{
					scope.interiors[index-1].left = scope.handles[index-1].left;
					scope.interiors[index-1].width = scope.handles[index].left - scope.handles[index-1].left;
				}
				else	//It's the first handle, so update the left background div
				{
					scope.left_bg_width = scope.handles[index].left;
				}
				
				//If there is an interior div to the right of the handle, update it
				if(index < scope.num_handles - 1)
				{
					scope.interiors[index].left = scope.handles[index].left;
					scope.interiors[index].width = scope.handles[index+1].left - scope.handles[index].left;
				}
				else	//It's the last handle, so update the right background div
				{
					scope.right_bg_width = 100 - scope.handles[index].left;
				}
			};
			
			
			//*******************************************************************************************
			//update_zindex: takes the index of a handle in scope.handles and updates its zindex value.
			//Normally the leftmost handle has the higher z-index; however, this causes problems if multiple handles are moved to the far left of the slider.
			//Because handles cannot pass each other, multiple handles stacked on the left would be stuck there; you cannot move the left handle past the other,
			//and you cannot select the right handle because it is below the left handle.
			//To fix this, the zindex values will be inverted for handles very near the slider's left edge. This function handles this check.
			//All handles have a z-index greater than 10, to make sure they're on top of the background divs.
			
			var update_zindex = function(index)
			{
				if(scope.handles[index].left < 2)		//If it's within 2% of the left edge of the slider, invert zindex
				{
					scope.handles[index].zindex = 10 + index + 1;
				}
				else
				{
					scope.handles[index].zindex = 10 + scope.num_handles - index;
				}
			};
			
			
			//*******************************************************************************************
			//fixPrecision: takes a number and an integer. Returns the number with the number of decimal spaces
			//specified by the integer. The integer should be between -20 and 20
			//Ex: fixPrecision(1234, 1) returns 1234.0
			//Ex: fixPrecision(1234, -1) returns 1230
			var fixPrecision = function(number, digits)
			{
				if(digits >= 0)
				{
					return parseFloat(number.toFixed(digits));
				}
				else
				{
					var round_unit = Math.pow(10, (-1 * digits));
					return round_unit * Math.round((number / round_unit));
				}
			};
			
			//*******************************************************************************************
			//reRangeAngle: takes a number representing an angle in degrees. Returns an equivalent angle in (-180, 180]
			//Ex: reRangeAngle(270) returns -90
			var reRangeAngle = function(angle)
			{
				while(angle > 180)
				{
					angle -= 360;
				}
				while(angle <= -180)
				{
					angle += 360;
				}
				return angle;
			};
			
			//*******************************************************************************************
			//initSliderOffsets: handles jquery that gets slider's offset and width.
			//Should be called at the start of every mouse interaction event with the slider
			var initSliderOffsets = function()
			{
				if(scope.slider_moveable === true || slider_init === false)
				{
					var bar = $('#' + scope.slider_id + "SliderBar");
					slider_width = bar.outerWidth();
					slider_offset.x = bar.offset().left;
					slider_offset.y = bar.offset().top;
					
					//When in the bottom two quadrants, the y offset needs to be mirrored (it gets reported as being in the top 2)
					if(scope.rotate < 0)
					{
						slider_offset.y += slider_width * Math.abs(Math.sin(rotate_radians));
					}
					//When in the right two quadrants, the x offset needs to be mirrored (it gets reported as being in the left 2)
					if(scope.rotate > 90 || scope.rotate < -90)
					{
						slider_offset.x += slider_width * Math.abs(Math.cos(rotate_radians));
					}
					
					//Compute slider's y-intercept (the b in y = mx + b)
					if(slider_offset.m1 !== undefined)
					{
						//Recall that slider_offset.m1 will be defined iff the slider is neither horizontal nor vertical.
						//We don't need b1 in those cases, so don't waste time trying to compute it.
						slider_offset.b1 = (-1 * slider_offset.m1 * slider_offset.x) + slider_offset.y;
					}
					
					
					slider_init = true;
				}
			};
			
			
			//*******************************************************************************************
			//barClickHandler: click handler for slide bar container. Moves the nearest handle to match the mouse's x-coordinate.
			scope.barClickHandler = function(event)
			{
				//Do nothing unless we aren't dragging a handle
				if(scope.recent_dragging === false)
				{
					initSliderOffsets();	//First must make sure slider offsets set
					
					var x_coord = event.pageX;
					var y_coord = event.pageY;
					var new_left = convertMouseToSliderPercent(x_coord, y_coord);
					
					//Check and handle increments
					if(scope.increment !== 0 && scope.increment !== undefined)
					{
						new_left = findNearestIncrement(new_left);
					}
					
					//find the nearest handle
					
					var handle_index = 0;
					//First check if we're to the right of the rightmost handle
					if(scope.handles[scope.num_handles - 1].left <= new_left)
					{
						handle_index = scope.num_handles - 1;
					}
					//next check if we're left of the leftmost handle
					else if(scope.handles[0].left >= new_left)
					{
						handle_index = 0;
					}
					else	//otherwise, find the first handle that isn't to our left
					{
						for(ii = 0; new_left > scope.handles[ii].left; ii++);
						
						//Now the ii-1 handle is left of our position, and the ii handle is to our right.
						//Check which is nearer. Tie goes to the right-side handle.
						if((scope.handles[ii].left - new_left) > (new_left - scope.handles[ii-1].left))
						{
							handle_index = ii - 1;
						}
						else
						{
							handle_index = ii;
						}
					}
					
					moveHandle(handle_index, new_left);			//move handle to the new position
					
					if(scope.evt_mouseup !== '' && scope.evt_mouseup !== undefined) //need to fire user's mouseup event
					{
						scope.$emit(scope.evt_mouseup, {'num_handles':scope.num_handles, 'handle':handle_index, 'id':scope.slider_id, 'value': scope.handles[handle_index].return_value});
					}
				}
				
			};
			
			
			//*******************************************************************************************
			//startHandleDrag: mousedown handler for slider handles. Takes a handle's index and starts the mousemove event to drag that handle.
			scope.startHandleDrag = function(index)
			{
				initSliderOffsets();
			
				cur_handle = index;
				dragging = true;
				scope.recent_dragging = true;
				uiSliderService.activate(scope.slider_id);		//Slider's handle is being dragged. Activate this slider in the service.
			};
			
			
			//*******************************************************************************************
			//mousemoveHandler: handler for slider container mousemove event, for dragging handles. Does nothing unless we're dragging a handle.
			scope.mousemoveHandler = function(event)
			{
				if(dragging === true)
				{
					continueHandleDrag(event);
				}
			};
			
			
			//*******************************************************************************************
			var continueHandleDrag = function(event)
			{
				var x_coord;
				var y_coord;
				
				if(event.touches && event.touches.length)		//If touch event
				{
					x_coord = event.touches[0].pageX;
					y_coord = event.touches[0].pageY;
				}
				else			//If mouse drag event
				{
					x_coord = event.pageX;
					y_coord = event.pageY;
				}
				
				var new_left = convertMouseToSliderPercent(x_coord, y_coord);
				
				//Check and handle increments
				if(scope.increment !== 0 && scope.increment !== undefined)
				{
					new_left = findNearestIncrement(new_left);
				}			
				
				moveHandle(cur_handle, new_left);		//Move the handle
			};
			
			
			//*******************************************************************************************
			//Takes a mouse x coordinate and converts it to a left% on the slider. May return a % that is off the slider.
			var convertMouseToSliderPercent = function(x_coord, y_coord)
			{
				//Check horizontal slider first as a special case for an efficiency boost in this common use case,
				//and also because the general calculation fails in this case due to undefined slopes.
				if(scope.rotate === 0)
				{
					return ((x_coord - slider_offset.x) / slider_width) * 100;
				}
				else if(scope.rotate === 180)	//Compute separately rather than using absolute value, because we want to preserve any negative signs.
				{
					return ((slider_offset.x - x_coord) / slider_width) * 100;
				}
				//Check vertical slider second as a special case, for the same reasons as above.
				else if(scope.rotate === 90)
				{
					return ((y_coord - slider_offset.y) / slider_width) * 100;
				}
				else if(scope.rotate === -90)	//Compute separately rather than using absolute value, because we want to preserve any negative signs.
				{
					return ((slider_offset.y - y_coord) / slider_width) * 100;
				}
				//Else, perform the generalized calculation
				else
				{
					//This is just 8th-grade algebra in a standard Euclidean plane. We're considering the slider as a line with 0 width,
					//and we're finding the point on the slider nearest to the mouse's coordinates.
					var x_new = (y_coord - (slider_offset.m2 * x_coord) - slider_offset.b1) / (slider_offset.m1 - slider_offset.m2);
					var y_new = (slider_offset.m1 * x_new) + slider_offset.b1;
					
					//Check if we're off the slider's near edge, else a left of -x% would register as +x% (because distances are positive), though it should be 0.
					//In the left two quadrants, the x value should be larger than the offset, else we're off the slider.
					if(scope.rotate < 90 && scope.rotate > -90 && x_new <= slider_offset.x)
					{
						return 0;
					}
					//In the other two quadrants, the x value should be smaller than the offset, else we're off the slider.
					else if(x_new >= slider_offset.x)
					{
						return 0;
					}
					else	//We're on the slider.
					{
						//Now use the distance formula to convert this new point to a left% on the slider.
						var dist = Math.sqrt(Math.pow(slider_offset.x - x_new, 2) + Math.pow(slider_offset.y - y_new, 2));
						var left = (dist / slider_width) * 100;
						
						return left;
					}
				}
			};
			
			
			//*******************************************************************************************
			//moveHandle: Takes a handle index and left% and moves that handle to that position. Takes care of all error checking.
			// -Disallows movement beyond slider edges (stops at edge)
			// -Disallows movement beyond other handles (stops on top of handle)
			// -Does not handle increments. Be sure the left value passed in is a valid increment, if necessary
			// This function is the ONLY way to move a handle, change its value, etc.
			
			var moveHandle = function(handle_index, new_left)
			{				
				//if we've moved beyond the next handle, stop there.
				if((handle_index < (scope.num_handles - 1)) && (new_left > scope.handles[handle_index+1].left))
				{
					new_left = scope.handles[handle_index+1].left;
				}
				//if we've moved beyond the previous handle, stop there.
				else if((handle_index > 0) && (new_left < scope.handles[handle_index-1].left))
				{
					new_left = scope.handles[handle_index-1].left;
				}
				//if we've moved off the slider, stop at the edge.
				else if(new_left < 0)
				{
					new_left = 0;
				}
				else if(new_left > 100)
				{
					new_left = 100;
				}
				
				scope.handles[handle_index].left = new_left;
				scope.handles[handle_index].value = calculate_value(new_left);
				
				if(user_values_flag === false)
				{
					scope.handles[handle_index].display_value = scope.handles[handle_index].value;
					scope.handles[handle_index].return_value = scope.handles[handle_index].value;
				}
				else
				{
					//If values were user-defined, then scope.handles[handle_index].value will be the index of the appropriate user_value
					scope.handles[handle_index].display_value = scope.user_values[scope.handles[handle_index].value].name;
					scope.handles[handle_index].return_value = scope.user_values[scope.handles[handle_index].value].val;
				}
				
				if(scope.handles[handle_index].value_in_handle === true)	//interpolate handle's html with new display_value if necessary
				{
					parseHandleHtml(handle_index);
				}
				
				if(scope.use_array === false) //Arbitrarily treat single handle as special case, to bypass 1-element array.
				{
					scope.handle_values = scope.handles[handle_index].return_value;
				}
				else
				{
					scope.handle_values[handle_index] = scope.handles[handle_index].return_value;
				}
				
				update_backgrounds(handle_index);
				update_zindex(handle_index);
			};
			
			
			//*******************************************************************************************
			//endHandleDrag: mouseup handler for everything. Stops the mousemove event on the container, ending the handle drag.
			var endHandleDrag = function()
			{
				var endHandleDragHelper = function()
				{
					if(dragging === true)
					{
						dragging = false;
						uiSliderService.deactivate();		//Dragging finished. Deactivate in the service
					
						if(scope.evt_mouseup !== '' && scope.evt_mouseup !== undefined) //if we were dragging a handle, then we need to fire the user's mouseup event, if it exists
						{
							scope.$emit(scope.evt_mouseup, {'num_handles':scope.num_handles, 'handle':cur_handle, 'id':scope.slider_id, 'value': scope.handles[cur_handle].return_value});
						}
											
						//Want to disable moving the handle by clicking when dragging and for a short while after dragging
						setTimeout(function()
						{
							scope.$apply(function()
							{
								scope.recent_dragging = false;		//After dragging is finished, wait a while before re-allowing clicking to move handles
							});
						}, 300);
					}
				};
				
				if(scope.$$phase === undefined)
				{
					scope.$apply(function()
					{
						endHandleDragHelper();
					});
				}
				else
				{
					endHandleDragHelper();
				}
			};
			
			//*******************************************************************************************
			//findNearestIncrement: For increment sliders, takes a left value (a position on the slider) and finds
			//	the increment on the slider closest to that value. Returns the left value of that increment.
			var findNearestIncrement = function(left)
			{
			
			//Version 1: Takes advantage of the fact that increments are evenly spaced to calculate where the nearest increment is.
			//	This version is more efficient, but will fail if the slider is ever adjusted to allow uneven increments.
			
			//Must check edge cases to avoid possible errors.
			if(left >= 100)
			{	return 100;	}
			if(left <= 0)
			{	return 0; }
			
			var increment_left = increments[1].left;			//Get left % value of an increment.
			var low_index = Math.floor(left / increment_left);	//Calculate index of increment just below our left value.
			
			//Find the closest entry to our left value. Round up in event of tie.
			if((left - increments[low_index].left) < (increments[low_index+1].left - left))
			{
				return increments[low_index].left;
			}
			else
			{
				return increments[low_index+1].left;
			}
			
			
			// Version 2: Does not assume increments are evenly spaced. Less efficient, but should always work.
			/*
				var len = increments.length;
				var index = Math.floor(len / 2);
				var high_index = len - 1;
				var low_index = 0;
				var diff = high_index - low_index;
				
				//Continually cut the array in half, narrowing the range in which to search for our left value.
				//Do this until the array is small.
				while(diff > 4)		//4 is an arbitrary low positive integer
				{
					index = Math.floor(diff / 2) + low_index;
					if(increments[index].left > left)
					{
						high_index = index;
					}
					else
					{
						low_index = index;
					}
					diff = high_index - low_index;
				}
				
				//Now that the array is small, just go through it entry by entry.
				for(var ii = low_index+1; increments[ii].left < left; ii++);	//Find the first entry larger than our left value
				
				//Find the closest entry to our left value. Round up in event of tie.
				if((left - increments[ii-1].left) < (increments[ii].left - left))
				{
					return increments[ii-1].left;
				}
				else
				{
					return increments[ii].left;
				}
			*/
			
			};
			
			//*******************************************************************************************
			//parseHandleHtml: takes a handle index. Operates on the handle's html_string, replacing
			//	'$$value' keys with the handle's display_value. Places the resulting string in the handle's
			//	innerhtml field
			var parseHandleHtml = function(index)
			{
				scope.handles[index].innerhtml = scope.handles[index].html_string.replace('$$value', scope.units_pre + scope.handles[index].display_value +  scope.units_post);
			};
			
			
			//*******************************************************************************************
			//setHandleValue: Takes a handle index and a handle return value and does all tasks necessary to move the handle to that value.
			// Used by the SetValue event listener.
			var setHandleValue = function(handle, value)
			{
				var new_left;
				
				if(user_values_flag === true)
				{
					var index;
					for(var ii = 0; ii < scope.user_values.length; ii++)
					{
						if(scope.user_values[ii].val.toString() == value.toString())
						{
							index = ii;
							ii = scope.user_values.length;
						}
					}
				
					new_left = increments[index].left;
				}
				else
				{
					new_left = calculate_left(value);
				}
				
				//Code to check for increments.
				//Currently commented out in order to allow the user to manually place a handle at a non-increment position.
				/*
				if(scope.increment !== 0)
				{
					new_left = findNearestIncrement(new_left);
				}		
				*/
				moveHandle(handle, new_left);
			};

			//*******************************************************************************************
			//nameInterfaceEvents: sets the names for the events. Should be called whenever scope.slider_id changes.
			var nameInterfaceEvents = function()
			{
				evt_get_value = 'evtSliderGetValue' + scope.slider_id;					//The event you must broadcast to read a value from this slider.
				evt_return_value = 'evtSliderReturnValue' + scope.slider_id;			//The event you must listen for to read a value from this slider.
				evt_get_all_values = 'evtSliderGetAllValues' + scope.slider_id;			//The event you must broadcast to read all values from this slider.
				evt_return_all_values = 'evtSliderReturnAllValues' + scope.slider_id;	//The event you must listen for to read all values from this slider.
				evt_set_value = 'evtSliderSetValue' + scope.slider_id;					//The event you must broadcast to set a value on the slider
				evt_init_slider = 'evtInitSlider' + scope.slider_id;					//The event you must broadcast to re-initialize the slider.
				evt_init_slider_finished = 'evtSliderInitialized' + scope.slider_id;	//This event is emitted when the slider is done initializing.
			};
			
			//End Functions

			
			//Set up jquery
			//Use document.ready, not scope.$on('viewContentLoaded'), because apparently viewContentLoaded doesn't always fire.
			$(document).ready(function()
			{
				setJqueryTouch();
			});
			
			
			//Set up Interface
			
			//Get a value
			scope.$on(evt_get_value, function(evt, params)
			{
				//params
					//handle				//Index of the handle whose value should be returned. Handles are zero-indexed and arranged in ascending order from left to right.
				//Note: if params.handle isn't defined, the first handle's value will be returned.
				var handle = 0;
				if(params !== undefined && params.handle !== undefined)
				{
					handle = params.handle;
				}
				
				scope.$emit(evt_return_value, {'value': scope.handles[handle].return_value});
			});
			
			//Get all values. ALWAYS returns the values in an array. Period.
			scope.$on(evt_get_all_values, function(evt, params)
			{
				var ret_array = [];
				for(ii=0; ii < scope.handles.length; ii++)
				{
					ret_array[ii] = scope.handles[ii].return_value;
				}
				scope.$emit(evt_return_all_values, {'values': ret_array});
			});
			
			//Set a value
			scope.$on(evt_set_value, function(evt, params)
			{
				//params
					//handle				//Index of handle whose value is to be set. Handles are zero-indexed and arranged in ascending order from left to right.
					//value					//Value on the slider to give the handle. Must be a valid value.
				//Note: if params.handle isn't defined, the first handle's value will be set.
				
				var handle = 0;
				if(params !== undefined && params.handle !== undefined)
				{
					handle = params.handle;
				}
				setHandleValue(handle, params.value);
			});
			
			//Init the slider
			scope.$on(evt_init_slider, function(evt, params)
			{
				//Don't try to re-build the slider while it's being built.
				if(building_slider === true)
				{
					building_queued = true;
				}
				else
				{
					initSlider();
				}
			});
			
			//Array checker. Returns true if the argument is a scalar array []. False otherwise.
			//Included here in order to eliminate dependency on an external array library.
			var isArray = function(array1)
			{
				if(Object.prototype.toString.apply(array1) === "[object Array]")
				{
					return true;
				}
				else
				{
					return false;
				}
			};
			
			initSlider();	//Init the slider
			
			//Have to re-init if the id changes
			attrs.$observe('sliderId', function(value)
			{
				initSlider();
			});
			
		}	//End: link function
	};
}])
.factory('uiSliderService', [function()
{
/*
uiSliderService: The sole purpose of this service is to handle the slider's mouseup event.
When there are multiple sliders on a page, the mouseup event to end handle dragging for every single one would fire with every single mouseup. This is bad for performance.
This service eliminates this inefficiency; now there is a single mouseup event for all sliders, defined in this service.
The service calls the appropriate slider's mouseup handler to end dragging.

Possible issue warning: As of 4/11/2013, there is no code to determine when a slider should be deregistered with the service.
In theory, this could lead to memory overflow and/or reduced performance.
In practice, this is unlikely to cause problems. The user would have to view hundreds if not thousands of sliders in a single app session,
each with a unique id, without ever refreshing the page.
*/
	var inst =
	{
		//list of all registered sliders. Key is the slider's id. Value is the mouseup callback endHandleDrag
		sliders: {},
		
		//Id of the currently active slider. If no slider is active, this property is the boolean 'false'.
		active: false,
		
		//Method to add a slider to the list
		register: function(id, callback)
		{
			this.sliders[id] = callback;
		},
		
		//Method to remove a slider from the list
		remove: function(id)
		{
			delete this.sliders[id];
		},
		
		//Method to activate a slider
		activate: function(id)
		{
			this.active = id;
		},
		
		//Method to deactivate a slider
		deactivate: function()
		{
			this.active = false;
		},
		
		clickHandler: function(thisObj)
		{	
			if(thisObj.active === false)		//Do nothing unless active
			{}
			else
			{
				thisObj.sliders[thisObj.active]();	//Call the active slider's registered callback function.
			}
		},
		
		//Initialization function. Sets event listeners on body element.
		init: function()
		{
			var thisObj = this;
			
			//Set mouseup function to end dragging
			$('body').bind('mouseup', function(event)
			{
				thisObj.clickHandler(thisObj, event);
			});
			
			//Set touch events for phones		
			$('body').bind('touchend', function(event)
			{
				thisObj.clickHandler(thisObj, event);
			});
		}
		
	};

	inst.init();
	return inst;
}])
.factory('uiPolynomial', [function()
{
	/*
	Polynomial Function Library
	A polynomial is an array [] of obecjts {}. Each inner object corresponds to a term:
		poly
			poly[ii]
				coeff				Coefficent for this term. May be any real number.
				exp					Exponent for this term. May be any real number.

	Note that a polynomial's terms need not be in any particular order, and there may be
	multiple terms with identical exponents.
	Use combinePolyTerms to combine like exponents and also to sort them in ascending order.
	addPoly and subPoly do this automatically.

	Index:
		1. buildPoly
		2. stringToPoly
		3. evalPoly
		4. polyToFunction
		5. differentiatePoly
		6. integratePoly
		7. combinePolyTerms
		8. scalePoly
		9. addPoly
		10. subPoly
		11. findPolyZeroNewton
		12. findPolyZeroBisection
	*/
	var inst ={

		//*******************************************************************************************
		//1. buildPoly: takes an array of coefficients and an array of corresponding exponents, of equal length
		//Returns the corresponding polynomial
		//*******************************************************************************************
		buildPoly : function(coeffs, exps)
		{
			var poly = [];
			var ii;
			for(ii = 0; ii < coeffs.length; ii++)
			{
				poly[ii] = {'coeff':coeffs[ii], 'exp':exps[ii]};
			}
			return poly;
		},

		
		
		//*******************************************************************************************
		//2. stringToPoly: takes a string with the format '[coefficient, exponent]~[coefficient, exponent]~...'
		//Returns the corresponding polynomial
		//*******************************************************************************************
		stringToPoly : function(poly_string)
		{
			var terms = poly_string.split('~');
			var ii;
			var poly = [];
			
			for(ii = 0; ii < terms.length; ii++)
			{
				poly[ii] = {};
				poly[ii].coeff = parseFloat((terms[ii].slice(terms[ii].indexOf('[')+1)), (terms[ii].slice(terms[ii].indexOf(',')-1)));
				poly[ii].exp = parseFloat((terms[ii].slice(terms[ii].indexOf(',')+1)), (terms[ii].slice(terms[ii].indexOf(']')-1)));
			}
			return poly;
		},
		
		
		
		//*******************************************************************************************
		//3. evalPoly: takes a polynomial and a number. Returns value of poly at that number.
		//Returns the corresponding polynomial
		//*******************************************************************************************
		evalPoly : function(poly, xx)
		{
			var val = 0;
			var ii;
			for(ii = 0; ii < poly.length; ii++)
			{
				val += (poly[ii].coeff * Math.pow(xx, poly[ii].exp));
			}
			return val;
		},

		
		
		//*******************************************************************************************
		//4. polyToFunction: takes a polynomial. Returns the polynomial as a function f(x), for convenience.
		//*******************************************************************************************
		polyToFunction : function(poly)
		{
			var thisObj = this;
			return function(xx) {
				return thisObj.evalPoly(poly, xx);
			};
		},
		
		
		
		//*******************************************************************************************
		//5. differentiatePoly: takes a polynomial. Returns the polynomial's derivative (another polynomial)
		//*******************************************************************************************
		differentiatePoly : function(poly)
		{
			var thisObj = this;
			var deriv = thisObj.copyPoly(poly);
			var ii;
			for(ii = 0; ii < deriv.length; ii++)
			{
				if(deriv[ii].exp === 0)
				{
					deriv[ii].coeff = 0;		//Derivative of constant term is 0; leave exp at 0
				}
				else
				{
					deriv[ii].coeff = deriv[ii].coeff * deriv[ii].exp;		//Power rule.
					deriv[ii].exp = deriv[ii].exp - 1;
				}
			}
			return deriv;
		},
		
		
		
		//*******************************************************************************************
		//6. integratePoly: takes a polynomial. Returns the polynomial's integral (another polynomial).
		//Integral will assume constant term is zero.
		//Can't integrate polys with an x^(-1) term, since our polynomial data type does not support
		//logarithm terms. Will console.log an error message and return the given polynomial in this case.
		//*******************************************************************************************
		integratePoly : function(poly)
		{
			var integral = thisObj.copyPoly(poly);
			var ii;
			for(ii = 0; ii < integral.length; ii++)
			{
				if(integral[ii].exp == -1)			//Abort
				{
					console.log("ERROR: uiPolynomial.integratePoly can't handle polynomials with an exponent = -1 term!");
					return poly;
				}
				else
				{
					integral[ii].exp = integral[ii].exp + 1;
					integral[ii].coeff = integral[ii].coeff / integral[ii].exp;		//Power rule.
				}
			}
			return integral;
		},
							
		//*******************************************************************************************
		//7. combinePolyTerms: takes a polynomial. Returns the polynomial with like terms combined.
		//Removes terms with coeff == 0. Also sorts poly terms in ascending order.
		//*******************************************************************************************
		combinePolyTerms : function(poly)
		{
			var ii;
			var new_poly = [];
			var term_counter = 0;
			var cur_exp;
			
			//Sort the terms in ascending order by exponent
			poly = poly.sort(function(a, b)
			{
				if(a.exp < b.exp)
				{
					return -1;
				}
				else if(a.exp > b.exp)
				{
					return 1;
				}
				else
				{
					return 0;
				}
			});
			
			cur_exp = poly[0].exp;
			new_poly[term_counter] = {'coeff': 0, 'exp':cur_exp};
			for(ii = 0; ii < poly.length; ii++)
			{
				if(cur_exp == poly[ii].exp)
				{
					new_poly[term_counter].coeff = new_poly[term_counter].coeff + poly[ii].coeff;		//Combine coefficients
				}
				else
				{
					term_counter++;
					cur_exp = poly[ii].exp;
					new_poly[term_counter] = {'coeff': poly[ii].coeff, 'exp':cur_exp};
				}
			}
			return new_poly;				
		},

		//*******************************************************************************************
		//8. scalePoly: takes a polynomial and a scalar. Scales the polynomial by the scalar. Returns resulting polynomial.
		//*******************************************************************************************
		scalePoly : function(poly, scalar)
		{
			var thisObj = this;
			var new_poly = thisObj.copyPoly(poly);
			var ii;
			for(ii=0; ii < new_poly.length; ii++)
			{
				new_poly[ii].coeff = new_poly[ii].coeff * scalar;
			}
			
			return new_poly;
		},
							
		//*******************************************************************************************
		//9. addPoly: takes two polynomials and adds thems together. Returns resulting polynomial.
		//*******************************************************************************************
		addPoly : function(poly1, poly2)
		{
			return this.combinePolyTerms(poly1.concat(poly2));
		},
							
		//*******************************************************************************************
		//10. subPoly: takes two polynomials and subtracts second from first. Returns resulting polynomial.
		//*******************************************************************************************
		subPoly : function(poly1, poly2)
		{
			return this.addPoly(poly1, this.scalePoly(poly2, -1));
		},
							
		//*******************************************************************************************
		//11. findPolyZeroNewton: Takes a polynomial and a guess (a number that might be the zero).
		//Uses Newton's method to find a zero of the polynomial. Returns the zero.
		//Make sure the function actually has a zero before using Newton's method!!!
		//*******************************************************************************************
		findPolyZeroNewton : function(params)
		{
			//params
				//poly						//The polynomial to find a zero for (required)
				//guess						//Real number. Initial guess as to where the zero is (required)
				//epsilon					//Positive real number. Accuracy threshold.  Optional.
				//max_iterations	//Positive integer. If we go beyond this many iterations with no answer found, returns an error.  Optional.
				
			var thisObj = this;
			
			if(params === undefined || params.poly === undefined || params.guess === undefined)
			{
				console.log("Error in uiPolynomial.findPolyZeroNewton: params.poly and params.guess must be defined");
				return {'err':true, 'val':0};	//Return error and a dummy value
			}
			else
			{
				var poly = params.poly;
				var guess = params.guess;
				
				var epsilon = 0.00001;					//Accuracy threshold. Tells algorithm how close to get to the real answer
				if(params.epsilon !== undefined)
				{
					epsilon = params.epsilon;
				}
				var max_iterations = 50;
				if(params.max_iterations !== undefined)
				{
					max_iterations = params.max_iterations;
				}
				
				//If the guess is the answer we're looking for
				if(Math.abs(thisObj.evalPoly(poly, guess)) < epsilon)
				{
					return {'err':false, 'val':guess};
				}
				//Else apply newton's method
				else
				{
					var ff = thisObj.polyToFunction(poly);
					var f_prime = thisObj.polyToFunction(thisObj.differentiatePoly(poly));
					var iterations = 0;
					
					var iterator = function(xx)
					{
						if(Math.abs(ff(xx)) < epsilon)
						{
							return {'err':false, 'val':xx};
						}
						else
						{
							iterations++;
							if(iterations > max_iterations)
							{
								console.log("Error in uiPolynomial.findPolyZeroNewton: Too many iterations without finding answer");
								return {'err':true, 'val':xx};		//Return error and the current value.
							}
							else
							{
								if(f_prime(xx) === 0)			//Error. Newton's method fails in this case,
								{
									return iterator(xx + 0.1);	//So try again with a slightly different guess.
								}
								else
								{
									return iterator(xx - (ff(xx) / f_prime(xx)));		//Continue with Newton's method
								}
							}
						}
					};
					
					return iterator(guess - (ff(guess) / f_prime(guess)));
				}
			}
		},
		
		//*******************************************************************************************
		//12. findPolyZeroBisection: Takes a polynomial and an interval. Finds the polynomial's zero in
		//	the interval. The polynomial should have exactly one zero in the interval, be defined
		//	throughout the interval, and must have opposite signs at the endpoints.
		//	This method is generally slower than Newton's method, but guaranteed to work for
		//	continuous functions. Therefore, since polynomials are continuous, it will always work.
		//*******************************************************************************************
		findPolyZeroBisection : function(params)
		{
			//params
				//poly						//The polynomial to find a zero for. Must be defined on [a, b], and must be >= 0 at one endpoint and <= 0 at the other.
				//a								//Real number. Lower bound for the interval in which to search for a zero.
				//b								//Real number larger than a. Upper bound for the interval in which to search for a zero.
				//epsilon					//Positive real number. Accuracy threshold.  Optional.
				
			var thisObj = this;
			
			if(params === undefined || params.poly === undefined || params.a === undefined || params.b === undefined)
			{
				console.log("Error in uiPolynomial.findPolyZeroBisection: params.poly, params.a, and params.b must be defined");
				return {'err':true, 'val':0};	//Return error and a dummy value
			}
			else
			{
				var poly = params.poly;
				
				var epsilon = 0.0001;					//Accuracy threshold. Tells algorithm how close to get to the real answer
				if(params.epsilon !== undefined)
				{
					epsilon = params.epsilon;
				}
				//var max_iterations = 100;
				//if(params.max_iterations != undefined)
				//{
				//	max_iterations = params.max_iterations;
				//}
				
				var ff = thisObj.polyToFunction(poly);
				//var iterations = 0;
					
				var iterator = function(a, b)
				{
					var f_a = ff(a);
					var f_b = ff(b);
					//If a is the answer
					if(Math.abs(f_a) < epsilon)
					{
						return {'err':false, 'val':a};
					}
					//Else if b is the answer
					else if(Math.abs(f_b) < epsilon)
					{
						return {'err':false, 'val':b};
					}
					//Else if there is no answer
					else if((f_a > 0 && f_b > 0) || (f_a < 0 && f_b < 0))
					{
						//Error.
						console.log("Error in uiPolynomial.findPolyZeroBisection: Bad interval. The polynomial must be >= 0 at one endpoint and <= 0 at the other.");
						return {'err':true, 'val':0};	//Return error and dummy value.
					}
					else
					{
						var c = ((a + b) / 2);		//Midpoint of interval
						var f_c = ff(c);
						
						//If the midpoint is the answer
						if(Math.abs(f_c) < epsilon)
						{
							return {'err':false, 'val':c};
						}
						//Else keep going
						else
						{
							//iterations++;
							//if(iterations > max_iterations)
							//{
							//	console.log("Error in uiPolynomial.findPolyZeroBisection: Too many iterations without finding answer");
							//	callback(true, c);		//Return error and the current midpoint.
							//}
							//else
							//{
							
							//Determine which interval has the zero: [a, c] or [c, b]. Only one can.
							if(f_c < 0)
							{
								if(f_a > 0)
								{
									return iterator(a, c);
								}
								else
								{
									return iterator(c, b);
								}
							}
							else
							{
								if(f_a < 0)
								{
									return iterator(a, c);
								}
								else
								{
									return iterator(c, b);
								}
							}
							
							//}
						}
					}
				};
					
				return iterator(params.a, params.b);
			}
		},
		
		//*******************************************************************************************
		//13. copyPoly: Takes a polynomial and returns an exact copy of that polynomial.
		//Could be replaced by a deep array copier/cloner.
		//*******************************************************************************************
		copyPoly : function(poly)
		{
			var copy = [];
			var ii;
			for(ii = 0; ii < poly.length; ii++)
			{
				copy[ii] =
				{
					'coeff': poly[ii].coeff,
					'exp': poly[ii].exp
				};
			}
			return copy;
		}
		
	};
	return inst;
}]);
/*
 jQuery UI Sortable plugin wrapper

 @param [ui-sortable] {object} Options to pass to $.fn.sortable() merged onto ui.config
*/
angular.module('ui.directives').directive('uiSortable', [
  'ui.config', function(uiConfig) {
    return {
      require: '?ngModel',
      link: function(scope, element, attrs, ngModel) {
        var onReceive, onRemove, onStart, onUpdate, opts;

        opts = angular.extend({}, uiConfig.sortable, scope.$eval(attrs.uiSortable));

        if (ngModel) {

          ngModel.$render = function() {
            element.sortable( "refresh" );
          };

          onStart = function(e, ui) {
            // Save position of dragged item
            ui.item.sortable = { index: ui.item.index() };
          };

          onUpdate = function(e, ui) {
            // For some reason the reference to ngModel in stop() is wrong
            ui.item.sortable.resort = ngModel;
          };

          onReceive = function(e, ui) {
            ui.item.sortable.relocate = true;
            // added item to array into correct position and set up flag
            ngModel.$modelValue.splice(ui.item.index(), 0, ui.item.sortable.moved);
          };

          onRemove = function(e, ui) {
            // copy data into item
            if (ngModel.$modelValue.length === 1) {
              ui.item.sortable.moved = ngModel.$modelValue.splice(0, 1)[0];
            } else {
              ui.item.sortable.moved =  ngModel.$modelValue.splice(ui.item.sortable.index, 1)[0];
            }
          };

          onStop = function(e, ui) {
            // digest all prepared changes
            if (ui.item.sortable.resort && !ui.item.sortable.relocate) {

              // Fetch saved and current position of dropped element
              var end, start;
              start = ui.item.sortable.index;
              end = ui.item.index();

              // Reorder array and apply change to scope
              ui.item.sortable.resort.$modelValue.splice(end, 0, ui.item.sortable.resort.$modelValue.splice(start, 1)[0]);

            }
            if (ui.item.sortable.resort || ui.item.sortable.relocate) {
              scope.$apply();
            }
          };

          // If user provided 'start' callback compose it with onStart function
          opts.start = (function(_start){
            return function(e, ui) {
              onStart(e, ui);
              if (typeof _start === "function")
                _start(e, ui);
            };
          })(opts.start);

          // If user provided 'start' callback compose it with onStart function
          opts.stop = (function(_stop){
            return function(e, ui) {
              onStop(e, ui);
              if (typeof _stop === "function")
                _stop(e, ui);
            };
          })(opts.stop);

          // If user provided 'update' callback compose it with onUpdate function
          opts.update = (function(_update){
            return function(e, ui) {
              onUpdate(e, ui);
              if (typeof _update === "function")
                _update(e, ui);
            };
          })(opts.update);

          // If user provided 'receive' callback compose it with onReceive function
          opts.receive = (function(_receive){
            return function(e, ui) {
              onReceive(e, ui);
              if (typeof _receive === "function")
                _receive(e, ui);
            };
          })(opts.receive);

          // If user provided 'remove' callback compose it with onRemove function
          opts.remove = (function(_remove){
            return function(e, ui) {
              onRemove(e, ui);
              if (typeof _remove === "function")
                _remove(e, ui);
            };
          })(opts.remove);
        }

        // Create sortable
        element.sortable(opts);
      }
    };
  }
]);

/**
This directive makes a <select> element customizably stylable by making the <select> element opacity 0 and position absolute and then putting the custom styled element behind it and copying the selected value (option) from the actual/functional <select> to the display version of the select.

//TOC
//1. init

scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html)
	@param {Array} opts
	@param {String} ngModel

attrs
	@param {String} [placeholder='Select']


EXAMPLE usage:
partial / html:
	<select ui-styledselect opts='opts' ng-model='ngModel'></select>

controller / js:

//end: EXAMPLE usage
*/
angular.module('ui.directives').directive('uiStyledselect', ['ui.config', '$compile', '$timeout', function (uiConfig, $compile, $timeout) {
  return {
		//priority:500,
		restrict: 'A',
		scope: {
			opts: '=',
			ngModel: '='
		},

		compile: function(element, attrs) {
			var defaults ={'placeholder':'Select'};
			for(var xx in defaults) {
				if(attrs[xx] ===undefined) {
					attrs[xx] =defaults[xx];
				}
			}
			
			var html="<div class='ui-styledselect-div'>"+		//note - MUST have a wrapper div since the outermost element that is the element itself will NOT work properly; only content INSIDE it will..
			"<select class='ui-styledselect' ng-change='updateVal({})' ng-options='opt.val as opt.name for opt in opts' ng-model='ngModel'>"+
				"<option value=''>"+attrs.placeholder+"</option>"+
			"</select>"+
			"<div class='ui-styledselect-display'>"+
				"{{displayVal}}"+
				"<div class='ui-styledselect-display-icon'></div>"+
				//"displayVal: {{displayVal}}"+		//TESTING
				//"ngModel: {{ngModel}}"+		//TESTING
			"</div>"+
			"</div>";
			element.replaceWith(html);
			
			return function(scope, element, attrs) {
				var dummy =1;
				//$compile(element)(scope);		//so ng-options works		//UPDATE: this now results in double options so CAN'T use it.. (and it seems to work without it now..)
			};
		},
		
		controller: function($scope, $element, $attrs) {
			if(!$scope.ngModel) {
				$scope.displayVal =$attrs.placeholder;
			}
			else {
				$scope.displayVal =$scope.ngModel;
			}
			/*
			//not currently working? or needed (just use $watch ngModel instead?)
			$scope.updateVal =function(params) {
				alert(ngModel);
				var dummy =1;
			};
			*/
			
			$scope.$watch('ngModel', function(newVal, oldVal) {
				if(!angular.equals(oldVal, newVal)) {		//very important to do this for performance reasons since $watch runs all the time
					//update display value - set it to the name of the opt whose value matches ngModel (newVal)
					for(var ii=0; ii<$scope.opts.length; ii++) {
						if($scope.opts[ii].val ==newVal) {
							$scope.displayVal =$scope.opts[ii].name;
							break;
						}
					}
				}
			});
		}
	};
}]);
/**
 * Binds a TinyMCE widget to <textarea> elements.
 */
angular.module('ui.directives').directive('uiTinymce', ['ui.config', function (uiConfig) {
  uiConfig.tinymce = uiConfig.tinymce || {};
  return {
    require: 'ngModel',
    link: function (scope, elm, attrs, ngModel) {
      var expression,
        options = {
          // Update model on button click
          onchange_callback: function (inst) {
            if (inst.isDirty()) {
              inst.save();
              ngModel.$setViewValue(elm.val());
              if (!scope.$$phase)
                scope.$apply();
            }
          },
          // Update model on keypress
          handle_event_callback: function (e) {
            if (this.isDirty()) {
              this.save();
              ngModel.$setViewValue(elm.val());
              if (!scope.$$phase)
                scope.$apply();
            }
            return true; // Continue handling
          },
          // Update model when calling setContent (such as from the source editor popup)
          setup: function (ed) {
            ed.onSetContent.add(function (ed, o) {
              if (ed.isDirty()) {
                ed.save();
                ngModel.$setViewValue(elm.val());
                if (!scope.$$phase)
                  scope.$apply();
              }
            });
          }
        };
      if (attrs.uiTinymce) {
        expression = scope.$eval(attrs.uiTinymce);
      } else {
        expression = {};
      }
      angular.extend(options, uiConfig.tinymce, expression);
      setTimeout(function () {
        elm.tinymce(options);
      });
    }
  };
}]);

/**
 * General-purpose validator for ngModel.
 * angular.js comes with several built-in validation mechanism for input fields (ngRequired, ngPattern etc.) but using
 * an arbitrary validation function requires creation of a custom formatters and / or parsers.
 * The ui-validate directive makes it easy to use any function(s) defined in scope as a validator function(s).
 * A validator function will trigger validation on both model and input changes.
 *
 * @example <input ui-validate=" 'myValidatorFunction($value)' ">
 * @example <input ui-validate="{ foo : '$value > anotherModel', bar : 'validateFoo($value)' }">
 * @example <input ui-validate="{ foo : '$value > anotherModel' }" ui-validate-watch=" 'anotherModel' ">
 * @example <input ui-validate="{ foo : '$value > anotherModel', bar : 'validateFoo($value)' }" ui-validate-watch=" { foo : 'anotherModel' } ">
 *
 * @param ui-validate {string|object literal} If strings is passed it should be a scope's function to be used as a validator.
 * If an object literal is passed a key denotes a validation error key while a value should be a validator function.
 * In both cases validator function should take a value to validate as its argument and should return true/false indicating a validation result.
 */
angular.module('ui.directives').directive('uiValidate', function () {

  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, elm, attrs, ctrl) {
      var validateFn, watch, validators = {},
        validateExpr = scope.$eval(attrs.uiValidate);

      if (!validateExpr) return;

      if (angular.isString(validateExpr)) {
        validateExpr = { validator: validateExpr };
      }

      angular.forEach(validateExpr, function (expression, key) {
        validateFn = function (valueToValidate) {
          if (scope.$eval(expression, { '$value' : valueToValidate })) {
            ctrl.$setValidity(key, true);
            return valueToValidate;
          } else {
            ctrl.$setValidity(key, false);
            return undefined;
          }
        };
        validators[key] = validateFn;
        ctrl.$formatters.push(validateFn);
        ctrl.$parsers.push(validateFn);
      });

      // Support for ui-validate-watch
      if (attrs.uiValidateWatch) {
        watch = scope.$eval(attrs.uiValidateWatch);
        if (angular.isString(watch)) {
          scope.$watch(watch, function(){
            angular.forEach(validators, function(validatorFn, key){
              validatorFn(ctrl.$modelValue);
            });
          });
        } else {
          angular.forEach(watch, function(expression, key){
            scope.$watch(expression, function(){
              validators[key](ctrl.$modelValue);
            });
          });
        }
      }
    }
  };
});


/**
 * A replacement utility for internationalization very similar to sprintf.
 *
 * @param replace {mixed} The tokens to replace depends on type
 *  string: all instances of $0 will be replaced
 *  array: each instance of $0, $1, $2 etc. will be placed with each array item in corresponding order
 *  object: all attributes will be iterated through, with :key being replaced with its corresponding value
 * @return string
 *
 * @example: 'Hello :name, how are you :day'.format({ name:'John', day:'Today' })
 * @example: 'Records $0 to $1 out of $2 total'.format(['10', '20', '3000'])
 * @example: '$0 agrees to all mentions $0 makes in the event that $0 hits a tree while $0 is driving drunk'.format('Bob')
 */
angular.module('ui.filters').filter('format', function(){
  return function(value, replace) {
    if (!value) {
      return value;
    }
    var target = value.toString(), token;
    if (replace === undefined) {
      return target;
    }
    if (!angular.isArray(replace) && !angular.isObject(replace)) {
      return target.split('$0').join(replace);
    }
    token = angular.isArray(replace) && '$' || ':';

    angular.forEach(replace, function(value, key){
      target = target.split(token+key).join(value);
    });
    return target;
  };
});

/**
 * Wraps the
 * @param text {string} haystack to search through
 * @param search {string} needle to search for
 * @param [caseSensitive] {boolean} optional boolean to use case-sensitive searching
 */
angular.module('ui.filters').filter('highlight', function () {
  return function (text, search, caseSensitive) {
    if (search || angular.isNumber(search)) {
      text = text.toString();
      search = search.toString();
      if (caseSensitive) {
        return text.split(search).join('<span class="ui-match">' + search + '</span>');
      } else {
        return text.replace(new RegExp(search, 'gi'), '<span class="ui-match">$&</span>');
      }
    } else {
      return text;
    }
  };
});

/**
 * Converts variable-esque naming conventions to something presentational, capitalized words separated by space.
 * @param {String} value The value to be parsed and prettified.
 * @param {String} [inflector] The inflector to use. Default: humanize.
 * @return {String}
 * @example {{ 'Here Is my_phoneNumber' | inflector:'humanize' }} => Here Is My Phone Number
 *          {{ 'Here Is my_phoneNumber' | inflector:'underscore' }} => here_is_my_phone_number
 *          {{ 'Here Is my_phoneNumber' | inflector:'variable' }} => hereIsMyPhoneNumber
 */
angular.module('ui.filters').filter('inflector', function () {
  function ucwords(text) {
    return text.replace(/^([a-z])|\s+([a-z])/g, function ($1) {
      return $1.toUpperCase();
    });
  }

  function breakup(text, separator) {
    return text.replace(/[A-Z]/g, function (match) {
      return separator + match;
    });
  }

  var inflectors = {
    humanize: function (value) {
      return ucwords(breakup(value, ' ').split('_').join(' '));
    },
    underscore: function (value) {
      return value.substr(0, 1).toLowerCase() + breakup(value.substr(1), '_').toLowerCase().split(' ').join('_');
    },
    variable: function (value) {
      value = value.substr(0, 1).toLowerCase() + ucwords(value.split('_').join(' ')).substr(1).split(' ').join('');
      return value;
    }
  };

  return function (text, inflector, separator) {
    if (inflector !== false && angular.isString(text)) {
      inflector = inflector || 'humanize';
      return inflectors[inflector](text);
    } else {
      return text;
    }
  };
});

/**
 * Filters out all duplicate items from an array by checking the specified key
 * @param [key] {string} the name of the attribute of each object to compare for uniqueness
 if the key is empty, the entire object will be compared
 if the key === false then no filtering will be performed
 * @return {array}
 */
angular.module('ui.filters').filter('unique', function () {

  return function (items, filterOn) {

    if (filterOn === false) {
      return items;
    }

    if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
      var hashCheck = {}, newItems = [];

      var extractValueToCompare = function (item) {
        if (angular.isObject(item) && angular.isString(filterOn)) {
          return item[filterOn];
        } else {
          return item;
        }
      };

      angular.forEach(items, function (item) {
        var valueToCheck, isDuplicate = false;

        for (var i = 0; i < newItems.length; i++) {
          if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
            isDuplicate = true;
            break;
          }
        }
        if (!isDuplicate) {
          newItems.push(item);
        }

      });
      items = newItems;
    }
    return items;
  };
});
