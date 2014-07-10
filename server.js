var express = require('express'),
    passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var logController = require('./backend/maidsafe/LogController.js');
var config = require('./Config.js');
var fs = require('fs');
var path = require('path');
var app = express();
var PORT = config.Constants.serverPort;
var gAuth;
var needsAuth = true;

fs.readFile(path.resolve(__dirname, 'gauth.json'), 'utf8', function(err, data) {
  if (err) {
    console.log('Error: ' + err);
    needsAuth = false;
    return;
  }

  gAuth = JSON.parse(data);

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


});


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


// configure Express
app.configure(function() {
  app.set('views', __dirname + '/client');
  app.set('view engine', 'ejs');
  //app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'maidsafelogs' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname));
});


app.get('/', function(req, res) {
  res.render('index', { user: { enabled: !needsAuth }, socketPort: config.Constants.socketPort });
});

app.get('/auth', ensureAuthenticated, function(req, res) {
  res.render('index', { user: { enabled: req.user._json.email.indexOf(gAuth.VALIDATION_STRING) > 0, email: req.user._json.email }, socketPort: config.Constants.socketPort });
});

app.get('/client/timeline', function(req, res) {
  res.render('timeline', { socketPort: config.Constants.socketPort });
});

app.get('/client/history', function(req, res) {
  res.render('history', { socketPort: config.Constants.socketPort });
});

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application
app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/userinfo.email']
  }),
  function(req, res) {
    // The request will be redirected to Google for authentication, so this
    // function will not be called.
  });

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/googlecallback',
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/auth');
  });


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

logController.register(app);
app.listen(PORT);