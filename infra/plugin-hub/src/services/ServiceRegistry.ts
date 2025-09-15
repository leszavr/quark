import { Redis } from 'ioredis';
import { ServiceInfo, HealthCheck } from '../models/types';
import { randomUUID } from 'crypto';

export class ServiceRegistry {
  private redis: Redis;
  private readonly SERVICES_KEY = 'quark:services';
  private readonly HEALTH_KEY = 'quark:health';

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async registerService(serviceData: Omit<ServiceInfo, 'id' | 'registeredAt' | 'lastHeartbeat'>): Promise<ServiceInfo> {
    const service: ServiceInfo = {
      id: randomUUID(),
      ...serviceData,
      registeredAt: new Date(),
      lastHeartbeat: new Date(),
    };

    await this.redis.hset(this.SERVICES_KEY, service.id, JSON.stringify(service));
    
    console.log(`✅ Service registered: ${service.name} (${service.id})`);
    return service;
  }

  async updateHeartbeat(serviceId: string): Promise<void> {
    const serviceData = await this.redis.hget(this.SERVICES_KEY, serviceId);
    if (serviceData) {
      const service: ServiceInfo = JSON.parse(serviceData);
      service.lastHeartbeat = new Date();
      await this.redis.hset(this.SERVICES_KEY, serviceId, JSON.stringify(service));
    }
  }

  async getAllServices(): Promise<ServiceInfo[]> {
    const services = await this.redis.hgetall(this.SERVICES_KEY);
    return Object.values(services).map(data => JSON.parse(data));
  }

  async getService(serviceId: string): Promise<ServiceInfo | null> {
    const serviceData = await this.redis.hget(this.SERVICES_KEY, serviceId);
    return serviceData ? JSON.parse(serviceData) : null;
  }

  async unregisterService(serviceId: string): Promise<boolean> {
    const result = await this.redis.hdel(this.SERVICES_KEY, serviceId);
    await this.redis.hdel(this.HEALTH_KEY, serviceId);
    
    if (result > 0) {
      console.log(`🗑️ Service unregistered: ${serviceId}`);
      return true;
    }
    return false;
  }

  async updateHealthCheck(serviceId: string, health: HealthCheck): Promise<void> {
    const healthData = {
      ...health,
      serviceId,
      timestamp: new Date(),
    };

    await this.redis.hset(this.HEALTH_KEY, serviceId, JSON.stringify(healthData));
    
    // Также обновляем heartbeat
    await this.updateHeartbeat(serviceId);
  }

  async getHealthCheck(serviceId: string): Promise<any> {
    const healthData = await this.redis.hget(this.HEALTH_KEY, serviceId);
    return healthData ? JSON.parse(healthData) : null;
  }

  async getAllHealthChecks(): Promise<any[]> {
    const healthChecks = await this.redis.hgetall(this.HEALTH_KEY);
    return Object.values(healthChecks).map(data => JSON.parse(data));
  }

  async getStaleServices(timeoutMinutes: number = 5): Promise<ServiceInfo[]> {
    const services = await this.getAllServices();
    const timeout = timeoutMinutes * 60 * 1000; // в миллисекундах
    const now = new Date();

    return services.filter(service => {
      const lastSeen = new Date(service.lastHeartbeat);
      return (now.getTime() - lastSeen.getTime()) > timeout;
    });
  }

  async cleanupStaleServices(timeoutMinutes: number = 5): Promise<number> {
    const staleServices = await this.getStaleServices(timeoutMinutes);
    
    for (const service of staleServices) {
      await this.unregisterService(service.id);
    }

    return staleServices.length;
  }
}

export default ServiceRegistry;
