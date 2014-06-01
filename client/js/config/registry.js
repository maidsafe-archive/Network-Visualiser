var app = angular.module('MaidSafe', []).run(['$rootScope', function($rootScope){
	$rootScope.socketEndPoint = "http://localhost:8081"
}]);

app.directive('tooltip', ToolTip);

app.service('dataManager', DataManagerService)
app.service('vaultBehaviour', VaultBehaviourService)
app.service('socketService', SocketService)

app.controller('ApplicationCtrl', ApplicationCtrl);
app.controller('VaultCtrl', VaultCtrl);
