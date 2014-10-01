var bridge = require('./../../../backend/mongo/bridge.js');
var Handler = require('./Handler.js');
var utils = require('./../utils.js');
var url = require('url');
var config = require('./../../../Config.js');
var saveLog = function(req, res) {
  var log = req.body;
  if (!utils.formatDate(log)) {
    res.send(500, 'Invalid date time format');
    return;
  }
  if (!log.hasOwnProperty('persona_id')) {
    // jshint sub:true
    log['persona_id'] = config.Constants.naPersonaId;
    // jshint sub:false
  }
  if (!utils.isValid(log)) {
    res.send(500, 'Invalid Parameters');
    return;
  }
  var handler = new Handler.SaveLogHandler(res);
  bridge.addLog(log, handler.promise, handler.refreshSessionsCallback);
};
var selectLogs = function(req, res) {
  var criteria = url.parse(req.url, true).query;
  if (!criteria || utils.isEmptyObject(criteria) || !utils.hasSessionName(criteria)) {
    res.send(500, 'Invalid select criteria');
    return;
  }
  var offset = new Date(criteria.ts).getTime() + ((criteria.offset || 1) * 60000);
  bridge.selectLogs(criteria.sn, {'ts': {'$gt': criteria.ts, '$lt': new Date(offset).toISOString()}},
    new Handler.SelectLogsHandler(res));
};
var searchLogs = function(req, res) {
  var criteria = url.parse(req.url, true).query;
  if (!criteria || !utils.hasSessionName(criteria) || !criteria.hasOwnProperty('query')) {
    res.send(500, 'Invalid Search');
    return;
  }
  // TODO Create criteria from request and perform a simple select
  // var searchCriteria = {};
  // bridge.selectLogs(criteria.sn, , new Handler.SelectLogsHandler(res));
};
var history = function(req, res) {
  var criteria = url.parse(req.url, true).query;
  if (!utils.hasSessionName(criteria)) {
    res.send(500, 'Missing Session Name');
    return;
  }
  var timeCriteria = criteria.ts ? {'ts': {'$lt': criteria.ts}} : {};
  if (utils.isPageRequestValid(criteria)) {
    // jshint sub:true
    bridge.vaultHistory(criteria.sn, criteria['vault_id'], timeCriteria,
      parseInt(criteria.page), parseInt(criteria.max), new Handler.SelectLogsHandler(res));
    // jshint sub:false
  } else {
    res.send(500, 'Invalid Request');
  }
};
var getCurrentActiveVaults = function(req, res, sessionName) {
  bridge.getActiveVaults(sessionName).then(function(vaults) {
    var counter = 0;
    var results = {};
    if (!vaults.length) {
      res.send(500, 'No vaults are active');
      return;
    }
    for (var index in vaults) {
      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      // jshint camelcase:false
      if (vaults[index].vault_id) {
        results[vaults[index].vault_id] = {
          vault_id_full: vaults[index].vault_id_full,
          host_name: vaults[index].host_name,
          logs: []
        };
        bridge.vaultHistory(sessionName, vaults[index].vault_id, {}, 0, config.Constants.vaultLogsCount)
          .then(function(logs) {
            counter++;
            if (logs.length > 0) {
              results[logs[0].vault_id].logs = logs;
            }
            if (counter >= vaults.length) {
              res.send(results);
            }
          }, function(err) {
            res.status(500).send(err);
          });
        }
      // jshint camelcase:true
      // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
      }
  });
};
var getActiveVaultsAtTime = function(criteria, res, sessionName) {
  bridge.getAllVaultNames(sessionName).then(function(vaults) {
    var results = {};
    var counter = 0;
    if (vaults.length === 0) {
      res.send(500, 'No active vaults');
    } else {
      for (var index in vaults) {
        // jshint camelcase:false
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        if (vaults[index].vault_id) {
          results[vaults[index].vault_id] = {
            vault_id_full: vaults[index].vault_id_full,
            host_name: vaults[index].host_name,
            logs: []
          };
          bridge.vaultHistory(sessionName, vaults[index].vault_id, {ts: {'$lt': criteria.ts}}, 0,
            config.Constants.vaultLogsCount).then(function(logs) {
              counter++;
              if (logs.length > 0) {
                results[logs[0].vault_id].logs = logs;
              }
              if (counter >= vaults.length) {
                res.send(results);
              }
            }, function(err) {
              console.log(err);
            });
        }
        // jshint camelcase:true
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
      }
    }
  });
};
var activeVaultsWithRecentLogs = function(req, res) {
  var criteria = url.parse(req.url, true).query;
  if (!utils.hasSessionName(criteria)) {
    res.send(500, 'Missing Session Name');
    return;
  }
  if (criteria.ts) {
    getActiveVaultsAtTime(criteria, res, criteria.sn);
  } else {
    getCurrentActiveVaults(req, res, criteria.sn);
  }
};
var getTimelineDates = function(req, res) {
  var criteria = url.parse(req.url, true).query;
  if (!utils.hasSessionName(criteria)) {
    res.send(500, 'Missing Session Name');
    return;
  }
  bridge.getTimelineDates(criteria.sn).then(function(dates) {
    res.send(dates);
  }, function(err) {
    res.send(500, err);
  });
};
var testLog = function(req, res) {
  var log = req.body;
  if (!utils.formatDate(log)) {
    res.send(500, 'Invalid date time format');
    return;
  }
  if (!utils.isValid(log)) {
    res.send(500, 'Invalid Parameters');
    return;
  }
  var expectedSessionId = '54ca73ce-0c3c-4155-c9e3-c89d74ad5602';
  // jshint camelcase:false
  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
  if (log.session_id !== expectedSessionId) {
    // jshint camelcase:true
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    res.send(500, 'Invalid Session');
  } else {
    res.send(200, 'Saved');
  }
};
exports.saveLog = saveLog;
exports.selectLogs = selectLogs;
exports.searchLogs = searchLogs;
exports.vaultHistory = history;
exports.getActiveVaults = activeVaultsWithRecentLogs;
exports.getTimelineDates = getTimelineDates;
exports.testLog = testLog;
