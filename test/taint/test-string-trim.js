'use strict';
require('../common');
const assert = require('assert');

const stringASCII_3 = '  foo ';
const stringUTF8_3 = '  😃. ';

const stringSet = [stringASCII_3, stringUTF8_3];

stringSet.forEach((string) => {
  const len = string.length;
  const str = string.taint('bar');

  let trimmed = str.trim();
  assert.strictEqual(trimmed.isTainted(), true);
  assert.taintEqual(trimmed, [{ 'begin': 0, 'end': len - 3 }]);

  trimmed = str.trim();
  assert.strictEqual(trimmed.isTainted(), true);
  assert.taintEqual(trimmed, [{ 'begin': 0, 'end': len - 3 }]);

  trimmed = str.trimLeft();
  assert.strictEqual(trimmed.isTainted(), true);
  assert.taintEqual(trimmed, [{ 'begin': 0, 'end': len - 2 }]);

  trimmed = str.trimRight();
  assert.strictEqual(trimmed.isTainted(), true);
  assert.taintEqual(trimmed, [{ 'begin': 0, 'end': len - 1 }]);
});
