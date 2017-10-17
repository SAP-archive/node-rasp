'use strict';
require('../common');
const assert = require('assert');

const stringASCII_3 = 'foo';
const stringUTF8_3 = '😃!';
const stringASCII_300 = 'foo'.repeat(100);
const stringUTF8_300 = '😃!'.repeat(100);

const stringSet = [stringASCII_3, stringUTF8_3,
                   stringASCII_300, stringUTF8_300];

stringSet.forEach((string) => {
  const len = string.length;
  const str = string,
    strTaint = string.setTaint('baz');
  let strCon;

  strCon = strTaint + str;
  assert.strictEqual(strCon.isTainted(), true);
  assert.taintEqual(strCon, [{'begin': 0, 'end': len}]);

  strCon = str + strCon;
  assert.strictEqual(strCon.isTainted(), true);
  assert.taintEqual(strCon, [{'begin': len, 'end': len + len}]);

  strCon = strTaint + strTaint;
  assert.strictEqual(strCon.isTainted(), true);
  assert.taintEqual(strCon, [{'begin': 0, 'end': len + len}]);

  strCon = str + strTaint + str;
  assert.strictEqual(strCon.isTainted(), true);
  assert.taintEqual(strCon, [{'begin': len, 'end': len + len}]);

  strCon = str + str;
  assert.strictEqual(strCon.isTainted(), false);
  assert.taintEqual(strCon, []);
});
