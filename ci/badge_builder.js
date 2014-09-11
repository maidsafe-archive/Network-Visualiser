var fs = require('fs');
var util = require('util');
var http = require('http');

var ImageDownloadHelper = function(filePath, callback) {
	var self = this;
  self.save = function(res) {
		var imagedata = '';
		res.setEncoding('binary');

		res.on('data', function(chunk) {
			imagedata += chunk
		});

		res.on('end', function() {
			fs.writeFile(filePath, imagedata, 'binary', function(err) {
				if (err) {
					throw err;
				}
				console.log('Generated ' + filePath);
				if (callback) {
					callback();
				}
		});
});
  }
  return self;
}

var getBadgeColor = function(percentage) {
  var color = 'red';
  if (percentage > 85) {
    color = 'brightgreen'
  } else if (percentage > 70) {
    color = 'green'
  } else if (percentage > 50) {
    color = 'orange'
  }
  return color;
}

var getPayload = function(text, status, color) {
  return {
    host: 'img.shields.io',
    path : util.format('/badge/%s-%s-%s.svg', text, status, color)
  };
}

var CoverageBadgeFactory = function(coverageResult, rootFolder, callback) {
  var factory = this;
  var text = 'Coverage';
  var status = '';
  var color = '';
  var imageDownloadHelper = new ImageDownloadHelper(rootFolder + '/coverage_status.svg', callback);

  var total = 0;
  for (var key in coverageResult) {
    total += coverageResult[key];
  };

  this.onComplete = function(cb) {
    factory.imageDownload.callback = cb
  }

  factory.status = (total / 4).toFixed(2)
  factory.color = getBadgeColor(factory.status)

	factory.generate = function() {
		http.request(getPayload(text, status, color), imageDownloadHelper.save).end();
	}

  return this;
}

var TestBadgeFactory = function(testResult, jscsPassed, rootFolder, callback) {
  var factory = this
  var text = 'Test';
  testResult.tests += 1;//For adding the JSCS test
  testResult.passes += jscsPassed ? 1 : 0;
  var status =  testResult.passes + '/' + testResult.tests;
  var color = getBadgeColor((testResult.passes / testResult.tests) * 100);
  var imageDownloadHelper = new ImageDownloadHelper(rootFolder + '/test_status.svg', callback);
  factory.generate = function() {
    http.request(getPayload(text, status, color), imageDownloadHelper.save).end();
  }

  return factory;
}

var generateTestStatusBadge = function(testResult, jscsPassed, rootFolder, callback) {
	var testBadge = new TestBadgeFactory(testResult, jscsPassed, rootFolder, callback);
	testBadge.generate();
}

var generateCoverageStatusBadge = function(coverageResult, rootFolder, callback) {
	var coverageBadge = new CoverageBadgeFactory(coverageResult, rootFolder, callback);
	coverageBadge.generate();
}

exports.saveTestSatusBadge = generateTestStatusBadge;
exports.saveCoverageSatusBadge = generateCoverageStatusBadge;
