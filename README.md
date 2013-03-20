# Node S3

A simple Amazon S3 node.js integration.

## Usage

```js
var s3Url = '...' // s3://{key}:{secret}@{bucket}.s3.amazonaws.com
var s3 = require('s3').create(s3Url);

var headers = {
  'x-amz-acl'      : 'public-read',
  'content-type'   : 'image/jpeg',
  'content-length' : 123 // remember to set the content-length
};

// Pipe a request containing a file directly to S3
s3.put('/some-s3-key', headers).from(req, function(err, res) {
  // handle the result
});

// Upload a buffer to S3
s3.put('/some-s3-key', headers).end(buffer, function (err, res) {
  // handle the result
});
```

## License

MIT
