var bridge = require('./../bridge');
module.exports = function(dbCon) {
  var MongoosePromise = require('mongoose').Promise;
  var instance = this;
  var COLLECTION_NAME_SUFFIX = '_actual_connection';
  var GeneralHandler = function(promise) {
    return function(err, doc) {
      if (err) {
        promise.error(err);
        return;
      }
      promise.complete(doc);
    };
  };
  var saveActualLog = function(log, callback) {
    var promise = new MongoosePromise();
    if (callback) {
      promise.addBack(callback);
    }
    dbCon.db.collection(log.sessionId + COLLECTION_NAME_SUFFIX, function(err, collection) {
      if (err) {
        promise.error(err);
        return;
      }
      collection.save(log, new GeneralHandler(promise));
    });
    return promise;
  };
  var getActualConnections = function(sessionId, activeIds, timestamp, callback) {
    var timestamp = timestamp || new Date().toISOString();
    var collectionName = sessionId + COLLECTION_NAME_SUFFIX;
    var reduce = function(docs) {
      var monitor = {};
      var reducedResults = [];
      var counter = activeIds.length;
      for (var i = 0; i < docs.length &&  counter > 0; i++) {
        if (!monitor.hasOwnProperty(docs[i].vaultId)) {
          reducedResults.push(docs[i]);
          monitor[docs[i].vaultId] = true;
          counter--;
        }
      }
      return reducedResults;
    };
    dbCon.db.collection(collectionName, function(err, coll) {
      if (err) {
        callback(err);
        return;
      }
      coll.find({vaultId: {$in : activeIds}, ts: { $lte : timestamp }}).sort([
        [ '_id', 'descending' ]
      ]).toArray(function(err, docs) {
        if (err) {
          callback(err);
          return;
        }
        callback(null, reduce(docs));
      });
    });
  };
  var dropCollection = function(sessionId) {
    dbCon.db.dropCollection(sessionId + COLLECTION_NAME_SUFFIX);
  };
  var retrieveActualConnection = function(sessionId, timestamp, callback) {
    var promise = new MongoosePromise();
    if (callback) {
      promise.addBack(callback);
    }
    var getActiveVaults = function (callback) {
      bridge.getActiveVaultsAtTime(sessionId, timestamp, callback);
    };
    var getActual = function(activeIds) {
      getActualConnections(sessionId, activeIds, timestamp, function(err, data) {
        if (err) {
          promise.error(err);
          return;
        }
        promise.complete(data);
      });
    };
    var onActiveVaultsReceived = function(err, vaults) {
      var vaultIds = [];
      if (err) {
        promise.error('Active vaults could not be retrieved');
        return;
      }
      for (var i in vaults) {
        if (vaults[i] && vaults[i].vaultId) {
          vaultIds.push(vaults[i].vaultId);
        }
      }
      getActual(vaultIds);
    }
    getActiveVaults(onActiveVaultsReceived);
    return promise;
  };
  instance.save = saveActualLog;
  instance.dropCollection = dropCollection;
  instance.getActualConnections = retrieveActualConnection;
  return instance;
};
