var clc = require('cli-color');

exports.reporter = function(results) {
  var temp;
  var errorGroup = {};
  var blue = clc.xterm(24);

  var groupErrors = function() {
    for (var i in results) {
      if (results[i]) {
        temp = results[i];
        if (!errorGroup.hasOwnProperty(temp.file)) {
          errorGroup[temp.file] = [];
        }
        errorGroup[temp.file].push(temp.error);
      }
    }
  };

  var printErrors = function() {
    var error;

    var printErrorsInFile = function(errorGroup) {
      for (var index in errorGroup) {
        if (errorGroup[index]) {
          error = errorGroup[index];
          console.log('\t%d,%d - %s', error.line, error.character, error.reason);
        }
      }
    };

    for (var file in errorGroup) {
      if (file && errorGroup[file]) {
        console.log(blue(file));
        printErrorsInFile(errorGroup[file]);
      }
    }
  };

  if (results && results.length > 0) {
    console.log('\n');
    groupErrors();
    printErrors();
  }
  console.log('\n');
  if (results && results.length > 0) {
    console.log(clc.red(results.length + ' error(s) found.'));
  } else {
    console.log(clc.green('jshint test passed without errors'));
  }
};
