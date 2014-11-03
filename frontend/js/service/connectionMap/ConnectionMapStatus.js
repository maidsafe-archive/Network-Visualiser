/* global window:false */
window.ConnectionMapStatus = [ 'd3Transformer', function(transformer) {
  var instance = this;
  var expectedConnections = {};
  var actualConnections = {};
  var statusChangeCallback;
  instance.vaultsCount = 0;
  var updateUI = function() {
    if (statusChangeCallback) {
      var vaults = transformer.transform(actualConnections, expectedConnections);
      instance.vaultsCount = vaults.length;
      statusChangeCallback(vaults);
    }
  };
  var transformVaults = function(data) {
    for (var i in data) {
      if (data[i]) {
        data[i] = transformer.formatVaultId(data[i]);
      }
    }
    return data;
  };
  var setActualLog = function(data) {
    switch (data.actionId) {
      case 18:
        delete actualConnections[data.vaultId];
        break;

      default:
        if (data.valueOne.closeGroupVaults) {
          data.valueOne.closeGroupVaults = formatVaultIds(data.valueOne.closeGroupVaults);
        }
        if (data.valueOne.vaultAdded) {
          data.valueOne.vaultAdded = transformer.formatVaultId(data.valueOne.vaultAdded);
        }
        if (data.valueOne.vaultRemoved) {
          data.valueOne.vaultRemoved = transformer.formatVaultId(data.valueOne.vaultRemoved);
        }
        actualConnections[data.vaultId] = data;
        break;
    }
  };
  var iterateActualLogs = function(actual) {
    for (var i in actual) {
      if (actual[i]) {
        setActualLog(actual[i]);
      }
    }
  };
  var formatVaultIds = function(vaults) {
    for (var i in vaults) {
      if (vaults[i]) {
        vaults[i] = transformer.formatVaultId(vaults[i]);
      }
    }
    return vaults;
  };
  var iterateExpectedLogs = function(expected) {
    for (var i in expected) {
      if (expected[i]) {
        expectedConnections[transformer.formatVaultId(expected[i].vaultId)] = formatVaultIds(expected[i].closestVaults);
      }
    }
  };
  var setStatusChangeCallback = function(callback) {
    statusChangeCallback = callback;
  };
  var setSnapshotStatus = function(data) {
    iterateActualLogs(data.actual);
    iterateExpectedLogs(data.expected);
    updateUI();
  };
  var updateExpected = function(diffs) {
    for (var index in diffs) {
      if (diffs[index]) {
        expectedConnections[transformer.formatVaultId(diffs[index].vaultId)] = transformVaults(
          diffs[index].closestVaults);
      }
    }
    updateUI();
  };
  var updateActual = function(data) {
    if (!data) {
      return;
    }
    setActualLog(data);
    updateUI();
  };
  instance.setSnapshot = setSnapshotStatus;
  instance.updateExpected = updateExpected;
  instance.updateActual = updateActual;
  instance.onStatusChange = setStatusChangeCallback;
  return instance;
} ];
