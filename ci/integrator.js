var resultBuilder = require('./result_builder');
var badgeBuilder = require('./badge_builder');
var async = require('async');
var gitBranchName;
var linterPassed;
var grunt = null;
var config = null;

var codeStyleTestCompleted = function(err, stdout, stderr, callback) {
  linterPassed = err ? false : true;
  callback();
};

var jshintCompleted = function(err, stdout, stderr, callback) {
  if (err && linterPassed) {
    linterPassed = false;
  }
  callback();
};

var testCompleted = function(err, stdout, stderr, callback) {
  var coverageResult = {};

  var onComplete = function() {
    if (err || !linterPassed) {
      process.exit(1);
      return;
    }
    callback();
  };

  if (!/^win/.test(process.platform)) {
    onComplete();
    return;
  }

  resultBuilder.getCoverageResult(coverageResult, config.publishedFolder, function() {
    console.log('=====================COVERAGE RESULT================================');
    for (var key in coverageResult) {
      if (coverageResult[key] != null) {
        if (key.length < 8) {
          console.log('%s\t\t: %d%', key, coverageResult[key]);
        } else {
          console.log('%s\t: %d%', key, coverageResult[key]);
        }
      }
    }
    console.log('====================================================================');
    onComplete();
  });
};

var CIWorkflow = function(grunt, callback) {
  var coverageResult = {};
  var testResult = {};
  var asyncIterator = function(func, cb) {
    func(cb);
  };

  var consolidateResults = function() {
    var coverage = function(callback) {
      resultBuilder.getCoverageResult(coverageResult, config.publishedFolder, callback);
    };
    var test = function(callback) {
      resultBuilder.getTestResult(testResult, config.publishedFolder, callback);
    };
    async.each([ coverage, test ], asyncIterator, generateBadges);
  };

  var generateBadges = function(err) {
    if (err) {
      throw err;
    }
    var coverage = function(callback) {
      badgeBuilder.saveCoverageSatusBadge(coverageResult, config.publishedFolder + '/lcov-report', callback);
    };
    var test = function(callback) {
      badgeBuilder.saveTestSatusBadge(testResult, linterPassed, config.publishedFolder  + '/lcov-report', callback);
    };
    async.each([ coverage, test ], asyncIterator, scp);
  };

  var scp = function() {
    grunt.tasks([ 'shell:scp:' + config.scpBranchPath[ gitBranchName ] ]);
    callback();
  };
  consolidateResults();
};

var onCoverageCompleted = function(err, stdout, stderr, callback) {
  if (!config.scpBranchPath.hasOwnProperty(gitBranchName)) {
    callback();
    return;
  }
  new CIWorkflow(grunt, callback);
};

var setGitBranch = function(err, stdout, stderr, callback) {
  if (err) {
    throw err;
  }
  gitBranchName = stdout.trim();
  callback();
};

exports.init = function(gruntProcess, ciConfig) {
  if (!gruntProcess || !ciConfig) {
    throw 'Required parameters are missing';
  }
  grunt = gruntProcess;
  config = ciConfig;
};

exports.coverageCompleted = onCoverageCompleted;
exports.gitBranchDetected = setGitBranch;
exports.codeStyleChecker = codeStyleTestCompleted;
exports.jshintCompleted = jshintCompleted;
exports.testCompleted = testCompleted;
