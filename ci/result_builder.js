var htmlParser = require('htmlparser2');
var fs = require('fs');

var getParser = function(coverageResult) {
  var watch = false;
  var keys = ['Statements', 'Branches', 'Functions', 'Lines'];
  var counter = 0;
  return new htmlParser.Parser({
    onopentag: function(name) {
      if (name === 'h2') {
        watch = true;
      }
    },
    ontext: function(text) {
      if (watch && text.indexOf('%') > -1) {
        text = text.trim();
        coverageResult[keys[counter]] = parseFloat(text.substring(0, text.length - 1));
        counter++;
      }
    },
    onclosetag: function(tagname) {
      if (tagname === 'h2') {
        watch = false;
      }
    }
  });
};

var parseCoverageResult = function(coverageResult, rootFolder, callback) {
  var parser = getParser(coverageResult);
  var fileReadCallBack = function(err, data) {
    if (err) {
      console.log(err);
      callback(err);
      return;
    }
    parser.write(data);
    parser.end();
    callback();
  };
  fs.readFile(rootFolder + '/lcov-report/index.html', {encoding: 'utf-8'}, fileReadCallBack);
};

var parseTestResult = function(testResult, rootFolder, callback) {
  var fileCb = function(err, data) {
    if (err) {
      callback(err);
    }
    var stats = JSON.parse(data.substring(data.indexOf('{'), data.indexOf('='))).stats;
    for (var key in stats) {
      if (stats[key]) {
        testResult[key] = stats[key];
      }
    }
    callback();
  };
  fs.readFile(rootFolder + '/results.json', {encoding: 'utf-8'}, fileCb);
};

exports.getCoverageResult = parseCoverageResult;
exports.getTestResult = parseTestResult;
