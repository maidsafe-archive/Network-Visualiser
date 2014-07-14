var VaultCtrl = [
  '$scope', '$rootScope', 'dataManager', 'vaultBehaviour', function($scope, $rootScope, dataManager, vaultBehaviour) {
    $scope.stateIcon;
    $scope.logsOpen;
    $scope.progressLevel;
    $scope.vaultName;
    $scope.fullVaultName;
    $scope.logs;
    $scope.vaultBehaviour = vaultBehaviour;
    $scope.iconsTray;
    $scope.isActive = false;
    $scope.flagClearedIcons = false;
    $scope.PERSONA_COLOUR_TAG = "persona_";
    $scope.ICONS_TRAY_SHAPES = { HEXAGON: 0, CIRCLE: 1, SQUARE: 2, DIAMOND: 3 };
    $scope.networkHealth = 0;
    $scope.intervalId;
    $scope.updateFromQueue = function() {
      var logs = dataManager.getLogsFromQueue($scope.vaultName);
      for (var index in logs) {
        $scope.logRecieved(logs[index], true);
      }
    }; //initialize the controller
    $scope.init = function(vault) {
      $scope.updateProgress(0);
      $scope.stateIcon = "info.png";
      $scope.logsOpen = false;
      $scope.vaultName = vault.vault_id;
      $scope.logs = [];
      $scope.personaColour = $scope.PERSONA_COLOUR_TAG + $scope.vaultBehaviour.personas[0];
      $scope.updateIcons(0);
      dataManager.setLogListner($scope.vaultName, $scope.logRecieved);
      $scope.updateFromQueue();
    };
    $scope.updateIcons = function(actionId) {
      $scope.iconsTray = $scope.vaultBehaviour.icons[actionId];
    };
    $scope.addLog = function(log) {
      if ($scope.logs.length >= $scope.vaultBehaviour.MAX_LOGS) {
        $scope.logs.shift();
      }
      $scope.logs.push(log);
    };
    $scope.stateOfVault = function(log) {
      $scope.isActive = (log.action_id != 18);
      if (!$scope.isActive) {
        $scope.networkHealth = 0;
        $scope.updateProgress($scope.networkHealth);
      }
    };
    $scope.logRecieved = function(log, initialLoad) {
      $scope.addLog(log);
      $scope.personaColour = $scope.PERSONA_COLOUR_TAG + (initialLoad ? 'na' : $scope.vaultBehaviour.personas[log.persona_id]);
      if (log.action_id == 17) {
        $scope.networkHealth = log.value1;
        $scope.updateProgress(log.value1);
      } else {
        $scope.subscriber = null;
        $scope.counter = null;
        if (!initialLoad) {
          $scope.updateIcons(log.action_id);
        }
      }
      if (!initialLoad) {
        if (log.action_id == 1 || log.action_id == 2) {
          $scope.counter = log.value1;
        } else if (log.action_id == 6 || log.action_id == 7) {
          $scope.subscriber = log.value1;
        }
      }

      if (!$scope.fullVaultName && (log.action_id == 0 || log.hasOwnProperty('vault_id_full'))) {
        $scope.fullVaultName = log.vault_id_full || log.value1;
      }

      $scope.stateOfVault(log);
      if (!$scope.$$phase) {
        $scope.$apply();
      }
      $scope.resetInActivityMonitor();
    };
    $scope.updateProgress = function(progress) {
      $scope.progressLevel = { width: (progress + '%') };
    };
    $scope.toggleVaultLogs = function(expand) {
      $scope.stateIcon = !$scope.logsOpen ? "arrow-up.png" : "info.png";
      $scope.logsOpen = expand ? expand : !$scope.logsOpen;
    };
    $scope.$on('expandVault', function(e, v) {
      if (v == $scope.logsOpen) {
        return;
      }
      $scope.toggleVaultLogs(v);
    });
    $scope.lastLog = function() {
      return $scope.logs.length > 0 ? $scope.vaultBehaviour.formatMessage($scope.logs[$scope.logs.length - 1]) : "";
    };
    $scope.resetInActivityMonitor = function() {
      $scope.flagClearedIcons = false;
      if ($scope.intervalId) {
        clearInterval($scope.intervalId);
      }
      $scope.intervalId = setInterval(function() {
        if (!$rootScope.playerPaused) {
          $scope.flagClearedIcons = true;
          $scope.updateIcons(0);
          $scope.personaColour = $scope.PERSONA_COLOUR_TAG + 'na';
          $scope.subscriber = null;
          $scope.counter = null;
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        }

      }, 5000);
    };
    $scope.isToolTipEnabled = function(shape) {
      if ($scope.flagClearedIcons || !$scope.logs || $scope.logs.length <= 0) {
        return false;
      } else {
        return vaultBehaviour.canShowToolTip(shape, $scope.logs[$scope.logs.length - 1].action_id);
      }
    };
  }
]