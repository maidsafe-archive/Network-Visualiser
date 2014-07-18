var logService = require('./service/LogService.js');
var utils = require('./utils.js');

var saveLogs = function(req, res) {
  logService.saveLog(req, res);
};
var selectLogs = function(req, res) {
  logService.selectLogs(req, res);
};
var searchLogs = function(req, res) {
  logService.searchLogs(req, res);
};
var getActiveVaults = function(req, res) {
  logService.getActiveVaults(req, res);
};
var history = function(req, res) {
  logService.vaultHistory(req, res);
};
var exportLogs = function(req, res) {
  logService.exportLogs(req, res);
};
var getTimelineDates = function(req, res) {
  logService.getTimelineDates(req, res);
};
var testLog = function(req, res) {
  logService.testLog(req, res);
};
exports.register = function(server) {
  server.post('/log', saveLogs);

  server.get('/vaults', getActiveVaults);
  server.get('/history', history);
  server.get('/selectLogs', selectLogs);

  // server.get('/searchLogs', searchLogs); // Needs implementation in LogService
  server.get('/export', exportLogs);
  server.get('/timelineDates', getTimelineDates);

  server.post('/testlog', testLog);
};