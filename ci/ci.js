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

	var consolidateResults = function() {
		async.each([
				function(callback) {
					resultBuilder.getCoverageResult(coverageResult, config.publishedFolder, callback);
				}, function(callback) {
					resultBuilder.getTestResult(testResult, config.publishedFolder, callback);
				}
			], function(func, cb) {
				func(cb);
			}, generateBadges);
	}

	var generateBadges = function(err) {
		if (err) {
			throw err
		}
		async.each([
				function(callback) {
					badgeBuilder.saveCoverageSatusBadge(coverageResult, config.publishedFolder, callback);
				}, function(callback) {
					badgeBuilder.saveTestSatusBadge(testResult, jscsPassed, config.publishedFolder, callback);
				}
			], function(func, cb) {
				func(cb);
			}, scp);
	}

	var scp = function() {
		grunt.tasks(['shell:scp:' + config.scpBranchPath[gitBranchName]])
		callback()
	}

	consolidateResults()
}

var onCoverageCompleted = function(err, stdout, stderr, callback) {//Needs to be refactored
	if (config.scpBranchPath.hasOwnProperty(gitBranchName)) {
			CIWorkflow(grunt, callback)
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
