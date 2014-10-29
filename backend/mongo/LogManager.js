var mongoose = require('mongoose');
var utils = require('./../maidsafe/utils.js');
var config = require('./../../Config.js');
var LogManager = function(dbConnConnection) {
  var dbConn;
  var HIDE_FIELDS;
  dbConn = dbConnConnection;
  /* jscs:disable disallowDanglingUnderscores */
  HIDE_FIELDS = { _id: 0, __v: 0 };
  /* jscs:enable disallowDanglingUnderscores */
  var formatCollectionName = function(sessionId, vaultId) {
    return sessionId + '_' + utils.transformVaultId(vaultId);
  };
  var searchAllCollections = function(sessionId, criteria, promise) {
    var results = {};
    dbConn.db.collectionNames(function(e, colls) {
      var fetched = 0;
      var sessionVaultNames;
      var completed = function() {
        fetched++;
        if (fetched === sessionVaultNames.length) {
          promise.complete(results);
        }
      };
      // TODO error is unhandled - possibly can block the thread
      var groupResults = function(er, col) {
        /* jscs:disable disallowDanglingUnderscores */
        col.find(criteria, { __v: 0 }).toArray(function(err, docs) {
          /* jscs:enable disallowDanglingUnderscores */
          if (docs.length > 0) {
            results[docs[0].vaultId] = docs;
          }
          completed();
        });
      };
      sessionVaultNames = utils.filterSessionVaultNames(sessionId, dbConn.name, colls);
      for (var i in sessionVaultNames) {
        if (sessionVaultNames[i]) {
          dbConn.db.collection(sessionVaultNames[i], groupResults);
        }
      }
    });
  };
  var vaultHistory = function(collectionName, criteria, page, max, promise) {
    dbConn.db.collection(collectionName, function(err, coll) {
      if (err) {
        promise.error(err);
      } else {
        var q = coll.find(utils.isEmptyObject(criteria) ? criteria : { $or: criteria }, HIDE_FIELDS).sort([
          [ 'ts', 'descending' ]
        ]);
        if (max > 0) {
          q.skip(page * max).limit(max);
        }
        q.toArray(function(err, data) {
          if (err) {
            promise.error(err);
            return;
          }
          var networkHealthFound = false;
          for (var i in data) {
            if (data[i].actionId === config.Constants.networkHealthActionId) {
              networkHealthFound = true;
              break;
            }
          }
          // max is -1 when /backend/history is called
          if (networkHealthFound || max < 0) {
            promise.complete(data);
            return;
          }
          criteria.actionId = config.Constants.networkHealthActionId;

          var healthCursor = coll.find(criteria, HIDE_FIELDS).sort([
            [ 'ts', 'descending' ]
          ]).limit(1);
          healthCursor.toArray(function(healthErr, healthData) {
            if (healthErr) {
              promise.error(healthErr);
              return;
            }
            if (healthData.length > 0) {
              data.push(healthData[0]);
            }
            promise.complete(data);
          });
        });
      }
    });
  };
  this.save = function(sessionId, data, callback) {
    var promise = new mongoose.Promise();
    if (callback) {
      promise.addBack(callback);
    }
    dbConn.db.collection(formatCollectionName(sessionId, data.vaultId), function(err, coll) {
      if (err) {
        promise.error(err);
      } else {
        // jshint unused:false
        coll.save(data, function(saveErr, docs) {
          if (saveErr) {
            promise.error(saveErr);
            return;
          }
          promise.complete(data);
        });
        // jshint unused:true
      }
    });
    return promise;
  };
  this.deleteVaultsInSession = function(sessionId, vaultIds, callback) {
    var promise = new mongoose.Promise();
    if (callback) {
      promise.addBack(callback);
    }
    if (vaultIds.length === 0) {
      promise.error('No VaultId\'s provided');
      return promise;
    }
    var deletedCount = 0;
    // jshint unused:false
    var dropHandler = function(e, res) {
      if (e) {
        promise.error(e);
        return;
      }
      deletedCount++;
      if (deletedCount === vaultIds.length) {
        promise.complete('');
      }
    };
    // jshint unused:true
    var deleteCollection = function(err, coll) {
      if (err) {
        promise.error(err);
        return;
      }
      coll.drop(dropHandler);
    };
    for (var i in vaultIds) {
      if (vaultIds[i]) {
        dbConn.db.collection(formatCollectionName(sessionId, vaultIds[i].vaultId), deleteCollection);
      }
    }
    return promise;
  };
  this.selectLogs = function(sessionId, criteria, callback) {
    var promise = new mongoose.Promise();
    if (callback) {
      promise.addBack(callback);
    }
    searchAllCollections(sessionId, criteria, promise);
    return promise;
  };
  this.history = function(sessionId, vaultId, criteria, page, max, callback) {
    var promise = new mongoose.Promise();
    if (callback) {
      promise.addBack(callback);
    }
    vaultHistory(formatCollectionName(sessionId, vaultId), criteria, page, max, promise);
    return promise;
  };
  this.isVaultActive = function(sessionId, vaultId, timestamp, callback) {
    timestamp = timestamp || new Date().toISOString();
    var promise = new mongoose.Promise();
    if (callback) {
      promise.addBack(callback);
    }
    var collectionName = sessionId + '_' + utils.transformVaultId(vaultId);
    dbConn.db.collection(collectionName, function(err, coll) {
      if (err) {
        promise.error(err);
        return;
      }
      coll.find({ts: {$lte : timestamp}}).sort(['ts', 'descending']).toArray(function(err, log) {
        if (err) {
          promise.error(err);
          return;
        }
        var result = null;
        if (log && log.length > 0) {
          result = {
            active: log.length > 0 && log[0].actionId !== config.Constants.stopActionId,
            vaultId: log[0].vaultId
          };
        }
        promise.complete(result);
      });
    });
    return promise;
  };
  return this;
};
exports.getManager = LogManager;
