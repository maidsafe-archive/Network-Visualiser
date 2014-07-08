var logService = require('./service/LogService.js');
var saveLogs = function(req, res) {
  logService.saveLog(req, res);
};
var search = function(req, res) {
  logService.searchLog(req, res);
};
var getActiveVaults = function(req, res) {
  logService.getActiveVaults(req, res);
};
var clearDB = function(req, res) {
  logService.clearAll(req, res);
};
var history = function(req, res) {
  logService.vaultHistory(req, res);
};
var exportLogs = function(req, res) {
  logService.exportLogs(req, res);
};
var importLogs = function(req, res) {
  logService.importLogs(req, res);
};
var getBeginDateString = function(req, res) {
  logService.getBeginDateString(req, res);
};
var testLog = function(req, res) {
  logService.testLog(req, res);
};
exports.register = function(server) {
  server.post('/log', saveLogs);
  server.post('/import', importLogs);

  server.get('/vaults', getActiveVaults);
  server.get('/clearLogs', clearDB);
  server.get('/history', history);
  server.get('/search', search);
  server.get('/export', exportLogs);
  server.get('/beginDateString', getBeginDateString);

  server.post('/logtest', testLog);
};