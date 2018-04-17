'use strict';
require('../common');
const assert = require('assert');

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

((string) => {
  let str =
    string.setTaint('bar') +
    string.toLowerCase().setTaint('bar');
  let matches;

  matches = str.match(/[A-E]/gi);
  matches.forEach((match) => {
    assert.strictEqual(match.isTainted(), true);
    assert.taintEqual(match, [{ 'begin': 0, 'end': 1 }]);
  });

  matches = str.match('abc');
  matches.forEach((match) => {
    assert.strictEqual(match.isTainted(), true);
    assert.taintEqual(match, [{ 'begin': 0, 'end': 3 }]);
  });

  str = string + string.toLowerCase().setTaint('bar');
  matches = str.match(/XYZabc/g);
  matches.forEach((match) => {
    assert.strictEqual(match.isTainted(), true);
    assert.taintEqual(match, [{ 'begin': 3, 'end': 6 }]);
  });

})(alphabet);
