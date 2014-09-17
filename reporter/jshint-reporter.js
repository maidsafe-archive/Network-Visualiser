var clc = require('cli-color');

exports.reporter = function(results) {
  var temp;
  var errorGroup = {};
  var blue = clc.xterm(24);

  var groupErrors = function() {
    for (var i in results) {
      temp = results[i];
      if (!errorGroup.hasOwnProperty(temp.file)) {
        errorGroup[temp.file] = [];
      }
      errorGroup[temp.file].push(temp.error);
      //console.log('%d,%d - %s in %s ', result.error.line, result.error.character, result.error.reason, result.file);
    }
  };

  var printErrors = function() {
    for (var file in errorGroup) {
      console.log(blue(file));
      for (var index in errorGroup[file]) {
        console.log('\t%d,%d - %s', errorGroup[file][index].line, errorGroup[file][index].character, errorGroup[file][index].reason);
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
}
