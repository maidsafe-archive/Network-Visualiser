var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var https = require('https');
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
      process.nextTick(function() {
        return done(null, { email: profile._json.email });
      });
    }
  ));

  passport.use(new BearerStrategy({ },
    function(token, done) {
      process.nextTick(function () {
        var options = {
          host: 'www.googleapis.com',
          path: '/oauth2/v1/userinfo',
          headers: { Authorization: 'Bearer ' + token}
        };

        var confirmReq = https.get(options, function(result) {
          if (result.statusCode !== 200) {
            return done("Invalid Token");
          }

          var responseParts = [];
          result.setEncoding('utf8');
          result.on("data", function(chunk) {
            responseParts.push(chunk);
          });
          result.on("end", function(){
            responseParts.join('');
            responseParts = JSON.parse(responseParts);
            return done(null, { email: responseParts.email });
          });
        });

        confirmReq.on('error', function() {
          return done("Invalid Token");
        });
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

  server.get('/auth/bearer', passport.authenticate('bearer'), function(req, res) {
    res.send('Success');
  });

  server.get('/googlecallback', passport.authenticate('google', { failureRedirect: '/' }), function(req, res) {
    res.redirect('/auth');
  });
};