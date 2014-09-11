var ci = require('./ci/ci');

module.exports = function(grunt) {

  var ISTANBUL_COMMAND = 'istanbul cover node_modules/mocha/bin/_mocha -- ';

  var CI_CONFIG = {
    publishedFolder : 'coverage',
    scpBranchPath : {master : 'temp', next : 'temp_next'},
    jsonReportFileName : 'results.json',
    jscsReportFileName : 'jscs.txt'
  }

  grunt.initConfig({
    shell : {
      test : {
        command: ISTANBUL_COMMAND + ' -u tdd -R mocha-unfunk-reporter'
      },
      jscs : {
        command:'jscs . -r text > ' + CI_CONFIG.publishedFolder + '/' + CI_CONFIG.jscsReportFileName,
        options : {
          callback : ci.codeStyleChecker
        }
      },
      scp : {
        command: function(path) {
          return 'scp -r ./coverage/lcov-report/*  root@visualiser.maidsafe.net:/usr/maidsafe/' + path + '/frontend/test_results'
        }
      },
      ci : {
        command : ISTANBUL_COMMAND + ' -u tdd -R json-cov > ' + CI_CONFIG.publishedFolder + '/' + CI_CONFIG.jsonReportFileName,
        options : {
          callback : ci.coverageCompleted
        }
      },
      gitBranch : {
        command : 'git rev-parse --abbrev-ref HEAD',
        options : {
          callback : ci.gitBranchDetected
        }
      }
    },
    clean: {
      test: [CI_CONFIG.publishedFolder]
    },
    mkdir : {
      test : {
        options: {
          create: [CI_CONFIG.publishedFolder]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mkdir');

  ci.init(grunt, CI_CONFIG);

  grunt.registerTask('test', ['clean:test', 'mkdir:test', 'shell:jscs', 'shell:test']);
  grunt.registerTask('ci', ['shell:gitBranch', 'clean:test', 'mkdir:test', 'shell:jscs', 'shell:ci', 'shell:test']);
};
