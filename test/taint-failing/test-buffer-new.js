'use strict';
require('../common');
const assert = require('assert');

const str1 = 'This is a tainted string!';
const str1Taint = str1.setTaint('baz');

const str2 = 'This is not a tainted string!';

const str3 = '😃!!!';
const str3Taint = str3.setTaint('abc');

const str4 = '7468697320697320612074c3a97374';
const str4Taint = str4.setTaint('abc');

let resultString;
let taintEnd;

const len1 = str1.length;
const len2 = str2.length;
const len3 = str3.length;

// Test 8: Using a two-byte character inside taint.
const buf8 = new Buffer(str2 + str3Taint + str2);
taintEnd = len2 + len3;
assert.taintEqual(buf8, [{ 'begin': len2, 'end': taintEnd }]);
resultString = buf8.toString();
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': len2, 'end': taintEnd }]);

// Test 14: Allocate buffer with tainted hex literal
const buf14 = Buffer.alloc(11, 'aGVsbG8gd29ybGQ='.setTaint('abc'), 'base64');
taintEnd = 11;
assert.taintEqual(buf14, [{ 'begin': 0, 'end': taintEnd }]);
resultString = buf14.toString();
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': taintEnd }]);

// Test 17: Concatenate two buffers that are both tainted
const buf17_1 = new Buffer(str1Taint);
const buf17_2 = new Buffer(str1Taint);
taintEnd = len1 + len1;
const buf17_3 = Buffer.concat([buf17_1, buf17_2], taintEnd);
assert.taintEqual(buf17_3, [{ 'begin': 0, 'end': taintEnd }]);
resultString = buf17_3.toString();
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': taintEnd }]);

// Test 20: Create tainted buffer with offset and length
const buf20 = Buffer.from(str1Taint, 0, 5);
taintEnd = 5;
assert.taintEqual(buf20, [{ 'begin': 0, 'end': taintEnd }]);
resultString = buf20.toString();
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': taintEnd }]);

// Test 22: Create buffer with string and encoding (hex)
const buf22 = Buffer.from(str4Taint, 'hex');
taintEnd = 'this is a test'.length;
assert.taintEqual(buf22, [{ 'begin': 0, 'end': taintEnd }]);
resultString = buf22.toString();
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': taintEnd }]);
