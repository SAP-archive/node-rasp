'use strict';
require('../common');
const assert = require('assert');
const _pg = require('taint/_pg');

// Wrap and assert console.info
console.info = (...args) => {
  args.forEach((arg) => {
    assert.strictEqual(arg.isTainted(), false);
  });
};

// Instrument pseudo pg module
const pg = {};
pg.Client = {};
pg.Client.prototype = {};
pg.Client.prototype.query = () => {};
_pg.instrument(pg);

pg.Client.prototype.query('SELECT foo FROM bar'.setTaint('bar'));
pg.Client.prototype.query('SELECT foo FROM bar WHERE b=\'a' +
                          'bc\' OR 1=1;--'.setTaint('bar') +
                          '\';');
pg.Client.prototype.query('SELECT foo FROM bar WHERE b=\'a' +
                          'bc\' OR 1=1;--'.setTaint('bar') +
                          '\' OR baz=\'' +
                          '\' OR tenant>0;--'.setTaint('baz') +
                          '\';');
