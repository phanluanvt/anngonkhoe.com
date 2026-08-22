const http = require('http');
const nativeCreateServer = http.createServer;
const ADS_TXT = 'google.com, pub-3937076958073792, DIRECT, f08c47fec0942fa0\n';

http.createServer = function(handler, ...rest) {
  return nativeCreateServer.call(http, (req, res) => {
    let pathname = '/';
    try {
      pathname = new URL(req.url || '/', 'http://localhost').pathname;
    } catch (_) {
      pathname = (req.url || '/').split('?')[0];
    }

    if ((req.method === 'GET' || req.method === 'HEAD') && (pathname === '/ads.txt' || pathname === '/ads.txt/')) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('X-Robots-Tag', 'all');
      if (req.method === 'HEAD') return res.end();
      return res.end(ADS_TXT);
    }

    return handler(req, res);
  }, ...rest);
};
