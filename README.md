# Node S3

A simple Amazon S3 node.js integration.

## Install

```
npm install node-s3
```

## Usage

### Initialization

First initialize the node-s3 module with a URI to your S3 bucket

```javascript
var s3Url = '...'; // s3://{key}:{secret}@{bucket}.s3.amazonaws.com
var s3 = require('node-s3').create(s3Url);
```

It's important that the key/secret provided have write permissions to
the bucket.

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

## License

MIT
