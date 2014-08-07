var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
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
      clientID: gAuth.CLIENT_ID,
      clientSecret: gAuth.CLIENT_SECRET,
      callbackURL: gAuth.CALLBACK
    },
    function(accessToken, refreshToken, profile, done) {
      // asynchronous verification, for effect...
      process.nextTick(function() {

        // The user's Google profile is returned to
        // represent the logged-in user.
        return done(null, profile);
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
    var mailId = req.user._json.email;
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

  server.get('/googlecallback', passport.authenticate('google', { failureRedirect: '/' }), function(req, res) {
    res.redirect('/auth');
  });
};