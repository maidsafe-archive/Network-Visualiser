var config = require('./../../Config.js');
exports.isValid = function(log) {
  return (log.vault_id && log.action_id && log.persona_id);
};
exports.formatDate = function(log) {
  try {
    if (log.ts) {
      if (log.ts.indexOf('GMT') < 0) //since utc time
        log.ts += 'GMT';
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