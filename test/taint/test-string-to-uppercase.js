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
  let str = string.taint('bar'),
    uppercase;

  assert.strictEqual(str.isTainted(), true);
  assert.taintEqual(str, [{ 'begin': 0, 'end': len }]);

  uppercase = str.toUpperCase();
  assert.strictEqual(uppercase.isTainted(), true);
  assert.taintEqual(uppercase, [{ 'begin': 0, 'end': len }]);

  uppercase = str.toUpperCase();
  assert.strictEqual(uppercase.isTainted(), true);
  assert.taintEqual(uppercase, [{ 'begin': 0, 'end': len }]);

  str = string + str.taint('foo');
  uppercase = str.toUpperCase();
  assert.strictEqual(uppercase.isTainted(), true);
  assert.taintEqual(uppercase, [{ 'begin': len, 'end': len + len }]);

  str = str + string;
  uppercase = str.toUpperCase();
  assert.strictEqual(uppercase.isTainted(), true);
  assert.taintEqual(uppercase, [{ 'begin': len, 'end': len + len }]);
});
