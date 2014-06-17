var HistoryCtrl = [
  '$scope', '$location', '$http', 'vaultBehaviour', function($scope, $location, $http, vaultBehaviour) {
    $scope.vaultId = $location.search().id;
    $scope.logs = [];
    $scope.vaultBehaviour = vaultBehaviour;
    $scope.asOfDate = new Date();
    $http({ url: ("/history?&max=-1&vault_id=" + $scope.vaultId), method: "GET" }).success(function(data) {
      $scope.logs = data;
    });
  }
];