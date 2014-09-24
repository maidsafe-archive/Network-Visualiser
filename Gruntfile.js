var ci = require('./ci/integrator');

module.exports = function(grunt) {
  var ISTANBUL_COMMAND = 'istanbul cover node_modules/mocha/bin/_mocha -- ';

  var CI_CONFIG = {
    publishedFolder: 'coverage',
    scpBranchPath: {master: 'pod/apps/network_visualiser', next: 'pod/apps/network_visualiser_next'},
    jsonReportFileName: 'results.json',
    jscsReportFileName: 'jscs.txt'
  };

  grunt.initConfig({
    shell: {
      test: {
        command: ISTANBUL_COMMAND + '--recursive -R mocha-unfunk-reporter ',
        options: {
          callback: ci.testCompleted
        }
      },
      jscs: {
        command: 'jscs . --reporter ci/reporters/jscs-reporter.js',
        options: {
          callback: ci.codeStyleChecker
        }
      },
      jshint: {
        command: 'jshint . --reporter ci/reporters/jshint-reporter.js',
        options: {
          callback: ci.jshintCompleted
        }
      },
      scp: {
        command: function(path) {
          return 'scp -r ./coverage/lcov-report/*  root@visualiser.maidsafe.net:/usr/maidsafe/' +
                  path + '/frontend/test_results';
        }
      },
      ci: {
        command: ISTANBUL_COMMAND + '--recursive -R json-cov > ' + CI_CONFIG.publishedFolder +
        '/' + CI_CONFIG.jsonReportFileName,
        options: {
          callback: ci.coverageCompleted
        }
      },
      gitBranch: {
        command: 'git rev-parse --abbrev-ref HEAD',
        options: {
          callback: ci.gitBranchDetected
        }
      }
    },
    clean: {
      test: [CI_CONFIG.publishedFolder]
    },
    mkdir: {
      test: {
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

  grunt.registerTask('test', ['clean:test', 'mkdir:test', 'shell:jscs', 'shell:jshint', 'shell:test']);
  grunt.registerTask('ci', ['shell:gitBranch', 'clean:test', 'mkdir:test', 'shell:jscs', 'shell:jshint',
  'shell:ci', 'shell:test']);
};
