/* global window:false */

window.DataManagerService = [
  '$http', '$rootScope', 'socketService', function($http, $rootScope, socketService) {
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
    var addLogToPool = function(log, initialLoad) {
      // jshint camelcase:false
      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      if (!vaultsInDisplay.hasOwnProperty(log.vaultId)) {
        vaultsInDisplay[ log.vaultId ] = { pushLog: null, queue: [] };
        newVaultObserver({ vaultId: log.vaultId });
      }
      // Temporary Queue to hold logs until the vault has not registered for receiving logs
      if (vaultsInDisplay[log.vaultId].pushLog) {
        vaultsInDisplay[log.vaultId].pushLog(log, initialLoad);
      } else {
        vaultsInDisplay[log.vaultId].queue.push(log);
        // jshint camelcase:true
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
      }
    };
    var activeVaults = function(time) {
      var addLog = function(vault) {
        var logs = vault.logs.reverse();
        for (var index in logs) {
          if (logs[index]) {
            // jshint camelcase:false
            // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
            logs[index].vaultIdFull = vault.vaultIdFull;
            logs[index].hostName = vault.hostName;
            // jshint camelcase:true
            // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
            addLogToPool(logs[index], time == null);
          }
        }
      };
      $http.get('/backend/vaults?' +
        ('sn=' + $rootScope.sessionName) + (time ? ('&ts=' + time) : '')).then(function(result) {
          var vaults = result.data;
          for (var key in vaults) {
            if (vaults[key].logs && vaults[key].logs.length > 0) {
              if (vaults[key]) {
                addLog(vaults[key]);
              }
            }
          }
          if (vaultsLoadedObserver) {
            vaultsLoadedObserver(time);
          }
        },
        // jshint unused:false
        function(err) {
          vaultsLoadedObserver();
        });
      // jshint unused:true
    };
    var getLogsFromQueue = function(vaultId) {
      var logs = vaultsInDisplay[vaultId].queue;
      vaultsInDisplay[vaultId].queue = [];
      return logs;
    };
    var setLogListner = function(vaultId, callback) {
      vaultsInDisplay[vaultId].pushLog = callback;
    };
    socketService.setLogListener(addLogToPool);
    this.getActiveVaults = activeVaults;
    this.pushLog = addLogToPool;
    this.getLogsFromQueue = getLogsFromQueue;
    this.setLogListener = setLogListner;
    this.clearState = clear;
  }
];
