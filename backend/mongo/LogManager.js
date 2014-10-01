var mongoose = require('mongoose');
var utils = require('./../maidsafe/utils.js');
var config = require('./../../Config.js');
var LogManager = function(dbConnConnection) {
  var dbConn;
  var HIDE_FIELDS;
  dbConn = dbConnConnection;
  /* jscs:disable disallowDanglingUnderscores */
  HIDE_FIELDS = {_id: 0, __v: 0};
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
        col.find(criteria, {__v: 0}).toArray(function(err, docs) {
          /* jscs:enable disallowDanglingUnderscores */
          if (docs.length > 0) {
            // jshint camelcase:false
            // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
            results[docs[0].vault_id] = docs;
            // jshint camelcase:true
            // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
            completed();
          }
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
        var q = coll.find(criteria, HIDE_FIELDS).sort([
          ['ts', 'descending']
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
            // jshint camelcase:false
            // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
            if (data[i].action_id === config.Constants.networkHealthActionId) {
              // jshint camelcase:true
              // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
              networkHealthFound = true;
              break;
            }
          }
          // max is -1 when /backend/history is called
          if (networkHealthFound || max < 0) {
            promise.complete(data);
            return;
          }
          // jshint camelcase:false
          // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
          criteria.action_id = config.Constants.networkHealthActionId;
          // jshint camelcase:true
          // jscs:enable requireCamelCaseOrUpperCaseIdentifiers

          var healthCursor = coll.find(criteria, HIDE_FIELDS).sort([
            ['ts', 'descending']
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
    // jshint camelcase:false
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    dbConn.db.collection(formatCollectionName(sessionId, data.vault_id), function(err, coll) {
      // jshint camelcase:true
      // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
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
        // jshint camelcase:false
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        dbConn.db.collection(formatCollectionName(sessionId, vaultIds[i].vault_id), deleteCollection);
        // jshint camelcase:true
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
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
  return this;
};
exports.getManager = LogManager;
