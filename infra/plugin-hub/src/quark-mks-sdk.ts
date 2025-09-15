import axios, { AxiosInstance } from 'axios';

export interface ModuleManifest {
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

export interface QuarkEvent {
  id?: string;
  type: string;
  source?: string;
  timestamp?: string;
  data: any;
  correlationId?: string;
  version?: string;
}

export interface Module {
  id: string;
  name: string;
  status: string;
  endpoints: {
    base: string;
    health: string;
  };
  capabilities: string[];
  lastSeen: string;
  technology: string;
  version: string;
}

export interface HealthCheck {
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  duration?: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: { [key: string]: HealthCheck };
}

export interface ModuleConfig extends Partial<ModuleManifest> {
  id: string;
  name: string;
  version: string;
  technology: string;
  language: string;
  description: string;
  author: string;
  pluginHub?: {
    url?: string;
    retryAttempts?: number;
    retryDelay?: number;
  };
}

export type EventHandler = (event: QuarkEvent) => void | Promise<void>;

export class QuarkModule {
  private manifest: ModuleManifest;
  private httpClient: AxiosInstance;
  private pluginHubUrl: string;
  private isRegistered: boolean = false;
  private heartbeatInterval?: NodeJS.Timeout;
  private healthChecks: Map<string, () => Promise<HealthCheck>> = new Map();
  private metrics: Map<string, () => number> = new Map();
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private startTime: number = Date.now();

  constructor(config: ModuleConfig) {
    this.pluginHubUrl = config.pluginHub?.url || process.env.QUARK_HUB_URL || 'http://localhost:3000';
    this.httpClient = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Создание манифеста с значениями по умолчанию
    this.manifest = {
      ...config,
      host: config.host || 'localhost',
      port: config.port || 3000,
      protocol: config.protocol || 'http',
      baseUrl: config.baseUrl || '',
      endpoints: {
        health: '/health',
        status: '/status',
        metrics: '/metrics',
        docs: '/docs',
        ...config.endpoints
      },
      capabilities: config.capabilities || [],
      dependencies: config.dependencies || [],
      provides: config.provides || [],
      tags: config.tags || [],
      lifecycle: {
        startup: 'auto',
        restart: 'on-failure',
        healthCheckInterval: 30,
        timeout: 10000,
        ...config.lifecycle
      },
      ...config
    } as ModuleManifest;

    this.setupDefaultHealthChecks();
    this.setupDefaultMetrics();
  }

  private setupDefaultHealthChecks(): void {
    this.addHealthCheck('self', async () => ({
      status: 'pass',
      message: 'Module is running',
      duration: 0
    }));
  }

  private setupDefaultMetrics(): void {
    this.addMetric('uptime', () => Math.floor((Date.now() - this.startTime) / 1000));
    this.addMetric('memory_usage', () => process.memoryUsage().heapUsed / 1024 / 1024);
  }

  async dock(): Promise<void> {
    try {
      console.log(`🚀 Initiating МКС docking sequence for ${this.manifest.name}...`);
      
      // Проверка доступности Plugin Hub
      await this.checkPluginHubAvailability();
      
      // Регистрация модуля
      const registrationData = {
        manifest: this.manifest,
        timestamp: new Date().toISOString()
      };

      const response = await this.httpClient.post(
        `${this.pluginHubUrl}/modules/register`,
        registrationData
      );

      if (response.data.success) {
        this.isRegistered = true;
        console.log(`✅ Module ${this.manifest.name} successfully docked to МКС`);
        console.log(`🌐 Hub endpoints:`, response.data.hubEndpoints);
        
        // Запуск heartbeat
        this.startHeartbeat();
        
        // Настройка graceful shutdown
        this.setupGracefulShutdown();
      } else {
        throw new Error(`Registration failed: ${response.data.error}`);
      }
    } catch (error) {
      console.error(`❌ МКС docking failed for ${this.manifest.name}:`, error);
      throw error;
    }
  }

  async undock(): Promise<void> {
    if (!this.isRegistered) return;

    try {
      console.log(`🛑 Initiating undocking sequence for ${this.manifest.name}...`);
      
      // Остановка heartbeat
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }

      // Уведомление Plugin Hub об отключении
      await this.httpClient.delete(`${this.pluginHubUrl}/modules/${this.manifest.id}`);
      
      this.isRegistered = false;
      console.log(`✅ Module ${this.manifest.name} successfully undocked from МКС`);
    } catch (error) {
      console.error(`❌ Undocking error:`, error);
    }
  }

  async sendHeartbeat(): Promise<void> {
    if (!this.isRegistered) return;

    try {
      const metrics = this.collectMetrics();
      const healthStatus = await this.performHealthChecks();

      const heartbeatData = {
        timestamp: new Date().toISOString(),
        status: healthStatus.status,
        metrics
      };

      await this.httpClient.post(
        `${this.pluginHubUrl}/modules/${this.manifest.id}/heartbeat`,
        heartbeatData
      );
    } catch (error) {
      console.warn(`⚠️ Heartbeat failed:`, error);
    }
  }

  async discoverModules(): Promise<Module[]> {
    try {
      const response = await this.httpClient.get(`${this.pluginHubUrl}/modules/discovery`);
      return response.data.modules || [];
    } catch (error) {
      console.error('Discovery failed:', error);
      return [];
    }
  }

  async getModule(id: string): Promise<Module | null> {
    const modules = await this.discoverModules();
    return modules.find(m => m.id === id) || null;
  }

  async publishEvent(event: Partial<QuarkEvent>): Promise<void> {
    const fullEvent: QuarkEvent = {
      id: this.generateEventId(),
      source: this.manifest.id,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      ...event
    };

    try {
      await this.httpClient.post(`${this.pluginHubUrl}/events`, fullEvent);
      console.log(`📡 Event published: ${fullEvent.type}`);
    } catch (error) {
      console.error('Event publishing failed:', error);
    }
  }

  subscribeToEvents(pattern: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(pattern)) {
      this.eventHandlers.set(pattern, []);
    }
    this.eventHandlers.get(pattern)!.push(handler);
  }

  addHealthCheck(name: string, check: () => Promise<HealthCheck>): void {
    this.healthChecks.set(name, check);
  }

  addMetric(name: string, metric: () => number): void {
    this.metrics.set(name, metric);
  }

  async performHealthChecks(): Promise<HealthStatus> {
    const checks: { [key: string]: HealthCheck } = {};
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    for (const [name, check] of this.healthChecks) {
      try {
        const start = Date.now();
        const result = await check();
        result.duration = Date.now() - start;
        checks[name] = result;

        if (result.status === 'fail') {
          overallStatus = 'unhealthy';
        } else if (result.status === 'warn' && overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      } catch (error) {
        checks[name] = {
          status: 'fail',
          message: error instanceof Error ? error.message : 'Unknown error'
        };
        overallStatus = 'unhealthy';
      }
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      checks
    };
  }

  collectMetrics(): { [key: string]: number } {
    const metrics: { [key: string]: number } = {};
    
    for (const [name, metric] of this.metrics) {
      try {
        metrics[name] = metric();
      } catch (error) {
        console.warn(`Failed to collect metric ${name}:`, error);
      }
    }

    return metrics;
  }

  healthEndpoint() {
    return async (req: any, res: any) => {
      const health = await this.performHealthChecks();
      const statusCode = health.status === 'healthy' ? 200 : 
                        health.status === 'degraded' ? 200 : 503;
      res.status(statusCode).json(health);
    };
  }

  statusEndpoint() {
    return (req: any, res: any) => {
      res.json({
        module: {
          id: this.manifest.id,
          name: this.manifest.name,
          version: this.manifest.version,
          technology: this.manifest.technology,
          framework: this.manifest.framework
        },
        status: this.isRegistered ? 'docked' : 'undocked',
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
        timestamp: new Date().toISOString()
      });
    };
  }

  metricsEndpoint() {
    return (req: any, res: any) => {
      const metrics = this.collectMetrics();
      res.json({
        timestamp: new Date().toISOString(),
        metrics
      });
    };
  }

  private async checkPluginHubAvailability(): Promise<void> {
    try {
      await this.httpClient.get(`${this.pluginHubUrl}/health`);
    } catch (error) {
      throw new Error(`Plugin Hub unavailable at ${this.pluginHubUrl}`);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(
      () => this.sendHeartbeat(),
      this.manifest.lifecycle.healthCheckInterval * 1000
    );
  }

  private setupGracefulShutdown(): void {
    const shutdown = (signal: string) => {
      console.log(`\n🛑 Received ${signal}, undocking from МКС...`);
      this.undock().then(() => {
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static fromEnv(): QuarkModule {
    return new QuarkModule({
      id: process.env.QUARK_MODULE_ID || 'unknown-module',
      name: process.env.QUARK_MODULE_NAME || 'Unknown Module',
      version: process.env.QUARK_MODULE_VERSION || '1.0.0',
      technology: process.env.QUARK_MODULE_TECHNOLOGY || 'Node.js',
      language: process.env.QUARK_MODULE_LANGUAGE || 'JavaScript',
      description: process.env.QUARK_MODULE_DESCRIPTION || 'Module created from environment',
      author: process.env.QUARK_MODULE_AUTHOR || 'Unknown Author',
      host: process.env.QUARK_MODULE_HOST || 'localhost',
      port: parseInt(process.env.QUARK_MODULE_PORT || '3000'),
      pluginHub: {
        url: process.env.QUARK_HUB_URL
      }
    });
  }
}

// Express middleware helper
export function withQuarkMiddleware(module: QuarkModule) {
  return (req: any, res: any, next: any) => {
    // Добавляем стандартные endpoints
    if (req.path === '/health') {
      return module.healthEndpoint()(req, res);
    }
    if (req.path === '/status') {
      return module.statusEndpoint()(req, res);
    }
    if (req.path === '/metrics') {
      return module.metricsEndpoint()(req, res);
    }
    next();
  };
}

export default QuarkModule;
