var app = angular.module('MaidSafe', ['angularFileUpload']);

app.run([
  '$rootScope', '$location', function($rootScope, $location) {
    $rootScope.socketEndPoint = "http://" + $location.host() + ":" + socketPort;
  }
]);

app.directive('fileDialog', FileDialog);
app.directive('clipCopy', ClipCopy);
app.service('socketService', SocketService);

app.controller('sessionCtrl', [
  '$scope', '$window', '$http', '$upload', 'socketService', function($scope, $window, $http, $upload, socketService) {

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

    socketService.setSignalListener(function(signal) {
      if (signal == 'REFRESH_SESSIONS') {
        refreshCurrentSessions();
        return;
      }
    });
    $scope.setStatusAlert = function(msg) {
      $scope.alert = msg;
      setTimeout(function() {
        $scope.alert = null;
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      }, 5000);
    };

    var refreshCurrentSessions = function() {
      $http.get('/backend/currentSessions').then(function(result) {
        $scope.activeSessions = result.data.filter(function(item) {
          return item.is_active;
        });
        $scope.pendingSessions = result.data.filter(function(item) {
          return !item.is_active;
        });
      }, function() {
        $scope.activeSessions = {};
        $scope.pendingSessions = {};
        $scope.setStatusAlert('No Current Sessions');
      });
    };

    var updateWindowClickEvent = function () {
      $window.onclick = null;
      if ($scope.createTab.isOpen) {
        $window.onclick = function () {
          $window.onclick = null;
          $scope.onCreateSessionTabClicked();
          $scope.$apply();
        };
      } else if ($scope.importTab.isOpen) {
        $window.onclick = function (event) {
          if (event.target.nodeName === 'INPUT' &&
            event.target.type === 'file') {
            return;
          }

          $window.onclick = null;
          $scope.onImportSessionTabClicked();
          $scope.$apply();
        };
      }
    };

    $scope.onSignInClicked = function() {
      window.location.href = "/auth/google";
    };
    $scope.testnetStatus = function() {
      window.open('/testnet-status', '_blank').focus();
    };
    $scope.openViewer = function(sessionName) {
      window.location.href = "/viewer#?sn=" + sessionName;
    };
    $scope.deleteSession = function(session) {
      session.isDeleteInProgress = true;
      var endPoint = session.is_active ? '/backend/deleteActiveSession' : '/backend/deletePendingSession';
      $http.get(endPoint + '?sn=' + session.session_name).success(refreshCurrentSessions).error(function(errorMessage) {
        $scope.setStatusAlert(errorMessage);
        session.isDeleteDialogOpen = false;
        session.isDeleteInProgress = false;
      });
    };
    $scope.onCreateSessionTabClicked = function() {
      $scope.importTab.isOpen = false;
      $scope.createTab.isOpen = !$scope.createTab.isOpen;
      updateWindowClickEvent();
      if (!$scope.createTab.isOpen) {
        $scope.createTab.inputRequired = true;
        $scope.createTab.sessionName = '';
        $scope.createTab.errorMessage = '';
        $scope.createSessionForm.$setPristine();
      }
    };

    $scope.onExportSessionClicked = function(sessionName) {
      if (!$scope.exportStatus[sessionName]) {
        $scope.exportStatus[sessionName] = {};
      }

      $scope.exportStatus[sessionName].status = 'progress';
      $http.get('/backend/requestExport?sn=' + sessionName).then(function(result) {
        $scope.exportStatus[sessionName].status = 'download';
        $scope.exportStatus[sessionName].fname = result.data;
      }, function() {
        $scope.setStatusAlert('Prepare Export Failed');
        $scope.exportStatus[sessionName].status = 'ready';
      });
    };

    $scope.onDownloadExportClicked = function(sessionName) {
      window.open('/backend/downloadExport?sn=' + sessionName + '&fname=' + $scope.exportStatus[sessionName].fname, '_blank');
      $scope.exportStatus[sessionName].status = 'ready';
      $scope.exportStatus[sessionName].fname = '';
    };

    $scope.onImportSessionTabClicked = function() {
      $scope.createTab.isOpen = false;
      $scope.importTab.isOpen = !$scope.importTab.isOpen;
      updateWindowClickEvent();
      if (!$scope.importTab.isOpen) {
        $scope.importTab.sessionName = '';
        $scope.importTab.file = null;
        $scope.importTab.errorMessage = '';
        $scope.importSessionForm.$setPristine();
      }
    };

    $scope.onCreateSession = function() {
      if (!$scope.createSessionForm.createSessionInput.$valid) {
        return;
      }

      $http({
        url: ("/backend/createSession"),
        method: "POST",
        data: { 'session_name': $scope.createTab.sessionName },
        headers: { 'Content-Type': 'application/json' }
      }).success(function(data) {
        $scope.createTab.sessionId = data;
        $scope.createTab.inputRequired = false;
      }).error(function(err) {
        $scope.createTab.errorMessage = err;
      });
    };

    $scope.onImportSession = function() {
      $scope.importTab.errorMessage = '';
      $scope.importTab.inProgress = true;
      $scope.upload = $upload.upload({
        url: '/backend/import',
        method: 'POST',
        data: { sn: $scope.importTab.sessionName },
        file: $scope.importTab.file,
      }).then(function(response) {
        $scope.importTab.inProgress = false;
        $scope.importTab.resetInputFile = true;
        $scope.setStatusAlert(response.data);
        $scope.onImportSessionTabClicked();
      }, function(response) {
        $scope.importTab.inProgress = false;
        $scope.importTab.resetInputFile = true;
        $scope.importTab.errorMessage = response.data;
      });
    };

    refreshCurrentSessions();
  }
]);