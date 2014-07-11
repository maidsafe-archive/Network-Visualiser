var SessionCtrl = [
  '$scope', '$http', function($scope, $http) {
    $scope.sessionId = '';
    $scope.sessionName = '';
    $scope.activeSessions = [];
    $scope.isCreateSessionTabOpen = false;
    $scope.isCreateSessionInputRequired = true;
    $scope.createSessionErrorMessage = '';

    $http.get('/currentActiveSessions').then(function(result) {
      $scope.activeSessions = result.data;
    });

    $scope.createSession = function() {
      if (!$scope.createSessionForm.focus.$valid)
        return;
      console.log("--> Submitting form with Name: " + $scope.sessionName);
      $http({
        url: ("/createSession"),
        method: "POST",
        data: { 'session_name': $scope.sessionName },
        headers: {'Content-Type': 'application/json'}
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
  }
];