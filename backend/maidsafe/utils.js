var config = require('./../../Config.js');
var transformLogToCamelCase = function(log) {
  var oldKeys = [ 'vault_id', 'action_id', 'session_id', 'value1', 'value2' ];
  var newKeys = [ 'vaultId', 'actionId', 'sessionId', 'valueOne', 'valueTwo' ];
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
    }
  } catch (err) {
    return false;
  }
  return true;
};
var prepareLogModel = function(log) {
  if (!log.hasOwnProperty('personaId')) {
    log.personaId = config.Constants.naPersonaId;
  }
  if (!isNaN(log.personaId)) {
    log.personaId = parseInt(log.personaId);
  }
  if (log.actionId === config.Constants.networkHealthActionId && !isNaN(log.valueOne)) {
    log.valueOne = parseInt(log.valueOne);
  }
};
exports.assertLogModelErrors = function(log) {
  var errors = null;
  var mandatoryAlways = [ 'vaultId', 'ts', 'sessionId', 'actionId', 'valueOne' ];
  var mandatoryAllValues = mandatoryAlways.slice();
  mandatoryAllValues.push('valueTwo');
  var actionIdWithAllVaulesMandatory = [ 4, 9, 11, 12 ];
  var validationMsg = config.ValidationMsg;
  var addError = function(err) {
    errors = errors || [];
    errors.push(err);
  };
  var validateNumerics = function() {
    if (isNaN(log.personaId)) {
      addError(validationMsg.PERSONA_ID_NOT_A_NUMBER);
    }
    if (!(log.actionId >= 0 && log.actionId <= config.Constants.maxActionIdRange)) {
      addError(validationMsg.ACTIONID_NOT_IN_RANGE);
    }
    if (log.actionId === config.Constants.networkHealthActionId && isNaN(log.valueOne)) {
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
    if (log.actionId !== config.Constants.networkHealthActionId && !log.valueOne) {
      addError(validationMsg.VALUE_ONE_CANNOT_BE_EMPTY);
    }
  };
  var validateLog = function() {
    var fieldsToValidate =
        actionIdWithAllVaulesMandatory.indexOf(log.actionId) > -1 ? mandatoryAllValues : mandatoryAlways;
    for (var index in fieldsToValidate) {
      if (!log.hasOwnProperty(fieldsToValidate[index]) || log[fieldsToValidate[index]] === null) {
        addError(fieldsToValidate[index] + validationMsg.FIELD_MANDATORY);
      }
    }
    if (errors) {
      return errors;
    }
    validateNumerics();
    validateString();
  };
  var validateConnectionMapLog = function() {
    if (!log.vaultId) {
      addError(validationMsg.VAULTID_CANNOT_BE_EMPTY);
    }
    if (!log.valueOne || (!log.valueOne.vaultAdded && !log.valueOne.vaultRemoved)) {
      addError(validationMsg.VALUT_ADDED_OR_REMOVED_MUST_BE_PRESENT);
      return;
    }
    if (log.valueOne.hasOwnProperty('vaultAdded') && typeof(log.valueOne.vaultAdded) !== 'string') {
      addError(validationMsg.VAULT_ADDED_MUST_BE_STRING);
    }
    if (log.valueOne.hasOwnProperty('vaultRemoved') && typeof(log.valueOne.vaultRemoved) !== 'string') {
      addError(validationMsg.VAULT_REMOVED_MUST_BE_STRING);
    }
    if (log.valueOne.hasOwnProperty('closeGroupVaults') && typeof(log.valueOne.closeGroupVaults) !== 'object') {
      addError(validationMsg.CLOSEST_VAULTS_MUST_BE_ARRAY);
    }
  };
  if (log.hasOwnProperty('vault_id')) {
    transformLogToCamelCase(log);
  }
  if (log.ts && !formatDate(log)) {
    addError(validationMsg.INVALID_DATE_FORMAT);
  }
  if (isNaN(log.actionId)) {
    addError(validationMsg.ACTION_ID_NOT_A_NUMBER);
    return errors;
  }
  log.actionId = parseInt(log.actionId);
  if (log.actionId === config.Constants.connectionMapActionId) {
    if (log.valueOne && typeof log.valueOne === 'string') {
      log.valueOne = JSON.parse(log.valueOne);
    }
    validateConnectionMapLog();
    return errors;
  }
  prepareLogModel(log);
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
exports.likeSearchForVault = function(value) {
  var keys = [ 'valueOne', 'valueTwo', 'actionId', 'personaId', 'ts' ];
  var criteria = [];
  var key;
  var condition;
  for (var keyIndex in keys) {
    if (keys[keyIndex]) {
      key = keys[keyIndex];
      condition = {};
      if ((key === 'actionId' || key === 'personaId') && isNaN(value)) {
        continue;
      } else if (key === 'actionId' || key === 'personaId') {
        condition[key] = parseInt(value);
      } else { // For like operation on strings
        condition[key] = new RegExp(value, 'i');
      }
      criteria.push(condition);
    }
  }
  return criteria;
};
