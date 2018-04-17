'use strict';
require('../common');
const fs = require('fs');
const assert = require('assert');
const content = 'Hello Node.js';
const error = /no such file or directory/;

/*
Tests for various fs functions that
take a path parameter, including mkdir, rmdir,
readFile, access, watch, truncate, chmod, and stat
(including corresponding sync functions)
*/

fs.mkdir('../test2'.setTaint('bar'), (err) => {
  assert.strictEqual(fs.existsSync('../test2'), false);
  assert.strictEqual(fs.existsSync('test2'), true);
  fs.rmdir('../test2'.setTaint('bar'), (err) => {
    assert.ifError(err);
    assert.strictEqual(err, null);
    assert.strictEqual(fs.existsSync('test2'), false);
  });
});

fs.mkdir('test', (err) => {
  fs.writeFile('test/test2.txt', 'Hello Node.js 2', (err) => {
    fs.writeFile('test.txt', content, (err) => {
      assert.ifError(err);
      fs.readFile('test.txt', (err, data) => {
        assert.ifError(err);
        assert.deepStrictEqual(data, Buffer.from(content));
      });

      fs.readFile('./test.txt'.setTaint('bar'), (err, data) => {
        assert.ifError(err);
        assert.deepStrictEqual(data, Buffer.from(content));
      });

      fs.readFile('../test.txt'.setTaint('bar'), (err, data) => {
        assert.ifError(err);
        assert.deepStrictEqual(data, Buffer.from(content));
      });

      fs.readFile('../../../test.txt'.setTaint('bar'), (err, data) => {
        assert.ifError(err);
        assert.deepStrictEqual(data, Buffer.from(content));
      });

      fs.readFile('test/test2.txt', (err, data) => {
        assert.ifError(err);
        assert.deepStrictEqual(data, Buffer.from('Hello Node.js 2'));
      });

      fs.readFile('test/../test2.txt'.setTaint('bar'), (err, data) => {
        assert.ifError(err);
        assert.deepStrictEqual(data, Buffer.from('Hello Node.js 2'));
      });

      fs.readFile('test/../../../test2.txt'.setTaint('bar'), (err, data) => {
        assert.ifError(err);
        assert.deepStrictEqual(data, Buffer.from('Hello Node.js 2'));
      });

      fs.readFile('../test/../../../test2.txt'.setTaint('bar'), (err, data) => {
        assert.ifError(err);
        assert.deepStrictEqual(data, Buffer.from('Hello Node.js 2'));
      });

      fs.readFile('../'.setTaint('bar') + 'test/' +
                  '../../..'.setTaint('bar') + '/test2.txt', (err, data) => {
        assert.ifError(err);
        assert.deepStrictEqual(data, Buffer.from('Hello Node.js 2'));
      });

      assert.throws(() => {
        fs.readFileSync('../test.txt');
      }, error);

      fs.access('test.txt', (err) => {
        assert.strictEqual(err, null);
      });

      fs.access('../../../test.txt'.setTaint('bar'), (err) => {
        assert.strictEqual(err, null);
      });

      fs.access('test/test2.txt', (err) => {
        assert.strictEqual(err, null);
      });

      fs.access('test/../test2.txt'.setTaint('bar'), (err) => {
        assert.strictEqual(err, null);
      });

      fs.access('test/../../../test2.txt'.setTaint('bar'), (err) => {
        assert.strictEqual(err, null);
      });

      fs.access('../test/../../../test2.txt'.setTaint('bar'), (err) => {
        assert.strictEqual(err, null);
      });

      fs.access('../'.setTaint('bar') + 'test/' +
                '../../..'.setTaint('bar'), (err) => {
        assert.strictEqual(err, null);
      });

      assert.throws(() => {
        fs.accessSync('../test.txt');
      }, error);

      assert.throws(() => {
        fs.watch('../test.txt');
      }, /watch/);


      fs.truncate('test.txt', 13, (err) => {
        assert.strictEqual(err, null);
      });

      fs.truncate('../test.txt'.setTaint('bar'), 13, (err) => {
        assert.strictEqual(err, null);
      });

      fs.truncate('../../../test.txt'.setTaint('bar'), 13, (err) => {
        assert.strictEqual(err, null);
      });

      fs.truncate('test/test2.txt', 15, (err) => {
        assert.strictEqual(err, null);
      });

      fs.truncate('test/../test2.txt'.setTaint('bar'), 15, (err) => {
        assert.strictEqual(err, null);
      });

      fs.truncate('test/../../../test2.txt'.setTaint('bar'), 15, (err) => {
        assert.strictEqual(err, null);
      });

      fs.truncate('../test/../../../test2.txt'.setTaint('bar'), 15, (err) => {
        assert.strictEqual(err, null);
      });

      fs.truncate('../'.setTaint('bar') + 'test/' +
                  '../../..'.setTaint('bar') + '/test2.txt', 15, (err) => {
        assert.strictEqual(err, null);
      });

      assert.throws(() => {
        fs.truncateSync('../test.txt', 15);
      }, error);

      fs.chmod('../test.txt'.setTaint('bar'), '00020', (err) => {
        assert.ifError(err);
        assert.strictEqual(err, null);
      });

      assert.throws(() => {
        fs.chmodSync('../test.txt', '00020');
      }, error);

      fs.stat('../test.txt'.setTaint('bar'), (err, stats) => {
        assert.ifError(err);
        assert.strictEqual(err, null);
      });

      assert.throws(() => {
        fs.statSync('../test.txt');
      }, error);

      fs.unlinkSync('test.txt');
      fs.unlinkSync('test/test2.txt');

    });
  });
});
