var mongoose = require('mongoose');
var utils = require('./../maidsafe/utils.js');

var KeyValueStorage = function(dbConnection) {

  var SCHEMA, KeyValueData, MODEL_NAME;
  var beginDate, endDate;
  SCHEMA = {
    key: String,
    value: String
  };
  MODEL_NAME = 'keyValueData';
  KeyValueData = mongoose.model(MODEL_NAME, new mongoose.Schema(SCHEMA), MODEL_NAME);
  utils.ensureUniqueDocInMongo(dbConnection, MODEL_NAME, 'key');

  this.clearDates = function() {
    beginDate = null;
    endDate = null;
  };
  this.getTimelineDates = function() {
    var obj = { 'beginDate' : null, 'endDate' : null};
    if (beginDate != null) {
      obj['beginDate'] = beginDate.toISOString();
    }
    if (endDate != null) {
      obj['endDate'] = endDate.toISOString();
    }
    return obj;
  };
  this.checkAndUpdateDates = function(log) {
    // Needs 2 vault Actions with first being a vault started action to set both dates.

    var promise = new mongoose.Promise;
    var newDate = new Date(log.ts);
    var newDateTime = newDate.getTime();
    // make const
    if (log.action_id == 0 && (beginDate == null || beginDate.getTime() > newDateTime)) {
      setDate(true, newDate, promise);
    } else if (beginDate != null && (endDate == null || endDate.getTime() < newDateTime)) {
      setDate(false, newDate, promise);
    } else {
      promise.complete('');
    }

    return promise;
  };
  var setDate = function(isBeginDate, newDate, promise) {
    var obj = {};
    obj['key'] = isBeginDate ? 'beginDate' : 'endDate';
    KeyValueData.update(obj, { $set: { value: newDate.toISOString() } }, { upsert: true }, function(err, doc) {
      if (err) {
        promise.error(err);
      } else if (isBeginDate) {
        beginDate = newDate;
        promise.complete('');
      } else {
        endDate = newDate;
        promise.complete('');
      }
    });
  };
  var getDatesFromDB = function() {
    KeyValueData.find({ key: 'beginDate' }, function(err, doc) {
      if (!err && doc.length != 0) {
        beginDate = new Date(doc[0].value);
      }
    });
    KeyValueData.find({ key: 'endDate' }, function(err, doc) {
      if (!err && doc.length != 0) {
        endDate = new Date(doc[0].value);
      }
    });
  };
  getDatesFromDB();
  return this;
};
exports.KeyValueStorage = KeyValueStorage;