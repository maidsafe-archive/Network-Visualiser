var mongoose = require('mongoose');
var fs = require('fs');
var csv = require('fast-csv');
var utils = require('./../maidsafe/utils.js');

var DBUtil = function(dbConnection) {
  var dbConn = dbConnection;
  var actionMap, personaMap;
  var ACTION_TO_STRING = {
    0: 'Vault Started',
    1: 'Increases count',
    2: 'Decreases count',
    3: 'Blocked Delete Request',
    4: 'Account Transfer',
    5: 'Got Account Transferred',
    6: 'Increase Subscribers',
    7: 'Decrease Subscribers',
    8: 'Move Chunk',
    9: 'Marking Node up',
    10: 'Marking Node Down',
    11: 'Joining PMID Node',
    12: 'Dropping PMID Node',
    13: 'Storing Chunk',
    14: 'Deleting Chunk',
    15: 'Update Version',
    16: 'Remove Account',
    17: 'Network Health changed',
    18: 'Vault Stopping'
  };
  var PERSONA_TO_STRING = {
    0: 'MaidNode',
    1: 'MpidNode',
    2: 'DataGetter',
    3: 'MaidManager',
    4: 'DataManager',
    5: 'PmidManager',
    6: 'PmidNode',
    7: 'MpidManager',
    8: 'VersionHandler',
    9: 'Cachehandler',
    10: 'NA'
  };
  var ExportHandler = function(promise) {
    var fetched = 0;
    var max = 0;
    var outStream;
    this.setTotalCount = function(count) {
      max = count;
    };
    this.setFile = function(outStream_) {
      outStream = outStream_;
    };
    this.callback = function() {
      fetched++;
      if (fetched == max) {
        outStream.end();
        promise.complete(outStream.path);
      }
    };
    return this;
  };
  // ReSharper disable once InconsistentNaming
  var VaultToCSV = function(formattedCollectionName, outStream, handler) {
    var writeToStream = function() {
      dbConn.db.collection(formattedCollectionName, function(err, col) {
        var stream = col.find({}, { __id: 0, __v: 0 }).stream();
        stream.on('data', function(doc) {
          outStream.write(doc.vault_id + ',' + doc.ts + ',' + ACTION_TO_STRING[doc.action_id] + ',' + PERSONA_TO_STRING[doc.persona_id] + ',' + (doc.value1 || '') + ',' + (doc.value2 || '') + '\n');
        });
        stream.on('close', function() {
          setTimeout(function() {
            handler.callback();
          }, 1000);
        });
      });
    };
    writeToStream();
  };
  // ReSharper disable once InconsistentNaming
  var ExportHelper = function(sessionId, promise) {
    var outStream;
    var handler;
    var isReady = false;
    this.setOutStream = function(stream) {
      outStream = stream;
      handler = new ExportHandler(promise);
      handler.setFile(outStream);
      convert();
    };
    var convert = function() {
      if (outStream && isReady) {
        outStream.write("Vault_Id,Timestamp,Action,Persona,Value1,Value2\n");
        dbConn.db.collectionNames(function(e, colls) {
          var sessionVaultNames = utils.filterSessionVaultNames(sessionId, dbConn.name, colls);
          handler.setTotalCount(sessionVaultNames.length);
          for (var index in sessionVaultNames) {
            // ReSharper disable once WrongExpressionStatement
            new VaultToCSV(sessionVaultNames[index], outStream, handler);
          }
        });
      }
    };
    this.streamReady = function(fd) {
      isReady = true;
      convert();
    };

    return this;
  };
  var createTempFile = function(streamReadyCallback) {
    this.fileName = "Logs_" + new Date().getTime() + ".csv";
    this.stream = fs.createWriteStream(this.fileName);
    this.stream.once('open', streamReadyCallback);
    return this;
  };
  this.exportLogs = function(sessionName, sessionInfo) {
    var promise = new mongoose.Promise;
    sessionInfo.getSessionIdForName(sessionName).then(function(sessionId) {
      var helper = new ExportHelper(sessionId, promise);
      var outFile = createTempFile(helper.streamReady);
      helper.setOutStream(outFile.stream);
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
          logManager.save(log);
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
    });
  };
  this.importLogs = function(filePath, vaultInfo, sessionInfo, logManager) {
    var promise = new mongoose.Promise;
    var validationCallback = function(errors) {
      if (errors.length > 0) {
        var err = '';
        for (var i = 0; i < errors.length; i++) {
          err += (errors[i].lineNumber + ' : ' + errors[i].msg + '</br>');
        }
        promise.error(err);
      } else {
        // TODO(Viv) remove this temp name gen to a proper format or get it from the user
        var sessionName = utils.generateRandomSessionIdString("Imported - ");
        sessionInfo.createSession(sessionName).then(function(sessionId) {
          importFactory(filePath, sessionId, vaultInfo, sessionInfo, logManager, promise);
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