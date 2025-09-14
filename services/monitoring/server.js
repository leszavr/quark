const express = require('express');
const path = require('path');
const { execSync } = require('child_process');
const app = express();
const PORT = 3001;

// Статические файлы
app.use(express.static(__dirname));

// Основной роут
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// API для проверки здоровья Plugin Hub
app.get('/api/health', async (req, res) => {
    try {
        // Пытаемся подключиться к Plugin Hub
        const response = await fetch('http://localhost:3000/health');
        if (response.ok) {
            const data = await response.json();
            res.json({ status: 'ok', message: 'Plugin Hub доступен', data });
        } else {
            res.json({ status: 'warning', message: 'Plugin Hub отвечает с ошибками' });
        }
    } catch (error) {
        res.json({ status: 'error', message: 'Plugin Hub недоступен', error: error.message });
    }
});

// API для получения статуса Docker сервисов
app.get('/api/docker/status', (req, res) => {
    try {
        const output = execSync('docker-compose ps', { 
            cwd: '/var/www/quark',
            encoding: 'utf8' 
        });
        
        // Парсим табличный вывод
        const lines = output.split('\n').filter(line => line.trim() && !line.includes('----'));
        const services = [];
        
        lines.forEach(line => {
            if (line.includes('quark-')) {
                const parts = line.split(/\s+/);
                if (parts.length >= 4) {
                    services.push({
                        Name: parts[0],
                        State: parts[2],
                        Ports: parts.slice(3).join(' ')
                    });
                }
            }
        });
            
        res.json({ services, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error('Docker status error:', error);
        res.status(500).json({ error: 'Failed to get Docker status', message: error.message });
    }
});

// API для получения логов Docker контейнера
app.get('/api/docker/logs/:service', (req, res) => {
    try {
        const { service } = req.params;
        const lines = req.query.lines || '20';
        
        const output = execSync(`docker-compose logs --tail ${lines} ${service}`, { 
            cwd: '/var/www/quark',
            encoding: 'utf8' 
        });
        
        res.json({ 
            service, 
            logs: output.split('\n').filter(line => line.trim()),
            timestamp: new Date().toISOString() 
        });
    } catch (error) {
        console.error('Docker logs error:', error);
        res.status(500).json({ error: 'Failed to get logs', message: error.message });
    }
});

// API для получения списка зарегистрированных сервисов
app.get('/api/services', async (req, res) => {
    try {
        const response = await fetch('http://localhost:3000/api/services');
        if (response.ok) {
            const services = await response.json();
            res.json({ services, timestamp: new Date().toISOString() });
        } else {
            res.json({ services: [], message: 'Plugin Hub недоступен' });
        }
    } catch (error) {
        res.json({ services: [], error: error.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🖥️ Monitoring Dashboard запущен на порту ${PORT}`);
    console.log(`📊 Откройте http://localhost:${PORT} для просмотра`);
});
