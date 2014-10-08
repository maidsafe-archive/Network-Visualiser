/* global window:false */

window.SessionHelper = [ '$window', '$http', function($window, $http) {
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
} ];
