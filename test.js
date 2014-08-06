'use strict';

var test = require('tape');
var nodes3 = require('./');

test('should correctly parse a string', function (t) {
  var s3 = nodes3('s3://key:secret@bucket.s3.amazonaws.com/prefix');
  t.equal(s3.pathname, '/prefix', 'have prefix');
  t.equal(s3.bucket, 'bucket', 'have bucket');
  t.end();
});

test('should correctly parse an object', function (t) {
  var options = {
    key: 'key',
    secret: 'secret',
    bucket: 'bucket',
    pathname: '/prefix'
  };
  var s3 = nodes3(options);
  t.equal(s3.pathname, '/prefix', 'have prefix');
  t.equal(s3.bucket, 'bucket', 'have bucket');
  t.end();
});

test('should not require a prefix', function (t) {
  var s3 = nodes3('s3://key:secret@bucket.s3.amazonaws.com');
  t.equal(s3.pathname, '', 'have empty pathname');
  var options = {
    key: 'key',
    secret: 'secret',
    bucket: 'bucket'
  };
  s3 = nodes3(options);
  t.equal(s3.pathname, '', 'have empty pathname');
  t.end();
});

test('should require key/secret', function (t) {
  var failed = false;
  try {
    nodes3('s3://bucket.s3.amazonaws.com');
  } catch (e) {
    failed = true;
  }
  t.ok(failed, 'did throw exception');
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
