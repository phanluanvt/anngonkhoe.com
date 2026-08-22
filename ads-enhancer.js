const http = require('http');
const nativeCreateServer = http.createServer;

http.createServer = function(handler, ...rest) {
  return nativeCreateServer.call(http, (req, res) => {
    const path = (req.url || '').split('?')[0];
    if (req.method === 'GET' && path === '/ads.txt') {
      res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=300'
      });
      return res.end('google.com, pub-3937076958073792, DIRECT, f08c47fec0942fa0\n');
    }
    return handler(req, res);
  }, ...rest);
};
