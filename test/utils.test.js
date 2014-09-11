var assert =  require('assert');
var utils = require('../backend/maidsafe/utils');

describe("Utils Test Suite", function(){

  it("Is Object Empty", function(){
    assert.equal(true, utils.isEmptyObject({}));
    assert.equal(true, utils.isEmptyObject(null));
    assert.equal(false, utils.isEmptyObject({d:10}));
    assert.equal(true, utils.isEmptyObject([]));
    assert.equal(true, utils.isEmptyObject([1]));
  });

});