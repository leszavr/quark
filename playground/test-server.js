const http = require('http');
const fs = require('fs');
const path = require('path');

// Простой HTTP-сервер для имитации media-service API
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/media/upload') {
    // Имитация успешной загрузки файла
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      id: 'test-file-id',
      url: 'http://localhost:3003/media/test-file-id',
      thumbnailUrl: 'http://localhost:3003/media/test-file-id/thumbnail',
      originalName: 'test-image.jpg',
      mimeType: 'image/jpeg',
      size: 102400,
      uploadedAt: new Date().toISOString()
    }));
  } else if (req.method === 'GET' && req.url.startsWith('/media/')) {
    // Имитация получения файла
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      url: 'http://localhost:3003/media/test-file-id'
    }));
  } else {
    // Для всех остальных запросов возвращаем 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not Found' }));
  }
});

server.listen(8080, '0.0.0.0', () => {
  console.log('Test media-service запущен на порту 8080');
});