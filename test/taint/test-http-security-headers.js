'use strict';
require('../common');
const assert = require('assert');
const net = require('net');
const http = require('http');
const url = require('url');
const qs = require('querystring');

const response1 = 'HTTP/1.1 200 OK\r\n' +
  'Connection: keep-alive\r\n' +
  'Content-Length: 0\r\n\r\n';

let request_number = 0;
let requests_sent = 0;
let server_response = '';
let client_got_eof = false;

const server = http.createServer(function(req, res) {
  res.id = request_number;
  req.id = request_number++;

  // Deactivate Security Headers
  if (req.id === 0) {
    res.setSecurityHeaders({'addHeaders': false});
  }

  // Default Security Headers
  if (req.id >= 1 && req.id <= 5) {
    res.setSecurityHeaders({'addHeaders': true});
  }

  // Specific Security Headers
  if (req.id === 6) {
    res.setSecurityHeaders({ 'addHeaders': true,
                                  'headers':
                                  { 'x-powered-by': false,
                                    'expect-ct': true,
                                    'strict-transport-security': false,
                                    'referrer-policy': false,
                                    'x-dns-prefatch-control': false,
                                    'x-permitted-cross-domain-policies': false,
                                    'content-type': false,
                                    'content-security-policy': false,
                                    'x-download-options': false,
                                    'x-frame-options': false,
                                    'x-xss-protection': true,
                                    'feature-policy': false,
                                    'public-key-pins': false,
                                    'cache-control': false
                                  }
                                }
    );
    //this.close();
  }
 
  res.sendDate = false; 
  res.end();
  this.close();
});

server.listen(0);

server.on('listening', function() {
  console.log('Server listens');
  const c = net.createConnection(this.address().port);
  c.setEncoding('utf8');
  
  // Deactivated Security Headers
  c.on('connect', function() {
    console.log('Connect');
    c.write('GET / HTTP/1.1\r\nX-X: foo\r\n\r\n');
    requests_sent += 1;
  });

  c.on('data', function(chunk) {
    console.log('data');
    console.log('requests_sent: ' + requests_sent);
    server_response += chunk;

     if (requests_sent === 1) {
      console.log(server_response);
      assert.strictEqual(server_response, response1);
      c.end();
    }
  });

  c.on('end', function() {

  });

  c.on('close', function() {

  });

   // Default Security Headers (non-http)

  // Default Security Headers (http)

  // Do not overwrite existing security headers

  // Keep other headers

  // Handle implicit headers


  // Set specific set of security headers
});
