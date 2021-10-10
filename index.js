const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const httpServer = http.createServer();
const mime = {
  html: 'text/html',
  txt: 'text/plain',
  css: 'text/css',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  js: 'application/javascript',
  json: 'application/json',
  mp4: 'video/mp4',
};

httpServer.on('request', (req, res) => {

  // serve the index.html file
  if (req.url === '/') {
    res.writeHead(200, { 'Content-type': 'text/html' });

    return res.end(fs.readFileSync('./index.html'));
  }

  // upload file and response with its url
  if (req.url === '/upload') {

    if (req.headers['content-type'] === 'application/json' && req.headers['done'] === 'true') {
      res.setHeader('Content-Type', 'application/json');

      return res.end(JSON.stringify({ url: `${req.headers.host}/public/${req.headers['file-name']}` }));
    }

    const fileName = req.headers['file-name'];

    req.on('data', (chunk) => {
      fs.appendFileSync(__dirname + '/public/' + fileName, chunk)
    });

    res.end('uploaded');
  }


  // read file uploaded
  const fileRegex = new RegExp(`^/public/.*`, 'i');
  if (fileRegex.test(req.url)) {
    try {
      const fileExtension = path.extname(`${decodeURI(req.url)}`);
      const type = mime[path.extname(fileExtension).slice(1)] || 'text/plain';
      const s = fs.createReadStream(`${decodeURI(req.url).replace('/', '')}`);

      res.writeHead(200, { 'Content-type': type });

      s.pipe(res);
    } catch (error) {
      return res.end('no file');
    }
  }

});

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});