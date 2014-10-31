/* global window:false */
window.ConnectionMapStatus = [ function() {
  var instance = this;
  var expectedConnections = {};
  var actualConnections = {};
  var setExpected = function(data) {
    expectedConnections = data;
  };
  var setActual = function(data) {
    actualConnections = data;
  };
  var updateExpected = function(diffs) {
    for (var index in diffs) {
      if (diffs[index]) {
        expectedConnections[diffs[index].vaultId] = diffs[index].closestVaults;
      }
    }
  };
  var updateActual = function(data) {
    for (var index in data) {
      if (data[index]) {
        actualConnections[data[index].vaultId] = data[index].closestVaults;
      }
    }
  };
  instance.setActualStatus = setActual;
  instance.setExpectedStatus = setExpected;
  instance.updateExpected = updateExpected;
  instance.updateActual = updateActual;
  return instance;
} ];
