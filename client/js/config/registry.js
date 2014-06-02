var app = angular.module('MaidSafe', []).run(['$rootScope', '$location', function($rootScope, $location){	
	$rootScope.socketEndPoint = "http://" + $location.host() + ":80"	
}]);

app.directive('tooltip', ToolTip);

app.service('dataManager', DataManagerService)
app.service('vaultBehaviour', VaultBehaviourService)
app.service('socketService', SocketService)

app.controller('ApplicationCtrl', ApplicationCtrl);
app.controller('VaultCtrl', VaultCtrl);
