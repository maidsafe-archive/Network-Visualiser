var VaultManager = [
  '$rootScope', '$filter', 'dataManager', 'vaultBehaviour', function($rootScope, $filter, dataManager, vaultBehaviour) {

    var PERSONA_COLOUR_TAG = "persona_";
    var ICONS_TRAY_SHAPES = { HEXAGON: 0, CIRCLE: 1, SQUARE: 2, DIAMOND: 3 };
    this.vaultBehaviour = vaultBehaviour;
    this.vaultCollection = [];

    this.addVault = function(vault) {
      var newVault = new VaultInfo();
      newVault.init(vault);
      this.vaultCollection.push(newVault);
    };


/*    $scope.$on('expandVault', function(e, v) {
      if (v == $scope.logsOpen) {
        return;
      }
      $scope.toggleVaultLogs(v);
    });


    $scope.lastLog = function() {
      return $scope.logs.length > 0 ? $scope.vaultBehaviour.formatMessage($scope.logs[$scope.logs.length - 1]) : "";
    };



    $scope.isToolTipEnabled = function(shape) {
      if ($scope.flagClearedIcons || !$scope.logs || $scope.logs.length <= 0) {
        return false;
      } else {
        return vaultBehaviour.canShowToolTip(shape, $scope.logs[$scope.logs.length - 1].action_id);
      }
    };*/


    var VaultInfo = function() {
      this.stateIcon = '';
      this.logsOpen = false;
      this.progressLevel = '0%';
      this.vaultName = '';
      this.fullVaultName = '';
      this.hostName = '';
      this.logs = [];
      this.iconsTray = {};
      this.isActive = false;
      this.flagClearedIcons = false;
      this.networkHealth = 0;
      this.subscriber = null;
      this.counter = null;
      this.intervalId = null;
      this.reactItem = null;

      this.refreshItem = function() {
        if (this.reactItem) {
          this.reactItem.setState({ scope: $rootScope });
        }
      };
      this.setReactItem = function(reactItem) {
        this.reactItem = reactItem;
      };

      this.toggleVaultLogs = function() {
        this.logsOpen = !this.logsOpen;
        this.stateIcon = this.logsOpen ? "arrow-up.png" : "info.png";
        this.refreshItem();
      };

      this.init = function(vault) {
        this.updateProgress(0);
        this.stateIcon = "info.png";
        this.logsOpen = false;
        this.vaultName = vault.vault_id;
        this.logs = [];
        this.personaColour = PERSONA_COLOUR_TAG + vaultBehaviour.personas[0];
        this.updateIcons(0);
        dataManager.setLogListner(this.vaultName, this.logReceived.bind(this));
        this.updateFromQueue();
      };

      this.updateProgress = function(progress) {
        this.progressLevel = { width: (progress + '%') };
      };

      this.updateIcons = function(actionId) {
        this.iconsTray = vaultBehaviour.icons[actionId];
      };

      this.logReceived = function(log, initialLoad) {
        log.formattedTime = $filter('date')(log.ts, 'dd/MM/yyyy HH:mm:ss');
        this.addLog(log);
        this.personaColour = PERSONA_COLOUR_TAG + (initialLoad ? 'na' : vaultBehaviour.personas[log.persona_id]);
        if (log.action_id == 17) {
          this.networkHealth = log.value1;
          this.updateProgress(log.value1);
        } else {
          this.subscriber = null;
          this.counter = null;
          if (!initialLoad) {
            this.updateIcons(log.action_id);
          }
        }

        if (!initialLoad) {
          if (log.action_id == 1 || log.action_id == 2) {
            this.counter = log.value1;
          } else if (log.action_id == 6 || log.action_id == 7) {
            this.subscriber = log.value1;
          }
        }

        if (!this.fullVaultName && (log.action_id == 0 || log.hasOwnProperty('vault_id_full'))) {
          this.fullVaultName = log.vault_id_full || log.value1;
        }

        if (!this.hostName && (log.action_id == 0 || log.hasOwnProperty('host_name'))) {
          this.hostName = log.host_name || log.value2 || '';
        }

        this.stateOfVault(log);

        this.refreshItem();
        /*if (!$scope.$$phase) {
          $scope.$apply();
        }*/

        this.resetInActivityMonitor();
      };

      this.addLog = function(log) {
        if (this.logs.length >= vaultBehaviour.MAX_LOGS) {
          this.logs.shift();
        }

        this.logs.push(log);
      };

      this.stateOfVault = function(log) {
        this.isActive = (log.action_id != 18);
        if (!this.isActive) {
          this.networkHealth = 0;
          this.updateProgress(this.networkHealth);
        }
      };

      this.resetInActivityMonitor = function() {
        /*this.flagClearedIcons = false;
        if (this.intervalId) {
          clearInterval(this.intervalId);
        }
        var currentVault = this;
        this.intervalId = setInterval(function() {
          if (!$rootScope.playerPaused) {
            currentVault.flagClearedIcons = true;
            currentVault.updateIcons(0);
            currentVault.personaColour = PERSONA_COLOUR_TAG + 'na';
            currentVault.subscriber = null;
            currentVault.counter = null;
            currentVault.refreshItem();
          }
        }, 5000);*/
      };

      this.updateFromQueue = function() {
        var logs = dataManager.getLogsFromQueue(this.vaultName);
        for (var index in logs) {
          this.logReceived(logs[index], true);
        }
      };
    };
  }
]