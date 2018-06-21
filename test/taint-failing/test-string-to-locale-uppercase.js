'use strict';
require('../common');
const assert = require('assert');

((string) => {
  const str1 = 'abc123'.taint('bar');
  const str2 = 'i\u0307'.taint('bar');
  const str = str1 + 'bar' + str2;
  let uppercase;

  uppercase = str1.toLocaleUpperCase();
  assert.strictEqual(uppercase.isTainted(), true);
  assert.taintEqual(uppercase, [{ 'begin': 0, 'end': 6 }]);

  uppercase = str2.toLocaleUpperCase('lt-LT');
  assert.strictEqual(uppercase.isTainted(), true);
  assert.taintEqual(uppercase, [{ 'begin': 0, 'end': 1 }]);

  uppercase = str.toLocaleUpperCase('lt');
  assert.strictEqual(uppercase.isTainted(), true);
  assert.taintEqual(uppercase, [
    { 'begin': 0, 'end': 6 },
    { 'begin': 9, 'end': 10 }
  ]);

})();
