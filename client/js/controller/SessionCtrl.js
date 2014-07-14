var SessionCtrl = [
  '$scope', '$http', 'socketService', function($scope, $http, socketService) {

    $scope.sessionId = '';
    $scope.sessionName = '';
    $scope.activeSessions = [];
    $scope.pendingSessions = [];
    $scope.isCreateSessionTabOpen = false;
    $scope.isCreateSessionInputRequired = true;
    $scope.createSessionErrorMessage = '';
    $scope.isConfirmDeleteDialogOpen = {};
    $scope.alert = null;

    socketService.setSignalListner(function(signal) {
      if (signal == 'REFRESH_SESSIONS') {
        console.log('received refresh');
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
      $http.get('/currentSessions').then(function(result) {
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

    refreshCurrentSessions();

    function cancelEventPropagation(event) {
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }
    }

    $scope.importLogs = function() {
      window.open("/client/template/import.html", "", "width=500, height=200, location=no, top=200px, left=500px");
    };
    $scope.openViewer = function(sessionName) {
      window.location.href = "/client/viewer#?sn=" + sessionName;
    };
    $scope.deleteSession = function(sessionName, event) {
      cancelEventPropagation(event);
      var endPoint = '/deleteSession';
      for (var i in $scope.pendingSessions) {
        if ($scope.pendingSessions[i].session_name == sessionName) {
          endPoint = '/deletePendingSession';
          break;
        }
      }
      $http.get(endPoint + '?sn=' + sessionName).success(refreshCurrentSessions).error($scope.setStatusAlert);
    };

    $scope.clearPendingSessions = function() {
      $http.get('/clearAllPendingSessions').success(refreshCurrentSessions).error($scope.setStatusAlert);
    };

    $scope.createSession = function() {
      if (!$scope.createSessionForm.focus.$valid) {
        return;
      }

      $http({
        url: ("/createSession"),
        method: "POST",
        data: { 'session_name': $scope.sessionName },
        headers: { 'Content-Type': 'application/json' }
      }).success(function(data) {
        $scope.sessionId = data;
        $scope.isCreateSessionInputRequired = false;
      }).error(function(err) {
        $scope.createSessionErrorMessage = err;
      });
    };
    $scope.validateFormInput = function(ngModelController) {
      if ($scope.createSessionErrorMessage != '' || ngModelController.$invalid) {
        return "invalid-input";
      }

      return "valid-input";
    };
    $scope.onCreateSessionTabClicked = function() {
      $scope.isCreateSessionTabOpen = !$scope.isCreateSessionTabOpen;
      if (!$scope.isCreateSessionTabOpen) {
        $scope.isCreateSessionInputRequired = true;
        $scope.sessionName = '';
        $scope.createSessionErrorMessage = '';
        $scope.createSessionForm.$setPristine();
      }
    };
    $scope.onDeleteSessionClicked = function(sessionName, event) {
      $scope.isConfirmDeleteDialogOpen[sessionName] = !$scope.isConfirmDeleteDialogOpen[sessionName];
      cancelEventPropagation(event);
    };
  }
];