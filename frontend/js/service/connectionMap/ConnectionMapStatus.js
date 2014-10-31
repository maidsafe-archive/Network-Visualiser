/* global window:false */
window.ConnectionMapStatus = [ 'd3Transformer', function(transformer) {
  var instance = this;
  var expectedConnections = {};
  var actualConnections = {};

  var updateUI = function() {
    console.log(transformer.transform(actualConnections, expectedConnections));
  };

  var setSnapshotStatus = function(data) {
    actualConnections = data.actual || {};
    expectedConnections = data.expected || {};
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
    switch (data.actionId) {
      case 18:
        delete actualConnections[data.vaultId];
        break;

      default:
        actualConnections[data.vaultId] = data;
        break;
    }
    updateUI();
  };
  instance.setSnapshot = setSnapshotStatus;
  instance.updateExpected = updateExpected;
  instance.updateActual = updateActual;
  return instance;
} ];
