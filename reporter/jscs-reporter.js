var clc = require('cli-color');

module.exports = function(errorsCollection) {
  var errorCount = 0;

  var fileName = clc.xterm(24);

  var report = errorsCollection.map(function(errors) {
    if (!errors.isEmpty()) {
      console.log('\n' + fileName(errors.getFilename()));
      var error;
      errorCount += errors.getErrorCount();
      var errorList = errors.getErrorList();
      for (var i in errorList) {
        error = errorList[i];
        console.log('\t' + error.line + ', ' + error.column + ' - '  + error.message);
      }
    }
    return '';
  });

  if (errorCount) {
    console.log('\n' + clc.red(errorCount + ' error(s) found.'));
  } else {
    console.log('\n' + clc.green('No code style errors found.'));
  }
};
