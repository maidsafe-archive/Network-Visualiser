var VaultManagerService = [
  '$rootScope', '$filter', '$timeout', 'dataManager', 'vaultBehaviour', function($rootScope, $filter, $timeout, dataManager, vaultBehaviour) {

    var service = this;
    var reactVaultCollectionItem = null;
    var PERSONA_COLOUR_TAG = "persona_";

    service.vaultBehaviour = vaultBehaviour;
    service.vaultCollection = [];

    var refreshVaultCollection = function() {
      if (reactVaultCollectionItem) {
        reactVaultCollectionItem.setState({});
      }
    };

    service.addVault = function(vault) {
      var newVault = new VaultInfo();
      newVault.init(vault);
      service.vaultCollection.push(newVault);
    };
    service.setReactVaultCollectionItem = function(reactItem) {
      reactVaultCollectionItem = reactItem;
    };
    service.expandAllVaultLogs = function(expand) {
      for (var index in service.vaultCollection) {
        service.vaultCollection[index].toggleVaultLogs(expand);
      }
      refreshVaultCollection();
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
      vault.isActive = false;
      vault.flagClearedIcons = false;
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
        vault.flagClearedIcons = false;
        if (timeoutPromise) {
          $timeout.cancel(timeoutPromise);
        }

        timeoutPromise = $timeout(function() {
          if (!$rootScope.playerPaused) {
            vault.flagClearedIcons = true;
            updateIcons(0);
            vault.personaColour = PERSONA_COLOUR_TAG + 'na';
            vault.subscriber = null;
            vault.counter = null;
            refreshVaultDisplay();
          }
        }, 5000);
      };
      var updateFromQueue = function() {
        var logs = dataManager.getLogsFromQueue(vault.vaultName);
        for (var index in logs) {
          logReceived(logs[index], true);
        }
      };
      var refreshVaultDisplay = function() {
        if (reactVaultItem) {
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
      vault.lastLog = function() {
        return vault.logs.length > 0 ? vaultBehaviour.formatMessage(vault.logs[vault.logs.length - 1]) : "";
      };
      vault.isToolTipEnabled = function(iconShape) {
        if (vault.flagClearedIcons || !vault.logs || vault.logs.length <= 0) {
          return false;
        } else {
          return vaultBehaviour.canShowToolTip(iconShape, vault.logs[vault.logs.length - 1].action_id);
        }
      };
    };
  }
]