'use strict';
require('../common');
const assert = require('assert');
const http = require('http');
const post = {
  host: 'localhost',
  port: '8989',
  method: 'POST'
};
const postData = '{json: {key: "value"}}';

(() => {
  const server = http.createServer((req, res) => {
    const { method, url } = req;
    const { headers } = req;

    // HTTP Body
    let body = [];
    req.on('data', (chunk) => {
      body.push(chunk);
      assert.strictEqual(chunk.toString().isTainted(), true);
    }).on('end', () => {
      if (body.length > 0) {
        body = Buffer.concat(body).toString();
        assert.strictEqual(body.isTainted(), true);
      }
    });

    // HTTP Header
    assert.strictEqual(method.isTainted(), true);
    assert.strictEqual(url.isTainted(), true);
    Object.keys(headers).forEach((key) => {
      assert.strictEqual(headers[key].isTainted(), true);
    });

    res.end('Hello, world!\n');
  });

  server.on('error', (e) => {
    console.log(e);
  });

  // HTTP GET request
  server.listen(8989, () => {
    http.get('http://localhost:8989', () => {
      const request = http.request(post, () => {
        server.close();
      });
      request.write(postData);
      request.end();
    });
  });

})();
