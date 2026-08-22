const fs = require('fs');
const Module = require('module');
const path = require('path');

const originalJs = Module._extensions['.js'];
const target = path.join(__dirname, 'server.js');
const adsense = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3937076958073792" crossorigin="anonymous"></script>';

Module._extensions['.js'] = function(mod, filename) {
  if (path.resolve(filename) === path.resolve(target)) {
    let code = fs.readFileSync(filename, 'utf8');
    if (!code.includes('ca-pub-3937076958073792')) {
      code = code.replace('<style>${css}</style></head>', '<style>${css}</style>' + adsense + '</head>');
    }
    return mod._compile(code, filename);
  }
  return originalJs(mod, filename);
};
