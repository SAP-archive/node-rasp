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
  let str = string.setTaint('bar'),
    substr;

  substr = str.substring(0);
  assert.strictEqual(substr.isTainted(), true);
  assert.taintEqual(substr, [{ 'begin': 0, 'end': len }]);

  substr = str.substring(1);
  assert.strictEqual(substr.isTainted(), true);
  assert.taintEqual(substr, [{ 'begin': 0, 'end': len - 1 }]);

  substr = str.substring(0, len);
  assert.strictEqual(substr.isTainted(), true);
  assert.taintEqual(substr, [{ 'begin': 0, 'end': len }]);

  substr = str.substring(len - 1, len);
  assert.strictEqual(substr.isTainted(), true);
  assert.taintEqual(substr, [{ 'begin': 0, 'end': 1 }]);

  str = string + str.setTaint('foo');
  substr = str.substring(len - 1, len + 1);
  assert.strictEqual(substr.isTainted(), true);
  assert.taintEqual(substr, [{ 'begin': 1, 'end': 2 }]);
});
