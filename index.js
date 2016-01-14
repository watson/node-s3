var curly = require('curly');
var aws4 = require('aws4');
var parseURL = require('url').parse;

module.exports = function (options) {
  var that = {};
  var host;
  var auth;
  var tokens;

  options = typeof options === 'string' ? parseURL(options) : options;
  tokens = options.hostname ? options.hostname.split('.') : [];

  if (!options.region && tokens.length === 5) {
    options.region = tokens[1];
  }

  that.prefix = options.prefix || options.pathname || '';
  that.bucket = options.bucket || tokens[0];
  that.region = options.region || 'us-east-1';

  host = that.bucket + '.s3.amazonaws.com';
  auth = options.auth ? options.auth.split(':') : [options.key, options.secret];
  auth = {
    accessKeyId: auth[0],
    secretAccessKey: auth[1]
  };

  if (!auth.accessKeyId || !auth.secretAccessKey) {
    throw 'S3 key and secret are required!';
  }

  ['put', 'post', 'get', 'del', 'head'].forEach(function (method) {
    var verb = method === 'del' ? 'DELETE' : method.toUpperCase();

    that[method] = function request(path, opts, callback) {
      path = that.prefix + path;

      if (typeof opts === 'function') {
        return request(path, null, opts);
      }
      if (typeof opts === 'string' || opts instanceof Buffer) {
        return request(path, { body: opts }, callback);
      }

      var awsRequest = curly.use(function (req) { // options
        req.service = 's3';
        req.region = that.region;
        req.host = host;
        req.method = method;
        req.path = path;
        aws4.sign(req, auth);
        return curly(req);
      });

      opts = opts || {};
      opts.pool = false;

      return awsRequest[verb](host + path, opts, callback);
    };
  });

  return that;
};
