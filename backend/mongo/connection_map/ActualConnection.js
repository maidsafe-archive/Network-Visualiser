var bridge = require('./../bridge');

module.exports = function(dbCon) {
  var MongoosePromise = require('mongoose').Promise;
  var instance = this;
  var COLLECTION_NAME_PREFIX = 'actual_connection_';
  var formatCollectionName = function(sessionId) {
    return COLLECTION_NAME_PREFIX + sessionId;
  };
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
    dbCon.db.collection(formatCollectionName(log.sessionId), function(err, collection) {
      if (err) {
        promise.error(err);
        return;
      }
      collection.save(log, new GeneralHandler(promise));
    });
    return promise;
  };
  var getActualConnections = function(sessionId, activeIds, timestamp, callback) {
    timestamp = timestamp || new Date().toISOString();
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
    dbCon.db.collection(formatCollectionName(sessionId), function(err, coll) {
      if (err) {
        callback(err);
        return;
      }
      coll.find({ vaultId: { $in: activeIds }, ts: { $lte: timestamp } }).sort([
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
  var getActualConnectionsDiff = function(sessionId, minTime, maxTime, callback) {
    dbCon.db.collection(formatCollectionName(sessionId), function(err, coll) {
      if (err) {
        callback(err);
        return;
      }
      coll.find({ ts: { $gte: minTime, $lte: maxTime } }).sort([
        [ '_id', 'descending' ]
      ]).toArray(function(err, docs) {
        if (err) {
          callback(err);
          return;
        }
        callback(null, docs);
      });
    });
  };
  var dropCollection = function(sessionId) {
    dbCon.db.dropCollection(formatCollectionName(sessionId));
  };
  var retrieveActualConnection = function(sessionId, timestamp, callback) {
    var promise = new MongoosePromise();
    if (callback) {
      promise.addBack(callback);
    }
    var getActiveVaults = function(callback) {
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
    };
    getActiveVaults(onActiveVaultsReceived);
    return promise;
  };
  var retrieveActualConnectionDiff = function(sessionId, minTime, maxTime, callback) {
    var promise = new MongoosePromise();
    if (callback) {
      promise.addBack(callback);
    }
    getActualConnectionsDiff(sessionId, minTime, maxTime, function(err, data) {
      if (err) {
        promise.error('Expected Fetch with range faied');
        return;
      }
      promise.complete(data);
    });
    return promise;
  };
  instance.save = saveActualLog;
  instance.dropCollection = dropCollection;
  instance.getActualConnections = retrieveActualConnection;
  instance.getActualConnectionsDiff = retrieveActualConnectionDiff;
  return instance;
};
