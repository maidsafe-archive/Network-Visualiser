var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var fs = require('fs');
var path = require('path');

var config = require('./../../Config.js');
var utils = require('./../maidsafe/utils.js');
var gAuth;
var needsAuth = true;

exports.initAuth = function(mailerCallback) {
  var fileContent;
  try {
    fileContent = fs.readFileSync(path.resolve(config.Constants.projectRootDir, config.Constants.authPath), 'utf8');
  } catch (e) {
    console.log('UserAuth Disabled');
    needsAuth = false;
    return needsAuth;
  }

  gAuth = JSON.parse(fileContent);

  passport.use(new GoogleStrategy({
      clientID: gAuth.GOOGLE.CLIENT_ID,
      clientSecret: gAuth.GOOGLE.CLIENT_SECRET,
      callbackURL: gAuth.GOOGLE.CALLBACK
    },
    function(accessToken, refreshToken, profile, done) {
      process.nextTick(function() {
        return done(null, { email: profile._json.email });
      });
    }
  ));

  passport.use(new GitHubStrategy({
      clientID: gAuth.GITHUB.CLIENT_ID,
      clientSecret: gAuth.GITHUB.CLIENT_SECRET,
      callbackURL: gAuth.GITHUB.CALLBACK
    },
    function(accessToken, refreshToken, profile, done) {
      process.nextTick(function() {
        return done(null, { email: profile._json.login + '@github' });
      });
    }
  ));

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

  mailerCallback(gAuth.MAIL_ID, gAuth.MAIL_PASS);

  return needsAuth;
};

exports.configureAuth = function(server) {
  if (!needsAuth) {
    return;
  }

  server.use(passport.initialize());
  server.use(passport.session());
};

var setUserInfo = function(req, res, next) {
  var userInfo = {
    isAuthenticated: false,
    isMaidSafeUser: false,
    mailAddress: ''
  };

  if (!needsAuth) {
    userInfo = {
      isAuthenticated: true,
      isMaidSafeUser: true,
      mailAddress: 'debug.mail@maidsafe.net'
    };
  } else if (req.isAuthenticated()) {
    var mailId = req.user.email;
    if (mailId.indexOf(gAuth.MAIDSAFE_USER) > 0) {
      userInfo = {
        isAuthenticated: true,
        isMaidSafeUser: true,
        mailAddress: mailId
      };
    } else {
      for (var index in gAuth.WHITELIST_USERS) {
        if (mailId == gAuth.WHITELIST_USERS[index]) {
          userInfo.isAuthenticated = true;
          userInfo.mailAddress = mailId;
          break;
        }
      }
    }
  }

  req._userInfo = userInfo;
  return next();
};

exports.appendUserInfo = setUserInfo;

exports.setupAuthCallbacks = function(server) {
  if (!needsAuth) {
    return;
  }

  server.get('/auth', setUserInfo, function(req, res) {
    if (req.isAuthenticated() && !req._userInfo.isAuthenticated) {
      res.redirect('/');
      return;
    }

    res.render('sessions', {
      userInfo: req._userInfo,
      socketPort: config.Constants.socketPort
    });
  });

  server.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.email'] }), function(req, res) {
    // The request will be redirected to Google for authentication, so this
    // function will not be called.
  });

  server.get('/auth/github', passport.authenticate('github'), function(req, res) {
    // The request will be redirected to Github for authentication, so this
    // function will not be called.
  });

  server.get('/googlecallback', passport.authenticate('google', { failureRedirect: '/' }), function(req, res) {
    res.redirect('/auth');
  });

  server.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/' }), function(req, res) {
    res.redirect('/auth');
  });
};