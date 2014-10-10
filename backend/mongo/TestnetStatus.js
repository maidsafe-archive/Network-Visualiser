var mongoose = require('mongoose');
var utils = require('./../maidsafe/utils.js');
var MODEL_NAME = 'testnetStatus';
var SCHEMA = {
  entry: Number,
  lastUpdated: String,
  isReady: Boolean,
  connections: [
    {
      contact: String,
      canConnect: Boolean
    }
  ]
};
var TestnetStatus = mongoose.model(MODEL_NAME, new mongoose.Schema(SCHEMA), MODEL_NAME);
var TestnetStatusInfo = function(dbConnection) {
  utils.ensureUniqueDocInMongo(dbConnection, MODEL_NAME, 'entry');
  this.updateTestnetStatus = function(data) {
    var promise = new mongoose.Promise();
    TestnetStatus.update({ entry: 1 }, { lastUpdated: data.lastUpdated, isReady: data.isReady,
    connections: data.connections }, { upsert: true }, function(errSave) {
      if (errSave) {
        promise.error(errSave);
        return;
      }
      promise.complete('Status Updated');
    });
    return promise;
  };
  this.getTestnetStatus = function() {
    var promise = new mongoose.Promise();
    TestnetStatus.findOne({ entry: 1 }, function(err, res) {
      if (err || !res) {
        promise.error(err);
        return;
      }
      promise.complete(res);
    });
    return promise;
  };
  return this;
};
exports.TestnetStatusInfo = TestnetStatusInfo;
