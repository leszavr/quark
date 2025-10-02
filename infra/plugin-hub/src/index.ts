import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import Redis from 'ioredis';
import { connect, StringCodec } from 'nats';
import axios from 'axios';
import { EnterpriseJWTMiddleware, EnterpriseJWTConfig } from './middleware/EnterpriseJWTMiddleware';

// Universal Docking Interface Types
interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  technology: string;
  language: string;
  framework?: string;
  host: string;
  port: number;
  protocol: 'http' | 'https' | 'grpc' | 'tcp' | 'custom';
  baseUrl?: string;
  endpoints: {
    health: string;
    status: string;
    metrics?: string;
    docs?: string;
  };
  capabilities: string[];
  dependencies: string[];
  provides: string[];
  description: string;
  author: string;
  tags: string[];
  lifecycle: {
    startup: 'auto' | 'manual';
    restart: 'always' | 'on-failure' | 'never';
    healthCheckInterval: number;
    timeout: number;
  };
  security?: {
    requiresAuth: boolean;
    permissions: string[];
    rateLimits?: {
      requests: number;
      window: number;
    };
  };
}

interface RegistrationResponse {
  success: boolean;
  moduleId: string;
  message: string;
  hubEndpoints: {
    events: string;
    discovery: string;
    metrics: string;
  };
  nextHeartbeat: string;
  configuration?: any;
}

console.log('🚀 Starting Quark Plugin Hub (МКС Command Module)...');

class PluginHub {
  private app: express.Application;
  private redis: Redis;
  private natsConnection: any = null;
  private server: any = null;
  private sc = StringCodec();
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();
  private jwtMiddleware!: EnterpriseJWTMiddleware;

  constructor() {
    this.app = express();
    
    // Redis connection - используем REDIS_URL или отдельные параметры
    if (process.env.REDIS_URL) {
      this.redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        lazyConnect: true
      });
    } else {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'redis',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        maxRetriesPerRequest: 3,
        lazyConnect: true
      });
    }

    this.initializeJWTMiddleware();
    this.setupMiddleware();
    this.setupRoutes();
    console.log('PluginHub initialized');
  }

  private initializeJWTMiddleware(): void {
    const jwtConfig: EnterpriseJWTConfig = {
      authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
      vaultConfig: {
        endpoint: process.env.VAULT_URL || 'http://vault:8200',
        token: process.env.VAULT_TOKEN || 'myroot'
      },
      redis: {
        url: process.env.REDIS_URL || 'redis://redis:6379',
        keyPrefix: 'quark:jwt:'
      },
      cache: {
        memoryTTL: 300,      // 5 minutes
        redisTTL: 900,       // 15 minutes  
        maxMemoryEntries: 1000
      },
      circuitBreaker: {
        failureThreshold: 5,
        resetTimeoutMs: 60000,     // 1 minute
        monitoringPeriodMs: 30000  // 30 seconds
      },
      rateLimiting: {
        windowMs: 60000,           // 1 minute
        maxRequests: 100,          // 100 requests per minute per user
        skipSuccessfulRequests: false
      },
      mtls: {
        enabled: process.env.MTLS_ENABLED === 'true',
        pkiPath: 'pki',
        roleName: 'quark-service'
      }
    };

    this.jwtMiddleware = new EnterpriseJWTMiddleware(jwtConfig);
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }));
    this.app.use(compression());
    this.app.use(morgan('combined'));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    // Health endpoint
    this.app.get('/health', async (req, res) => {
      const natsOk = this.natsConnection && !this.natsConnection.isClosed();
      const redisOk = await this.checkRedis();

      res.json({
        status: 'healthy',
        timestamp: new Date(),
        version: '1.0.0',
        services: { 
          nats: natsOk, 
          redis: redisOk 
        },
        architecture: 'mks-command-module'
      });
    });

    // Universal Module Registration (UDI compliant) - Protected
    this.app.post('/modules/register', this.jwtMiddleware.authenticate, async (req, res) => {
      try {
        const { manifest, timestamp, registrationToken } = req.body;
        
        if (!manifest || !this.validateManifest(manifest)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid or missing module manifest',
            code: 'QE002'
          });
        }

        // Check if module already exists
        const existingModule = await this.redis.hget('quark:modules', manifest.id);
        if (existingModule) {
          return res.status(409).json({
            success: false,
            error: 'Module already registered',
            code: 'QE003'
          });
        }

        // Register module
        const moduleData = {
          ...manifest,
          lastHeartbeat: new Date().toISOString(),
          registeredAt: new Date().toISOString(),
          status: 'healthy'
        };

        await this.redis.hset('quark:modules', manifest.id, JSON.stringify(moduleData));

        // Setup health monitoring
        this.setupHealthMonitoring(manifest);

        // Publish registration event
        if (this.natsConnection && !this.natsConnection.isClosed()) {
          const event = {
            id: this.generateEventId(),
            type: 'module.registered',
            source: 'plugin-hub',
            timestamp: new Date().toISOString(),
            data: {
              moduleId: manifest.id,
              moduleName: manifest.name,
              capabilities: manifest.capabilities
            },
            version: '1.0.0'
          };
          
          this.natsConnection.publish('quark.module.registered', this.sc.encode(JSON.stringify(event)));
        }

        console.log(`🚀 Module registered: ${manifest.name} (${manifest.id})`);

        const response: RegistrationResponse = {
          success: true,
          moduleId: manifest.id,
          message: 'Module successfully registered with МКС',
          hubEndpoints: {
            events: `http://localhost:${process.env.PORT || 3000}/events`,
            discovery: `http://localhost:${process.env.PORT || 3000}/modules/discovery`,
            metrics: `http://localhost:${process.env.PORT || 3000}/modules/${manifest.id}/metrics`
          },
          nextHeartbeat: new Date(Date.now() + manifest.lifecycle.healthCheckInterval * 1000).toISOString()
        };

        res.json(response);
      } catch (error) {
        console.error('Module registration error:', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Registration failed',
          code: 'QE001'
        });
      }
    });

    // Module Discovery
    this.app.get('/modules/discovery', async (req, res) => {
      try {
        const modulesData = await this.redis.hgetall('quark:modules');
        const modules = Object.values(modulesData).map(data => {
          const module = JSON.parse(data);
          return {
            id: module.id,
            name: module.name,
            status: module.status || 'unknown',
            endpoints: {
              base: `${module.protocol}://${module.host}:${module.port}${module.baseUrl || ''}`,
              health: `${module.protocol}://${module.host}:${module.port}${module.endpoints.health}`
            },
            capabilities: module.capabilities,
            lastSeen: module.lastHeartbeat,
            technology: module.technology,
            version: module.version
          };
        });

        res.json({
          modules,
          total: modules.length,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Discovery failed',
          code: 'QE201'
        });
      }
    });

    // Module Heartbeat
    this.app.post('/modules/:moduleId/heartbeat', async (req, res) => {
      try {
        const { moduleId } = req.params;
        const { timestamp, status, metrics } = req.body;

        const moduleData = await this.redis.hget('quark:modules', moduleId);
        if (!moduleData) {
          return res.status(404).json({
            success: false,
            error: 'Module not found'
          });
        }

        const module = JSON.parse(moduleData);
        module.lastHeartbeat = timestamp || new Date().toISOString();
        module.status = status || 'healthy';
        if (metrics) {
          module.lastMetrics = metrics;
        }

        await this.redis.hset('quark:modules', moduleId, JSON.stringify(module));

        res.json({
          success: true,
          message: 'Heartbeat received',
          nextHeartbeat: new Date(Date.now() + module.lifecycle.healthCheckInterval * 1000).toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Heartbeat failed'
        });
      }
    });

    // Legacy endpoints for backward compatibility
    this.app.post('/api/services/register', async (req, res) => {
      try {
        const serviceInfo = req.body;
        
        if (!serviceInfo.id || !serviceInfo.name || !serviceInfo.type) {
          return res.status(400).json({
            success: false,
            error: 'Missing required service information'
          });
        }

        const serviceData = {
          ...serviceInfo,
          lastHeartbeat: new Date().toISOString(),
          registeredAt: new Date().toISOString()
        };

        await this.redis.hset('quark:services', serviceInfo.id, JSON.stringify(serviceData));

        if (this.natsConnection && !this.natsConnection.isClosed()) {
          const event = {
            type: 'service.registered',
            serviceId: serviceInfo.id,
            serviceName: serviceInfo.name,
            timestamp: new Date().toISOString()
          };
          
          this.natsConnection.publish('quark.service.registered', this.sc.encode(JSON.stringify(event)));
        }

        console.log(`🔧 Legacy service registered: ${serviceInfo.name} (${serviceInfo.id})`);

        res.json({
          success: true,
          message: 'Service registered successfully',
          serviceId: serviceInfo.id
        });
      } catch (error) {
        console.error('Service registration error:', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Registration failed'
        });
      }
    });

    this.app.get('/services', async (req, res) => {
      try {
        const servicesData = await this.redis.hgetall('quark:services');
        const services = Object.values(servicesData).map(data => JSON.parse(data));
        res.json(services);
      } catch (error) {
        res.json([]);
      }
    });

    this.app.get('/api/services', async (req, res) => {
      try {
        const servicesData = await this.redis.hgetall('quark:services');
        const services = Object.values(servicesData).map(data => {
          const service = JSON.parse(data);
          service.lastHeartbeat = new Date(service.lastHeartbeat);
          return service;
        });

        res.json({
          success: true,
          data: services
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get services'
        });
      }
    });

    this.app.post('/api/services/:serviceId/heartbeat', async (req, res) => {
      try {
        const { serviceId } = req.params;
        const serviceData = await this.redis.hget('quark:services', serviceId);
        
        if (serviceData) {
          const service = JSON.parse(serviceData);
          service.lastHeartbeat = new Date().toISOString();
          await this.redis.hset('quark:services', serviceId, JSON.stringify(service));
          
          res.json({
            success: true,
            message: 'Heartbeat received',
            serviceId,
            timestamp: new Date()
          });
        } else {
          res.status(404).json({
            success: false,
            error: 'Service not found'
          });
        }
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Heartbeat failed'
        });
      }
    });
  }

  private validateManifest(manifest: ModuleManifest): boolean {
    const required = ['id', 'name', 'version', 'technology', 'host', 'port', 'endpoints'];
    for (const field of required) {
      if (!manifest[field as keyof ModuleManifest]) {
        console.error(`Missing required field: ${field}`);
        return false;
      }
    }

    if (!manifest.endpoints.health || !manifest.endpoints.status) {
      console.error('Missing required endpoints: health and status');
      return false;
    }

    if (!manifest.lifecycle || !manifest.lifecycle.healthCheckInterval) {
      console.error('Missing lifecycle configuration');
      return false;
    }

    return true;
  }

  private setupHealthMonitoring(manifest: ModuleManifest): void {
    if (this.healthCheckIntervals.has(manifest.id)) {
      clearInterval(this.healthCheckIntervals.get(manifest.id)!);
    }

    const interval = setInterval(async () => {
      await this.performHealthCheck(manifest.id);
    }, manifest.lifecycle.healthCheckInterval * 1000);

    this.healthCheckIntervals.set(manifest.id, interval);
  }

  private async performHealthCheck(moduleId: string): Promise<void> {
    try {
      const moduleData = await this.redis.hget('quark:modules', moduleId);
      if (!moduleData) {
        this.clearHealthMonitoring(moduleId);
        return;
      }

      const module = JSON.parse(moduleData);
      const healthUrl = `${module.protocol}://${module.host}:${module.port}${module.endpoints.health}`;
      
      try {
        const response = await axios.get(healthUrl, { timeout: 5000 });
        const isHealthy = response.status === 200;
        
        module.status = isHealthy ? 'healthy' : 'unhealthy';
        module.lastHealthCheck = new Date().toISOString();
        
        await this.redis.hset('quark:modules', moduleId, JSON.stringify(module));
        
        if (this.natsConnection && !this.natsConnection.isClosed()) {
          const event = {
            id: this.generateEventId(),
            type: 'module.health',
            source: 'plugin-hub',
            timestamp: new Date().toISOString(),
            data: {
              moduleId,
              status: module.status,
              healthData: response.data
            },
            version: '1.0.0'
          };
          
          this.natsConnection.publish('quark.module.health', this.sc.encode(JSON.stringify(event)));
        }
      } catch (healthError) {
        module.status = 'unhealthy';
        module.lastHealthCheck = new Date().toISOString();
        await this.redis.hset('quark:modules', moduleId, JSON.stringify(module));
        
        console.warn(`Health check failed for module ${moduleId}`);
      }
    } catch (error) {
      console.error(`Error during health check for module ${moduleId}:`, error);
    }
  }

  private clearHealthMonitoring(moduleId: string): void {
    if (this.healthCheckIntervals.has(moduleId)) {
      clearInterval(this.healthCheckIntervals.get(moduleId)!);
      this.healthCheckIntervals.delete(moduleId);
    }
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async checkRedis(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  async start(): Promise<void> {
    try {
      await this.redis.connect();
      console.log('✅ Connected to Redis');

      try {
        this.natsConnection = await connect({ 
          servers: (process.env.NATS_SERVERS || process.env.NATS_URL || 'nats://localhost:4222').split(',') 
        });
        console.log('✅ Connected to NATS');
      } catch (error) {
        console.warn('⚠️ NATS connection failed (continuing without NATS):', error);
      }

      const existingServices = await this.redis.hgetall('quark:services');
      console.log(`📚 Loaded ${Object.keys(existingServices).length} existing services`);

      const port = parseInt(process.env.PORT || '3000');
      const host = process.env.HOST || '0.0.0.0';

      this.server = this.app.listen(port, host, () => {
        console.log('PluginHub started with full functionality!');
        console.log(`✅ Plugin Hub listening on port ${port}`);
        console.log(`🌐 Health check: http://localhost:${port}/health`);
        console.log(`🔗 Service registration: http://localhost:${port}/register`);
      });

      this.setupGracefulShutdown();

    } catch (error) {
      console.error('❌ Failed to start Plugin Hub:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = (signal: string) => {
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
      this.shutdown().then(() => {
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down Plugin Hub...');
    
    try {
      if (this.server) {
        await new Promise<void>((resolve) => {
          this.server.close(() => resolve());
        });
      }

      if (this.natsConnection && !this.natsConnection.isClosed()) {
        await this.natsConnection.close();
      }

      await this.redis.disconnect();
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
  }
}

// Start the Plugin Hub
const pluginHub = new PluginHub();
pluginHub.start().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

export default PluginHub;
