var express = require('express');
var MongoStore = require('connect-mongo')(express);
var connectMultiparty = require('connect-multiparty');
var methodOverride = require('method-override');

var bridge = require('./backend/mongo/bridge.js');
var userAuth = require('./backend/auth/UserAuth.js');
var logController = require('./backend/maidsafe/LogController.js');
var sessionController = require('./backend/maidsafe/SessionController.js');
var testnetStatusManager = require('./backend/maidsafe/TestnetStatusManager.js');
var ciManager = require('./backend/maidsafe/CIManager.js');
var config = require('./Config.js');
var serverPort = config.Constants.serverPort;
var socketPort = config.Constants.socketPort;

var app = express();

bridge.setupMongooseConnection(function() {
  app.set('needsAuth', userAuth.initAuth(testnetStatusManager.mailerInit));
  app.set('views', __dirname + '/frontend');
  app.set('view engine', 'ejs');
  app.use(express.cookieParser());
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(connectMultiparty());
  app.use(methodOverride());
  app.use(express.session({
    store: new MongoStore({
      url: config.Constants.mongo_con + '/nodeSessions'
    }),
    cookie: { maxAge: 3600000 },
    secret: 'maidsafelogs'
  }));
  userAuth.configureAuth(app);
  app.use(app.router);
  app.use(express.static(__dirname + '/frontend'));


  app.get('/', userAuth.appendUserInfo, function(req, res) {
    if (req.isAuthenticated() && !req._userInfo.isAuthenticated) {
      req._userInfo.invalidAuthMessage = 'Invalid Authentication';
    }

    res.render('sessions', { userInfo: req._userInfo, socketPort: socketPort });
  });

  app.get('/viewer', function(req, res) {
    res.render('viewer', { socketPort: socketPort });
  });

  app.get('/timeline', function(req, res) {
    res.render('timeline', { socketPort: socketPort });
  });

  app.get('/history', function(req, res) {
    res.render('history', { socketPort: socketPort });
  });

  app.get('/search', function(req, res) {
    res.render('search', { socketPort: socketPort });
  });

  app.get('/testnet-status', function(req, res) {
    res.render('testnet-status', { socketPort: socketPort });
  });

  userAuth.setupAuthCallbacks(app);
  sessionController.register(app);
  logController.register(app);
  testnetStatusManager.register(app);
  testnetStatusManager.startChecker();
  ciManager.startChecker();
  app.listen(serverPort);
});