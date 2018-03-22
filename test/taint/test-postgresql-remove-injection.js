'use strict';
require('../common');
const assert = require('assert');

const { removeAllInjections } = require('../../lib/taint/pg_lexer.js');

const query0 = 'SELECT * FROM table WHERE foo=\'bar\';';
assert.deepStrictEqual(removeAllInjections(query0),
                       { injected: false });

const query1 = 'SELECT * FROM table WHERE foo=\'' +
               'bar\' or 1=1;--'.setTaint('bar') + '\';';
assert.deepStrictEqual(removeAllInjections(query1),
                       {injected: true,
                        query: 'SELECT * FROM table WHERE foo=\'\';',
                        vectors: ['bar\' or 1=1;--']});
/*const query1 = 'SELECT * FROM table WHERE foo=\'bar\';'.setTaint('bar');
assert.deepStrictEqual(removeInjection(query1, []),
                       {query:'?1', params: [query1]});*/
