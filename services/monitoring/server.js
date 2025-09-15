const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.static(__dirname));
app.use(express.json());

// Конфигурация
const config = {
    pluginHub: {
        url: process.env.PLUGIN_HUB_URL || 'http://plugin-hub:3000',
        timeout: 5000
    },
    services: {
        core: [
            { id: 'postgres', name: 'PostgreSQL', type: 'database' },
            { id: 'redis', name: 'Redis', type: 'cache' },
            { id: 'nats', name: 'NATS', type: 'messaging' },
            { id: 'vault', name: 'Vault', type: 'security' },
            { id: 'plugin-hub', name: 'Plugin Hub', type: 'core' }
        ]
    }
};

// Утилиты для HTTP запросов
async function makeRequest(url, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.pluginHub.timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeout);
        return response;
    } catch (error) {
        clearTimeout(timeout);
        throw error;
    }
}

// API Routes

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Получение статуса Plugin Hub
app.get('/api/plugin-hub/status', async (req, res) => {
    try {
        const response = await makeRequest(`${config.pluginHub.url}/health`);
        
        if (response.ok) {
            const data = await response.json();
            res.json({
                status: 'online',
                message: 'Plugin Hub доступен',
                data: data,
                timestamp: new Date().toISOString()
            });
        } else {
            res.json({
                status: 'error',
                message: `Plugin Hub вернул статус ${response.status}`,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        res.json({
            status: 'offline',
            message: 'Plugin Hub недоступен',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Получение зарегистрированных сервисов
app.get('/api/services', async (req, res) => {
    try {
        const response = await makeRequest(`${config.pluginHub.url}/api/services`);
        
        if (response.ok) {
            const data = await response.json();
            res.json({
                success: true,
                services: data.data || [],
                count: (data.data || []).length,
                timestamp: new Date().toISOString()
            });
        } else {
            res.json({
                success: false,
                services: [],
                count: 0,
                error: `HTTP ${response.status}`,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        res.json({
            success: false,
            services: [],
            count: 0,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Получение статуса конкретного сервиса
app.get('/api/services/:serviceId/status', async (req, res) => {
    const { serviceId } = req.params;
    
    try {
        const response = await makeRequest(`${config.pluginHub.url}/api/services`);
        
        if (response.ok) {
            const data = await response.json();
            const service = (data.data || []).find(s => s.id === serviceId);
            
            if (service) {
                // Проверяем актуальность heartbeat
                const lastHeartbeat = new Date(service.lastHeartbeat);
                const now = new Date();
                const timeDiff = (now - lastHeartbeat) / 1000;
                
                let status = 'offline';
                if (timeDiff < 30) status = 'online';
                else if (timeDiff < 120) status = 'warning';
                
                res.json({
                    serviceId,
                    status,
                    lastHeartbeat: service.lastHeartbeat,
                    timeSinceLastHeartbeat: Math.floor(timeDiff),
                    service,
                    timestamp: new Date().toISOString()
                });
            } else {
                res.json({
                    serviceId,
                    status: 'not-found',
                    message: 'Сервис не зарегистрирован',
                    timestamp: new Date().toISOString()
                });
            }
        } else {
            res.status(503).json({
                serviceId,
                status: 'unavailable',
                error: 'Plugin Hub недоступен',
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        res.status(503).json({
            serviceId,
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Получение системной информации
app.get('/api/system/info', (req, res) => {
    const memUsage = process.memoryUsage();
    
    res.json({
        nodejs: {
            version: process.version,
            uptime: Math.floor(process.uptime()),
            memory: {
                rss: Math.round(memUsage.rss / 1024 / 1024),
                heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
                heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024)
            }
        },
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        path: req.path,
        timestamp: new Date().toISOString()
    });
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🖥️  Quark МКС Monitoring Dashboard`);
    console.log(`📊 Server started on port ${PORT}`);
    console.log(`� http://localhost:${PORT}`);
    console.log(`⚙️  Plugin Hub: ${config.pluginHub.url}`);
    console.log(`📅 Started at: ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully');
    process.exit(0);
});
