exports.Request = function() {
  this.body = null;
};
exports.Response = function(done, assert) {
  var respCode;
  var respMsg;
  var instance = this;
  if (!assert) {
    done('No assertion specified');
    return;
  }
  if (!done) {
    throw 'done callback is not specified';
  }
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
    try {
      assert(respCode, respMsg);
      try {
        done();
      }catch(e){
        console.log(e);
      };
    } catch (err) {
      done(err);
    }
    return instance;
  };
};
