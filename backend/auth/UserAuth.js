var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var fs = require('fs');
var path = require('path');
var config = require('./../../Config.js');
var gAuth;
var needsAuth = true;
var googleOauthScope = { scope: [ 'https://www.googleapis.com/auth/userinfo.email' ] };
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
  }, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
      /* jscs:disable disallowDanglingUnderscores */
      return done(null, { email: profile._json.email });
      /* jscs:enable disallowDanglingUnderscores */
    });
  }));
  passport.use(new GitHubStrategy({
    clientID: gAuth.GITHUB.CLIENT_ID,
    clientSecret: gAuth.GITHUB.CLIENT_SECRET,
    callbackURL: gAuth.GITHUB.CALLBACK
  }, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
      /* jscs:disable disallowDanglingUnderscores */
      return done(null, { email: profile._json.login + '@github' });
      /* jscs:enable disallowDanglingUnderscores */
    });
  }));
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
    var checkIfWhiteListUser = function() {
      for (var index in gAuth.WHITELIST_USERS) {
        if (mailId === gAuth.WHITELIST_USERS[index]) {
          userInfo.isAuthenticated = true;
          userInfo.mailAddress = mailId;
          break;
        }
      }
    };
    if (mailId.indexOf(gAuth.MAIDSAFE_USER) > 0) {
      userInfo = {
        isAuthenticated: true,
        isMaidSafeUser: true,
        mailAddress: mailId
      };
    } else {
      checkIfWhiteListUser();
    }
  }
  /* jscs:disable disallowDanglingUnderscores */
  req._userInfo = userInfo;
  /* jscs:enable disallowDanglingUnderscores */
  return next();
};
exports.appendUserInfo = setUserInfo;
exports.setupAuthCallbacks = function(server) {
  if (!needsAuth) {
    return;
  }
  server.get('/auth', setUserInfo, function(req, res) {
    /* jscs:disable disallowDanglingUnderscores */
    if (req.isAuthenticated() && !req._userInfo.isAuthenticated) {
      res.redirect('/');
      return;
    }
    /* jscs:enable disallowDanglingUnderscores */
    res.render('sessions', {
      /* jscs:disable disallowDanglingUnderscores */
      userInfo: req._userInfo,
      /* jscs:enable disallowDanglingUnderscores */
      socketPort: config.Constants.socketPort
    });
  });
  /* jshint unused:false*/
  server.get('/auth/google', passport.authenticate('google', googleOauthScope), function(req, res) {
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
  /* jshint unused:true*/
  server.get('/auth/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });
};
