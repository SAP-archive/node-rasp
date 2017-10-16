'use strict';
require('../common');
const assert = require('assert');

const stringASCII_3 = '  foo ';
const stringUTF8_3 = '  😃. ';

const stringSet = [stringASCII_3, stringUTF8_3];

// assert for string taint
assert.taintEqual = taintEqual;
function taintEqual(string, expectedTaint) {
  const actualTaint = string.getTaint();

  assert.strictEqual(actualTaint.length, expectedTaint.length);

  expectedTaint.forEach(function(range, i) {
    assert.strictEqual(actualTaint[i].begin, range.begin);
    assert.strictEqual(actualTaint[i].end, range.end);
  });
}

stringSet.forEach((string) => {
  const len = string.length;
  const str = string.setTaint('bar');

  let trimmed = str.trim();
  assert.strictEqual(trimmed.isTainted(), true);
  assert.taintEqual(trimmed, [{'begin': 0, 'end': len - 3}]);

  trimmed = str.trim();
  assert.strictEqual(trimmed.isTainted(), true);
  assert.taintEqual(trimmed, [{'begin': 0, 'end': len - 3}]);

  trimmed = str.trimLeft();
  assert.strictEqual(trimmed.isTainted(), true);
  assert.taintEqual(trimmed, [{'begin': 0, 'end': len - 2}]);

  trimmed = str.trimRight();
  assert.strictEqual(trimmed.isTainted(), true);
  assert.taintEqual(trimmed, [{'begin': 0, 'end': len - 1}]);
});
