var fs = require('fs');
var util = require('util');
var http = require('http');
var TEST_STATUS_BADGE_LABEL = 'Tests Status';
var COVERAGE_STATUS_BADGE_LABEL = 'Tests Status';

var ImageDownloadHelper = function(filePath, callback) {
  var self = this;
  self.save = function(res) {
    var imagedata = '';
    var fileWriter = function(err) {
      if (err) {
        throw err;
      }
      console.log('Generated ' + filePath);
      if (callback) {
        callback();
      }
    };

    res.setEncoding('binary');

    res.on('data', function(chunk) {
      imagedata += chunk;
    });

    res.on('end', function() {
      fs.writeFile(filePath, imagedata, 'binary', fileWriter);
    });
  };
  return self;
};

var getBadgeColor = function(percentage) {
  var color = 'red';
  if (percentage === 100) {
    color = 'brightgreen';
  } else if (percentage > 80) {
    color = 'green';
  } else if (percentage > 50) {
    color = 'yellow';
  } else if (percentage > 30) {
    color = 'orange';
  } else {
    color = 'red';
  }
  return color;
};

var getPayload = function(text, status, color) {
  return {
    host: 'img.shields.io',
    path : util.format('/badge/%s-%s-%s.svg', text, status, color)
  };
};

var CoverageBadgeFactory = function(coverageResult, rootFolder, callback) {
  var factory = this;
  var status = '';
  var color = '';
  var imageDownloadHelper = new ImageDownloadHelper(rootFolder + '/coverage_status.svg', callback);

  var total = 0;
  for (var key in coverageResult) {
    total += coverageResult[key];
  }

  this.onComplete = function(cb) {
    factory.imageDownload.callback = cb;
  };

  factory.status = (total / 4).toFixed(2) + '%';
  factory.color = getBadgeColor(factory.status);

  factory.generate = function() {
    http.request(getPayload(COVERAGE_STATUS_BADGE_LABEL, status, color), imageDownloadHelper.save).end();
  };

  return this;
};

var TestBadgeFactory = function(testResult, jscsPassed, rootFolder, callback) {
  var factory = this;
  testResult.tests += 1;//For adding the JSCS test
  testResult.passes += jscsPassed ? 1 : 0;
  var status =  testResult.passes + '/' + testResult.tests + '%';
  var color = getBadgeColor((testResult.passes / testResult.tests) * 100);
  var imageDownloadHelper = new ImageDownloadHelper(rootFolder + '/test_status.svg', callback);
  factory.generate = function() {
    http.request(getPayload(TEST_STATUS_BADGE_LABEL, status, color), imageDownloadHelper.save).end();
  };
  return factory;
};

var generateTestStatusBadge = function(testResult, jscsPassed, rootFolder, callback) {
  var testBadge = new TestBadgeFactory(testResult, jscsPassed, rootFolder, callback);
  testBadge.generate();
};

var generateCoverageStatusBadge = function(coverageResult, rootFolder, callback) {
  var coverageBadge = new CoverageBadgeFactory(coverageResult, rootFolder, callback);
  coverageBadge.generate();
};

exports.saveTestSatusBadge = generateTestStatusBadge;
exports.saveCoverageSatusBadge = generateCoverageStatusBadge;
