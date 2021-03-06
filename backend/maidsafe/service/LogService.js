var bridge = require('./../../../backend/mongo/bridge.js');
var Handler = require('./Handler.js');
var utils = require('./../utils.js');
var url = require('url');
var config = require('./../../../Config.js');
var queue = require('./QueueService');
var socket = require('./../../socket/Socket');
var connectionMapService = require('./ConnectionMapService');

var saveLog = function(req, res) {
  var log = req.body;
  var sessionId = log.sessionId;
  var err = utils.assertLogModelErrors(log);
  if (err) {
    res.send(400, err);
    return;
  }
  var handler  = new Handler.SaveLogHandler(res);
  var SaveToActualConn = function(log, response) {
    bridge.connectionMap.addActualLog(log, function(err, data) {
      response.status(err ? 500 : 200);
      response.send(err ? err.message : data);
      if (!err) {
        socket.broadcastActualConnection(log);
      }
    });
  };
  if (log.actionId === config.Constants.connectionMapActionId) {
    new SaveToActualConn(log, res);
    return;
  }
  var addLogHandler = function(err) {
    if (err) {
      handler.promise(err);
    }
    if (log.actionId === config.Constants.startActionId || log.actionId === config.Constants.stopActionId) {
      log.sessionId = sessionId;
      queue.pushToQueue(log);
      new SaveToActualConn(log, res);
    }
    handler.promise(err, log);
  };
  bridge.addLog(log, addLogHandler, handler.refreshSessionsCallback);
};
var selectLogs = function(req, res) {
  var criteria = url.parse(req.url, true).query;
  if (!criteria || utils.isEmptyObject(criteria) || !utils.hasSessionName(criteria)) {
    res.send(500, 'Invalid select criteria');
    return;
  }
  var offset = new Date(criteria.ts).getTime() + ((criteria.offset || 1) * 60000);
  bridge.selectLogs(criteria.sn, { 'ts': { '$gt': criteria.ts, '$lt': new Date(offset).toISOString() } },
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
  var searchCriteria = criteria.searchVal ? utils.likeSearchForVault(criteria.searchVal) : {};
  if (utils.isPageRequestValid(criteria)) {
    bridge.vaultHistory(criteria.sn, criteria.vaultId, searchCriteria,
      parseInt(criteria.page), parseInt(criteria.max), new Handler.SelectLogsHandler(res));
  } else {
    res.send(500, 'Invalid Request');
  }
};
var getCurrentActiveVaults = function(req, res, sessionName) {
  bridge.getActiveVaults(sessionName).then(function(vaults) {
    var counter = 0;
    var results = {};
    var errorHandler = function(err) {
      res.status(500).send(err);
    };
    var onSuccess = function(logs) {
      counter++;
      if (logs.length > 0) {
        results[logs[0].vaultId].logs = logs;
      }
      if (counter >= vaults.length) {
        res.send(results);
      }
    };
    if (!vaults.length) {
      res.send(500, 'No vaults are active');
      return;
    }
    for (var index in vaults) {
      if (vaults[index].vaultId) {
        results[vaults[index].vaultId] = {
          vaultIdFull: vaults[index].vaultIdFull,
          hostName: vaults[index].hostName,
          logs: []
        };
        bridge.vaultHistory(sessionName, vaults[index].vaultId, {}, 0, config.Constants.vaultLogsCount)
          .then(onSuccess, errorHandler);
      }
    }
  });
};
var getActiveVaultsAtTime = function(criteria, res, sessionName) {
  bridge.getAllVaultNames(sessionName).then(function(vaults) {
    var results = {};
    var counter = 0;
    var onError =  function(err) {
      console.log(err);
    };
    var onSuccess = function(logs) {
      counter++;
      if (logs.length > 0) {
        results[logs[0].vaultId].logs = logs;
      }
      if (counter >= vaults.length) {
        res.send(results);
      }
    };
    if (vaults.length === 0) {
      res.send(500, 'No active vaults');
    } else {
      for (var index in vaults) {
        if (vaults[index].vaultId) {
          results[vaults[index].vaultId] = {
            vaultIdFull: vaults[index].vaultIdFull,
            hostName: vaults[index].hostName,
            logs: []
          };
          bridge.vaultHistory(sessionName, vaults[index].vaultId, { ts: { '$lt': criteria.ts } }, 0,
            config.Constants.vaultLogsCount).then(onSuccess, onError);
        }
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
  var err = utils.assertLogModelErrors(log);
  if (err) {
    res.send(400, err);
    return;
  }
  var expectedSessionId = '54ca73ce-0c3c-4155-c9e3-c89d74ad5602';
  if (log.sessionId !== expectedSessionId) {
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
exports.connectionMap = connectionMapService;
