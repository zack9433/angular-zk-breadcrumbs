'use strict';

;(function() {
  angular.module('zkBreadcrumbs', [])
    .factory("breadcrumbService", function($state, $stateParams) {
      var list = [], title;

      if (!Object.keys) {
        Object.keys = function(obj) {
          var keys = [];

          for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
              keys.push(i);
            }
          }

          return keys;
        };
      }

      function getProperty(object, path) {
        function index(obj, i) {
          return obj[i];
        }

        return path.split('.').reduce(index, object);
      }

      function addBreadcrumb(title, state) {
        list.push({
          title: title,
          state: state
        });
      }

      function generateBreadcrumbs(state, params) {
        if(angular.isDefined(state.parent)) {
          generateBreadcrumbs(state.parent, params);
        }

        if(angular.isDefined(state.breadcrumb)) {
          if(angular.isDefined(state.breadcrumb.title)) {
            // addBreadcrumb($interpolate(state.breadcrumb.title)(state.locals.globals), state.name);

            var displayName='';
            // Loop through ownParams and replace any expressions with the matching value
            if (0 !== Object.keys(params).length) {
              angular.forEach(Object.keys(params), function(param, index){
                displayName = state.breadcrumb.title.replace(':' + param, params[param]);
              });
            } else {
              displayName = state.breadcrumb.title;
            }

            addBreadcrumb(displayName, state.name);
          }
        }
      }

      function appendTitle(translation, index) {
        var title = translation;

        if(index < list.length - 1) {
          title += ' > ';
        }

        return title;
      }

      function generateTitle() {
        title = '';

        angular.forEach(list, function(breadcrumb, index) {
          /*$translate(breadcrumb.title).then(
            function(translation) {
              title += appendTitle(translation, index);
            }, function(translation) {
              title += appendTitle(translation, index);
            }
          );*/
          title += appendTitle(breadcrumb.title, index);
        });
      }

      return {
        generate: function() {
          list = [];

          generateBreadcrumbs($state.$current, $stateParams);
          generateTitle();
        },

        title: function() {
          return title;
        },

        list: function() {
          return list;
        }
      };
    })
    .directive("breadcrumbs", function(breadcrumbService) {
      return {
        restrict: 'EA',
        replace: true,
        priority: 100,
        templateUrl: '/template/common/breadcrumbs.html',
        link: function(scope) {
          breadcrumbService.generate();
          scope.breadcrumbList = breadcrumbService.list();
          scope.$on('$stateChangeSuccess', function() {
            breadcrumbService.generate();
            scope.breadcrumbList = breadcrumbService.list();
          });
        }
      };
    });
}());
