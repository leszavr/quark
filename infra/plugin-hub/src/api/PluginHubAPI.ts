import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { ServiceRegistry } from '../core/ServiceRegistry.js';
import { EventBus } from '../core/EventBus.js';
import { HealthMonitor } from '../core/HealthMonitor.js';
import { ApiResponse, ServiceInfo, ModuleDefinition, HealthCheck } from '../types/index.js';

export class PluginHubAPI {
  private app: express.Application;
  private registry: ServiceRegistry;
  private eventBus: EventBus;
  private healthMonitor: HealthMonitor;

  constructor(
    registry: ServiceRegistry,
    eventBus: EventBus,
    healthMonitor: HealthMonitor
  ) {
    this.registry = registry;
    this.eventBus = eventBus;
    this.healthMonitor = healthMonitor;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
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

    // Logging
    this.app.use(morgan('combined'));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    // Health endpoint
    this.app.get('/health', (req, res) => {
      res.json(this.createResponse({
        status: 'healthy',
        timestamp: new Date(),
        version: '1.0.0'
      }));
    });

    // Service routes
    this.setupServiceRoutes();
    
    // Module routes
    this.setupModuleRoutes();
    
    // Health monitoring routes
    this.setupHealthRoutes();
    
    // Event routes
    this.setupEventRoutes();
    
    // System routes
    this.setupSystemRoutes();

    // Error handling
    this.setupErrorHandling();
  }

  private setupServiceRoutes(): void {
    const router = express.Router();

    // Register service
    router.post('/register', async (req, res) => {
      try {
        const serviceInfo: ServiceInfo = req.body;
        
        // Validate service info
        if (!serviceInfo.id || !serviceInfo.name || !serviceInfo.type) {
          return res.status(400).json(this.createResponse(
            null, 
            'Missing required service information'
          ));
        }

        await this.registry.registerService(serviceInfo);
        
        res.json(this.createResponse({
          message: 'Service registered successfully',
          serviceId: serviceInfo.id
        }));
      } catch (error) {
        res.status(500).json(this.createResponse(
          null, 
          error instanceof Error ? error.message : 'Registration failed'
        ));
      }
    });

    // Unregister service
    router.delete('/:serviceId', async (req, res) => {
      try {
        const { serviceId } = req.params;
        await this.registry.unregisterService(serviceId);
        
        res.json(this.createResponse({
          message: 'Service unregistered successfully',
          serviceId
        }));
      } catch (error) {
        res.status(500).json(this.createResponse(
          null,
          error instanceof Error ? error.message : 'Unregistration failed'
        ));
      }
    });

    // Get service
    router.get('/:serviceId', async (req, res) => {
      try {
        const { serviceId } = req.params;
        const service = await this.registry.getService(serviceId);
        
        if (!service) {
          return res.status(404).json(this.createResponse(
            null,
            'Service not found'
          ));
        }

        res.json(this.createResponse(service));
      } catch (error) {
        res.status(500).json(this.createResponse(
          null,
          error instanceof Error ? error.message : 'Failed to get service'
        ));
      }
    });

    // Get all services
    router.get('/', async (req, res) => {
      try {
        const { type } = req.query;
        
        let services: ServiceInfo[];
        if (type) {
          services = await this.registry.getServicesByType(type as ServiceInfo['type']);
        } else {
          services = await this.registry.getAllServices();
        }

        res.json(this.createResponse(services));
      } catch (error) {
        res.status(500).json(this.createResponse(
          null,
          error instanceof Error ? error.message : 'Failed to get services'
        ));
      }
    });

    // Heartbeat
    router.post('/:serviceId/heartbeat', async (req, res) => {
      try {
        const { serviceId } = req.params;
        await this.registry.heartbeat(serviceId);
        
        res.json(this.createResponse({
          message: 'Heartbeat received',
          serviceId,
          timestamp: new Date()
        }));
      } catch (error) {
        res.status(500).json(this.createResponse(
          null,
          error instanceof Error ? error.message : 'Heartbeat failed'
        ));
      }
    });

    // Service discovery
    router.get('/discover/all', async (req, res) => {
      try {
        const services = await this.registry.discoverServices();
        res.json(this.createResponse(services));
      } catch (error) {
        res.status(500).json(this.createResponse(
          null,
          error instanceof Error ? error.message : 'Discovery failed'
        ));
      }
    });

    // Search services
    router.get('/search/:pattern', async (req, res) => {
      try {
        const { pattern } = req.params;
        const services = await this.registry.findServicesByPattern(pattern);
        res.json(this.createResponse(services));
      } catch (error) {
        res.status(500).json(this.createResponse(
          null,
          error instanceof Error ? error.message : 'Search failed'
        ));
      }
    });

    this.app.use('/api/services', router);
  }

  private setupModuleRoutes(): void {
    const router = express.Router();

    // Register module
    router.post('/register', async (req, res) => {
      try {
        const moduleDefinition: ModuleDefinition = req.body;
        
        if (!moduleDefinition.id || !moduleDefinition.name) {
          return res.status(400).json(this.createResponse(
            null,
            'Missing required module information'
          ));
        }

        await this.registry.registerModule(moduleDefinition);
        
        res.json(this.createResponse({
          message: 'Module registered successfully',
          moduleId: moduleDefinition.id
        }));
      } catch (error) {
        res.status(500).json(this.createResponse(
          null,
          error instanceof Error ? error.message : 'Module registration failed'
        ));
      }
    });

    // Get module
    router.get('/:moduleId', async (req, res) => {
      try {
        const { moduleId } = req.params;
        const module = await this.registry.getModule(moduleId);
        
        if (!module) {
          return res.status(404).json(this.createResponse(
            null,
            'Module not found'
          ));
        }

        res.json(this.createResponse(module));
      } catch (error) {
        res.status(500).json(this.createResponse(
          null,
          error instanceof Error ? error.message : 'Failed to get module'
        ));
      }
    });

    // Get all modules
    router.get('/', async (req, res) => {
      try {
        const modules = await this.registry.getAllModules();
        res.json(this.createResponse(modules));
      } catch (error) {
        res.status(500).json(this.createResponse(
          null,
          error instanceof Error ? error.message : 'Failed to get modules'
        ));
      }
    });

    this.app.use('/api/modules', router);
  }

  private setupHealthRoutes(): void {
    const router = express.Router();

    // Get health summary
    router.get('/summary', async (req, res) => {
      try {
        const summary = await this.healthMonitor.getHealthSummary();
        res.json(this.createResponse(summary));
      } catch (error) {
        res.status(500).json(this.createResponse(
          null,
          error instanceof Error ? error.message : 'Failed to get health summary'
        ));
      }
    });

    // Get service health
    router.get('/service/:serviceId', async (req, res) => {
      try {
        const { serviceId } = req.params;
        const health = await this.registry.getHealth(serviceId);
        
        if (!health) {
          return res.status(404).json(this.createResponse(
            null,
            'Health information not found'
          ));
        }

        res.json(this.createResponse(health));
      } catch (error) {
        res.status(500).json(this.createResponse(
          null,
          error instanceof Error ? error.message : 'Failed to get health information'
        ));
      }
    });

    // Check service health
    router.post('/check/:serviceId', async (req, res) => {
      try {
        const { serviceId } = req.params;
        const health = await this.healthMonitor.checkService(serviceId);
        
        if (!health) {
          return res.status(404).json(this.createResponse(
            null,
            'Service not found'
          ));
        }

        res.json(this.createResponse(health));
      } catch (error) {
        res.status(500).json(this.createResponse(
          null,
          error instanceof Error ? error.message : 'Health check failed'
        ));
      }
    });

    // Get all health information
    router.get('/', async (req, res) => {
      try {
        const healthChecks = await this.registry.getAllHealth();
        res.json(this.createResponse(healthChecks));
      } catch (error) {
        res.status(500).json(this.createResponse(
          null,
          error instanceof Error ? error.message : 'Failed to get health information'
        ));
      }
    });

    this.app.use('/api/health', router);
  }

  private setupEventRoutes(): void {
    const router = express.Router();

    // Publish event
    router.post('/publish', async (req, res) => {
      try {
        const { subject, event } = req.body;
        
        if (!subject || !event) {
          return res.status(400).json(this.createResponse(
            null,
            'Subject and event are required'
          ));
        }

        await this.eventBus.publishEvent(subject, event);
        
        res.json(this.createResponse({
          message: 'Event published successfully',
          subject,
          eventId: event.id
        }));
      } catch (error) {
        res.status(500).json(this.createResponse(
          null,
          error instanceof Error ? error.message : 'Failed to publish event'
        ));
      }
    });

    // Get event history
    router.get('/history/:subject', async (req, res) => {
      try {
        const { subject } = req.params;
        const { limit, startTime, endTime } = req.query;
        
        const options: any = {};
        if (limit) options.limit = parseInt(limit as string);
        if (startTime) options.startTime = new Date(startTime as string);
        if (endTime) options.endTime = new Date(endTime as string);

        const events = await this.eventBus.getEventHistory(subject, options);
        res.json(this.createResponse(events));
      } catch (error) {
        res.status(500).json(this.createResponse(
          null,
          error instanceof Error ? error.message : 'Failed to get event history'
        ));
      }
    });

    this.app.use('/api/events', router);
  }

  private setupSystemRoutes(): void {
    const router = express.Router();

    // Get system status
    router.get('/status', async (req, res) => {
      try {
        const [serviceStats, healthSummary, eventBusInfo] = await Promise.all([
          this.registry.getServiceStats(),
          this.healthMonitor.getHealthSummary(),
          this.eventBus.getConnectionInfo()
        ]);

        res.json(this.createResponse({
          services: serviceStats,
          health: healthSummary,
          eventBus: eventBusInfo,
          monitoring: this.healthMonitor.getMonitoringStats(),
          timestamp: new Date()
        }));
      } catch (error) {
        res.status(500).json(this.createResponse(
          null,
          error instanceof Error ? error.message : 'Failed to get system status'
        ));
      }
    });

    // Get system metrics
    router.get('/metrics', async (req, res) => {
      try {
        const stats = await this.registry.getServiceStats();
        res.json(this.createResponse(stats));
      } catch (error) {
        res.status(500).json(this.createResponse(
          null,
          error instanceof Error ? error.message : 'Failed to get metrics'
        ));
      }
    });

    this.app.use('/api/system', router);
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json(this.createResponse(
        null,
        `Endpoint not found: ${req.method} ${req.path}`
      ));
    });

    // Global error handler
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Unhandled error:', error);
      
      res.status(500).json(this.createResponse(
        null,
        'Internal server error'
      ));
    });
  }

  private createResponse<T>(data?: T, error?: string): ApiResponse<T> {
    return {
      success: !error,
      data: error ? undefined : data,
      error,
      timestamp: new Date()
    };
  }

  getApp(): express.Application {
    return this.app;
  }
}
