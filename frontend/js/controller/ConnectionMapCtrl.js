/**
 * Created by krishnakumarp on 29-09-2014.
 */

var app = angular.module('MaidSafe', ['ngReact']);

app.controller('connectionMapCtrl', ['$scope', '$location', function ($scope, $location) {
    $scope.sessionName = $location.search().sn;
    $scope.iconsTrayClosed = true;
    $scope.currentTime = new Date();
    $scope.vaultsCount = 10;

    $scope.toggleIconsTray = function () {
        $scope.iconsTrayClosed = !$scope.iconsTrayClosed;
    };
}]);
