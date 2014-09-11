var resultBuilder = require('./result_builder');
var badgeBuilder = require('./badge_builder');
var async = require('async');

var gitBranchName;
var jscsPassed;
var defaultConfig = {
  publishedFolder : 'coverage',
  scpBranchPath : {master : 'temp', next : 'temp_next'},
  jsonReportFileName : 'results.json',
  jscsReportFileName : 'jscs.txt'
};
var grunt = null;
var config = null;
var codeStyleTestCompleted = function(err, stdout, stderr, callback) {
  jscsPassed = err ? false : true;
  console.log('******** JSCS ******* ' + jscsPassed);
  callback()
}

var CIWorkflow = function(grunt, callback) {
  var coverageResult = {};
  var testResult = {};
  var asycIterator = function(func, cb) {
    func(cb);
  }

  var consolidateResults = function() {
    var coverage = function(callback) {
      resultBuilder.getCoverageResult(coverageResult, config.publishedFolder, callback);
    }
    var test = function(callback) {
      resultBuilder.getTestResult(testResult, config.publishedFolder, callback);
    }
    async.each([coverage, test], asycIterator, generateBadges);
  }

  var generateBadges = function(err) {
    if (err) {
      throw err
    }
    var coverage = function(callback) {
      badgeBuilder.saveCoverageSatusBadge(coverageResult, config.publishedFolder, callback);
    }
    var test = function(callback) {
      badgeBuilder.saveTestSatusBadge(testResult, jscsPassed, config.publishedFolder, callback);
    }
    async.each([coverage, test], asycIterator, scp);
  }

  var scp = function() {
    grunt.tasks(['shell:scp:' + config.scpBranchPath[gitBranchName]]);
    callback();
  }
  consolidateResults()
}

var onCoverageCompleted = function(err, stdout, stderr, callback) {//Needs to be refactored
  if (config.scpBranchPath.hasOwnProperty(gitBranchName)) {
    CIWorkflow(grunt, callback)
  } else {
    callback();
  }
}
var setGitBranch = function(err, stdout, stderr, callback) {
  if (err) {
    throw err;
  }
  gitBranchName = stdout.trim();
  callback();
}
exports.init = function(_grunt, ciConfig) {
  grunt = _grunt;
  config = ciConfig || defaultConfig;
}
exports.coverageCompleted = onCoverageCompleted;
exports.gitBranchDetected = setGitBranch;
exports.codeStyleChecker = codeStyleTestCompleted;
