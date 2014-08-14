var mongoose = require('mongoose');
var fs = require('fs');
var csv = require('fast-csv');
var utils = require('./../maidsafe/utils.js');
var async = require('async');
var Transform = require('stream').Transform;

var DBUtil = function(dbConnection) {
  var dbConn = dbConnection;
  var actionMap, personaMap;
  var ACTION_TO_STRING = {
    0: 'Vault Started',
    1: 'Increase count to',
    2: 'Decrease count to',
    3: 'Blocked Delete Request',
    4: 'Account Transfer',
    5: 'Got Account Transferred',
    6: 'Increase Subscribers to',
    7: 'Decrease Subscribers to',
    8: 'Move Chunk',
    9: 'Marking Node up',
    10: 'Marking Node Down',
    11: 'Joining PMID Node',
    12: 'Dropping PMID Node',
    13: 'Storing Chunk',
    14: 'Deleting Chunk',
    15: 'Update Version',
    16: 'Remove Account',
    17: 'Network Health Changed',
    18: 'Vault Stopping'
  };
  var PERSONA_TO_STRING = {
    0: 'MAID',
    1: 'MPID',
    2: 'Data-Getter',
    3: 'MAID-Manager',
    4: 'Data-Manager',
    5: 'PMID-Manager',
    6: 'PMID',
    7: 'MPID-Manager',
    8: 'Version-Handler',
    9: 'Cache-Handler',
    10: 'NA'
  };

  function createParser() {
    var parser = new Transform({ objectMode: true });
    parser._transform = function(doc, encoding, done) {
      this.push(doc.vault_id + ',' + doc.ts + ',' + ACTION_TO_STRING[doc.action_id] + ',' + PERSONA_TO_STRING[doc.persona_id] + ',' + (doc.value1 || '') + ',' + (doc.value2 || '') + '\n');
      done();
    };
    return parser;
  }

  var appendCollectionToFile = function(formattedCollectionName, fileName) {
    var promise = new mongoose.Promise;
    var outStream = fs.createWriteStream(fileName, { 'flags': 'a' });
    dbConn.db.collection(formattedCollectionName, function(err, col) {
      var stream = col.find({}, { __id: 0, __v: 0 }).sort([['ts', 'ascending']]).stream();
      var res = stream.pipe(createParser()).pipe(outStream);
      res.on('finish', function() {
        promise.complete('');
      });
    });
    return promise;
  };
  var setupExportFile = function() {
    var promise = new mongoose.Promise;
    var fileName = "Logs_" + new Date().getTime() + ".csv";
    fs.writeFile(fileName, "Vault_Id,Timestamp,Action,Persona,Value1,Value2\n", function(err) {
      if (err) {
        promise.error(err);
      } else {
        promise.complete(fileName);
      }
    });
    return promise;
  };
  this.exportLogs = function(sessionName, sessionInfo) {
    var promise = new mongoose.Promise;
    sessionInfo.getSessionIdForName(sessionName).then(function(sessionId) {
      setupExportFile().then(function(fileName) {
        dbConn.db.collectionNames(function(e, colls) {
          var sessionVaultNames = utils.filterSessionVaultNames(sessionId, dbConn.name, colls);
          async.forEachSeries(sessionVaultNames, function(vaultName, callback) {
            appendCollectionToFile(vaultName, fileName).then(function() {
              callback();
            }, function() {
              callback('Export Failed');
            });
          }, function(err) {
            err ? promise.error(err) : promise.complete(fileName);
          });
        });
      });
    }, function(err) {
      promise.error(err);
    });
    return promise;
  };
  var getActionNameMap = function() {
    var map = {};
    for (var key in ACTION_TO_STRING) {
      map[ACTION_TO_STRING[key]] = key;
    }
    return map;
  };
  var getPersonaNameMap = function() {
    var map = {};
    for (var key in PERSONA_TO_STRING) {
      map[PERSONA_TO_STRING[key]] = key;
    }
    return map;
  };
  var getLogFromCSVRow = function(data) {
    return { vault_id: data[0], ts: data[1], action_id: actionMap[data[2]], persona_id: (personaMap[data[3]] || 10), value1: (data[4] || ''), value2: (data[5] || '') };
  };
  var importValidator = function(data) {
    var log = getLogFromCSVRow(data);
    var errString = '';
    var isValid = true;
    var addErrorMessage = function(msg) {
      errString += ((errString == '' ? errString : ', ') + msg);
      isValid = false;
    };
    if (!log.vault_id || log.vault_id == '') {
      addErrorMessage("Vault Id is empty");
    }
    if (!log.ts) {
      addErrorMessage("Timestamp is empty");
    }
    if (log.ts) {
      try {
        var tempDate = new Date(log.ts);
        if (tempDate == "Invalid Date") {
          addErrorMessage("Invalid Timestamp");
        }
      } catch (e) {
        addErrorMessage("Invalid Timestamp");
      }
    }
    if (!log.action_id) {
      addErrorMessage("Action Id is empty or invalid - spell check");
    }
    if (log.action_id) {
      try {
        parseInt(log.action_id);
      } catch (e) {
        addErrorMessage('Invalid Action Id');
      }
    }
    if (log.persona_id) {
      try {
        parseInt(log.action_id);
      } catch (e) {
        addErrorMessage('Invalid Persona Id');
      }
    }

    return { valid: isValid, msg: errString };
  };
  var importFactory = function(filePath, sessionId, vaultInfo, sessionInfo, logManager, promise, validationCallback) {
    var stream = fs.createReadStream(filePath);
    var validationErrors = [];
    var lineNumber = 0;

    // ReSharper disable once InconsistentNaming - Constructor func
    var SaveLog = function(data) {
      var actionId = actionMap[data[2]];
      var log = {
        vault_id: data[0],
        ts: data[1],
        session_id: sessionId,
        action_id: actionId,
        persona_id: personaMap[data[3]],
        value1: (data[4] || ''),
        value2: (data[5] || '')
      };
      vaultInfo.updateVaultStatus(log).then(function() {
        // we assume imported logs hold valid info. Thus stream the intake in parallel.
        sessionInfo.updateSessionInfo(log).then(function() {
          delete log.session_id;
          logManager.save(sessionId, log);
        });
      });
    };

    csv.fromStream(stream).on("record", function(data) {
      if (lineNumber++ == 0) {
        return;
      }

      if (validationCallback) {
        var errorInfo = importValidator(data);
        if (!errorInfo.valid) {
          errorInfo.lineNumber = lineNumber;
          validationErrors.push(errorInfo);
        }
      } else {
        // ReSharper disable once WrongExpressionStatement
        new SaveLog(data);
      }
    }).on("end", function() {
      if (validationCallback) {
        validationCallback(validationErrors);
      } else {
        promise.complete('Added to Server Queue.');
      }
    }).on("error", function() {
      stream.destroy();
      promise.error('Invalid File');
    });
  };
  this.importLogs = function(sessionName, createdBy, filePath, vaultInfo, sessionInfo, logManager) {
    var promise = new mongoose.Promise;
    var validationCallback = function(errors) {
      if (errors.length > 0) {
        var err = '';
        for (var i = 0; i < errors.length; i++) {
          err += (errors[i].lineNumber + ' : ' + errors[i].msg + '</br>');
        }
        promise.error(err);
      } else {
        sessionInfo.createSession(sessionName, createdBy).then(function(sessionId) {
          importFactory(filePath, sessionId, vaultInfo, sessionInfo, logManager, promise);
        }, function(createSessionError) {
          promise.error(createSessionError);
        });
      }
    };
    importFactory(filePath, '', vaultInfo, sessionInfo, logManager, promise, validationCallback);
    return promise;
  };
  actionMap = getActionNameMap();
  personaMap = getPersonaNameMap();
  return this;
};
exports.getDBUtil = DBUtil;