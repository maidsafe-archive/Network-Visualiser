/* global window:false */
var app = window.angular.module('MaidSafe', []);
app.run([
  '$rootScope', '$location', function($rootScope, $location) {
    $rootScope.socketEndPoint = 'http://' + $location.host() + ':' + window.socketPort;
    $rootScope.sessionName = $location.search().sn;
  }
]);
app.service('socketService', window.ConnectionMapSocketService);
app.service('connectionMapStatus', window.ConnectionMapStatus);
app.service('d3Transformer', window.Transform);
app.service('dataService', window.ConnectionMapDataService);
app.controller('connectionMapCtrl', [
  '$scope', '$timeout', '$filter', '$rootScope', 'dataService', 'connectionMapStatus', 'socketService',
  function($scope, $timeout, $filter, $rootScope, dataService, mapStatus, socketService) {
    $scope.keyTrayClosed = false;
    $scope.currentTime = '';
    $scope.toggleKeyTray = function() {
      $scope.keyTrayClosed = !$scope.keyTrayClosed;
    };
    var clockTimer = function() {
      $scope.currentTime = $filter('date')(new Date(), 'dd/MM/yyyy HH:mm:ss');
      $timeout(clockTimer, 1000);
    };
    if (!$rootScope.sessionName) {
      console.error('Session Name not found');
      return;
    }
    socketService.connectToChannel($rootScope.sessionName);
    dataService.getConnectionMapSnapshot($rootScope.sessionName).then(function(data) {
      mapStatus.setSnapshot(data);
    }, function(err) {
      console.error('%s %s', new Date().toISOString(), err);
    });
    $timeout(function() {
      clockTimer();
    }, 10);
  }
]);
