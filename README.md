# Node S3

A simple Amazon S3 node.js integration.

## Usage

```js
var s3Url = '...'; // s3://{key}:{secret}@{bucket}.s3.amazonaws.com
var s3 = require('s3').create(s3Url);

// Pipe a request directly to S3
var headers = { 'content-length': req.headers['content-length'] };
var s3Req = s3.put('/some-s3-key', { headers: headers }, callback);
req.pipe(s3Req);

// Upload a buffer to S3
s3.put('/some-s3-key', { body: buffer }, callback);
```

## License

MIT
