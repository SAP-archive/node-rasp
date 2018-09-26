'use strict';
require('../common');
const assert = require('assert');

const stringASCII_3 = 'foo';
const stringUTF8_3 = '😃!';
const stringASCII_300 = 'foo'.repeat(100);
const stringUTF8_300 = '😃!'.repeat(100);

const stringSet = [stringASCII_3, stringUTF8_3,
                   stringASCII_300, stringUTF8_300];

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
  let str = string.setTaint('bar'),
    lowercase;

  assert.strictEqual(str.isTainted(), true);
  assert.taintEqual(str, [{'begin': 0, 'end': len}]);

  lowercase = str.toLowerCase();
  assert.strictEqual(lowercase.isTainted(), true);
  assert.taintEqual(lowercase, [{'begin': 0, 'end': len}]);

  lowercase = str.toLowerCase();
  assert.strictEqual(lowercase.isTainted(), true);
  assert.taintEqual(lowercase, [{'begin': 0, 'end': len}]);

  str = string + str.setTaint('foo');
  lowercase = str.toLowerCase();
  assert.strictEqual(lowercase.isTainted(), true);
  assert.taintEqual(lowercase, [{'begin': len, 'end': len + len}]);

  str = str + string;
  lowercase = str.toLowerCase();
  assert.strictEqual(lowercase.isTainted(), true);
  assert.taintEqual(lowercase, [{'begin': len, 'end': len + len}]);
});
