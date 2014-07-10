var app = angular.module('MaidSafe', ['ui-rangeSlider']).run([
  '$rootScope', '$location', function($rootScope, $location) {
    $rootScope.socketEndPoint = "http://" + $location.host() + ":" + socketPort;
  }
]);

app.directive('tooltip', ToolTip);
app.service('dataManager', DataManagerService);
app.service('vaultBehaviour', VaultBehaviourService);
app.service('socketService', SocketService);
app.service('playbackService', PlaybackService);
app.controller('applicationCtrl', ApplicationCtrl);
app.controller('vaultCtrl', VaultCtrl);
app.controller('historyCtrl', HistoryCtrl);
app.controller('timelineCtrl', TimelineCtrl);
app.controller('sessionCtrl', SessionCtrl);