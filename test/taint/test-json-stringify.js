'use strict';
require('../common');
const assert = require('assert');

((string) => {
  const obj = {};
  let stringified;

  obj.foo1 = 'bar'.taint('baz');
  stringified = JSON.stringify(obj);
  assert.strictEqual(stringified.isTainted(), true);
  assert.taintEqual(stringified, [{ 'begin': 9, 'end': 12 }]);

  obj['foo2'.taint('baz')] = 'bar';
  stringified = JSON.stringify(obj);
  assert.strictEqual(stringified.isTainted(), true);
  assert.taintEqual(stringified, [
    { 'begin': 9, 'end': 12 },
    { 'begin': 15, 'end': 19 }
  ]);

})();
