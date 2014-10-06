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
app.service('sessionHelper', ['$window', '$http', function($window, $http) {
  var $scope;
  var instance = this;
  instance.onSignalReceived = function(signal) {
    if (signal === 'REFRESH_SESSIONS') {
      instance.refreshCurrentSessions();
      return;
    }
  };
  var caseInsensitiveCompare = function(a, b) {
    // jshint camelcase:false
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    return a.session_name.toLowerCase().localeCompare(b.session_name.toLowerCase());
    // jshint camelcase:true
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
  };
  var mergeAndRemoveSessions = function(a, b) {
    var result = [];
    while (b.length > 0) {
      if (a.length === 0) {
        result.push(b.shift());
        continue;
      }
      var compareResult = caseInsensitiveCompare(a[0], b[0]);
      if (compareResult < 0) {
        a.shift();
      } else if (compareResult > 0) {
        result.push(b.shift());
      } else {
        result.push(a.shift());
        b.shift();
      }
    }
    return result;
  };
  instance.refreshCurrentSessions = function() {
    $http.get('/backend/currentSessions').then(function(result) {
      // jshint camelcase:false
      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      var newActiveSessions = result.data.filter(function(item) {
        return item.is_active;
      }).sort(caseInsensitiveCompare);
      var newPendingSessions = result.data.filter(function(item) {
        return !item.is_active;
      }).sort(caseInsensitiveCompare);
      // jshint camelcase:true
      // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
      var currentActiveSessions = $scope.activeSessions;
      var currentPendingSessions = $scope.pendingSessions;
      $scope.activeSessions = mergeAndRemoveSessions(currentActiveSessions, newActiveSessions);
      $scope.pendingSessions = mergeAndRemoveSessions(currentPendingSessions, newPendingSessions);
    }, function() {
      $scope.activeSessions = [];
      $scope.pendingSessions = [];
      $scope.setStatusAlert('No Current Sessions');
    });
  };
  instance.updateWindowClickEvent = function() {
    $window.onclick = null;
    if ($scope.createTab.isOpen) {
      $window.onclick = function() {
        $window.onclick = null;
        $scope.onCreateSessionTabClicked();
        $scope.$apply();
      };
    } else if ($scope.importTab.isOpen) {
      $window.onclick = function(event) {
        if (event.target.nodeName === 'INPUT' && event.target.type === 'file') {
          return;
        }
        $window.onclick = null;
        $scope.onImportSessionTabClicked();
        $scope.$apply();
      };
    }
  };
  instance.bindScope = function(scope) {
    $scope = scope;
  };
}]);
app.service('sessionEvents', ['$http', '$upload', 'sessionHelper', function($http, $upload, sessionHelper) {
  var instance = this;
  instance.bindEventsForScope = function($scope) {
    $scope.deleteSession = function(session) {
      session.isConfirmInProgress = true;
      var onError = function(errorMessage) {
        $scope.setStatusAlert(errorMessage);
        session.isConfirmDialogOpen = false;
        session.isConfirmInProgress = false;
      };
      // jshint camelcase:false
      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      var endPoint = session.is_active ? '/backend/deleteActiveSession' : '/backend/deletePendingSession';
      $http.get(endPoint + '?sn=' + session.session_name).error(onError);
      // jshint camelcase:true
      // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    };
    $scope.clearSession = function(session) {
      session.isConfirmInProgress = true;
      var onError = function(errorMessage) {
        $scope.setStatusAlert(errorMessage);
        session.isConfirmDialogOpen = false;
        session.isConfirmInProgress = false;
      };
      // jshint camelcase:false
      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      $http.get('/backend/clearActiveSession?sn=' + session.session_name).error(onError);
      // jshint camelcase:true
      // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
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
        data: {'session_name': $scope.createTab.sessionName},
        headers: {'Content-Type': 'application/json'}
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
        data: {sn: $scope.importTab.sessionName},
        file: $scope.importTab.file
      }).then(onSuccess, onError);
    };
  };
}]);
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
