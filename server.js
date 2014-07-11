var express = require('express');

var userAuth = require('./backend/auth/UserAuth.js');
var logController = require('./backend/maidsafe/LogController.js');
var sessionController = require('./backend/maidsafe/SessionController.js');
var config = require('./Config.js');
var PORT = config.Constants.serverPort;

var app = express();

app.configure(function() {
  app.set('needsAuth', userAuth.initAuth(app));
  app.set('views', __dirname + '/client');
  app.set('view engine', 'ejs');
  // app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'maidsafelogs' }));
  userAuth.configureAuth(app);
  app.use(app.router);
  app.use(express.static(__dirname));
});

app.get('/', function(req, res) {
  res.render('sessions', { user: { enabled: !app.settings.needsAuth }, socketPort: PORT });
});

app.get('/client/viewer', function(req, res) {
  res.render('viewer', { socketPort: PORT });
});

app.get('/client/timeline', function(req, res) {
  res.render('timeline', { socketPort: PORT });
});

app.get('/client/history', function(req, res) {
  res.render('history', { socketPort: PORT });
});

userAuth.setupAuthCallbacks(app);

sessionController.register(app);
logController.register(app);
app.listen(PORT);