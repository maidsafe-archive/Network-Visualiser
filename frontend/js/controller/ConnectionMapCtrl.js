/* global window:false */
var app = window.angular.module('MaidSafe', [ 'ngReact' ]);
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
    $scope.showStatusButton = false;
    $scope.conMapStatus = 1;
    $scope.keyTrayClosed = false;
    $scope.currentTime = '';
    $scope.connections = [];
    $scope.vaultsCount = 0;
    $scope.showViewer = function() {
      window.location.href = '/viewer#?sn=' + $rootScope.sessionName;
    };
    $scope.toggleKeyTray = function() {
      $scope.keyTrayClosed = !$scope.keyTrayClosed;
    };
    $scope.showTimeline = function() {
      window.location.href = '/connectionmaptimeline#?sn=' + $rootScope.sessionName;
    };
    $scope.zoom = function(zoomFactor) {
      var text;
      var scaleIndex;
      var scale;
      var svg;
      svg = window.d3.select('svg g');
      text = svg.attr('transform');
      scaleIndex = text.indexOf('scale');
      if (scaleIndex > -1) {
        scale = parseFloat(text.substring(scaleIndex + 6, text.length - 1)) + zoomFactor;
        svg.attr('transform', text.substring(0, scaleIndex) + 'scale(' + scale + ')');
        return;
      }
      scale = 1 + zoomFactor;
      svg.attr('transform', text + 'scale(' + scale + ')');
    };
    var reactComponent;
    var clockTimer = function() {
      $scope.currentTime = $filter('date')(new Date(), 'dd/MM/yyyy HH:mm:ss');
      $timeout(clockTimer, 1000);
    };
    if (!$rootScope.sessionName) {
      console.error('Session Name not found');
      return;
    }
    $scope.registerReactComponent = function(reactComp) {
      reactComponent = reactComp;
    };
    $scope.changeConnectionStatus = function(mode) {
      $scope.conMapStatus = mode;
      window.connectionMapEvents.setMode(mode);
    };
    mapStatus.onStatusChange(function(transformedData) {
      $scope.connections = transformedData;
      reactComponent.setState({});
      window.connectionMapEvents.onNodeTextClicked(function(clicked) {
        $scope.showStatusButton = clicked;
      });
    });
    socketService.connectToChannel($rootScope.sessionName);
    dataService.getConnectionMapSnapshot($rootScope.sessionName).then(function(data) {
      mapStatus.setSnapshot(data);
    }, function(err) {
      console.error('%s %s', new Date().toISOString(), err);
    });
    $timeout(function() {
      clockTimer();
    }, 10);
    $scope.$watch(function() {
      return mapStatus.vaultsCount;
    }, function(newValue) {
      $scope.vaultsCount = newValue ;
    });
  }
]);
