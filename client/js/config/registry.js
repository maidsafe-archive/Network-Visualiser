var app = angular.module('MaidSafe', []);


app.service('dataManager', DataManagerService)
app.service('vaultBehaviour', VaultBehaviourService)

app.controller('ApplicationCtrl', ApplicationCtrl);
app.controller('VaultCtrl', VaultCtrl);


