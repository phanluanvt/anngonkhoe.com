const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'server.js');
const patchedPath = path.join('/tmp', 'anngonkhoe-server.js');

let code = fs.readFileSync(srcPath, 'utf8');
code = code.replace(/gemini-2\.5-flash-lite/g, 'gemini-3.5-flash-lite');
fs.writeFileSync(patchedPath, code, 'utf8');
require(patchedPath);
