/* global window:false */
window.ConnectionMapStatus = [ 'd3Transformer', function(transformer) {
  var instance = this;
  var expectedConnections = {};
  var actualConnections = {};

  var updateUI = function() {
//    console.log(transformer.transform(actualConnections, expectedConnections));
    // TODO bind with D3
  };
  var setActualLog = function(data) {
    switch (data.actionId) {
      case 18:
        delete actualConnections[data.vaultId];
        break;

      default:
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
  var iterateExpectedLogs = function(expected) {
    for (var i in expected) {
      if (expected[i]) {
        expectedConnections[transformer.formatVaultId(expected[i].vaultId)] = expected[i].closestVaults;
      }
    }
  };
  var setSnapshotStatus = function(data) {
    iterateActualLogs(data.actual);
    iterateExpectedLogs(data.expected);
    updateUI();
  };
  var updateExpected = function(diffs) {
    for (var index in diffs) {
      if (diffs[index]) {
        expectedConnections[transformer.formatVaultId(diffs[index].vaultId)] = diffs[index].closestVaults;
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
  return instance;
} ];
