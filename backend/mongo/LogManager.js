var mongoose = require('mongoose');
var utils = require('./../maidsafe/utils.js');
var config = require('./../../Config.js');

var LogManager = function(dbConnConnection) {
  var dbConn, LOG_SCHEMA, HIDE_FIELDS;

  dbConn = dbConnConnection;

  HIDE_FIELDS = { _id: 0, __v: 0 };
  var searchAllCollections = function(criteria, promise) {
    var results = {};
    dbConn.db.collectionNames(function(e, colls) {
      var fetched = 0;
      for (i in colls) {
        if (colls[i].name.indexOf('system.index') < 0) { //} || colls[i].name.indexOf('vaultStatus')<0){
          dbConn.db.collection(colls[i].name.replace(dbConn.name + '.', ''), function(err, col) {
            col.find(criteria, { __v: 0 }).toArray(function(err, docs) {
              fetched++;
              if (docs.length > 0) {
                results[docs[0].vault_id] = docs;
              }
              if (fetched == colls.length - 1) {
                promise.complete(results);
              }
            });
          });
        }
      }
    });
  };
  var vaultHistory = function(vaultId, criteria, page, max, promise) {
    dbConn.db.collection(vaultId, function(err, coll) {
      if (err) {
        promise.error(err);
      } else {
        console.log('criteria: ' + JSON.stringify(criteria));
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
          for (i in data) {
            networkHealthFound = data[i].action_id == config.Constants.action_network_health;
          }
          if (networkHealthFound) {
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
    dbConn.db.collection(utils.transformVaultId(data.vault_id), function(err, coll) {
      if (err) {
        promise.error(err);
      } else {
        coll.save(data, function(err, docs) {
          err ? promise.error(err) : promise.complete(data);
        });
      }
    });
    return promise;
  };
  this.search = function(criteria, callback) {
    var promise = new mongoose.Promise;
    if (callback) {
      promise.addBack(callback);
    }
    searchAllCollections(criteria, promise);
    return promise;
  };
  this.history = function(vaultId, criteria, page, max, callback) {
    var promise = new mongoose.Promise;
    if (callback) {
      promise.addBack(callback);
    }
    vaultHistory(utils.transformVaultId(vaultId), criteria, page, max, promise);
    return promise;
  };
  return this;
};

exports.getManager = LogManager;