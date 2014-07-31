var DataManagerService = [
  '$http', '$rootScope', function($http, $rootScope) {

    var vaultLogPool, vaults;
    var addLogToPool;
    var newVaultObserver;
    var vaultsInDisplay = {};
    var vaultsLoadedObserver;
    var clear = function() {
      vaultsInDisplay = {};
    };
    this.onNewVault = function(callback) {
      newVaultObserver = callback;
    };
    this.onVaultsLoaded = function(callback) {
      vaultsLoadedObserver = callback;
    };
    addLogToPool = function(log, initialLoad) {
      if (!vaultsInDisplay.hasOwnProperty(log.vault_id)) {
        vaultsInDisplay[log.vault_id] = { pushLog: null, queue: [] };
        newVaultObserver({ vault_id: log.vault_id });
      }
      //Temporary Queue to hold logs until the vault has not registered for receiving logs
      if (vaultsInDisplay[log.vault_id].pushLog) {
        vaultsInDisplay[log.vault_id].pushLog(log, initialLoad);
      } else {
        vaultsInDisplay[log.vault_id].queue.push(log);
      }
    };
    var activeVaults = function(time) {
      $http.get('/backend/vaults?' + ('sn=' + $rootScope.sessionName) + (time ? ('&ts=' + time) : '')).then(function(result) {
        var vaults = result.data;
        for (var key in vaults) {
          if (vaults[key].logs && vaults[key].logs.length > 0) {
            var logs = vaults[key].logs.reverse();
            for (var index in logs) {
              logs[index].vault_id_full = vaults[key].vault_id_full;
              logs[index].host_name = vaults[key].host_name;
              addLogToPool(logs[index], time == null);
            }
          }
        }
        if (vaultsLoadedObserver) {
          vaultsLoadedObserver(time);
        }
      }, function(err) {
        vaultsLoadedObserver();
      });
    };
    var getLogsFromQueue = function(vaultId) {
      var logs = vaultsInDisplay[vaultId].queue;
      vaultsInDisplay[vaultId].queue = [];
      return logs;
    };
    var setLogListner = function(vaultId, callback) {
      vaultsInDisplay[vaultId].pushLog = callback;
    };
    this.getActiveVaults = activeVaults;
    this.pushLog = addLogToPool;
    this.getLogsFromQueue = getLogsFromQueue;
    this.setLogListner = setLogListner;
    this.clearState = clear;
  }
]