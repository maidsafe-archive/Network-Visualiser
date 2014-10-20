exports.Request = function() {
  this.body = null;
};
exports.Response = function(assert) {
  var respCode;
  var respMsg;
  var instance = this;
  instance.status = function(status) {
    respCode = status;
    return instance;
  };
  instance.send = function(status, msg) {
    if (status && msg) {
      respCode = status;
      respMsg = msg;
    } else {
      respCode = 200;
      respMsg = status;
    }
    if (assert) {
//      try {
        assert(respCode, respMsg);
//        done();
//      } catch (err) {
//        console.log('FAILED');
//        console.log(err);
//        // done(err);
//      }
    }
    return instance;
  };
};
