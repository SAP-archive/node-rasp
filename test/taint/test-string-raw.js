'use strict';
require('../common');
const assert = require('assert');

((string) => {
  const name1 = 'Bob'.setTaint('bar');
  const name2 = 'A' + 'lic'.setTaint('bar') + 'e';
  let raw;

  raw = String.raw`Hi ${name1}`;
  assert.strictEqual(raw.isTainted(), true);
  assert.taintEqual(raw, [{ 'begin': 3, 'end': 6 }]);

  raw = String.raw`Hey ${name2}!`;
  assert.strictEqual(raw.isTainted(), true);
  assert.taintEqual(raw, [{ 'begin': 5, 'end': 8 }]);

  raw = String.raw({ raw: name2 }, 0, 'baz'.setTaint('foo'), 2);
  assert.strictEqual(raw.isTainted(), true);
  assert.taintEqual(raw, [
    { 'begin': 2, 'end': 3 },
    { 'begin': 3, 'end': 6 },
    { 'begin': 6, 'end': 7 },
    { 'begin': 8, 'end': 9 }
  ]);

})();
