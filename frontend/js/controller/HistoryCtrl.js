/* global window:false */

var app = window.angular.module('MaidSafe', [ 'ngReact' ]);
app.service('vaultBehaviour', window.VaultBehaviourService);
app.controller('historyCtrl', [
  '$scope', '$location', '$http', '$filter', '$timeout' , 'vaultBehaviour',
  function($scope, $location, $http, $filter, $timeout, vaultBehaviour) {
    $scope.sessionName = $location.search().sn;
    $scope.vaultId = $location.search().id;
    $scope.logs = [];
    $scope.vaultBehaviour = vaultBehaviour;
    $scope.asOfDate = new Date();
    $scope.searchText = '';
    var reactLogsCollectionItem;
    var timeoutPromise;
    var refreshLogsCollection = function() {
      if (reactLogsCollectionItem && reactLogsCollectionItem.isMounted()) {
        reactLogsCollectionItem.setState({ renderedItemsCount: 0 });
      }
    };
    $scope.setReactLogsCollectionItem = function(reactItem) {
      reactLogsCollectionItem = reactItem;
    };
    $scope.$watch('searchText', function() {
      if (timeoutPromise) {
        $timeout.cancel(timeoutPromise);
      }
      timeoutPromise = $timeout(function() {
        timeoutPromise = null;
        refreshLogsCollection();
      }, 500);
    });
    $http({ url: '/backend/history?&max=-1&vaultId=' + $scope.vaultId + '&sn=' + $scope.sessionName, method: 'GET' })
      .success(function(data) {
        var retrievedLogs = data;
        for (var i = 0; i < retrievedLogs.length; ++i) {
          retrievedLogs[i].ts = $filter('date')(new Date(retrievedLogs[i].ts), 'MMM dd yy HH:mm.ss.sss');
          retrievedLogs[i].logIndex = i;
        }
        $scope.logs = retrievedLogs;
      });
  }
]);
