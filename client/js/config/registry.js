var app = angular.module('MaidSafe', []).run(['$rootScope', '$location', function($rootScope, $location){	
	$rootScope.socketEndPoint = "http://" + $location.host() + ":8081"	
}]);

app.directive('tooltip', ToolTip);

app.service('dataManager', DataManagerService)
app.service('vaultBehaviour', VaultBehaviourService)
app.service('socketService', SocketService)

app.controller('applicationCtrl', ApplicationCtrl);
app.controller('vaultCtrl', VaultCtrl);
app.controller('historyCtrl', HistoryCtrl);
