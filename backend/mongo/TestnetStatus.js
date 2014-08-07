var mongoose = require('mongoose');
var utils = require('./../maidsafe/utils.js');

var TestnetStatusInfo = function(dbConnection) {
  var SCHEMA, TestnetStatus, MODEL_NAME;
  SCHEMA = {
    entry: Number,
    last_updated: String,
    is_ready: Boolean,
    connections: [
      {
        contact: String,
        canConnect: Boolean
      }
    ]
  };
  MODEL_NAME = 'testnetStatus';
  TestnetStatus = mongoose.model(MODEL_NAME, new mongoose.Schema(SCHEMA), MODEL_NAME);
  utils.ensureUniqueDocInMongo(dbConnection, MODEL_NAME, 'entry');

  this.updateTestnetStatus = function(data, callback) {
    var promise = new mongoose.Promise;
    var updateCriteria = { $set: { last_updated: data.last_updated, is_ready: data.is_ready, connections: data.connections } };
    TestnetStatus.findOneAndUpdate({ entry: 1 }, updateCriteria, { new: false }).exec(function(errSave, oldEntry) {
      if (errSave) {
        promise.error(errSave);
        return;
      }

      /*if (!callback) {
        promise.complete('Status Updated');
        return;
      }

      if (!oldEntry) {
        callback(data.is_ready);
        promise.complete('Status Updated');
        return;
      }

      var oldConnections = oldEntry.connections;
      var newConnections = data.connections;
      if (oldConnections.length != newConnections.length) {
        callback(data.is_ready);
        promise.complete('Status Updated');
        return;
      }

      oldConnections.sort(sortConnections);
      newConnections.sort(sortConnections);
      for (var index in oldConnections) {
        if ((oldConnections[index].contact != newConnections[index].contact) ||
            (oldConnections[index].canConnect != newConnections[index].canConnect)) {
          callback(data.is_ready);
          break;
        }
      }*/

      promise.complete('Status Updated');
    });
    return promise;
  };
  this.getTestnetStatus = function() {
    var promise = new mongoose.Promise;

    TestnetStatus.findOne({ entry: 1 }, function(err, res) {
      err || !res ? promise.error(err) : promise.complete(res);
    });
    return promise;
  };

  var sortConnections = function(leftItem, rightItem) {
    return leftItem.contact.localeCompare(rightItem.contact);
  };

  return this;
};
exports.TestnetStatusInfo = TestnetStatusInfo;