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
  const str = string,
    strTaint = string.setTaint('baz');
  let strCon;

  strCon = strTaint.concat(str);
  assert.strictEqual(strCon.isTainted(), true);
  assert.taintEqual(strCon, [{'begin': 0, 'end': len}]);

  strCon = str.concat(strCon);
  assert.strictEqual(strCon.isTainted(), true);
  assert.taintEqual(strCon, [{'begin': len, 'end': len + len}]);

  strCon = strTaint.concat(strTaint);
  assert.strictEqual(strCon.isTainted(), true);
  assert.taintEqual(strCon, [{'begin': 0, 'end': len + len}]);

  strCon = str.concat(strTaint, str);
  assert.strictEqual(strCon.isTainted(), true);
  assert.taintEqual(strCon, [{'begin': len, 'end': len + len}]);

  strCon = str.concat(str);
  assert.strictEqual(strCon.isTainted(), false);
  assert.taintEqual(strCon, []);
});
