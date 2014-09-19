var clc = require('cli-color');

module.exports = function(errorsCollection) {
  var errorCount = 0;

  var fileName = clc.xterm(24);

  errorsCollection.map(function(errors) {
    if (!errors.isEmpty()) {
      console.log('\n' + fileName(errors.getFilename()));
      var error;
      errorCount += errors.getErrorCount();
      var errorList = errors.getErrorList();
      for (var i in errorList) {
        if (errorList[i]) {
          error = errorList[i];
          console.log('    ' + error.line + ', ' + error.column + ' - '  + error.message);
        }
      }
    }
  });

  var msg = errorCount ? clc.red(errorCount + ' error(s) found.') : clc.green('No code style errors found.');
  console.log('\n' + msg);
};
