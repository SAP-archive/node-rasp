'use strict';

require('../common');
const assert = require('assert');
const contentType = require('../../lib/_contentTypeDetection');

const data1 = '';
assert.strictEqual(contentType.isHTML(data1), false);

const data2 = '<html></html>';
assert.strictEqual(contentType.isHTML(data2), true);

const data3 = '    <html></html>';
assert.strictEqual(contentType.isHTML(data3), true);

const data4 = '<HtMl>';
assert.strictEqual(contentType.isHTML(data4), true);

const data5 = '<!DOCTYPE HTML';
assert.strictEqual(contentType.isHTML(data5), true);

const data6 = '<HTML';
assert.strictEqual(contentType.isHTML(data6), true);

const data7 = '<HEAD';
assert.strictEqual(contentType.isHTML(data7), true);

const data8 = '<SCRIPT';
assert.strictEqual(contentType.isHTML(data8), true);

const data9 = '<IFRAME';
assert.strictEqual(contentType.isHTML(data9), true);

const data10 = '<H1';
assert.strictEqual(contentType.isHTML(data10), true);

const data11 = '<DIV';
assert.strictEqual(contentType.isHTML(data11), true);

const data12 = '<FONT';
assert.strictEqual(contentType.isHTML(data12), true);

const data13 = '<TABLE';
assert.strictEqual(contentType.isHTML(data13), true);

const data14 = '<A';
assert.strictEqual(contentType.isHTML(data14), true);

const data15 = '<STYLE';
assert.strictEqual(contentType.isHTML(data15), true);

const data16 = '<TITLE';
assert.strictEqual(contentType.isHTML(data16), true);

const data17 = '<B';
assert.strictEqual(contentType.isHTML(data17), true);

const data18 = '<BODY';
assert.strictEqual(contentType.isHTML(data18), true);

const data19 = '<BR';
assert.strictEqual(contentType.isHTML(data19), true);

const data20 = '<P';
assert.strictEqual(contentType.isHTML(data20), true);

const data21 = '<!--';
assert.strictEqual(contentType.isHTML(data21), true);
