/*jshint expr: true*/

var should = require('should'); // jshint ignore:line
var config = require('../Config');
var mongoose = require('mongoose');
var sessionInfo = require('../../backend/mongo/SessionInfo');

describe('Sessions', function() {
  var sessionId;
  var SESSION_NAME = 'TEST_SESSION';
  var USER = 'test_user';
  var userInfoModel = {mailAddress: USER, isAuthenticated: true, isMaidSafeUser: true};
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

  before(function(done) {
    prepareDB(done);
  });

  it('Should create a new session', function(done) {
    sessionInfo.createSession(SESSION_NAME, USER, function(err, data) {
      should(err).not.be.ok;
      sessionId = data;
      done();
    });
  });

  it('Should not create a duplicate session', function(done) {
    sessionInfo.createSession(SESSION_NAME, USER, function(err) {
      should(err).be.ok;
      done();
    });
  });

  it('Should not create a session if user is not available', function(done) {
    sessionInfo.createSession(SESSION_NAME + '2', null, function(err) {
      should(err).be.ok;
      done();
    });
  });

  it('Should be able to get all current sessions as maidsafe user', function(done) {
    sessionInfo.getCurrentSessions(userInfoModel, function(err, data) {
      should(err).not.be.ok;
      data.length.should.be.above(0);
      done();
    });
  });

  it('Should be able to get current sessions if user is not a Maidsafe user', function(done) {
    userInfoModel.isMaidSafeUser = false;
    sessionInfo.getCurrentSessions(userInfoModel, function(err) {
      should(err).not.be.ok;
      done();
    });
  });

  it('Should not be able to get current sessions if user is not authenticated', function(done) {
    userInfoModel.isAuthenticated = false;
    sessionInfo.getCurrentSessions(userInfoModel, function(err) {
      should(err).not.be.ok;
      done();
    });
  });

  it('Session should be valid', function(done) {
    sessionInfo.isValidSessionId({'session_id': sessionId}).then(function(data) {
      should(data).be.ok;
      done();
    }, function(err) {
      should(err).not.be.ok;
      done();
    });
  });

  it('Session should not be valid', function(done) {
    sessionInfo.isValidSessionId({'session_id': 'JUNK-SESSION'}).then(function(data) {
      should(data).not.be.ok;
      done();
    }, function(err) {
      should(err).not.be.ok;
      done();
    });
  });

  it('Session be able to get Session Id for the Session Name', function(done) {
    sessionInfo.getSessionIdForName(SESSION_NAME).then(function(data) {
      should(data).be.ok;
      done();
    }, function(err) {
      should(err).not.be.ok;
      done();
    });
  });

  it('Session be able to get Session Name for the Session Id', function(done) {
    sessionInfo.getSessionNameForId(sessionId, function(err, data) {
      should(err).not.be.ok;
      should(data).be.exactly(SESSION_NAME);
      done();
    });
  });

  it('Should be able to update session info for Start Action', function(done) {
    var log = {'action_id': 0, 'session_id': sessionId, ts: new Date().toUTCString()};
    sessionInfo.updateSessionInfo(log, function(err) {
      should(err).not.be.ok;
      done();
    });
  });

  it('Should be able to update session info for Stop Action', function(done) {
    var date = new Date();
    var log;
    date.setSeconds(date.getSeconds() + 1);
    log = {'action_id': 18, 'session_id': sessionId, ts: date.toUTCString()};
    sessionInfo.updateSessionInfo(log).then(function(data) {
      should(data).be.exactly('');
      done();
    }, function(err) {
      should(err).not.be.ok;
      done();
    });
  });

  it('Should get time line dates for session', function(done) {
    sessionInfo.getTimelineDates(SESSION_NAME, function(err, data) {
      should(err).not.be.ok;
      should(data).be.ok;
      done();
    });
  });

  it('Should be able to get Session created by for Session name', function(done) {
    sessionInfo.getSessionCreatedByForName(SESSION_NAME).then(function(data) {
      should(data).be.exactly(USER);
      done();
    }, function(err) {
      should(err).not.be.ok;
      done();
    });
  });

  it('Should be able to clear Active Session', function(done) {
    sessionInfo.clearActiveSession(SESSION_NAME, function(err) {
      should(err).not.be.ok;
      done();
    });
  });

  it('Should be able to delete Session', function(done) {
    sessionInfo.deleteSession(SESSION_NAME, function(err) {
      should(err).not.be.ok;
      done();
    });
  });

  after(function(done) {
    db.db.dropDatabase();
    mongoose.disconnect();
    done();
  });
});
