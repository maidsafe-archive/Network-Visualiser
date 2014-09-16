var htmlParser = require('htmlparser2');
var fs = require('fs');

var getParser = function(coverageResult) {
  var watch = false;
  var keys = ['statement', 'branches', 'functions', 'lines'];
  var counter = 0;
  return new htmlParser.Parser({
    onopentag: function(name, attribs) {
      if (name === 'h2') {
        watch = true;
      }
    },
    ontext: function(text) {
      if (watch && text.indexOf('%') > -1) {
        text = text.trim();
        coverageResult[keys[counter]] = parseInt(text.substring(0, text.length - 1));
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
  console.log('parsing cov result');
  var parser = getParser(coverageResult);
  var fileReadCallBack = function(err, data) {
    console.log(data);
    if (err) {
      console.log(err);
      callback(err);
    } else {
      parser.write(data);
      parser.end();
      console.log('Cov result :: ' )
      console.log(coverageResult)
      callback();
    }
  };
  fs.readFile(rootFolder + '/lcov-report/index.html', {encoding : 'utf-8'}, fileReadCallBack);
};

var parseTestResult = function(testResult, rootFolder, callback) {
  console.log('parsing json result');
  var fileCb = function(err, data) {
    console.log(data);
    if (err) {
      callback(err);
    }
    var stats = JSON.parse(data.split('=')[0]).stats;
    console.log(stats )
    for (var key in stats) {
      testResult[key] = stats[key];
    }
    console.log('Test result')
    console.log(testResult)
    callback();
  };
  fs.readFile(rootFolder + '/results.json', {encoding : 'utf-8'}, fileCb);
};

exports.getCoverageResult = parseCoverageResult;
exports.getTestResult = parseTestResult;
