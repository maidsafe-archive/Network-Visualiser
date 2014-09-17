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
      // process.stdout.write('%d,%d - %s in %s ', result.error.line, result.error.character, result.error.reason, result.file);
    }
  };

  var printErrors = function() {
    for (var file in errorGroup) {
       process.stdout.write(blue(file));
      for (var index in errorGroup[file]) {
         process.stdout.write('\n\t' + errorGroup[file][index].line + ', ' +  errorGroup[file][index].character + ' - ' + errorGroup[file][index].reason);
      }
    }
  };

  if (results && results.length > 0) {
     process.stdout.write('\n');
    groupErrors();
    printErrors();
  }
   process.stdout.write('\n');
  if (results && results.length > 0) {
     process.stdout.write(clc.red(results.length + ' error(s) found.' + '\n'));
  } else {
     process.stdout.write(clc.green('jshint test passed without errors' + '\n'));
  }
};
