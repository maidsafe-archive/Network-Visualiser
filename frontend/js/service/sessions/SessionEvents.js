/* global window:false */

window.SessionEvents = [ '$http', '$upload', 'sessionHelper', function($http, $upload, sessionHelper) {
  var instance = this;
  instance.bindEventsForScope = function($scope) {
    $scope.deleteSession = function(session) {
      session.isConfirmInProgress = true;
      var onError = function(errorMessage) {
        $scope.setStatusAlert(errorMessage);
        session.isConfirmDialogOpen = false;
        session.isConfirmInProgress = false;
      };
      var endPoint = session.isActive ? '/backend/deleteActiveSession' : '/backend/deletePendingSession';
      $http.get(endPoint + '?sn=' + session.sessionName).error(onError);
    };
    $scope.clearSession = function(session) {
      session.isConfirmInProgress = true;
      var onError = function(errorMessage) {
        $scope.setStatusAlert(errorMessage);
        session.isConfirmDialogOpen = false;
        session.isConfirmInProgress = false;
      };
      $http.get('/backend/clearActiveSession?sn=' + session.sessionName).error(onError);
    };
    $scope.onCreateSessionTabClicked = function() {
      if ($scope.importTab.isOpen) {
        $scope.onImportSessionTabClicked();
      }
      $scope.createTab.isOpen = !$scope.createTab.isOpen;
      sessionHelper.updateWindowClickEvent();
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
      var onSuccess = function(result) {
        $scope.exportStatus[sessionName].status = 'download';
        $scope.exportStatus[sessionName].fname = result.data;
      };
      var onError = function() {
        $scope.setStatusAlert('Prepare Export Failed');
        $scope.exportStatus[sessionName].status = 'ready';
      };
      $scope.exportStatus[sessionName].status = 'progress';
      $http.get('/backend/requestExport?sn=' + sessionName).then(onSuccess, onError);
    };
    $scope.onDownloadExportClicked = function(sessionName) {
      window.open('/backend/downloadExport?sn=' +
        sessionName + '&fname=' + $scope.exportStatus[sessionName].fname, '_blank');
      $scope.exportStatus[sessionName].status = 'ready';
      $scope.exportStatus[sessionName].fname = '';
    };
    $scope.onImportSessionTabClicked = function() {
      if ($scope.createTab.isOpen) {
        $scope.onCreateSessionTabClicked();
      }
      $scope.importTab.isOpen = !$scope.importTab.isOpen;
      sessionHelper.updateWindowClickEvent();
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
      var onSuccess = function(data) {
        $scope.createTab.sessionId = data;
        $scope.createTab.inputRequired = false;
      };
      var onError = function(err) {
        $scope.createTab.errorMessage = err;
      };
      $http({
        url: '/backend/createSession',
        method: 'POST',
        data: { 'sessionName': $scope.createTab.sessionName },
        headers: { 'Content-Type': 'application/json' }
      }).success(onSuccess).error(onError);
    };
    $scope.onImportSession = function() {
      $scope.importTab.errorMessage = '';
      $scope.importTab.inProgress = true;
      var onSuccess = function(response) {
        $scope.importTab.inProgress = false;
        $scope.importTab.resetInputFile = true;
        $scope.setStatusAlert(response.data);
        $scope.onImportSessionTabClicked();
      };
      var onError = function(response) {
        $scope.importTab.inProgress = false;
        $scope.importTab.resetInputFile = true;
        $scope.importTab.errorMessage = response.data;
      };
      $scope.upload = $upload.upload({
        url: '/backend/import',
        method: 'POST',
        data: { sn: $scope.importTab.sessionName },
        file: $scope.importTab.file
      }).then(onSuccess, onError);
    };
  };
} ];
