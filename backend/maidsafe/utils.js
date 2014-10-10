var config = require('./../../Config.js');
exports.isValid = function(log) {
  // jshint camelcase:false
  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
  var isValid = log.vaultId && log.actionId && log.personaId;
  log.actionId = parseInt(log.actionId);
  // jshint camelcase:true
  // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
  if (!log.hasOwnProperty('sessionId')) {
    isValid = false;
  }
  return isValid;
};
exports.formatDate = function(log) {
  try {
    if (log.ts) {
      if (log.ts.indexOf('UTC') < 0) {
        log.ts += 'UTC';
      }
      log.ts = new Date(log.ts).toISOString();
    } else {
      log.ts = new Date().toISOString();
    }
  } catch (err) {
    return false;
  }
  return true;
};
/* jshint unused:false */
/* jshint forin:false */
exports.isEmptyObject = function(object) {
  for (var i in object) {
    return false;
  }
  return true;
};
/* jshint unused:true */
/* jshint forin:true */
exports.transformVaultId = function(vaultId) {
  return (vaultId.indexOf('..') > -1) ? vaultId.replace('..', '_') : vaultId.replace('_', '..');
};
exports.decodeData = function(str) {
  str = new Buffer(str, 'base64').toString('utf8');
  return new Buffer(str).toString('hex');
};
exports.isPageRequestValid = function(criteria) {
  // jshint camelcase:false
  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
  if (criteria.vaultId) {
    // jshint camelcase:true
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    if (criteria.page) {
      try {
        criteria.page = parseInt(criteria.page);
      } catch (e) {
        criteria.page = 0;
      }
    } else {
      criteria.page = 0;
    }
    if (criteria.max) {
      try {
        criteria.max = parseInt(criteria.max);
      } catch (e) {
        criteria.max = config.Constants.paging.max;
      }
    } else {
      criteria.max = config.Constants.paging.max;
    }
    return true;
  }
  return false;
};
exports.transformQuery = function(query) {
  for (var key in query) {
    if (key === 'ts') {
      query[key] = { '$gt': query[key] }; // works fine only ISO string - query is done based on ISO string
    } else { // For like operation on strings
      query[key] = new RegExp(query[key], 'i');
    }
  }
  return query;
};
exports.ensureUniqueDocInMongo = function(dbConn, collectionName, fieldName) {
  dbConn.db.collection(collectionName, function(err, coll) {
    if (coll) {
      var ob = {};
      ob[fieldName] = 1;
      /* jshint unused:false */
      coll.ensureIndex(ob, { unique: true, dropDups: true }, function(errorUpdate, writeSuccess) {
        if (errorUpdate) {
          console.log(errorUpdate);
        }
      });
      /* jshint unused:true */
    }
  });
};
exports.generateRandomSessionIdString = function(prefix) {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
  return prefix == null ? uuid : prefix + uuid;
};
exports.hasSessionName = function(criteria) {
  return criteria && criteria.hasOwnProperty('sn');
};
exports.filterSessionVaultNames = function(sessionId, dbConnName, collections) {
  var sessionVaultNames = [];
  for (var i in collections) {
    if (collections[i]) {
      var collName = collections[i].name.replace(dbConnName + '.', '');
      if (collName.indexOf(sessionId) === 0) {
        sessionVaultNames.push(collName);
      }
    }
  }
  return sessionVaultNames;
};
