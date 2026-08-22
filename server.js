const http = require('http');

const port = process.env.PORT || 3000;

const html = `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ăn Ngon Khỏe</title>
  <meta name="description" content="Ăn Ngon Khỏe - kiến thức ăn uống, dinh dưỡng và lối sống lành mạnh.">
</head>
<body>
  <main style="max-width:760px;margin:80px auto;padding:24px;font-family:Arial,sans-serif;line-height:1.6">
    <h1>Ăn Ngon Khỏe</h1>
    <p>Website đang được xây dựng.</p>
  </main>
</body>
</html>`;

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}).listen(port, '0.0.0.0', () => {
  console.log(`AnNgonKhoe running on port ${port}`);
});
