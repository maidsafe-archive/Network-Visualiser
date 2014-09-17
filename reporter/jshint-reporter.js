var clc = require('cli-color');

exports.reporter = function(results) {
  var result;
  console.log('\n');
  for (var i in results) {
    result = results[i];
    console.log('%d,%d - %s in %s ', result.error.line, result.error.character, result.error.reason, result.file);
  }
  console.log('\n');
  if (results && results.length > 0) {
    console.log(clc.red(results.length + ' error(s) found.'));
  } else {
    console.log(clc.green('jshint test passed without errors'));
  }
};
