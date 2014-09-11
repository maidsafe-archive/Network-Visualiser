var assert =  require('assert');
var utils = require('../backend/maidsafe/utils');

suite("Utils Test Suite", function(){

  test("Is Object Empty", function(){
    assert.equal(true, utils.isEmptyObject({}));
    assert.equal(true, utils.isEmptyObject(null));
    assert.equal(false, utils.isEmptyObject({d:10}));
    assert.equal(true, utils.isEmptyObject([]));
    assert.equal(false, utils.isEmptyObject([1]));
  });

});