const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, 'server.js');
const patched = path.join('/tmp', 'anngonkhoe-server-adsense.js');
const adsense = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3937076958073792" crossorigin="anonymous"></script>';

let code = fs.readFileSync(source, 'utf8');
if (!code.includes('ca-pub-3937076958073792')) {
  const marker = '<style>${css}</style></head>';
  if (!code.includes(marker)) {
    throw new Error('AdSense inject marker not found in server.js');
  }
  code = code.replace(marker, '<style>${css}</style>' + adsense + '</head>');
}
fs.writeFileSync(patched, code, 'utf8');
require(patched);
