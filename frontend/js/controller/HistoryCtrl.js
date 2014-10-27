/* global window:false */

var app = window.angular.module('MaidSafe', [ 'ngReact' ]);
app.service('vaultBehaviour', window.VaultBehaviourService);
app.controller('historyCtrl', [
  '$scope', '$location', '$http', '$filter', '$timeout' , 'vaultBehaviour',
  function($scope, $location, $http, $filter, $timeout, vaultBehaviour) {
    var maxRecordsPerPage = 200;
    $scope.sessionName = $location.search().sn;
    $scope.vaultId = $location.search().id;
    $scope.logs = [];
    $scope.vaultBehaviour = vaultBehaviour;
    $scope.asOfDate = new Date();
    $scope.searchText = '';
    $scope.paging = { pageNumber: 0, max: maxRecordsPerPage, hasMore: true, canPage: true };
    var reactLogsCollectionItem;
    var timeoutPromise;
    var searchVal = null;
    var reset = function() {
      $scope.paging = { pageNumber: 0, max: maxRecordsPerPage, hasMore: true, canPage: true };
      $scope.logs = [];
    };
    var refreshLogsCollection = function() {
      if (reactLogsCollectionItem && reactLogsCollectionItem.isMounted()) {
        reactLogsCollectionItem.setState({});
      }
    };
    $scope.setReactLogsCollectionItem = function(reactItem) {
      reactLogsCollectionItem = reactItem;
    };
    $scope.$watch('searchText', function(newValue, oldValue) {
      if (!newValue && !oldValue) {
        return;
      }
      var Search = function(searchText) {
        timeoutPromise = null;
        var execute = function() {
          if (searchText !== searchVal) {
            reset();
          }
          searchVal = searchText;
          $scope.loadNextPage(true);
        };
        return execute;
      };
      if (timeoutPromise) {
        $timeout.cancel(timeoutPromise);
      }
      timeoutPromise = $timeout(new Search(newValue), 500);
    });
    $scope.loadNextPage = function(forceReload) {
      if ($scope.paging.canPage) {
        $scope.paging.canPage = false;
        var url = '/backend/history?&max=' + $scope.paging.max + '&page=' + ($scope.paging.pageNumber++) +
          '&vaultId=' + $scope.vaultId + '&sn=' + $scope.sessionName;
        if (searchVal) {
          url += '&searchVal=' + searchVal;
        }
        $http({ url: url, method: 'GET' })
          .success(function(data) {
            var retrievedLogs = data;
            for (var i = 0; i < retrievedLogs.length; ++i) {
              retrievedLogs[i].ts = $filter('date')(new Date(retrievedLogs[i].ts), 'MMM dd yy HH:mm.ss.sss');
              retrievedLogs[i].logIndex = new Date().getTime() + (Math.random() * 100).toFixed(3);
            }
            if (retrievedLogs.length < maxRecordsPerPage) {
              $scope.paging.hasMore = false;
            }
            $scope.logs = $scope.logs.concat(retrievedLogs);
            $scope.paging.canPage = true;
            if (forceReload) {
              refreshLogsCollection();
            }
          })
          /* jshint unused:false */
          .error(function(data, status, headers, config) {
            $scope.paging.hasMore = false;
          });
        /* jshint unused:true */
      }
    };
  }
]);
