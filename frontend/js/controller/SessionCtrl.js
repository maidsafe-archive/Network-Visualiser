/* global window:false */

var app = window.angular.module('MaidSafe', ['angularFileUpload']);
app.run([
  '$rootScope', '$location', function($rootScope, $location) {
    $rootScope.socketEndPoint = 'http://' + $location.host() + ':' + window.socketPort;
  }
]);
app.directive('fileDialog', window.FileDialog);
app.directive('clipCopy', window.ClipCopy);
app.service('socketService', window.SocketService);
app.service('sessionHelper', window.SessionHelper);
app.service('sessionEvents', window.SessionEvents);
app.controller('sessionCtrl', [
  '$scope', '$window', '$http', 'socketService', 'sessionHelper', 'sessionEvents',
  function($scope, $window, $http, socketService, sessionHelper, sessionEvents) {
    $scope.userInfo = {};
    $scope.activeSessions = [];
    $scope.pendingSessions = [];
    $scope.exportStatus = {};
    $scope.alert = null;
    $scope.sessionNamePattern = /^[a-zA-Z0-9- ]{1,}$/;
    $scope.createTab = {
      sessionName: '',
      sessionId: '',
      isOpen: false,
      inputRequired: true,
      errorMessage: '',
      isValid: null
    };
    $scope.importTab = {
      sessionName: '',
      file: null,
      fileError: '',
      sessionId: '',
      isOpen: false,
      errorMessage: '',
      inProgress: null,
      resetInputFile: false
    };
    $scope.init = function(user) {
      $scope.userInfo = JSON.parse(JSON.stringify(user));
      if ($scope.userInfo.invalidAuthMessage) {
        $scope.setStatusAlert($scope.userInfo.invalidAuthMessage);
      }
    };
    $scope.onGoogleSignInClicked = function() {
      window.location.href = '/auth/google';
    };
    $scope.onGitHubSignInClicked = function() {
      window.location.href = '/auth/github';
    };
    $scope.testnetStatus = function() {
      window.open('/testnet-status', '_blank').focus();
    };
    $scope.openViewer = function(sessionName) {
      window.location.href = '/viewer#?sn=' + sessionName;
    };
    sessionHelper.bindScope($scope);
    sessionEvents.bindEventsForScope($scope);
    sessionHelper.refreshCurrentSessions();
    socketService.setSignalListener(sessionHelper.onSignalReceived);
    $scope.setStatusAlert = function(msg) {
      $scope.alert = msg;
      setTimeout(function() {
        $scope.alert = null;
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      }, 5000);
    };
  }
]);
