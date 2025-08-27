const http = require('http');
const fs = require('fs');
const path = require('path');

// MIME-типы для файлов
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

// Простой HTTP-сервер для playground
const server = http.createServer((req, res) => {
  console.log(`Запрос: ${req.method} ${req.url}`);
  
  // Обработка корневого пути
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(process.cwd(), filePath);
  
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Проверка существования файла
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Файл не найден
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>', 'utf-8');
      return;
    }
    
    // Чтение и отправка файла
    fs.readFile(filePath, (err, content) => {
      if (err) {
        // Ошибка чтения файла
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>500 Internal Server Error</h1>', 'utf-8');
        return;
      }
      
      // Успешная отправка файла
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    });
  });
});

const PORT = 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Playground сервер запущен на http://localhost:${PORT}`);
  console.log('Для остановки сервера нажмите Ctrl+C');
});