/*jshint expr: true*/
/*jshint maxstatements: false*/
/*jshint unused:false*/

var should = require('should'); // jshint ignore:line
var config = require('../Config');
var mongoose = require('mongoose');
var sessionInfo = require('../../backend/mongo/SessionInfo');

describe('SessionInfo', function() {
  var sessionId;
  var SESSION_NAME = 'TEST_SESSION';
  var USER = 'test_user';
  var userInfoModel = { mailAddress: USER, isAuthenticated: true, isMaidSafeUser: true };
  var db;

  var prepareDB = function(callback) {
    mongoose.connect(config.Constants.mongoCon, function(connectionError) {
      if (connectionError) {
        callback(connectionError);
        return;
      }
      db = mongoose.connection;
      db.on('error', function() {
        console.error.bind(console, 'connection error:');
      });
      sessionInfo = sessionInfo.SessionMetaData(db);
      callback();
    });
  };

  var createSession = function(callback) {
    sessionInfo.createSession(SESSION_NAME, USER, function(err, data) {
      sessionId = data;
      callback(err, data);
    });
  };

  var deleteSession = function(callback) {
    sessionInfo.deleteSession(SESSION_NAME, function(err) {
      callback(err);
    });
  };

  before(function(done) {
    prepareDB(done);
  });

  it('Should create a new session', function(done) {
    var clearSession = function() {
      deleteSession(function(err) {
        done();
      });
    };

    createSession(function(err, data) {
      should(err).not.be.ok;
      clearSession();
    });
  });

  it('Should not create a duplicate session', function(done) {
    var clearSession = function() {
      deleteSession(function(err) {
        done();
      });
    };

    createSession(function(err, data) {
      sessionInfo.createSession(SESSION_NAME, USER, function(err) {
        should(err).be.ok;
        clearSession();
      });
    });
  });

  it('Should not create a session if user is not available', function(done) {
    sessionInfo.createSession(SESSION_NAME + '2', null, function(err) {
      should(err).be.ok;
      done();
    });
  });

  it('Should be able to get all current sessions as maidsafe user', function(done) {
    var clearSession = function() {
      deleteSession(function(err) {
        done();
      });
    };

    createSession(function(err, data) {
      sessionInfo.createSession(SESSION_NAME, USER, function(err) {
        should(err).be.ok;
        sessionInfo.getCurrentSessions(userInfoModel, function(err, data) {
          should(err).not.be.ok;
          data.length.should.be.above(0);
          clearSession();
        });
      });
    });
  });

  it('Should be able to get current sessions if user is not a Maidsafe user', function(done) {
    var clearSession = function() {
      deleteSession(function(err) {
        done();
      });
    };

    createSession(function(err, data) {
      sessionInfo.createSession(SESSION_NAME, USER, function(err) {
        should(err).be.ok;
        userInfoModel.isMaidSafeUser = false;
        sessionInfo.getCurrentSessions(userInfoModel, function(err) {
          should(err).not.be.ok;
          clearSession();
        });
        userInfoModel.isMaidSafeUser = true;
      });
    });
  });

  it('Should not be able to get current sessions if user is not authenticated', function(done) {
    var clearSession = function() {
      deleteSession(function(err) {
        done();
      });
    };

    createSession(function(err, data) {
      sessionInfo.createSession(SESSION_NAME, USER, function(err) {
        should(err).be.ok;
        userInfoModel.isAuthenticated = false;
        sessionInfo.getCurrentSessions(userInfoModel, function(err) {
          should(err).not.be.ok;
          clearSession();
        });
        userInfoModel.isAuthenticated = true;
      });
    });
  });

  it('Session should be valid', function(done) {
    var clearSession = function() {
      deleteSession(function(err) {
        done();
      });
    };

    createSession(function(err, data) {
      sessionInfo.createSession(SESSION_NAME, USER, function(err) {
        should(err).be.ok;
        sessionInfo.isValidSessionId({ 'sessionId': sessionId }).then(function(data) {
          should(data).be.ok;
          clearSession();
        }, function(err) {
          should(err).not.be.ok;
          clearSession();
        });
      });
    });
  });

  it('Session should not be valid', function(done) {
    sessionInfo.isValidSessionId({ 'sessionId': 'JUNK-SESSION' }).then(function(data) {
      should(data).not.be.ok;
      done();
    }, function(err) {
      should(err).not.be.ok;
      done();
    });
  });

  it('Session be able to get Session Id for the Session Name', function(done) {
    var clearSession = function() {
      deleteSession(function(err) {
        done();
      });
    };

    createSession(function(err, data) {
      sessionInfo.createSession(SESSION_NAME, USER, function(err) {
        should(err).be.ok;
        sessionInfo.getSessionIdForName(SESSION_NAME).then(function(data) {
          should(data).be.ok;
          clearSession();
        }, function(err) {
          should(err).not.be.ok;
          clearSession();
        });
      });
    });
  });

  it('Session be able to get Session Name for the Session Id', function(done) {
    var clearSession = function() {
      deleteSession(function(err) {
        done();
      });
    };

    createSession(function(err, data) {
      sessionInfo.createSession(SESSION_NAME, USER, function(err) {
        should(err).be.ok;
        sessionInfo.getSessionNameForId(sessionId, function(err, data) {
          should(err).not.be.ok;
          should(data).be.exactly(SESSION_NAME);
          clearSession();
        });
      });
    });
  });

  it('Should be able to update session info and get timeline data', function(done) {
    var clearSession = function() {
      deleteSession(function(err) {
        done();
      });
    };

    createSession(function(err, data) {
      sessionInfo.createSession(SESSION_NAME, USER, function(err) {
        should(err).be.ok;
        var log = { 'actionId': 0, 'sessionId': sessionId, ts: new Date().toUTCString() };
        sessionInfo.updateSessionInfo(log, function(err) {
          should(err).not.be.ok;
          var date = new Date();
          date.setSeconds(date.getSeconds() + 1);
          log = { 'actionId': 18, 'sessionId': sessionId, ts: date.toUTCString() };
          sessionInfo.updateSessionInfo(log).then(function(data) {
            sessionInfo.getTimelineDates(SESSION_NAME, function(err, data) {
              should(err).not.be.ok;
              should(data).be.ok;
              clearSession();
            });
          }, function(err) {
            should(err).not.be.ok;
            clearSession();
          });
        });
      });
    });
  });

  it('Should be able to get Session created by for Session name', function(done) {
    var clearSession = function() {
      deleteSession(function(err) {
        done();
      });
    };
    createSession(function(err, data) {
      sessionInfo.createSession(SESSION_NAME, USER, function(err) {
        should(err).be.ok;
        sessionInfo.getSessionCreatedByForName(SESSION_NAME).then(function(data) {
          should(data).be.exactly(USER);
          clearSession();
        }, function(err) {
          should(err).not.be.ok;
          clearSession();
        });
      });
    });
  });

  it('Should throw error while clearing Active Session if the session is not active', function(done) {
    var clearSession = function() {
      deleteSession(function(err) {
        done();
      });
    };
    createSession(function(err, data) {
      should(err).not.be.ok;
      sessionInfo.clearActiveSession(SESSION_NAME, function(err) {
        should(err).be.ok;
        clearSession();
      });
    });
  });

  it('Should be able to clear Active Session', function(done) {
    var clearSession = function() {
      deleteSession(function(err) {
        done();
      });
    };
    createSession(function(err, data) {
      should(err).not.be.ok;
      var log = { 'actionId': 0, 'sessionId': sessionId, ts: new Date().toUTCString() };
      sessionInfo.updateSessionInfo(log, function(err) {
        should(err).not.be.ok;
        sessionInfo.clearActiveSession(SESSION_NAME, function(err, data) {
          should(err).not.be.ok;
          clearSession();
        });
      });
    });
  });

  it('Should be able to delete Session', function(done) {
    createSession(function(err, data) {
      should(err).not.be.ok;
      sessionInfo.deleteSession(SESSION_NAME, function(err) {
        should(err).not.be.ok;
        done();
      });
    });
  });

  after(function(done) {
    db.db.dropDatabase();
    mongoose.disconnect();
    done();
  });
});
