var app = angular.module('MaidSafe', ['angularFileUpload']);

app.run([
  '$rootScope', '$location', function($rootScope, $location) {
    $rootScope.socketEndPoint = "http://" + $location.host() + ":" + socketPort;
  }
]);

app.directive('fileDialog', FileDialog);
app.directive('clipCopy', ClipCopy);
app.service('dataManager', DataManagerService);
app.service('socketService', SocketService);

app.controller('sessionCtrl', [
  '$scope', '$http', '$upload', 'socketService', function($scope, $http, $upload, socketService) {

    $scope.userInfo = {};
    $scope.activeSessions = [];
    $scope.pendingSessions = [];
    $scope.isConfirmDeleteDialogOpen = {};
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

    socketService.setSignalListner(function(signal) {
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

    function refreshCurrentSessions() {
      $http.get('/backend/currentSessions').then(function(result) {
        $scope.activeSessions = result.data.filter(function(item) {
          return item.is_active;
        });
        $scope.pendingSessions = result.data.filter(function(item) {
          return !item.is_active;
        });
      }, function(err) {
        $scope.activeSessions = {};
        $scope.pendingSessions = {};
        $scope.setStatusAlert('No Current Sessions');
      });
    };

    function cancelEventPropagation(event) {
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }
    }

    $scope.onSignInClicked = function() {
      window.location.href = "/auth/google";
    };
    $scope.importLogs = function() {
      window.open("/client/template/import.html", "", "width=500, height=200, location=no, top=200px, left=500px");
    };
    $scope.openViewer = function(sessionName) {
      window.location.href = "/viewer#?sn=" + sessionName;
    };
    $scope.deleteSession = function(sessionName, event) {
      cancelEventPropagation(event);
      var endPoint = '/backend/deleteActiveSession';
      for (var i in $scope.pendingSessions) {
        if ($scope.pendingSessions[i].session_name == sessionName) {
          endPoint = '/backend/deletePendingSession';
          break;
        }
      }
      $http.get(endPoint + '?sn=' + sessionName).success(function() {
        delete $scope.isConfirmDeleteDialogOpen[sessionName];
        refreshCurrentSessions();
      }).error(function(errorMessage) {
        $scope.setStatusAlert(errorMessage);
        $scope.isConfirmDeleteDialogOpen[sessionName] = false;
      });
    };
    $scope.onDeleteSessionClicked = function(sessionName, event) {
      $scope.isConfirmDeleteDialogOpen[sessionName] = !$scope.isConfirmDeleteDialogOpen[sessionName];
      cancelEventPropagation(event);
    };

    $scope.onCreateSessionTabClicked = function() {
      $scope.importTab.isOpen = false;
      $scope.createTab.isOpen = !$scope.createTab.isOpen;
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