exports.Request = function() {
  this.body = null;
};
exports.Response = function(done, assert) {
  var respCode;
  var respMsg;
  var instance = this;
  instance.status = function(status) {
    respCode = status;
    return instance;
  };
  this.send = function(status, msg) {
    if (status && msg) {
      respCode = status;
      respMsg = msg;
    } else {
      respCode = 200;
      respMsg = status;
    }
    if (assert) {
      try {
        assert(respCode, respMsg);
      } catch (err) {
        done(err);
      }
    }
    return instance;
  };
};
