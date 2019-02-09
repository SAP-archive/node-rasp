'use strict';
require('../common');
const assert = require('assert');

// ASCII
const strAscii = 'This string is not tainted!';
const strAsciiTaint = 'This is a tainted string!'.taint('baz');

const strAsciiLen = strAscii.length;
const strAsciiTaintLen = strAsciiTaint.length;

let resultString;
let taintEnd;
let taintEnd2;
let taintStart;
let taintStart2;

// ### ONE STRING ###

// Ascii string in buffer is tainted.
const buf01 = Buffer.from(strAsciiTaint, 'ascii');
assert.taintEqual(buf01, [{ 'begin': 0, 'end': strAsciiTaintLen }]);
resultString = buf01.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strAsciiTaintLen }]);

// Ascii string in buffer is not tainted.
const buf02 = Buffer.from(strAscii, 'ascii');
assert.taintEqual(buf02, []);
resultString = buf02.toString('ascii');
assert.strictEqual(resultString.isTainted(), false);
assert.taintEqual(resultString, []);

// ### Concatenation of strings ###

// One tainted string
const buf03 = Buffer.from(strAscii + strAsciiTaint + strAscii, 'ascii');
taintStart = strAsciiLen;
taintEnd = taintStart + strAsciiTaintLen;
assert.taintEqual(buf03, [{ 'begin': taintStart, 'end': taintEnd }]);
resultString = buf03.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);

// Two same tainted strings
const buf04 = Buffer.from(strAscii + strAsciiTaint + strAsciiTaint +
                                                    strAscii, 'ascii');
taintStart = strAsciiLen;
taintEnd = taintStart + strAsciiTaintLen + strAsciiTaintLen;
assert.taintEqual(buf04, [{ 'begin': taintStart, 'end': taintEnd }]);
resultString = buf04.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);

// Two different tainted strings
const buf05 = Buffer.from(strAscii + strAsciiTaint.taint('different') +
                                    strAsciiTaint + strAscii, 'ascii');
taintStart = strAsciiLen;
taintEnd = taintStart + strAsciiTaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + strAsciiTaintLen;
assert.taintEqual(buf05, [{ 'begin': taintStart, 'end': taintEnd },
                          { 'begin': taintStart2, 'end': taintEnd2 }]);
resultString = buf05.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd },
                                 { 'begin': taintStart2, 'end': taintEnd2 }]);

// Taint at the beginning
const buf06 = Buffer.from(strAsciiTaint + strAscii, 'ascii');
taintStart = 0;
taintEnd = strAsciiTaintLen;
assert.taintEqual(buf06, [{ 'begin': taintStart, 'end': taintEnd }]);
resultString = buf06.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);

// Taint at the end
const buf07 = Buffer.from(strAscii + strAsciiTaint, 'ascii');
taintStart = strAsciiLen;
taintEnd = taintStart + strAsciiTaintLen;
assert.taintEqual(buf07, [{ 'begin': taintStart, 'end': taintEnd }]);
resultString = buf07.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);

// Taint at the beginning and the end
const buf08 = Buffer.from(strAsciiTaint + strAscii + strAsciiTaint, 'ascii');
taintStart = 0;
taintEnd = strAsciiTaintLen;
taintStart2 = taintEnd + strAsciiLen;
taintEnd2 = taintStart2 + strAsciiTaintLen;
assert.taintEqual(buf08, [{ 'begin': taintStart, 'end': taintEnd },
                          { 'begin': taintStart2, 'end': taintEnd2 }]);
resultString = buf08.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd },
                                 { 'begin': taintStart2, 'end': taintEnd2 }]);

// ### COPY BUFFER ###

// Tainted buffer
const buf09 = Buffer.from(buf01);
assert.taintEqual(buf09, [{ 'begin': 0, 'end': strAsciiTaintLen }]);
resultString = buf09.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strAsciiTaintLen }]);

// Multiple taints
const buf10 = Buffer.from(buf08);
taintStart = 0;
taintEnd = strAsciiTaintLen;
taintStart2 = taintEnd + strAsciiLen;
taintEnd2 = taintStart2 + strAsciiTaintLen;
assert.taintEqual(buf10, [{ 'begin': taintStart, 'end': taintEnd },
                          { 'begin': taintStart2, 'end': taintEnd2 }]);
resultString = buf10.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd },
                                 { 'begin': taintStart2, 'end': taintEnd2 }]);
