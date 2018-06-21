'use strict';
require('../common');
const assert = require('assert');

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

((string) => {
  const len = string.length;
  let str =
    string.taint('bar') +
    string.toLowerCase().taint('bar');
  let parts;

  parts = str.split('');
  parts.forEach((part) => {
    assert.strictEqual(part.isTainted(), true);
    assert.taintEqual(part, [{ 'begin': 0, 'end': 1 }]);
  });

  parts = str.split('XYZabc');
  parts.forEach((part) => {
    assert.strictEqual(part.isTainted(), true);
    assert.taintEqual(part, [{ 'begin': 0, 'end': len - 3 }]);
  });

  str = string + string.toLowerCase().taint('bar');
  parts = str.split('XYZabc');
  assert.strictEqual(parts[0].isTainted(), false);
  assert.taintEqual(parts[0], []);
  assert.strictEqual(parts[1].isTainted(), true);
  assert.taintEqual(parts[1], [{ 'begin': 0, 'end': len - 3 }]);

})(alphabet);
