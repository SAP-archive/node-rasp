'use strict';
require('../common');
const assert = require('assert');

const { checkInjection } = require('../../lib/taint/pg_lexer.js');

const query0 = 'SELECT * FROM table WHERE foo=\'bar\';';
assert.deepStrictEqual(checkInjection(query0), false);

const query1 = 'SELECT * FROM table WHERE foo=\'bar\';'.setTaint('bar');
assert.deepStrictEqual(checkInjection(query1), true);

const query2 = 'SELECT * FROM table WHERE foo=\'' +
               'bar\' OR 1=1;--'.setTaint('bar') + ';';
assert.deepStrictEqual(checkInjection(query2), true);
