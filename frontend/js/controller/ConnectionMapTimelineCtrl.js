/* global window:false */
var app = window.angular.module('MaidSafe', [ 'ui-rangeSlider', 'ngReact' ]);
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
app.service('playBackService', window.PlaybackDataService);
app.service('player', window.PlayerService);
app.controller('connectionMapTimelineCtrl', [
  '$scope', '$timeout', '$filter', '$rootScope', 'dataService', 'connectionMapStatus', 'socketService',
  'playBackService', 'player',
  function($scope, $timeout, $filter, $rootScope, dataService, mapStatus, socketService, playBackService, player) {
    $scope.PLAYER_STATE = { PLAYING: 'playing', STOPPED: 'stopped', PAUSED: 'pause' };
    $scope.playerState = $scope.PLAYER_STATE.STOPPED;
    $scope.playback; // this variable is used to bing the player state on to the UI
    $scope.maxTime = new Date();
    $scope.conMapStatus = 2;
    $scope.keyTrayClosed = false;
    $scope.connections = [];
    $scope.vaultsCount = 0;
    $scope.player = player;
    $scope.toggleKeyTray = function() {
      $scope.keyTrayClosed = !$scope.keyTrayClosed;
    };
   // player.watchState($scope.playback.currentState);
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
    var onSnapShotChange = function(data) {
      $scope.connections = data;
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
    mapStatus.onStatusChange(function(trasformedData) {
      $scope.connections = trasformedData;
      reactComponent.setState({});
    });
    playBackService.setSnapShotHandler(dataService.getConnectionMapSnapshot);
    playBackService.setBufferedDataHandler(dataService.getConnectionMapDiff);
    player.onSnapShotChange(onSnapShotChange);
    socketService.connectToChannel($rootScope.sessionName);
    $timeout(function() {
      clockTimer();
    }, 10);
    window.player = player;
    window.sessionName = $rootScope.sessionName;
    player.init($rootScope.sessionName, $scope);
    $scope.$watch(function() {
      return mapStatus.vaultsCount;
    }, function(newValue) {
      $scope.vaultsCount = newValue ;
    });
  }
]);
