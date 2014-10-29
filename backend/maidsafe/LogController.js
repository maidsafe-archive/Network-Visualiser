var logService = require('./service/LogService.js');
var url = require('url');
var saveLogs = function(req, res) {
  logService.saveLog(req, res);
};
var selectLogs = function(req, res) {
  logService.selectLogs(req, res);
};
/*var searchLogs = function(req, res) {
  logService.searchLogs(req, res);
};*/
var getActiveVaults = function(req, res) {
  logService.getActiveVaults(req, res);
};
var history = function(req, res) {
  logService.vaultHistory(req, res);
};
var getTimelineDates = function(req, res) {
  logService.getTimelineDates(req, res);
};
var testLog = function(req, res) {
  logService.testLog(req, res);
};
var getConnectionMapSnapshot = function(req, res) {
  var criteria = url.parse(req.url, true).query;
  if (!criteria || !criteria.sn) {
    res.send(400, 'SessionName missing in parameter');
    return;
  }
  logService.connectionMap.snapshot(criteria.sn, criteria.ts || new Date().toISOString(), function(err, data) {
    res.status(err ? 500 : 200);
    res.send(err ? 'An Error Occurred' : data);
  });
};
exports.register = function(server) {
  server.post('/log', saveLogs);
  server.get('/backend/vaults', getActiveVaults);
  server.get('/backend/history', history);
  server.get('/backend/selectLogs', selectLogs);
  // server.get('/searchLogs', searchLogs); // Needs implementation in LogService
  server.get('/backend/timelineDates', getTimelineDates);
  server.post('/testlog', testLog);
  server.get('/connectionMapSnapshot', getConnectionMapSnapshot);
};
