'use strict';

var curly = require('curly');
var crypto = require('crypto');
var parseURL = require('url').parse;

var signer = function (key, secret) {
  if (!key || !secret) throw new Error('S3 key and secret are required!');

  var getStringToSign = function (verb, resource, headers) {
    var lowerCaseHeaders = {};

    Object.keys(headers).forEach(function (header) {
      lowerCaseHeaders[header.toLowerCase()] = headers[header];
    });

    var res = [
      verb,
      lowerCaseHeaders['content-md5'] || '',
      lowerCaseHeaders['content-type'] || '',
      ''
    ];

    Object.keys(lowerCaseHeaders)
      .filter(function (header) {
        return header.indexOf('x-amz-') === 0;
      })
      .sort(function (a, b) {
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
      })
      .forEach(function (header) {
        res.push(header + ':' + lowerCaseHeaders[header]);
      });

    res.push(resource);

    return res.join('\n');
  };

  return function (verb, resource, headers) {
    headers = headers || {};
    headers['x-amz-date'] = (new Date()).toUTCString();

    var stringToSign = getStringToSign(verb, resource, headers);
    var hash = crypto.createHmac('sha1', secret).update(stringToSign).digest('base64');

    headers.authorization = 'AWS ' + key + ':' + hash;

    return headers;
  };
};

module.exports = function (options) {
  var that = {},
      auth, sign, prefix;

  options = typeof options === 'string' ? parseURL(options) : options;

  that.pathname = options.pathname || '';
  that.bucket = options.bucket || options.hostname.split('.')[0];

  auth = options.auth ? options.auth.split(':') : [options.key, options.secret];
  sign = signer(auth[0], auth[1]);
  prefix = that.bucket + '.s3.amazonaws.com' + that.pathname;

  ['put', 'post', 'get', 'del', 'head'].forEach(function (method) {
    var verb = method.replace('del', 'delete').toUpperCase();

    that[method] = function request(pathname, options, callback) {
      if (typeof options === 'function') return request(pathname, null, options);

      var signing = '/' + that.bucket + that.pathname + pathname;

      options = options || {};
      options.pool = false;
      options.headers = sign(verb, signing, options.headers);

      return curly[method](prefix + pathname, options, callback);
    };
  });

  return that;
};
