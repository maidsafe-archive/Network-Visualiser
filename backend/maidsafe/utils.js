var config = require('./../../Config.js');
var transformLogToCamelCase = function(log) {
  var oldKeys = [ 'vault_id', 'action_id', 'session_id' ];
  var newKeys = [ 'vaultId', 'actionId', 'sessionId' ];
  var addCamelCaseKeys = function() {
    var index;
    for (var key in log) {
      if ((index = oldKeys.indexOf(key)) > -1) {
        log[newKeys[index]] = log[key];
      }
    }
  };
  var removeOldKeys = function() {
    for (var index in oldKeys) {
      if (log.hasOwnProperty(oldKeys[index])) {
        delete log[oldKeys[index]];
      }
    }
  };
  addCamelCaseKeys();
  removeOldKeys();
};
var formatDate = function(log) {
  try {
    if (log.ts) {
      if (log.ts.indexOf('UTC') < 0 && (log.ts.indexOf('Z') !== log.ts.length - 1)) {
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
var prepareLogModel = function(log) {
  if (log.hasOwnProperty('vault_id')) {
    transformLogToCamelCase(log);
  }
  if (!log.hasOwnProperty('personaId')) {
    log.personaId = config.Constants.naPersonaId;
  }
  if (!isNaN(log.actionId)) {
    log.actionId = parseInt(log.actionId);
  }
  if (!isNaN(log.personaId)) {
    log.personaId = parseInt(log.personaId);
  }
  if (log.actionId === config.Constants.networkHealthActionId && !isNaN(log.value1)) {
    log.value1 = parseInt(log.value1);
  }
};
exports.assertLogModelErrors = function(log) {
  var errors = null;
  var mandatoryAlways = [ 'vaultId', 'ts', 'sessionId', 'actionId', 'value1' ];
  var mandatoryAllValues = mandatoryAlways.slice().push('value2');
  var actionIdWithAllVaulesMandatory = [ 4, 5, 15 ];
  var validationMsg = config.ValidationMsg;
  var addError = function(err) {
    errors = errors || [];
    errors.push(err);
  };
  var validateNumerics = function() {
    if (isNaN(log.personaId)) {
      addError(validationMsg.PERSONA_ID_NOT_A_NUMBER);
    }
    if (isNaN(log.actionId)) {
      addError(validationMsg.ACTION_ID_NOT_A_NUMBER);
    } else if (!(log.actionId >= 0 && log.actionId <= config.Constants.maxActionIdRange)) {
      addError(validationMsg.ACTIONID_NOT_IN_RANGE);
    }
    if (log.actionId === config.Constants.networkHealthActionId && isNaN(log.value1)) {
      addError(validationMsg.NETWORK_HEALTH_MUST_BE_INTEGER);
    }
  };
  var validateString = function() {
    if (!log.vaultId) {
      addError(validationMsg.VAULTID_CANNOT_BE_EMPTY);
    }
    if (!log.sessionId) {
      addError(validationMsg.SESSIONID_CANNOT_BE_EMPTY);
    }
    if (log.actionId !== config.Constants.networkHealthActionId && !log.value1) {
      addError(validationMsg.VALUE_ONE_CANNOT_BE_EMPTY);
    }
  };
  var validateLog = function() {
    var fieldsToValidate =
        actionIdWithAllVaulesMandatory.indexOf(log.actionId) > -1 ? mandatoryAllValues : mandatoryAlways;
    for (var index in fieldsToValidate) {
      if (!log.hasOwnProperty(fieldsToValidate[index])) {
        addError(fieldsToValidate[index] + validationMsg.FIELD_MANDATORY);
      }
    }
    if (errors) {
      return errors;
    }
    validateNumerics();
    validateString();
  };
  prepareLogModel(log);
  if (!formatDate(log)) {
    addError(validationMsg.INVALID_DATE_FORMAT);
  }
  validateLog();
  return errors;
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
  if (criteria.vaultId) {
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
