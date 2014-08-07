# Node S3

A simple Amazon S3 node.js integration.

[![Build Status](https://travis-ci.org/watson/node-s3.png)](https://travis-ci.org/watson/node-s3)

## Install

```
npm install node-s3
```

## Usage

### Initialization

First initialize the node-s3 module with a URI to your S3 bucket

```javascript
var s3Url = 's3://key:secret@your_bucket.s3.amazonaws.com';
var s3 = require('node-s3')(s3Url);
```

It's important that the key/secret provided have write permissions to
the bucket.

Alternatively initialize with an options object:

```javascript
var options = {
  key: '...',
  secret: '...',
  bucket: '...',
  pathname: '/foo' // optional: prefix all S3 keys with this path
};
var s3 = require('node-s3')(options);
```

### Uploading

Example 1: Upload a Buffer to S3

```javascript
s3.put('/some-s3-key', { body: buffer }, callback);
```

Example 2: Pipe an incoming http request directly to S3

```javascript
http.createServer(function (req, res) {
  var headers = {
    'Content-Length': req.headers['content-length']
  };
  var s3Req = s3.put('/some-s3-key', { headers: headers }, callback);
  req.pipe(s3Req);
}).listen(3000);
```

## API

Common for all functions on the s3 object returned from the node-s3
constructor is that they take up to 3 arguemnts:

- `key` - The requested S3 key (required). Will be concatinated with the optional pathname given upon initalization
- `options` - Optional options hash. Can among other things contain HTTP headers sent along with the content
- `callback` - Optional callback called with (err, response, body)

Functions:

- `s3.head(key, options, callback)` - Perform a HEAD request
- `s3.get(key, options, callback)` - Perform a GET request
- `s3.post(key, options, callback)` - Perform a POST request
- `s3.put(key, options, callback)` - Perform a PUT request
- `s3.del(key, options, callback)` - Perform a DELETE request

## License

MIT
