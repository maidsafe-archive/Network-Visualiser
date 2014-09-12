var resultBuilder = require('./result_builder');
var badgeBuilder = require('./badge_builder');
var async = require('async');
var gitBranchName;
var linterPassed;
var grunt = null;
var config = null;

var codeStyleTestCompleted = function(err, stdout, stderr, callback) {
  linterPassed = err ? false : true;
  console.log('******** JSCS ******* ' + linterPassed);
  callback();
};

var jshintCompleted = function(err, stdout, stderr, callback) {
  if (err && linterPassed) {
    linterPassed = false;
  }
  callback();
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
    async.each([coverage, test], asyncIterator, generateBadges);
  };

  var generateBadges = function(err) {
    if (err) {
      throw err;
    }
    var coverage = function(callback) {
      badgeBuilder.saveCoverageSatusBadge(coverageResult, config.publishedFolder, callback);
    };
    var test = function(callback) {
      badgeBuilder.saveTestSatusBadge(testResult, linterPassed, config.publishedFolder, callback);
    };
    async.each([coverage, test], asnycIterator, scp);
  };

  var scp = function() {
    grunt.tasks(['shell:scp:' + config.scpBranchPath[gitBranchName]]);
    callback();
  };
  consolidateResults();
};

var onCoverageCompleted = function(err, stdout, stderr, callback) {//Needs to be refactored
  if (config.scpBranchPath.hasOwnProperty(gitBranchName)) {
    new CIWorkflow(grunt, callback);
  } else {
    callback();
  }
};

var setGitBranch = function(err, stdout, stderr, callback) {
  if (err) {
    throw err;
  }
  gitBranchName = stdout.trim();
  callback();
};

exports.init = function(_grunt, ciConfig) {
  if (_grunt && ciConfig) {
    grunt = _grunt;
    config = ciConfig;
  } else {
    throw 'Required parameters are missing';
  }
};

exports.coverageCompleted = onCoverageCompleted;
exports.gitBranchDetected = setGitBranch;
exports.codeStyleChecker = codeStyleTestCompleted;
exports.jshintCompleted = jshintCompleted;
