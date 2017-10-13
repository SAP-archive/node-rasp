'use strict';
require('../common');
const assert = require('assert');

assert.taintEqual = taintEqual;
function taintEqual(string, expectedTaint) {
  const actualTaint = string.getTaint();

  assert.strictEqual(actualTaint.length, expectedTaint.length);

  expectedTaint.forEach(function(range, i) {
    assert.strictEqual(actualTaint[i].begin, range.begin);
    assert.strictEqual(actualTaint[i].end, range.end);
  });
}

const str1 = 'abc'.setTaint('foo');
const str2 = 'cba';

const char1 = str1[1];
assert.strictEqual(char1.isTainted(), true);

const char2 = str2[1];
assert.strictEqual(char2.isTainted(), false);
assert.strictEqual(char1.isTainted(), true);
