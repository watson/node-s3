var curly = require('curly');
var aws4 = require('aws4');
var parseURL = require('url').parse;

/**
 * Creates the node-s3 object which includes
 * information like:
 * - prefix: the path prefix
 * - bucket: the bucket to access
 * - region: the aws region
 * - auth: the aws creds
 *
 * and HTTP methods:
 * - put
 * - post
 * - get
 * - del
 * - head
 *
 * for making quick requests to amazon S3. The `options` param should be
 * one of:
 * - a valid S3 bucket url (if without region, region will default to `us-east-1`)
 * - an object consisting of:
 *   - prefix: the path prefix
 *   - bucket: the s3 bucket
 *   - region: the s3 region
 *   - key: the aws user ID key
 *   - secret: the aws user secret key
 *
 * WARNING: string parsing will **not** work with period ('.') delimited
 * bucket names - buckets must be delimited with something other than
 * periods. You can still use the options hash and specify the bucket
 * name if your buckets include periods.
 * @param  {object} options The options used to init the requests
 * @return {object}         The initialized object
 */
module.exports = function (options) {
  var that = {};
  var tokens;
  var temp;

  // Parse string if needed
  options = typeof options === 'string' ? parseURL(options) : options;
  tokens = options.hostname ? options.hostname.split('.') : [];

  // Find region if present
  // Doesn't work with period delimited buckets
  if (!options.region && tokens.length === 5) {
    options.region = tokens[1];
  }

  // Populate instance info
  that.prefix = options.prefix || options.pathname || '';
  that.bucket = options.bucket || tokens[0];
  that.region = options.region || 'us-east-1';
  temp = options.auth ?
    options.auth.split(':') : [options.key, options.secret];
  that.auth = {
    accessKeyId: temp[0],
    secretAccessKey: temp[1]
  };

  // Check for AWS creds
  if (!that.auth.accessKeyId || !that.auth.secretAccessKey) {
    throw 'S3 key and secret are required!';
  }

  /**
   * Populate HTTP methods
   */
  ['put', 'post', 'get', 'del', 'head'].forEach(function (method) {
    var verb = method === 'del' ? 'DELETE' : method.toUpperCase();
    var host = that.bucket + '.s3.amazonaws.com';

    that[method] = function request(path, opts, callback) {

      // extend curly
      var awsRequest = curly.use(function (req) {
        req.service = 's3';
        req.region = that.region;
        req.host = host;
        req.method = method;
        req.path = that.prefix + path;
        req.url = req.host + req.path;
        aws4.sign(req, that.auth);
        return curly(req);
      });

      // Deal with incomplete params
      if (typeof opts === 'function') {
        return awsRequest(path, null, opts);
      }
      if (typeof opts === 'string' || opts instanceof Buffer) {
        return awsRequest(path, { body: opts }, callback);
      }

      opts = opts || {};
      opts.pool = false;

      return awsRequest[verb](host + path, opts, callback);
    };
  });

  return that;
};
