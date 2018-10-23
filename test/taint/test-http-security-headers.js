'use strict';
require('../common');
const assert = require('assert');
const net = require('net');
const http = require('http');

const firstLine = 'HTTP/1.1 200 OK\r\n';

const headers = 'Connection: keep-alive\r\n' +
  'Content-Length: 0\r\n';

const response1 = firstLine + headers + '\r\n';

const response2 = firstLine +
  'Content-Type: text/plain\r\n' +
  'Expect-CT: max-age=86400, enforce\r\n' +
  'Strict-Transport-Security: max-age=6307200;includeSubdomains\r\n' +
  'Referrer-Policy: no-referrer\r\n' +
  'X-Content-Type-Options: nosniff\r\n' +
  'X-DNS-Prefatch-Control: off\r\n' +
  'X-Permitted-Cross-Domain-Policies: none\r\n' +
  headers + '\r\n';

const response3 = firstLine +
  'Content-Type: text/html\r\n' +
  'Expect-CT: max-age=86400, enforce\r\n' +
  'Strict-Transport-Security: max-age=6307200;includeSubdomains\r\n' +
  'Referrer-Policy: no-referrer\r\n' +
  'X-Content-Type-Options: nosniff\r\n' +
  'X-DNS-Prefatch-Control: off\r\n' +
  'X-Permitted-Cross-Domain-Policies: none\r\n' +
  'Content-Security-Policy: script-src self; object-src self\r\n' +
  'X-Download-Options: noopen\r\n' +
  'X-Frame-Options: deny\r\n' +
  'X-XSS-Protection: 1; mode=block\r\n' +
  headers + '\r\n';

const response4 = firstLine +
  'Referrer-Policy: origin\r\n' +
  'Expect-CT: max-age=86400, enforce\r\n' +
  'Strict-Transport-Security: max-age=6307200;includeSubdomains\r\n' +
  'X-Content-Type-Options: nosniff\r\n' +
  'X-DNS-Prefatch-Control: off\r\n' +
  'X-Permitted-Cross-Domain-Policies: none\r\n' +
  headers + '\r\n';

const response5 = firstLine +
  'Expect-CT: max-age=86400, enforce\r\n' +
  'Strict-Transport-Security: max-age=6307200;includeSubdomains\r\n' +
  'Referrer-Policy: no-referrer\r\n' +
  'X-Content-Type-Options: nosniff\r\n' +
  'X-DNS-Prefatch-Control: off\r\n' +
  'X-Permitted-Cross-Domain-Policies: none\r\n' +
  headers + '\r\n';

const response6 = firstLine +
  'X-Foo: bar\r\n' +
  'Expect-CT: max-age=86400, enforce\r\n' +
  'Strict-Transport-Security: max-age=6307200;includeSubdomains\r\n' +
  'Referrer-Policy: no-referrer\r\n' +
  'X-Content-Type-Options: nosniff\r\n' +
  'X-DNS-Prefatch-Control: off\r\n' +
  'X-Permitted-Cross-Domain-Policies: none\r\n' +
  headers + '\r\n';

const response7 = firstLine +
  'Expect-CT: max-age=86400, enforce\r\n' +
  'X-Content-Type-Options: nosniff\r\n' +
  headers + '\r\n';

const response8 = response7;

let requests_sent = 0;
let requests_received = 0;

const server = http.createServer(function(req, res) {

  // Deactivate Security Headers
  if (requests_received === 0) {
    res.setSecurityHeaders({ 'addHeaders': false });
  }

  /*// Default Security Headers
  if (requests_received >= 1 && requests_received <= 5) {
    res.setSecurityHeaders({ 'addHeaders': true });
  }*/

  // Content-Type text/plain
  if (requests_received === 1) {
    res.setSecurityHeaders({ 'addHeaders': true });
    res.setHeader('Content-Type', 'text/plain');
  }

  // Content-Type text/html
  if (requests_received === 2) {
    res.setHeader('Content-Type', 'text/html');
  }

  if (requests_received === 3) {
    res.setHeader('Referrer-Policy', 'origin');
  }

  if (requests_received === 4) {
    res.setHeader('X-Powered-By', 'Taint-Node');
  }

  if (requests_received === 5) {
    res.setHeader('X-Foo', 'bar');
  }

  // Specific Security Headers
  if (requests_received === 6) {
    res.setSecurityHeaders({ 'addHeaders': true,
                             'headers':
                             { 'x-powered-by': false,
                               'expect-ct': true,
                               'strict-transport-security': false,
                               'referrer-policy': false,
                               'x-dns-prefatch-control': false,
                               'x-permitted-cross-domain-policies': false,
                               'x-content-type-options': true,
                               'content-security-policy': false,
                               'x-download-options': false,
                               'x-frame-options': false,
                               'x-xss-protection': true,
                               'feature-policy': false,
                               'public-key-pins': false,
                               'cache-control': false
                             }
    });
  }

  // Security Header Prototype should be stored
  if (requests_received === 7)
    this.close();

  res.sendDate = false;
  res.end();
  requests_received += 1;
});

server.listen(0);

server.on('listening', function() {
  const c = net.createConnection(this.address().port);
  c.setEncoding('utf8');

  c.on('connect', function() {
    c.write('GET / HTTP/1.1\r\n\r\n');
    requests_sent += 1;
  });

  c.on('data', function(chunk) {
    const server_response = chunk;
    console.log('Chunk: ' + chunk);

    // Deactivated Security Headers
    if (requests_sent === 1) {
      assert.strictEqual(server_response, response1);
    }

    // Default Security Headers (non-http)
    if (requests_sent === 2) {
      assert.strictEqual(server_response, response2);
    }

    // Default Security Headers (http)
    if (requests_sent === 3) {
      assert.strictEqual(server_response, response3);
    }

    // Do not overwrite exisitng security headers
    if (requests_sent === 4) {
      assert.strictEqual(server_response, response4);
    }

    // Remove powered-by header
    if (requests_sent === 5) {
      assert.strictEqual(server_response, response5);
    }

    // Keep other headers
    if (requests_sent === 6) {
      assert.strictEqual(server_response, response6);
    }

    // Sepcific set of security headers
    if (requests_sent === 7) {
      assert.strictEqual(server_response, response7);
    }

    // Security headers should be stored over multiple responses
    if (requests_sent === 8) {
      assert.strictEqual(server_response, response8);
      c.end();
      return;
    }

    c.write('GET / HTTP/1.1\r\n\r\n');
    requests_sent += 1;
  });

  c.on('end', function() {

  });

  c.on('close', function() {

  });
});
