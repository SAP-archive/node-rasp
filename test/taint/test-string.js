'use strict';
require('../common');
var assert = require('assert');

assert.taintEqual = taintEqual;

function taintEqual(string, expectedTaint) {
  var actualTaint = string.getTaint();

  assert.strictEqual(actualTaint.length, expectedTaint.length);
  
  expectedTaint.forEach(function(range, i) {
    assert.strictEqual(actualTaint[i].begin, range.begin);
    assert.strictEqual(actualTaint[i].end, range.end);
  });
}

(function() {
  var str = 'foo', strTaint;
  assert.strictEqual(str.isTainted(), false);
  assert.taintEqual(str, []);

  strTaint = str.setTaint('bar');
  assert.strictEqual(str.isTainted(), false);
  assert.taintEqual(str, []);
  assert.strictEqual(strTaint.isTainted(), true);
  assert.taintEqual(strTaint, [{'begin': 0, 'end': 3}]);

  str = str.removeTaint();
  assert.strictEqual(str.isTainted(), false);
  assert.deepEqual(str.getTaint(), []);
  
  str = strTaint.removeTaint();
  assert.strictEqual(str.isTainted(), false);
  assert.taintEqual(str, []);
  assert.strictEqual(strTaint.isTainted(), true);
  assert.taintEqual(strTaint, [{'begin': 0, 'end': 3}]);
  
  strTaint = strTaint.removeTaint();
  assert.strictEqual(strTaint.isTainted(), false);
  assert.taintEqual(strTaint, []);
})();

