import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import Redis from 'ioredis';
import { connect, StringCodec } from 'nats';

console.log('🚀 Starting Quark Plugin Hub (МКС Command Module)...');

class PluginHub {
  private app: express.Application;
  private server: any = null;
  private redis: Redis;
  private natsConnection: any = null;
  private sc = StringCodec();
  private services: Map<string, any> = new Map();

  constructor() {
    this.app = express();
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });
    
    this.setupMiddleware();
    this.setupRoutes();
    console.log('PluginHub initialized');
  }

  private setupMiddleware(): void {
    // Security
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }));

    // Compression
    this.app.use(compression());
    
    // JSON parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Logging
    this.app.use(morgan('combined'));
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'plugin-hub',
        version: '1.0.0',
        connections: {
          redis: this.redis.status,
          nats: this.natsConnection ? 'connected' : 'disconnected'
        }
      });
    });

    // Basic info endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: 'Quark Plugin Hub',
        description: 'МКС Command Module - Central service management',
        version: '1.0.0',
        endpoints: ['/health', '/services', '/register'],
        registeredServices: this.services.size
      });
    });

    // Register service
    this.app.post('/register', async (req, res) => {
      try {
        const { id, name, version, url, healthEndpoint } = req.body;
        
        if (!id || !name || !url) {
          return res.status(400).json({ error: 'Missing required fields: id, name, url' });
        }

        const serviceInfo = {
          id,
          name,
          version: version || '1.0.0',
          url,
          healthEndpoint: healthEndpoint || `${url}/health`,
          registeredAt: new Date().toISOString(),
          lastHeartbeat: new Date().toISOString(),
          status: 'online'
        };

        // Store in memory
        this.services.set(id, serviceInfo);

        // Store in Redis
        await this.redis.hset('services', id, JSON.stringify(serviceInfo));

        // Publish event via NATS
        if (this.natsConnection) {
          await this.natsConnection.publish('service.registered', this.sc.encode(JSON.stringify(serviceInfo)));
        }

        console.log(`📝 Service registered: ${name} (${id})`);
        res.json({ success: true, service: serviceInfo });
      } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
      }
    });

    // List services
    this.app.get('/services', async (req, res) => {
      try {
        const services = Array.from(this.services.values());
        res.json({ services, count: services.length });
      } catch (error) {
        console.error('❌ Services list error:', error);
        res.status(500).json({ error: 'Failed to get services' });
      }
    });
  }

  private async initConnections(): Promise<void> {
    try {
      // Connect to Redis
      await this.redis.connect();
      console.log('✅ Connected to Redis');

      // Connect to NATS
      this.natsConnection = await connect({
        servers: process.env.NATS_URL || 'nats://localhost:4222',
      });
      console.log('✅ Connected to NATS');

      // Load existing services from Redis
      const existingServices = await this.redis.hgetall('services');
      for (const [id, serviceData] of Object.entries(existingServices)) {
        this.services.set(id, JSON.parse(serviceData));
      }
      console.log(`📚 Loaded ${this.services.size} existing services`);

    } catch (error) {
      console.error('❌ Connection error:', error);
    }
  }

  async start(): Promise<void> {
    const PORT = process.env.PORT || 3000;
    
    // Initialize connections first
    await this.initConnections();
    
    this.server = this.app.listen(PORT, () => {
      console.log(`✅ Plugin Hub listening on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 Service registration: http://localhost:${PORT}/register`);
    });

    console.log('PluginHub started with full functionality!');
  }

  async stop(): Promise<void> {
    try {
      if (this.server) {
        this.server.close();
        console.log('✅ HTTP server stopped');
      }

      if (this.natsConnection) {
        await this.natsConnection.close();
        console.log('✅ NATS disconnected');
      }

      if (this.redis) {
        this.redis.disconnect();
        console.log('✅ Redis disconnected');
      }
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
  }
}

const pluginHub = new PluginHub();
pluginHub.start().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

export default PluginHub;
