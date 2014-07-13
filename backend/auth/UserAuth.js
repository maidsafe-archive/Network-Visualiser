var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var fs = require('fs');
var path = require('path');

var config = require('./../../Config.js');
var utils = require('./../maidsafe/utils.js');
var gAuth;
var needsAuth = true;

exports.initAuth = function(server, callback) {
  var fileContent;
  try {
    fileContent = fs.readFileSync(path.resolve(__dirname, '../../gauth.json'), 'utf8');
  } catch (e) {
    console.log('UserAuth Disabled');
    needsAuth = false;
    return needsAuth;
  }

  gAuth = JSON.parse(fileContent);

  //   Use the GoogleStrategy within Passport.
  //   Strategies in Passport require a `verify` function, which accept
  //   credentials (in this case, an accessToken, refreshToken, and Google
  //   profile), and invoke a callback with a user object.
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

  // API Access link for creating client ID and secret:
  // https://code.google.com/apis/console/
  // Passport session setup.
  // To support persistent login sessions, Passport needs to be able to
  // serialize users into and deserialize users out of the session.  Typically,
  // this will be as simple as storing the user ID when serializing, and finding
  // the user by ID when deserializing.
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

  return needsAuth;
};

exports.configureAuth = function(server) {
  if (!needsAuth) {
    return;
  }

  server.use(passport.initialize());
  server.use(passport.session());
};

exports.setupAuthCallbacks = function(server) {
  if (!needsAuth) {
    return;
  }

  server.get('/auth', utils.ensureAuthenticated, function(req, res) {
    res.render('index', {
      user: {
        enabled: req.user._json.email.indexOf(gAuth.VALIDATION_STRING) > 0,
        email: req.user._json.email
      },
      socketPort: config.Constants.socketPort
    });
  });

  // GET /auth/google
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  The first step in Google authentication will involve
  //   redirecting the user to google.com.  After authorization, Google
  //   will redirect the user back to this application
  server.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.email'] }), function(req, res) {
    // The request will be redirected to Google for authentication, so this
    // function will not be called.
  });

  // GET /auth/google/callback
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function function will be called,
  //   which, in this example, will redirect the user to the home page.
  server.get('/googlecallback', passport.authenticate('google', { failureRedirect: '/' }), function(req, res) {
    res.redirect('/auth');
  });
};