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

  this.updateTestnetStatus = function(data) {
    var promise = new mongoose.Promise;
    TestnetStatus.update({ entry: 1 },
                         { last_updated: data.last_updated, is_ready: data.is_ready, connections: data.connections },
                         { upsert: true },
                         function(errSave, resSave) {
      if (errSave) {
        promise.error(errSave);
        return;
      }
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
  return this;
};
exports.TestnetStatusInfo = TestnetStatusInfo;