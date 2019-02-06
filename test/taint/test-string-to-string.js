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
  let str = string.taint('bar');
  let result = str.toString();

  assert.strictEqual(result.isTainted(), true);
  assert.taintEqual(result, [{ 'begin': 0, 'end': len }]);

  str = string + str.taint('foo');
  result = str.toString();
  assert.strictEqual(result.isTainted(), true);
  assert.taintEqual(result, [{ 'begin': len, 'end': len + len }]);

  str = str + string;
  result = str.toString();
  assert.strictEqual(result.isTainted(), true);
  assert.taintEqual(result, [{ 'begin': len, 'end': len + len }]);

  result = string.toString();
  assert.strictEqual(result.isTainted(), false);
  assert.taintEqual(result, []);
});
