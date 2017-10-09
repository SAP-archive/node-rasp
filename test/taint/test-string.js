'use strict';
require('../common');
var assert = require('assert');

// assert for string taint
assert.taintEqual = taintEqual;
function taintEqual(string, expectedTaint) {
  var actualTaint = string.getTaint();

  assert.strictEqual(actualTaint.length, expectedTaint.length);
  
  expectedTaint.forEach(function(range, i) {
    assert.strictEqual(actualTaint[i].begin, range.begin);
    assert.strictEqual(actualTaint[i].end, range.end);
  });
}

// String set and remove complete taint
(function () {
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
  assert.taintEqual(str, []);
  
  str = strTaint.removeTaint();
  assert.strictEqual(str.isTainted(), false);
  assert.taintEqual(str, []);
  assert.strictEqual(strTaint.isTainted(), true);
  assert.taintEqual(strTaint, [{'begin': 0, 'end': 3}]);
  
  strTaint = strTaint.removeTaint();
  assert.strictEqual(strTaint.isTainted(), false);
  assert.taintEqual(strTaint, []);
})();

// String concatenation
(function() {
  var str = 'foo', strTaint = 'bar'.setTaint('baz'), strCon;
  
  strCon = strTaint + str;
  assert.strictEqual(strCon.isTainted(), true);
  assert.taintEqual(strCon, [{'begin': 0, 'end': 3}]);
  
  strCon = str + strCon;
  assert.strictEqual(strCon.isTainted(), true);
  assert.taintEqual(strCon, [{'begin': 3, 'end': 6}]);
  
  strCon = strTaint + strTaint;
  assert.strictEqual(strCon.isTainted(), true);
  assert.taintEqual(strCon, [{'begin': 0, 'end': 6}]);
  
  strCon = str + strTaint + str;
  assert.strictEqual(strCon.isTainted(), true);
  assert.taintEqual(strCon, [{'begin': 3, 'end': 6}]);
  
  strCon = str + str;
  assert.strictEqual(strCon.isTainted(), false);
  assert.taintEqual(strCon, []);
})();

// String.prototype.charAt
(function() {
  var str, character;
  
  str  = 'foo'.setTaint('bar');
  assert.strictEqual(str.isTainted(), true);
  assert.taintEqual(str, [{'begin': 0, 'end': 3}]);

  character = str.charAt(0);
  assert.strictEqual(character.isTainted(), true);
  assert.taintEqual(character, [{'begin': 0, 'end': 1}]);
  
  character = str.charAt(1);
  assert.strictEqual(character.isTainted(), true);
  assert.taintEqual(character, [{'begin': 0, 'end': 1}]);
  
  character = str.charAt(2);
  assert.strictEqual(character.isTainted(), true);
  assert.taintEqual(character, [{'begin': 0, 'end': 1}]);
  
  str  = str.removeTaint();
  assert.strictEqual(str.isTainted(), false);
  assert.taintEqual(str, []);

  character = str.charAt(0);
  assert.strictEqual(character.isTainted(), false);
  assert.taintEqual(character, []);
  
  character = str.charAt(1);
  assert.strictEqual(character.isTainted(), false);
  assert.taintEqual(character, []);
  
  character = str.charAt(2);
  assert.strictEqual(character.isTainted(), false);
  assert.taintEqual(character, []);

  str = str + str.setTaint('foo') + str;
  character = str.charAt(2);
  assert.strictEqual(character.isTainted(), false);
  assert.taintEqual(character, []);
  
  character = str.charAt(3);
  assert.strictEqual(character.isTainted(), true);
  assert.taintEqual(character, [{'begin': 0, 'end': 1}]);
  
  character = str.charAt(6);
  assert.strictEqual(character.isTainted(), false);
  assert.taintEqual(character, []);
})();

