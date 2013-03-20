var curly = require('curly').pool(false);
var common = require('common');
var crypto = require('crypto');
var parseURL = require('url').parse;

var signer = function(publicKey, secretKey) {
  var stringToSign = function(method, resource, headers) {
    var res = [
      method,
      headers['content-md5'] || '',
      headers['content-type'] || '',
      ''
    ];

    if (headers['x-amz-acl']) {
      res.push('x-amz-acl:'+headers['x-amz-acl']);
    }
    if (headers['x-amz-copy-source']) {
      res.push('x-amz-copy-source:'+headers['x-amz-copy-source']);
    }
    if (headers['x-amz-date']) {
      res.push('x-amz-date:'+headers['x-amz-date']);
    }
    if (headers['x-amz-storage-class']) {
      res.push('x-amz-storage-class:'+headers['x-amz-storage-class']);
    }

    res.push(resource);

    return res.join('\n');
  }

  return function(method, resource, headers) {
    headers = headers || {};
    headers.date = new Date().toUTCString();
    headers['x-amz-date'] = headers.date;
    headers.authorization = 'AWS '+
      publicKey+':'+crypto.createHmac('sha1',
          secretKey).update(stringToSign(method, resource,
              headers)).digest('base64');

    return headers;
  };
};

exports.create = function(options) {
  options = typeof options === 'string' ? parseURL(options) : options;

  var that = {};

  that.pathname = (options.pathname || '');
  that.bucket = options.hostname.split('.')[0];

  var publicKey = options.auth.split(':')[0];
  var secretKey = options.auth.split(':')[1];

  var sign = signer(publicKey, secretKey);
  var prefix = that.bucket+'.s3.amazonaws.com'+that.pathname;

  ['put', 'post', 'get', 'del', 'head'].forEach(function(method) {
    var httpMethod = method.replace('del', 'delete').toUpperCase();

    that[method] = function(pathname, headers, callback) {
      if (typeof headers === 'function') {
        callback = headers;
        headers = {};
      }
      var signing = '/'+that.bucket+that.pathname+pathname;
      return curly[method](prefix+pathname).headers(sign(httpMethod, signing, headers), callback);
    };
  });

  return that;
};
