import Redis from 'ioredis';
import { ServiceInfo, HealthCheck, ModuleDefinition } from '../types/index.js';

export class ServiceRegistry {
  private redis: Redis;
  private readonly SERVICES_KEY = 'quark:services';
  private readonly MODULES_KEY = 'quark:modules';
  private readonly HEALTH_KEY = 'quark:health';

  constructor(redis: Redis) {
    this.redis = redis;
  }

  // Service Registration
  async registerService(service: ServiceInfo): Promise<void> {
    const serviceData = {
      ...service,
      lastHeartbeat: new Date().toISOString(),
      registeredAt: new Date().toISOString()
    };

    await this.redis.hset(
      this.SERVICES_KEY,
      service.id,
      JSON.stringify(serviceData)
    );

    // Publish service registration event
    await this.redis.publish('quark:events:service:registered', JSON.stringify({
      type: 'service.registered',
      serviceId: service.id,
      serviceName: service.name,
      timestamp: new Date().toISOString()
    }));

    console.log(`Service registered: ${service.name} (${service.id})`);
  }

  async unregisterService(serviceId: string): Promise<void> {
    const service = await this.getService(serviceId);
    if (service) {
      await this.redis.hdel(this.SERVICES_KEY, serviceId);
      await this.redis.hdel(this.HEALTH_KEY, serviceId);

      // Publish service unregistration event
      await this.redis.publish('quark:events:service:unregistered', JSON.stringify({
        type: 'service.unregistered',
        serviceId,
        serviceName: service.name,
        timestamp: new Date().toISOString()
      }));

      console.log(`Service unregistered: ${service.name} (${serviceId})`);
    }
  }

  async getService(serviceId: string): Promise<ServiceInfo | null> {
    const serviceData = await this.redis.hget(this.SERVICES_KEY, serviceId);
    if (!serviceData) return null;

    const service = JSON.parse(serviceData);
    service.lastHeartbeat = new Date(service.lastHeartbeat);
    
    return service;
  }

  async getAllServices(): Promise<ServiceInfo[]> {
    const servicesData = await this.redis.hgetall(this.SERVICES_KEY);
    return Object.values(servicesData).map(data => {
      const service = JSON.parse(data);
      service.lastHeartbeat = new Date(service.lastHeartbeat);
      return service;
    });
  }

  async getServicesByType(type: ServiceInfo['type']): Promise<ServiceInfo[]> {
    const services = await this.getAllServices();
    return services.filter(service => service.type === type);
  }

  async updateServiceStatus(serviceId: string, status: ServiceInfo['status']): Promise<void> {
    const service = await this.getService(serviceId);
    if (service) {
      service.status = status;
      service.lastHeartbeat = new Date();
      await this.registerService(service);
    }
  }

  // Heartbeat Management
  async heartbeat(serviceId: string): Promise<void> {
    const service = await this.getService(serviceId);
    if (service) {
      service.lastHeartbeat = new Date();
      await this.redis.hset(
        this.SERVICES_KEY,
        serviceId,
        JSON.stringify(service)
      );
    }
  }

  async getStaleServices(timeoutMs: number = 30000): Promise<ServiceInfo[]> {
    const services = await this.getAllServices();
    const now = Date.now();
    
    return services.filter(service => {
      const lastHeartbeat = service.lastHeartbeat.getTime();
      return (now - lastHeartbeat) > timeoutMs;
    });
  }

  // Module Management
  async registerModule(module: ModuleDefinition): Promise<void> {
    const moduleData = {
      ...module,
      registeredAt: new Date().toISOString()
    };

    await this.redis.hset(
      this.MODULES_KEY,
      module.id,
      JSON.stringify(moduleData)
    );

    // Publish module registration event
    await this.redis.publish('quark:events:module:registered', JSON.stringify({
      type: 'module.registered',
      moduleId: module.id,
      moduleName: module.name,
      timestamp: new Date().toISOString()
    }));

    console.log(`Module registered: ${module.name} (${module.id})`);
  }

  async getModule(moduleId: string): Promise<ModuleDefinition | null> {
    const moduleData = await this.redis.hget(this.MODULES_KEY, moduleId);
    return moduleData ? JSON.parse(moduleData) : null;
  }

  async getAllModules(): Promise<ModuleDefinition[]> {
    const modulesData = await this.redis.hgetall(this.MODULES_KEY);
    return Object.values(modulesData).map(data => JSON.parse(data));
  }

  // Health Management
  async updateHealth(healthCheck: HealthCheck): Promise<void> {
    const healthData = {
      ...healthCheck,
      timestamp: new Date().toISOString()
    };

    await this.redis.hset(
      this.HEALTH_KEY,
      healthCheck.serviceId,
      JSON.stringify(healthData)
    );

    // Update service health status
    const service = await this.getService(healthCheck.serviceId);
    if (service) {
      service.health = healthCheck.status === 'healthy' ? 'healthy' : 'unhealthy';
      await this.registerService(service);
    }
  }

  async getHealth(serviceId: string): Promise<HealthCheck | null> {
    const healthData = await this.redis.hget(this.HEALTH_KEY, serviceId);
    if (!healthData) return null;

    const health = JSON.parse(healthData);
    health.timestamp = new Date(health.timestamp);
    
    return health;
  }

  async getAllHealth(): Promise<HealthCheck[]> {
    const healthData = await this.redis.hgetall(this.HEALTH_KEY);
    return Object.values(healthData).map(data => {
      const health = JSON.parse(data);
      health.timestamp = new Date(health.timestamp);
      return health;
    });
  }

  // Discovery
  async discoverServices(): Promise<ServiceInfo[]> {
    return this.getAllServices();
  }

  async findServicesByPattern(pattern: string): Promise<ServiceInfo[]> {
    const services = await this.getAllServices();
    const regex = new RegExp(pattern, 'i');
    
    return services.filter(service => 
      regex.test(service.name) || 
      regex.test(service.id) ||
      regex.test(service.type)
    );
  }

  // Statistics
  async getServiceStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    healthy: number;
    unhealthy: number;
    byType: Record<string, number>;
  }> {
    const services = await this.getAllServices();
    
    const stats = {
      total: services.length,
      active: services.filter(s => s.status === 'active').length,
      inactive: services.filter(s => s.status === 'inactive').length,
      healthy: services.filter(s => s.health === 'healthy').length,
      unhealthy: services.filter(s => s.health === 'unhealthy').length,
      byType: {} as Record<string, number>
    };

    // Count by type
    services.forEach(service => {
      stats.byType[service.type] = (stats.byType[service.type] || 0) + 1;
    });

    return stats;
  }

  // Cleanup
  async cleanup(): Promise<void> {
    const staleServices = await this.getStaleServices();
    
    for (const service of staleServices) {
      console.log(`Cleaning up stale service: ${service.name} (${service.id})`);
      await this.unregisterService(service.id);
    }
  }
}
