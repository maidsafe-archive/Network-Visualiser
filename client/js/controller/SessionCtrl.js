var SessionCtrl = [
  '$scope', '$http', 'socketService', function($scope, $http, socketService) {

    $scope.sessionId = '';
    $scope.sessionName = '';
    $scope.activeSessions = [];
    $scope.isCreateSessionTabOpen = false;
    $scope.isCreateSessionInputRequired = true;
    $scope.createSessionErrorMessage = '';
    $scope.isConfirmDeleteDialogOpen = {};

    socketService.setSignalListner(function(signal) {
      if (signal == 'REFRESH_SESSIONS') {
        refreshActiveSessions();
        return;
      }
    });

    function refreshActiveSessions() {
      $http.get('/currentActiveSessions').then(function(result) {
        $scope.activeSessions = result.data;
      }, function(err) {
        $scope.activeSessions = {};
      });
    };

    refreshActiveSessions();


    $scope.importLogs = function() {
      window.open("/client/template/import.html", "", "width=500, height=200, location=no, top=200px, left=500px");
    };
    $scope.deleteSession = function(sessionName) {
      $http.get('/deleteSession?sn=' + sessionName);
    };
    $scope.clearPendingSessions = function() {
      $http.get('/clearPendingSessions');
    };

    $scope.createSession = function() {
      if (!$scope.createSessionForm.focus.$valid) {
        return;
      }
      console.log("--> Submitting form with Name: " + $scope.sessionName);
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
        console.log(err);
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
    $scope.onDeleteSessionClicked = function(sessionName) {
      $scope.isConfirmDeleteDialogOpen[sessionName] = !$scope.isConfirmDeleteDialogOpen[sessionName];
    };
  }
];