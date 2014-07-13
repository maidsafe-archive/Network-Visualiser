var config = require('./../../Config.js');
exports.isValid = function(log) {
  var isValid = log.vault_id && log.action_id && log.persona_id;
  if (!log.hasOwnProperty('session_id')) {
    isValid = false;
  }
  return isValid;
};
exports.formatDate = function(log) {
  try {
    if (log.ts) {
      // console.log(JSON.stringify(log.ts));
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
exports.isEmptyObject = function(object) {
  for (var i in object) {
    return false;
  }
  return true;
};
exports.transformVaultId = function(vaultId) {
  return (vaultId.indexOf('..') > -1) ? vaultId.replace('..', '_') : vaultId.replace('_', '..');
};
exports.decodeData = function(str) {
  str = new Buffer(str, "base64").toString("utf8");
  return new Buffer(str).toString('hex');
};
exports.isPageRequestValid = function(criteria) {
  if (criteria.vault_id) {
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
    if (key == 'ts') {
      query[key] = { "$gt": query[key] }; //works fine only ISO string - query is done based on ISO string
    } else { //For like operation on strings
      query[key] = new RegExp(query[key], "i");
    }
  }
  return query;
};
exports.ensureUniqueDocInMongo = function(dbConn, collectionName, fieldName) {
  dbConn.db.collection(collectionName, function(err, coll) {
    if (coll) {
      var ob = {};
      ob[fieldName] = 1;
      coll.ensureIndex(ob, { unique: true, dropDups: true }, function(errorUpdate, writeSuccess) {
        if (errorUpdate) {
          console.log(errorUpdate);
        }
      });
    }
  });
};
exports.generateRandomSessionIdString = function(prefix) {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
  return prefix == null ? uuid : prefix + uuid;
};
exports.ensureAuthenticated = function(req, res, next) {
  if (!req.app.settings.needsAuth || req.isAuthenticated()) {
    return next();
  }

  return res.redirect('/');
};
exports.hasSessionName = function(criteria) {
  return criteria && criteria.hasOwnProperty('sn');
};
exports.filterSessionVaultNames = function(sessionId, dbConnName, collections) {
  var sessionVaultNames = [];
  for (var i in collections) {
    var collName = collections[i].name.replace(dbConnName + '.', '');
    if (collName.indexOf(sessionId) == 0) {
      sessionVaultNames.push(collName);
    }
  }
  return sessionVaultNames;
};