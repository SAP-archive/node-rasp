'use strict';
require('../common');
const assert = require('assert');

// UTF8
const strUtf8 = '😃㻖';
const strUtf8Taint = strUtf8.taint('abc');

// UTF16LE
const strUtf16 = Buffer.from(strUtf8, 'utf8').toString('utf16le');
const strUtf16Taint = Buffer.from(strUtf8Taint, 'utf8').toString('utf16le')
                                                       .taint('abc');

const strUtf16Len = Buffer.from(strUtf8, 'utf8').toString('utf16le').length;
const strUtf16TaintLen = Buffer.from(strUtf8Taint, 'utf8')
                                               .toString('utf16le').length;

const bufUtf16Len = Buffer.from(strUtf16, 'utf16le').length;
const bufUtf16TaintLen = Buffer.from(strUtf16Taint, 'utf16le').length;

let resultString;
let taintEnd;
let taintEnd2;
let taintStart;
let taintStart2;

// ### ONE STRING ###

// Utf16 string in buffer is tainted.
const buf01 = new Buffer(strUtf16Taint, 'utf16le');
assert.taintEqual(buf01, [{ 'begin': 0, 'end': bufUtf16TaintLen }]);
resultString = buf01.toString('utf16le');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strUtf16TaintLen }]);

// Utf16 string in buffer is not tainted.
const buf02 = new Buffer(strUtf16, 'utf16le');
assert.taintEqual(buf02, []);
resultString = buf02.toString('utf16le');
assert.strictEqual(resultString.isTainted(), false);
assert.taintEqual(resultString, []);

// ### Concatenation of strings ###

// Concatenated utf16 string: One tainted string
const buf03 = new Buffer(strUtf16 + strUtf16Taint + strUtf16, 'utf16le');
taintStart = bufUtf16Len;
taintEnd = taintStart + bufUtf16TaintLen;
assert.taintEqual(buf03, [{ 'begin': taintStart, 'end': taintEnd }]);
resultString = buf03.toString('utf16le');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strUtf16Len;
taintEnd = taintStart + strUtf16TaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);

// Concatenated Utf16 string: Two same tainted strings
const buf04 = new Buffer(strUtf16 + strUtf16Taint + strUtf16Taint +
                                                  strUtf16, 'utf16le');
taintStart = bufUtf16Len;
taintEnd = taintStart + bufUtf16TaintLen * 2;
assert.taintEqual(buf04, [{ 'begin': taintStart, 'end': taintEnd }]);
taintStart = strUtf16Len;
taintEnd = taintStart + strUtf16Len * 2;
resultString = buf04.toString('utf16le');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);

// Concatenated Utf16 string: Two different tainted strings
const buf05 = new Buffer(strUtf16 + strUtf16Taint.taint('different') +
                                   strUtf16Taint + strUtf16, 'utf16le');
taintStart = bufUtf16Len;
taintEnd = taintStart + bufUtf16TaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + bufUtf16TaintLen;
assert.taintEqual(buf05, [{ 'begin': taintStart, 'end': taintEnd },
                          { 'begin': taintStart2, 'end': taintEnd2 }]);
resultString = buf05.toString('utf16le');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strUtf16Len;
taintEnd = taintStart + strUtf16TaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + strUtf16TaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd },
                                 { 'begin': taintStart2, 'end': taintEnd2 }]);

// Utf16 taint at the beginning.
const buf06 = new Buffer(strUtf16Taint + strUtf16, 'utf16le');
taintStart = 0;
taintEnd = bufUtf16TaintLen;
assert.taintEqual(buf06, [{ 'begin': taintStart, 'end': taintEnd }]);
resultString = buf06.toString('utf16le');
assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strUtf16TaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);

// Utf16 taint at the end
const buf07 = new Buffer(strUtf16 + strUtf16Taint, 'utf16le');
taintStart = bufUtf16Len;
taintEnd = taintStart + bufUtf16TaintLen;
assert.taintEqual(buf07, [{ 'begin': taintStart, 'end': taintEnd }]);
resultString = buf07.toString('utf16le');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strUtf16Len;
taintEnd = taintStart + strUtf16TaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);

// Utf16 taint at the beginning and the end
const buf08 = new Buffer(strUtf16Taint + strUtf16 + strUtf16Taint, 'utf16le');
taintStart = 0;
taintEnd = bufUtf16TaintLen;
taintStart2 = taintEnd + bufUtf16Len;
taintEnd2 = taintStart2 + bufUtf16TaintLen;
assert.taintEqual(buf08, [{ 'begin': taintStart, 'end': taintEnd },
                          { 'begin': taintStart2, 'end': taintEnd2 }]);
resultString = buf08.toString('utf16le');
assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strUtf16TaintLen;
taintStart2 = taintEnd + strUtf16Len;
taintEnd2 = taintStart2 + strUtf16TaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd },
                                 { 'begin': taintStart2, 'end': taintEnd2 }]);
