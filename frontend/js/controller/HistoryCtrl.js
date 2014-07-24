var HistoryCtrl = [
  '$scope', '$location', '$http', 'vaultBehaviour', function($scope, $location, $http, vaultBehaviour) {
    $scope.sessionName = $location.search().sn;
    $scope.vaultId = $location.search().id;
    $scope.logs = [];
    $scope.vaultBehaviour = vaultBehaviour;
    $scope.asOfDate = new Date();
    $http({ url: ("/backend/history?&max=-1&vault_id=" + $scope.vaultId + '&sn=' + $scope.sessionName), method: "GET" }).success(function(data) {
      $scope.logs = data;
    });
  }
];