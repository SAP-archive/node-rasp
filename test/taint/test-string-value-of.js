'use strict';
require('../common');
const assert = require('assert');

((string) => {
  const str1 = 'abc123'.setTaint('bar');
  const str2 = 'i\u0307'.setTaint('bar');
  const str = str1 + 'bar' + str2;
  let value;

  value = str1.valueOf();
  assert.strictEqual(value.isTainted(), true);
  assert.taintEqual(value, [{ 'begin': 0, 'end': 6 }]);

  value = str2.valueOf();
  assert.strictEqual(value.isTainted(), true);
  assert.taintEqual(value, [{ 'begin': 0, 'end': 2 }]);

  value = str.valueOf();
  assert.strictEqual(value.isTainted(), true);
  assert.taintEqual(value, [
    { 'begin': 0, 'end': 6 },
    { 'begin': 9, 'end': 11 }
  ]);

})();
