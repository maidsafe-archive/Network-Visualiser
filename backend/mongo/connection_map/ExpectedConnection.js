var mongoose = require('mongoose');
var config = require('./../../../Config');
var partialSort = require('./partialsort');

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
  var computeExpectedConnections = function(log, expConSnapshot) {
    var vaultLastSnapshot;
    var vaultIds = [];
    var diffsForUpdate = [];
    for (var i in expConSnapshot) {
      vaultLastSnapshot = expConSnapshot[i].value;
      vaultIds.push(vaultLastSnapshot.vaultId);
      if (vaultLastSnapshot.closestVaults.indexOf(log.valueOne) === -1) {
        if (vaultLastSnapshot.closestVaults.length === config.Constants.maxClosest &&
          partialSort.closerToTarget(log.valueOne,
            vaultLastSnapshot.closestVaults[config.Constants.maxClosest -1],
            vaultLastSnapshot.vaultId) > -1) {
          continue;
        }
        vaultLastSnapshot.closestVaults.push(log.valueOne);
        diffsForUpdate.push(formatConnectionData(log.ts,
          vaultLastSnapshot.vaultId,
          partialSort.sort(vaultLastSnapshot.closestVaults, config.Constants.maxClosest, vaultLastSnapshot.vaultId)
        ));
      }
    }
    // update the started vaults expected connections
    diffsForUpdate.push(formatConnectionData(log.ts,
      log.valueOne,
      partialSort.sort(vaultIds, config.Constants.maxClosest, log.valueOne)
    ));
    return diffsForUpdate;
  };
  var getExpectedConnections = function(sessionId, callback) {
    var collectionName = sessionId + COLLECTION_NAME_SUFFIX;
    var map = function(){
      var data = {ts:this.ts,vaultId: this.vaultId, closestVaults:this.closestVaults};
      emit(this.vaultId,data);
    };
    // reduce function
    var reduce = function(key, values){
      return values[0];
    };
    // map-reduce command
    var command = {
      mapreduce: collectionName, // the name of the collection we are map-reducing
      map: map.toString(), // a function for mapping
      reduce: reduce.toString(), // a function  for reducing
      sort: {ts: -1}, // sorting on field ts
      out: {inline: 1}  // doesn't create a new collection, includes the result in the output obtained
    };
    dbCon.db.executeDbCommand(command, function(err, dbres) {
      if (dbres.documents[0].errmsg === 'ns doesn\'t exist' ) {
        callback(err, []);
        return;
      }
      callback(err, dbres.documents[0].results);
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
      diffs = computeExpectedConnections(log, docs);
      for (var i = 0; i < diffs.length; i++) {
        saveExpectedConnection(log.sessionId,
          diffs[i],
          i === diffs.length-1 ? new GeneralHandler(promise) : function(err) {
          }
        );
      }
    };
    getExpectedConnections(log.sessionId, onExpectedConnections);
    return promise;
  };
  instance.updateExpectedConnection = updateExpectedConnection;
  return instance;
};
