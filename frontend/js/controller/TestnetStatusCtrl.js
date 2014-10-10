/* global window:false */

var app = window.angular.module('MaidSafe', []);
app.run([
  '$rootScope', '$location', function($rootScope, $location) {
    $rootScope.socketEndPoint = 'http://' + $location.host() + ':' + window.socketPort;
  }
]);
app.service('socketService', window.SocketService);
app.controller('testnetStatusCtrl', [
  '$scope', '$http', 'socketService', function($scope, $http, socketService) {
    $scope.testnetStatus = {};
    socketService.setTestnetStatusListener(function(data) {
      $scope.testnetStatus = data;
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });
    $http.get('/backend/testnetStatus').then(function(res) {
      $scope.testnetStatus = res.data;
    }, function() {
      $scope.testnetStatus = {
        // jshint camelcase:false
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        isReady: false,
        lastUpdated: new Date().toISOString()
        // jshint camelcase:true
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
      };
    });
  }
]);
