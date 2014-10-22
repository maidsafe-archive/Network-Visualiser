/* global emit:false */

var mongoose = require('mongoose');
var config = require('./../../../Config');
var partialSort = require('./partialsort');
var bridge = require('./../bridge');

module.exports = function(dbCon) {
  var MongoosePromise = mongoose.Promise;
  var instance = this;
  var COLLECTION_NAME_SUFFIX = '_expected_connection';
  var GeneralHandler = function(promise) {
    return function(err, doc) {
      if (err) {
        promise.error(err);
        return;
      }
      promise.complete(doc);
    };
  };
  var formatConnectionData = function(ts, vaultId, closeConnections) {
    return { ts: ts, vaultId: vaultId, closestVaults: closeConnections };
  };
  var computeExpectedConnectionsOnStop = function(log, expConSnapshot) {
    var vaultLastSnapshot;
    var vaultIds = [];
    var diffsForUpdate = [];
    for (var i in expConSnapshot) {
      if (expConSnapshot[i].value && expConSnapshot[i].value.vaultId !== log.valueOne) {
        vaultIds.push(expConSnapshot[i].value.vaultId);
      }
    }
    for (var index in expConSnapshot) {
      if (expConSnapshot[index]) {
        vaultLastSnapshot = expConSnapshot[index].value;
        if (log.valueOne !== vaultLastSnapshot.vaultId && vaultLastSnapshot.closestVaults.indexOf(log.valueOne) > -1) {
          diffsForUpdate.push(formatConnectionData(log.ts,
            vaultLastSnapshot.vaultId,
            partialSort.sort(vaultIds, config.Constants.maxClosest, vaultLastSnapshot.vaultId)
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
      if (vaultLastSnapshot.closestVaults.length === config.Constants.maxClosest &&
        partialSort.closerToTarget(log.valueOne,
          vaultLastSnapshot.closestVaults[config.Constants.maxClosest - 1],
          vaultLastSnapshot.vaultId) > -1) {
        return;
      }
      vaultLastSnapshot.closestVaults.push(log.valueOne);
      diffsForUpdate.push(formatConnectionData(log.ts,
        vaultLastSnapshot.vaultId,
        partialSort.sort(vaultLastSnapshot.closestVaults, config.Constants.maxClosest, vaultLastSnapshot.vaultId)
      ));
    };
    for (var i in expConSnapshot) {
      if (expConSnapshot[i]) {
        vaultLastSnapshot = expConSnapshot[i].value;
        vaultIds.push(vaultLastSnapshot.vaultId);
        if (vaultLastSnapshot.closestVaults.indexOf(log.valueOne) === -1) {
          compute();
        }
      }
    }
    // update the started vaults expected connections
    diffsForUpdate.push(formatConnectionData(log.ts,
      log.valueOne,
      partialSort.sort(vaultIds, config.Constants.maxClosest, log.valueOne)
    ));
    return diffsForUpdate;
  };
  var getExpectedConnections = function(sessionId, activeIds, callback) {
    var collectionName = sessionId + COLLECTION_NAME_SUFFIX;
    var map = function() {
      emit(this.vaultId, { ts: this.ts, vaultId: this.vaultId, closestVaults: this.closestVaults });
    };
    var reduce = function(key, values) {
      return values[0];
    };
    var command = {
      mapreduce: collectionName,
      map: map.toString(),
      reduce: reduce.toString(),
      sort: { ts: -1 },
      out: { inline: 1 },  // doesn't create a new collection, includes the result in the output obtained
      query: { vaultId: { $in: activeIds } } // this condition is not working thus filtering in map function
    };
    dbCon.db.command(command, function(err, dbres) {
      if (err && err.errmsg === 'ns doesn\'t exist') {
        callback(null, []);
        return;
      }
      callback(err, dbres.results);
    });
  };
  var saveExpectedConnection = function(sessionId, data, callback) {
    dbCon.db.collection(sessionId + COLLECTION_NAME_SUFFIX, function(err, coll) {
      coll.save(data, callback);
    });
  };
  var updateExpectedConnection = function(log, callback) {
    var diffs;
    var promise = new MongoosePromise();
    var mockHandler = function(err) {
      if (err) {
        console.log(err);
      }
    };
    if (callback) {
      promise.addBack(callback);
    }
    var onExpectedConnections = function(err, docs) {
      if (err || !docs) {
        promise.error(err ? err : 'Expected connections table - data fetch failed');
        return;
      }
      if (docs.length === 0 && log.actionId !== config.Constants.startActionId) {
        promise.error('Vault is not active');
        return;
      }
      // If the expected connection table is empty, then add the data
      if (docs.length === 0) {
        saveExpectedConnection(log.sessionId,
          formatConnectionData(log.ts, log.valueOne, []),
          new GeneralHandler(promise));
        return;
      }
      diffs = log.actionId === config.Constants.startActionId ?
        computeExpectedConnections(log, docs) : computeExpectedConnectionsOnStop(log, docs);
      for (var i = 0; i < diffs.length; i++) {
        saveExpectedConnection(log.sessionId,
          diffs[i],
          (i === diffs.length - 1) ? new GeneralHandler(promise) : mockHandler
        );
      }
    };
    bridge.getActiveVaultsFullId(log.sessionId).then(function(activeValuts) {
      var activeIds = [];
      for (var index in activeValuts) {
        if (activeValuts[index]) {
          activeIds.push(activeValuts[index].vaultIdFull);
        }
      }
      getExpectedConnections(log.sessionId, activeIds, onExpectedConnections);
    });
    return promise;
  };
  instance.updateExpectedConnection = updateExpectedConnection;
  return instance;
};
