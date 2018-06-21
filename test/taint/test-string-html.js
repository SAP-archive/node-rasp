'use strict';
require('../common');
const assert = require('assert');

((string) => {
  const str1 = 'abc123'.taint('bar');
  const str2 = 'a' + 'bc1'.taint('bar') + '23';
  let html;

  html = str1.anchor();
  assert.strictEqual(html.isTainted(), true);
  assert.taintEqual(html, [{ 'begin': 20, 'end': 26 }]);

  html = str1.anchor('foo'.taint('baz'));
  assert.strictEqual(html.isTainted(), true);
  assert.taintEqual(html, [
    { 'begin': 9, 'end': 12 },
    { 'begin': 14, 'end': 20 }
  ]);

  html = str2.anchor();
  assert.strictEqual(html.isTainted(), true);
  assert.taintEqual(html, [{ 'begin': 21, 'end': 24 }]);

  html = str2.anchor('foo'.taint('baz'));
  assert.strictEqual(html.isTainted(), true);
  assert.taintEqual(html, [
    { 'begin': 9, 'end': 12 },
    { 'begin': 15, 'end': 18 }
  ]);

  html = str1.link();
  assert.strictEqual(html.isTainted(), true);
  assert.taintEqual(html, [{ 'begin': 20, 'end': 26 }]);

  html = str1.link('foo'.taint('baz'));
  assert.strictEqual(html.isTainted(), true);
  assert.taintEqual(html, [
    { 'begin': 9, 'end': 12 },
    { 'begin': 14, 'end': 20 }
  ]);

  html = str2.link();
  assert.strictEqual(html.isTainted(), true);
  assert.taintEqual(html, [{ 'begin': 21, 'end': 24 }]);

  html = str2.link('foo'.taint('baz'));
  assert.strictEqual(html.isTainted(), true);
  assert.taintEqual(html, [
    { 'begin': 9, 'end': 12 },
    { 'begin': 15, 'end': 18 }
  ]);

  html = str2.big();
  assert.strictEqual(html.isTainted(), true);
  assert.taintEqual(html, [{ 'begin': 6, 'end': 9 }]);

})();
