/* global window:false */
window.VaultManagerService = [
  '$rootScope', '$filter', '$timeout', 'dataManager', 'vaultBehaviour',
  function($rootScope, $filter, $timeout, dataManager, vaultBehaviour) {
    var service = this;
    var reactVaultCollectionItem = null;
    var PERSONA_COLOUR_TAG = 'persona_';
    service.vaultBehaviour = vaultBehaviour;
    service.vaultCollection = [];
    var locationOf = function(element, array, comparer, start, end) {
      if (array.length === 0) {
        return -1;
      }
      start = start || 0;
      end = end || array.length;
      var pivot = (start + end) >> 1;
      var c = comparer(element, array[pivot]);
      if (end - start <= 1) {
        return c === -1 ? pivot - 1 : pivot;
      }
      switch (c) {
        case -1:
          return locationOf(element, array, comparer, start, pivot);
        case 0:
          return pivot;
        case 1:
          return locationOf(element, array, comparer, pivot, end);
      }
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
        if (service.vaultCollection[index]) {
          service.vaultCollection[index].toggleVaultLogs(expand);
        }
      }
      service.refreshVaultCollection();
    };
    var VaultInfo = function() {
      var timeoutPromise = null;
      var reactVaultItem = null;
      var logCount = 0;
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
      vault.zeroClipboardObject = null;
      var updateIcons = function(actionId) {
        vault.iconsTray = vaultBehaviour.icons[actionId];
      };
      var logReceived = function(log, initialLoad) {
        log.actionId = parseInt(log.actionId);
        log.personaId = parseInt(log.personaId);
        log.uniqueCount = ++logCount;
        log.formattedTime = $filter('date')(log.ts, 'dd/MM/yyyy HH:mm:ss');
        addLog(log);
        vault.personaColour = PERSONA_COLOUR_TAG + (initialLoad ? 'na' : vaultBehaviour.personas[log.personaId]);
        if (log.actionId === 17) {
          vault.networkHealth = log.valueOne;
        } else {
          vault.subscriber = null;
          vault.counter = null;
          if (!initialLoad) {
            updateIcons(log.actionId);
            vault.alertMessage = vaultBehaviour.alertMessage(log);
          }
        }
        if (!initialLoad) {
          if (log.actionId === 1 || log.actionId === 2) {
            vault.counter = log.valueOne;
          } else if (log.actionId === 6 || log.actionId === 7) {
            vault.subscriber = log.valueOne;
          }
        }
        if (!vault.fullVaultName && (log.actionId === 0 || log.hasOwnProperty('vaultIdFull'))) {
          vault.fullVaultName = log.vaultIdFull || log.valueOne;
        }
        if (!vault.hostName && (log.actionId === 0 || log.hasOwnProperty('hostName'))) {
          vault.hostName = log.hostName || log.valueTwo || '';
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
        vault.isActive = (log.actionId !== 18);
        if (!vault.isActive) {
          vault.networkHealth = 0;
        }
      };
      var resetInActivityMonitor = function() {
        if (timeoutPromise) {
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
        }, 5000);
      };
      var updateFromQueue = function() {
        var logs = dataManager.getLogsFromQueue(vault.vaultName);
        for (var index in logs) {
          if (logs[index]) {
            logReceived(logs[index], true);
          }
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
        vault.stateIcon = vault.logsOpen ? 'arrow-up.png' : 'info.png';
        if (performRefresh) {
          refreshVaultDisplay();
        }
      };
      vault.init = function(vaultData) {
        updateIcons(0);
        vault.vaultName = vaultData.vaultId;
        dataManager.setLogListener(vault.vaultName, logReceived);
        updateFromQueue();
      };
    };
  }
];
