/* global window:false */
window.ExpectedConnectionHelper = [ 'partialSort', function(partialSort) {
  var instance = this;
  var MAX_CLOSEST = 4;
  var formatConnectionData = function(ts, vaultId, closeConnections) {
    return { ts: ts, vaultId: vaultId, closestVaults: closeConnections };
  };
  var removeFromArray = function(value, array) {
    var index = array.indexOf(value);
    if (index < 0) {
      return array;
    }
    return array.slice(0, index).concat(array.slice(++index));
  };
  var computeExpectedConnectionsOnStop = function(log, expConSnapshot) {
    var vaultLastSnapshot;
    var vaultIds = [];
    var diffsForUpdate = [];
    for (var i in expConSnapshot) {
      if (expConSnapshot[i] && expConSnapshot[i].vaultId !== log.valueOne) {
        vaultIds.push(expConSnapshot[i].vaultId);
      }
    }
    for (var index in expConSnapshot) {
      if (expConSnapshot[index]) {
        vaultLastSnapshot = expConSnapshot[index];
        if (log.valueOne !== vaultLastSnapshot.vaultId && vaultLastSnapshot.closestVaults.indexOf(log.valueOne) > -1) {
          diffsForUpdate.push(formatConnectionData(log.ts,
            vaultLastSnapshot.vaultId,
            partialSort.sort(removeFromArray(vaultLastSnapshot.vaultId, vaultIds), MAX_CLOSEST,
              vaultLastSnapshot.vaultId)
          ));
        }
      }
    }
    return diffsForUpdate;
  };
  var computeExpectedConnections = function(log, expConSnapshot) {
    var vaultLastSnapshot;
    var vaultIds = [];
    var diffsForUpdate = [];
    var compute = function() {
      if (vaultLastSnapshot.closestVaults.length === MAX_CLOSEST &&
        partialSort.closerToTarget(log.valueOne,
          vaultLastSnapshot.closestVaults[MAX_CLOSEST - 1],
          vaultLastSnapshot.vaultId) > -1) {
        return;
      }
      vaultLastSnapshot.closestVaults.push(log.valueOne);
      diffsForUpdate.push(formatConnectionData(log.ts,
        vaultLastSnapshot.vaultId,
        partialSort.sort(vaultLastSnapshot.closestVaults, MAX_CLOSEST, vaultLastSnapshot.vaultId)
      ));
    };
    for (var i in expConSnapshot) {
      if (expConSnapshot[i]) {
        vaultLastSnapshot = expConSnapshot[i];
        vaultIds.push(vaultLastSnapshot.vaultId);
        if (vaultLastSnapshot.closestVaults.indexOf(log.valueOne) === -1) {
          compute();
        }
      }
    }
    // update the started vaults expected connections
    diffsForUpdate.push(formatConnectionData(log.ts,
      log.valueOne,
      partialSort.sort(removeFromArray(log.valueOne, vaultIds), MAX_CLOSEST, log.valueOne)
    ));
    return diffsForUpdate;
  };
  instance.computeExpectedOnStart = computeExpectedConnections;
  instance.computeExpectedOnStop = computeExpectedConnectionsOnStop;
} ];
