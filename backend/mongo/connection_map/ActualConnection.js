module.exports = function(dbCon) {
  var MongoosePromise = require('mongoose').Promise;
  var instance = this;
  var COLLECTION_NAME_SUFFIX = '_actual_connection';
  var GeneralHandler = function(promise) {
    return function(err, doc) {
      if (err) {
        promise.error(err);
        return;
      }
      promise.complete(doc);
    };
  };
  var saveActualLog = function(log, callback) {
    var promise = new MongoosePromise();
    if (callback) {
      promise.addBack(callback);
    }
    dbCon.db.collection(log.sessionId + COLLECTION_NAME_SUFFIX, function(err, collection) {
      if (err) {
        promise.error(err);
        return;
      }
      collection.save(log, new GeneralHandler(promise));
    });
    return promise;
  };
  var dropCollection = function(sessionId) {
    dbCon.db.dropCollection(sessionId + COLLECTION_NAME_SUFFIX);
  };
  instance.save = saveActualLog;
  instance.dropCollection = dropCollection;
  return instance;
};
