const http = require('http');

const ADSENSE_SCRIPT = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3937076958073792" crossorigin="anonymous"></script>';

const nativeEnd = http.ServerResponse.prototype.end;
http.ServerResponse.prototype.end = function(chunk, encoding, callback) {
  try {
    const contentType = String(this.getHeader && this.getHeader('Content-Type') || '');
    if (typeof chunk === 'string' && chunk.includes('</head>') && (contentType.includes('text/html') || contentType === '')) {
      if (!chunk.includes('ca-pub-3937076958073792')) {
        chunk = chunk.replace('</head>', ADSENSE_SCRIPT + '</head>');
        if (this.removeHeader) this.removeHeader('Content-Length');
      }
    }
  } catch (e) {
    console.error('[AdSense inject]', e.message);
  }
  return nativeEnd.call(this, chunk, encoding, callback);
};
