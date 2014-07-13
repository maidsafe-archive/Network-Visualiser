var mongoose = require('mongoose');
var utils = require('./../maidsafe/utils.js');
var config = require('./../../Config.js');

var LogManager = function(dbConnConnection) {
  var dbConn, HIDE_FIELDS;

  dbConn = dbConnConnection;

  HIDE_FIELDS = { _id: 0, __v: 0 };
  var formatCollectionName = function(sessionId, vaultId) {
    return sessionId + '_' + utils.transformVaultId(vaultId);
  };
  var searchAllCollections = function(sessionId, criteria, promise) {
    var results = {};
    dbConn.db.collectionNames(function(e, colls) {
      var fetched = 0;
      var sessionVaultNames = utils.filterSessionVaultNames(sessionId, dbConn.name, colls);
      for (i in sessionVaultNames) {
        dbConn.db.collection(sessionVaultNames[i], function(er, col) {
          col.find(criteria, { __v: 0 }).toArray(function(err, docs) {
            fetched++;
            if (docs.length > 0) {
              results[docs[0].vault_id] = docs;
            }
            if (fetched == sessionVaultNames.length) {
              promise.complete(results);
            }
          });
        });
      }
    });
  };
  var vaultHistory = function(collectionName, criteria, page, max, promise) {
    dbConn.db.collection(collectionName, function(err, coll) {
      if (err) {
        promise.error(err);
      } else {
        var q = coll.find(criteria, HIDE_FIELDS).sort([['ts', 'descending']]);
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
            if (data[i].action_id == config.Constants.action_network_health) {
              networkHealthFound = true;
              break;
            }
          }

          // max is -1 when /history is called
          if (networkHealthFound || max < 0) {
            promise.complete(data);
            return;
          }
          criteria['action_id'] = config.Constants.action_network_health;
          var healthCursor = coll.find(criteria, HIDE_FIELDS).sort([['ts', 'descending']]).limit(1);
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
  this.save = function(data, callback) {
    var promise = new mongoose.Promise;
    if (callback) {
      promise.addBack(callback);
    }
    dbConn.db.collection(formatCollectionName(data.session_id, data.vault_id), function(err, coll) {
      if (err) {
        promise.error(err);
      } else {
        coll.save(data, function(saveErr, docs) {
          saveErr ? promise.error(saveErr) : promise.complete(data);
        });
      }
    });
    return promise;
  };
  this.deleteVaultsInSession = function(sessionId, vaultIds, callback) {
    var promise = new mongoose.Promise;
    if (callback) {
      promise.addBack(callback);
    }

    var deletedCount = 0;
    for (var i in vaultIds) {
      dbConn.db.collection(formatCollectionName(sessionId, vaultIds[i].vault_id), function(err, coll) {
        if (err) {
          promise(err);
          return;
        }

        coll.drop(function(e, res) {
          if (e) {
            promise.error(e);
            return;
          }
          deletedCount++;
          if (deletedCount == vaultIds.length) {
            promise.complete('');
          }
        });
      });
    }
    return promise;
  };
  this.selectLogs = function(sessionId, criteria, callback) {
    var promise = new mongoose.Promise;
    if (callback) {
      promise.addBack(callback);
    }
    searchAllCollections(sessionId, criteria, promise);
    return promise;
  };
  this.history = function(sessionId, vaultId, criteria, page, max, callback) {
    var promise = new mongoose.Promise;
    if (callback) {
      promise.addBack(callback);
    }
    vaultHistory(formatCollectionName(sessionId, vaultId), criteria, page, max, promise);
    return promise;
  };
  return this;
};

exports.getManager = LogManager;