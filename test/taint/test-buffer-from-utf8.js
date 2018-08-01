'use strict';
require('../common');
const assert = require('assert');

// UTF8
const strUtf8 = '😃㻖';
const strUtf8Taint = strUtf8.setTaint('abc');

const strUtf8Len = Buffer.from(strUtf8, 'utf8').toString('utf8').length;
const strUtf8TaintLen = Buffer.from(strUtf8Taint, 'utf8')
                                               .toString('utf8').length;

const bufUtf8Len = Buffer.from(strUtf8, 'utf8').length;
const bufUtf8TaintLen = Buffer.from(strUtf8Taint, 'utf8').length;

let resultString;
let taintEnd;
let taintEnd2;
let taintStart;
let taintStart2;

// ### ONE STRING ###

// Utf8 string in buffer is tainted.
const buf01 = Buffer.from(strUtf8Taint, 'utf8');
assert.taintEqual(buf01, [{ 'begin': 0, 'end': bufUtf8TaintLen }]);
resultString = buf01.toString('utf8');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strUtf8TaintLen }]);

// Utf8 string in buffer is not tainted.
const buf02 = Buffer.from(strUtf8, 'utf8');
assert.taintEqual(buf02, []);
resultString = buf02.toString('utf8');
assert.strictEqual(resultString.isTainted(), false);
assert.taintEqual(resultString, []);

// ### Concatenation of strings ###

// Concatenated utf8 string: One tainted string
const buf03 = Buffer.from(strUtf8 + strUtf8Taint + strUtf8, 'utf8');
taintStart = bufUtf8Len;
taintEnd = taintStart + bufUtf8TaintLen;
assert.taintEqual(buf03, [{ 'begin': taintStart, 'end': taintEnd }]);
resultString = buf03.toString('utf8');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strUtf8Len;
taintEnd = taintStart + strUtf8TaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);

// Concatenated utf8 string: Two same tainted strings
const buf04 = Buffer.from(strUtf8 + strUtf8Taint + strUtf8Taint +
                                                  strUtf8, 'utf8');
taintStart = bufUtf8Len;
taintEnd = taintStart + bufUtf8TaintLen * 2;
assert.taintEqual(buf04, [{ 'begin': taintStart, 'end': taintEnd }]);
taintStart = strUtf8Len;
taintEnd = taintStart + strUtf8Len * 2;
resultString = buf04.toString('utf8');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);

// Concatenated utf8 string: Two different tainted strings
const buf05 = Buffer.from(strUtf8 + strUtf8Taint.setTaint('different') +
                                   strUtf8Taint + strUtf8, 'utf8');
taintStart = bufUtf8Len;
taintEnd = taintStart + bufUtf8TaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + bufUtf8TaintLen;
assert.taintEqual(buf05, [{ 'begin': taintStart, 'end': taintEnd },
                          { 'begin': taintStart2, 'end': taintEnd2 }]);
resultString = buf05.toString('utf8');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strUtf8Len;
taintEnd = taintStart + strUtf8TaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + strUtf8TaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd },
                                 { 'begin': taintStart2, 'end': taintEnd2 }]);

// UTF8 taint at the beginning.
const buf06 = Buffer.from(strUtf8Taint + strUtf8, 'utf8');
taintStart = 0;
taintEnd = bufUtf8TaintLen;
assert.taintEqual(buf06, [{ 'begin': taintStart, 'end': taintEnd }]);
resultString = buf06.toString('utf8');
assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strUtf8TaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);

// UTF8 taint at the end
const buf07 = Buffer.from(strUtf8 + strUtf8Taint, 'utf8');
taintStart = bufUtf8Len;
taintEnd = taintStart + bufUtf8TaintLen;
assert.taintEqual(buf07, [{ 'begin': taintStart, 'end': taintEnd }]);
resultString = buf07.toString('utf8');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strUtf8Len;
taintEnd = taintStart + strUtf8TaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);

// UTF8 taint at the beginning and the end
const buf08 = Buffer.from(strUtf8Taint + strUtf8 + strUtf8Taint, 'utf8');
taintStart = 0;
taintEnd = bufUtf8TaintLen;
taintStart2 = taintEnd + bufUtf8Len;
taintEnd2 = taintStart2 + bufUtf8TaintLen;
assert.taintEqual(buf08, [{ 'begin': taintStart, 'end': taintEnd },
                          { 'begin': taintStart2, 'end': taintEnd2 }]);
resultString = buf08.toString('utf8');
assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strUtf8TaintLen;
taintStart2 = taintEnd + strUtf8Len;
taintEnd2 = taintStart2 + strUtf8TaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd },
                                 { 'begin': taintStart2, 'end': taintEnd2 }]);
