var express = require('express');
var MongoStore = require('connect-mongo')(express);
var connectMultiparty = require('connect-multiparty');
var methodOverride = require('method-override');

var userAuth = require('./backend/auth/UserAuth.js');
var logController = require('./backend/maidsafe/LogController.js');
var sessionController = require('./backend/maidsafe/SessionController.js');
var ciManager = require('./backend/maidsafe/CIManager.js');
var config = require('./Config.js');
var serverPort = config.Constants.serverPort;
var socketPort = config.Constants.socketPort;

var app = express();

app.set('needsAuth', userAuth.initAuth(app));
app.set('views', __dirname + '/client');
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
app.use(express.static(__dirname));


app.get('/', userAuth.appendUserInfo, function(req, res) {
  res.render('sessions', { userInfo: req._userInfo, socketPort: socketPort });
});

app.get('/client/viewer', function(req, res) {
  res.render('viewer', { socketPort: socketPort });
});

app.get('/client/timeline', function(req, res) {
  res.render('timeline', { socketPort: socketPort });
});

app.get('/client/history', function(req, res) {
  res.render('history', { socketPort: socketPort });
});

app.get('/client/search', function(req, res) {
  res.render('search', { socketPort: socketPort });
});

userAuth.setupAuthCallbacks(app);
sessionController.register(app);
logController.register(app);
ciManager.startChecker();
app.listen(serverPort);