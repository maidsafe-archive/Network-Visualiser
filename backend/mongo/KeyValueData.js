var mongoose = require('mongoose');
var utils = require('./../maidsafe/utils.js');

var KeyValueStorage = function(dbConnection) {

  var SCHEMA, KeyValueData, MODEL_NAME;
  var firstLogTime;
  SCHEMA = {
    key: String,
    value: String
  };
  MODEL_NAME = 'keyValueData';
  KeyValueData = mongoose.model(MODEL_NAME, new mongoose.Schema(SCHEMA), MODEL_NAME);
  utils.ensureUniqueDocInMongo(dbConnection, MODEL_NAME, 'key');

  this.clearFirstLogTime = function() {
    firstLogTime = null;
  };
  this.hasFirstLogTime = function() {
    return firstLogTime != null;
  };
  this.getFirstLogTime = function() {
    return firstLogTime || new Date().toISOString();
  };
  this.setFirstLogTime = function(firstLogTimeISO, promise) { // ISO string
    firstLogTime = firstLogTimeISO;
    KeyValueData.update({ key: 'firstLogTime' }, { $set : { value: firstLogTimeISO }}, { upsert: true }, function(err, doc) {
      if (promise) {
        if (err) {
          promise.error(err);
        } else {
          promise.complete('');
        }
      }
    });
  };
  var setFirstLogTimeFromDB = function() {
    KeyValueData.find({ key: 'firstLogTime' }, function(err, doc) {
      if (!err && doc.length != 0) {
        firstLogTime = doc[0].value;
      }
    });
  };
  setFirstLogTimeFromDB();
  return this;
};
exports.KeyValueStorage = KeyValueStorage;