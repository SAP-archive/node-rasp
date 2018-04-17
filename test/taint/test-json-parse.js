'use strict';
require('../common');
const assert = require('assert');

((string) => {
  const str1 = '{"foo":"bar"}'.setTaint('baz');
  const str2 = '{"f' + 'oo":"b'.setTaint('baz') + 'ar"}';
  let parsed, key, value;

  parsed = JSON.parse(str1);
  key = Object.keys(parsed)[0];
  value = parsed.foo;
  assert.strictEqual(key.isTainted(), true);
  assert.taintEqual(key, [{ 'begin': 0, 'end': 3 }]);
  assert.strictEqual(value.isTainted(), true);
  assert.taintEqual(value, [{ 'begin': 0, 'end': 3 }]);

  parsed = JSON.parse(str2);
  key = Object.keys(parsed)[0];
  value = parsed.foo;
  assert.strictEqual(key.isTainted(), true);
  assert.taintEqual(key, [{ 'begin': 1, 'end': 3 }]);
  assert.strictEqual(value.isTainted(), true);
  assert.taintEqual(value, [{ 'begin': 0, 'end': 1 }]);

})();
