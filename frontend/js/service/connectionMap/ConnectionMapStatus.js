/* global window:false */
window.ConnectionMapStatus = [ 'd3Transformer', function(transformer) {
  var instance = this;
  var expectedConnections = {};
  var actualConnections = {};

  var updateUI = function() {
    console.log(transformer.transform(actualConnections, expectedConnections));
  };

  var setSnapshotStatus = function(data) {
    actualConnections = data.actual;
    expectedConnections = data.expected;
    updateUI();
  };
  var updateExpected = function(diffs) {
    for (var index in diffs) {
      if (diffs[index]) {
        expectedConnections[diffs[index].vaultId] = diffs[index].closestVaults;
      }
    }
    updateUI();
  };
  var updateActual = function(data) {
    for (var index in data) {
      if (data[index]) {
        actualConnections[data[index].vaultId] = data[index].closestVaults;
      }
    }
    updateUI();
  };
  instance.setSnapshot = setSnapshotStatus;
  instance.updateExpected = updateExpected;
  instance.updateActual = updateActual;
  return instance;
} ];
