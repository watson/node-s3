var util = require('util');
var http = require('http');
var events = require('events');
var test = require('tape');
var nodes3 = require('./');

test('should correctly parse a string', function (t) {
  var s3 = nodes3('s3://key:secret@bucket.s3.amazonaws.com/prefix');
  t.equal(s3.prefix, '/prefix', 'have prefix');
  t.equal(s3.bucket, 'bucket', 'have bucket');
  t.end();
});

test('should correctly parse an object', function (t) {
  var options = {
    key: 'key',
    secret: 'secret',
    bucket: 'bucket',
    prefix: '/prefix'
  };
  var s3 = nodes3(options);
  t.equal(s3.prefix, '/prefix', 'have prefix');
  t.equal(s3.bucket, 'bucket', 'have bucket');
  t.end();
});

test('should not require a prefix', function (t) {
  var s3 = nodes3('s3://key:secret@bucket.s3.amazonaws.com');
  t.equal(s3.prefix, '', 'have empty prefix');
  var options = {
    key: 'key',
    secret: 'secret',
    bucket: 'bucket'
  };
  s3 = nodes3(options);
  t.equal(s3.prefix, '', 'have empty prefix');
  t.end();
});

test('should require key/secret', function (t) {
  var fn = function () {
    nodes3('s3://bucket.s3.amazonaws.com');
  };
  t.throws(fn, 'S3 key and secret are required!');
  t.end();
});

test('should expose 5 HTTP verbs as functions', function (t) {
  var s3 = nodes3('s3://key:secret@bucket.s3.amazonaws.com');
  t.equal(typeof s3.put, 'function', 'PUT');
  t.equal(typeof s3.post, 'function', 'POST');
  t.equal(typeof s3.get, 'function', 'GET');
  t.equal(typeof s3.del, 'function', 'DELETE');
  t.equal(typeof s3.head, 'function', 'HEAD');
  t.end();
});

test('should return an EventEmitter', function (t) {
  var s3 = nodes3('s3://key:secret@bucket.s3.amazonaws.com');
  var req = s3.head('/foo');
  t.ok(req instanceof events.EventEmitter, 'return an EventEmitter');
  t.end();
});

test('should complete a HEAD request', function (t) {
  var s3 = nodes3('s3://key:secret@bucket.us-east-1.s3.amazonaws.com');
  s3.head('/foo', function (err, res, body) {
    t.equal(err, null, 'have no error');
    t.ok(res instanceof http.IncomingMessage, 'have an IncomingMessage');
    t.equal(body, '', 'have no body');
    t.equal(res.statusCode, 403, 'give 403 status-code');
    t.end();
  });
});

test('should complete a GET request', function (t) {
  var s3 = nodes3('s3://key:secret@bucket.s3.amazonaws.com');
  s3.get('/foo', function (err, res, body) {
    t.equal(err, null, 'have no error');
    t.ok(res instanceof http.IncomingMessage, 'have an IncomingMessage');
    t.ok(!!~body.indexOf('<Code>InvalidAccessKeyId</Code>'), 'respond with InvalidAccessKeyId');
    t.equal(res.statusCode, 403, 'give 403 status-code');
    t.end();
  });
});

[{ body: 'foobar' }, 'foobar', new Buffer('foobar')].forEach(function (options) {
  test('should complete a POST request with: ' + util.inspect(options), function (t) {
    var s3 = nodes3('s3://key:secret@bucket.s3.amazonaws.com');
    s3.post('/foo', options, function (err, res, body) {
      t.equal(err, null, 'have no error');
      t.ok(res instanceof http.IncomingMessage, 'have an IncomingMessage');
      t.ok(!!~body.indexOf('<Code>InvalidAccessKeyId</Code>'), 'respond with InvalidAccessKeyId');
      t.equal(res.statusCode, 403, 'give 403 status-code');
      t.end();
    });
  });
});
