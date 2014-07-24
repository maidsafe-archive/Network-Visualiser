var app = angular.module('MaidSafe', ['ui-rangeSlider', 'angularFileUpload']);

app.run([
  '$rootScope', '$location', function($rootScope, $location) {
    $rootScope.socketEndPoint = "http://" + $location.host() + ":" + socketPort;
  }
]);

app.directive('tooltip', ToolTip);
app.directive('fileDialog', FileDialog);
app.directive('clipCopy', ClipCopy);
app.service('dataManager', DataManagerService);
app.service('vaultBehaviour', VaultBehaviourService);
app.service('socketService', SocketService);
app.service('playbackService', PlaybackService);
app.controller('applicationCtrl', ApplicationCtrl);
app.controller('vaultCtrl', VaultCtrl);
app.controller('historyCtrl', HistoryCtrl);
app.controller('timelineCtrl', TimelineCtrl);
app.controller('sessionCtrl', SessionCtrl);
app.controller('searchCtrl', SearchCtrl);