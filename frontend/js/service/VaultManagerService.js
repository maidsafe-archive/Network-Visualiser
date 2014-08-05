var VaultManagerService = [
  '$rootScope', '$filter', '$timeout', 'dataManager', 'vaultBehaviour', function($rootScope, $filter, $timeout, dataManager, vaultBehaviour) {

    var service = this;
    var reactVaultCollectionItem = null;
    var PERSONA_COLOUR_TAG = "persona_";

    service.vaultBehaviour = vaultBehaviour;
    service.vaultCollection = [];

    function locationOf(element, array, comparer, start, end) {
      if (array.length === 0)
        return -1;

      start = start || 0;
      end = end || array.length;
      var pivot = (start + end) >> 1;
      var c = comparer(element, array[pivot]);
      if (end - start <= 1) return c == -1 ? pivot - 1 : pivot;
      switch (c) {
        case -1: return locationOf(element, array, comparer, start, pivot);
        case 0: return pivot;
        case 1: return locationOf(element, array, comparer, pivot, end);
      };
    };

    service.refreshVaultCollection = function() {
      if (reactVaultCollectionItem && reactVaultCollectionItem.isMounted()) {
        reactVaultCollectionItem.setState({});
      }
    };
    service.addVault = function(vault) {
      var newVault = new VaultInfo();
      newVault.init(vault);
      var insertIndex = locationOf(newVault, service.vaultCollection, function(leftItem, rightItem) {
        return leftItem.vaultName.localeCompare(rightItem.vaultName);
      });
      service.vaultCollection.splice(insertIndex + 1, 0, newVault);
    };
    service.setReactVaultCollectionItem = function(reactItem) {
      reactVaultCollectionItem = reactItem;
    };
    service.expandAllVaultLogs = function(expand) {
      for (var index in service.vaultCollection) {
        service.vaultCollection[index].toggleVaultLogs(expand);
      }
      service.refreshVaultCollection();
    };

    var VaultInfo = function() {
      var timeoutPromise = null;
      var reactVaultItem = null;
      var vault = this;

      vault.personaColour = PERSONA_COLOUR_TAG + vaultBehaviour.personas[0];
      vault.stateIcon = 'info.png';
      vault.logsOpen = false;
      vault.vaultName = '';
      vault.fullVaultName = '';
      vault.hostName = '';
      vault.logs = [];
      vault.iconsTray = {};
      vault.alertMessage = null;
      vault.isActive = false;
      vault.networkHealth = 0;
      vault.subscriber = null;
      vault.counter = null;

      var updateIcons = function(actionId) {
        vault.iconsTray = vaultBehaviour.icons[actionId];
      };
      var logReceived = function(log, initialLoad) {
        log.formattedTime = $filter('date')(log.ts, 'dd/MM/yyyy HH:mm:ss');
        addLog(log);
        vault.personaColour = PERSONA_COLOUR_TAG + (initialLoad ? 'na' : vaultBehaviour.personas[log.persona_id]);
        if (log.action_id == 17) {
          vault.networkHealth = log.value1;
        } else {
          vault.subscriber = null;
          vault.counter = null;
          if (!initialLoad) {
            updateIcons(log.action_id);
            vault.alertMessage = vaultBehaviour.alertMessage(log);
          }
        }

        if (!initialLoad) {
          if (log.action_id == 1 || log.action_id == 2) {
            vault.counter = log.value1;
          } else if (log.action_id == 6 || log.action_id == 7) {
            vault.subscriber = log.value1;
          }
        }

        if (!vault.fullVaultName && (log.action_id == 0 || log.hasOwnProperty('vault_id_full'))) {
          vault.fullVaultName = log.vault_id_full || log.value1;
        }

        if (!vault.hostName && (log.action_id == 0 || log.hasOwnProperty('host_name'))) {
          vault.hostName = log.host_name || log.value2 || '';
        }

        stateOfVault(log);
        refreshVaultDisplay();
        resetInActivityMonitor();
      };
      var addLog = function(log) {
        if (vault.logs.length >= vaultBehaviour.MAX_LOGS) {
          vault.logs.shift();
        }

        vault.logs.push(log);
      };
      var stateOfVault = function(log) {
        vault.isActive = (log.action_id != 18);
        if (!vault.isActive) {
          vault.networkHealth = 0;
        }
      };
      var resetInActivityMonitor = function() {
        /*if (timeoutPromise) {
          $timeout.cancel(timeoutPromise);
        }

        timeoutPromise = $timeout(function() {
          if (!$rootScope.playerPaused) {
            updateIcons(0);
            vault.alertMessage = null;
            vault.personaColour = PERSONA_COLOUR_TAG + 'na';
            vault.subscriber = null;
            vault.counter = null;
            refreshVaultDisplay();
          } else {
            resetInActivityMonitor();
          }
        }, 5000);*/
      };
      var updateFromQueue = function() {
        var logs = dataManager.getLogsFromQueue(vault.vaultName);
        for (var index in logs) {
          logReceived(logs[index], true);
        }
      };
      var refreshVaultDisplay = function() {
        if (reactVaultItem && reactVaultItem.isMounted()) {
          reactVaultItem.setState({});
        }
      };

      vault.setReactVaultItem = function(reactItem) {
        reactVaultItem = reactItem;
      };
      vault.toggleVaultLogs = function(expand, performRefresh) {
        vault.logsOpen = expand ? expand : !vault.logsOpen;
        vault.stateIcon = vault.logsOpen ? "arrow-up.png" : "info.png";
        if (performRefresh) {
          refreshVaultDisplay();
        }
      };
      vault.init = function(vaultData) {
        updateIcons(0);
        vault.vaultName = vaultData.vault_id;
        dataManager.setLogListner(vault.vaultName, logReceived);
        updateFromQueue();
      };
    };
  }
];