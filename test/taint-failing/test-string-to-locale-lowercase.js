'use strict';
require('../common');
const assert = require('assert');

((string) => {
  const str1 = 'abc123'.setTaint('bar');
  const str2 = '\u0130'.setTaint('bar');
  const str = str1 + 'bar' + str2;
  let lowercase;

  lowercase = str1.toLocaleLowerCase();
  assert.strictEqual(lowercase.isTainted(), true);
  assert.taintEqual(lowercase, [{ 'begin': 0, 'end': 6 }]);

  lowercase = str2.toLocaleLowerCase('en-US');
  assert.strictEqual(lowercase.isTainted(), true);
  assert.taintEqual(lowercase, [{ 'begin': 0, 'end': 1 }]);

  lowercase = str.toLocaleLowerCase('tr');
  assert.strictEqual(lowercase.isTainted(), true);
  assert.taintEqual(lowercase, [
    { 'begin': 0, 'end': 6 },
    { 'begin': 9, 'end': 10 }
  ]);

})();
