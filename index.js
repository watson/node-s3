'use strict';

var curly = require('curly');
var crypto = require('crypto');
var parseURL = require('url').parse;

var signer = function (publicKey, secretKey) {
  var stringToSign = function (verb, resource, headers) {
    var res = [
      verb,
      headers['content-md5'] || '',
      headers['content-type'] || '',
      ''
    ];

    if (headers['x-amz-acl'])
      res.push('x-amz-acl:' + headers['x-amz-acl']);
    if (headers['x-amz-copy-source'])
      res.push('x-amz-copy-source:' + headers['x-amz-copy-source']);
    if (headers['x-amz-date'])
      res.push('x-amz-date:' + headers['x-amz-date']);
    if (headers['x-amz-storage-class'])
      res.push('x-amz-storage-class:' + headers['x-amz-storage-class']);

    res.push(resource);

    return res.join('\n');
  };

  return function (verb, resource, headers) {
    headers = headers || {};
    headers.date = new Date().toUTCString();
    headers['x-amz-date'] = headers.date;

    var hash = crypto.createHmac('sha1', secretKey).update(stringToSign(verb, resource, headers)).digest('base64');

    headers.authorization = 'AWS ' + publicKey + ':' + hash;

    return headers;
  };
};

exports.create = function (options) {
  var that = {},
      auth, publicKey, secretKey, sign, prefix;

  options = typeof options === 'string' ? parseURL(options) : options;

  that.pathname = options.pathname || '';
  that.bucket = options.hostname.split('.')[0];

  auth = options.auth.split(':');
  publicKey = auth[0];
  secretKey = auth[1];

  sign = signer(publicKey, secretKey);
  prefix = that.bucket + '.s3.amazonaws.com' + that.pathname;

  ['put', 'post', 'get', 'del', 'head'].forEach(function (method) {
    var verb = method.replace('del', 'delete').toUpperCase();

    that[method] = function (pathname, options, callback) {
      var signing = '/' + that.bucket + that.pathname + pathname;

      if (typeof options === 'function') {
        callback = options;
        options = {};
      }

      options = options || {};
      options.pool = false;
      options.headers = sign(verb, signing, options.headers);

      return curly[method](prefix + pathname, options, callback);
    };
  });

  return that;
};
