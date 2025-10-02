import axios from 'axios';
import { ServiceRegistry } from './ServiceRegistry';
import { HealthCheck } from '../models/types';

export class HealthMonitor {
  private serviceRegistry: ServiceRegistry;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(serviceRegistry: ServiceRegistry) {
    this.serviceRegistry = serviceRegistry;
  }

  start(intervalSeconds: number = 30): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      await this.checkAllServices();
      await this.serviceRegistry.cleanupStaleServices();
    }, intervalSeconds * 1000);

    console.log(`🔍 Health monitor started (interval: ${intervalSeconds}s)`);
  }

  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('🛑 Health monitor stopped');
    }
  }

  private async checkAllServices(): Promise<void> {
    const services = await this.serviceRegistry.getAllServices();
    
    for (const service of services) {
      await this.checkServiceHealth(service.id);
    }
  }

  async checkServiceHealth(serviceId: string): Promise<HealthCheck> {
    const service = await this.serviceRegistry.getService(serviceId);
    
    if (!service) {
      throw new Error(`Service not found: ${serviceId}`);
    }

    const healthCheck: HealthCheck = {
      serviceId,
      status: 'unknown',
      timestamp: new Date(),
    };

    try {
      const startTime = Date.now();
      const response = await axios.get(service.healthEndpoint, {
        timeout: 5000,
        validateStatus: (status) => status < 500, // 4xx ошибки считаем здоровыми
      });
      
      healthCheck.responseTime = Date.now() - startTime;
      healthCheck.status = response.status < 400 ? 'healthy' : 'unhealthy';
      healthCheck.details = {
        statusCode: response.status,
        data: response.data,
      };

    } catch (error: any) {
      healthCheck.status = 'unhealthy';
      healthCheck.details = {
        error: error.message,
        code: error.code,
      };
    }

    await this.serviceRegistry.updateServiceHealth(serviceId, healthCheck);
    return healthCheck;
  }

  async getSystemHealth(): Promise<{
    totalServices: number;
    onlineServices: number;
    offlineServices: number;
    errorServices: number;
    services: any[];
  }> {
    const services = await this.serviceRegistry.getAllServices();
    
    const stats = {
      totalServices: services.length,
      onlineServices: services.filter(s => s.status === 'online').length,
      offlineServices: services.filter(s => s.status === 'offline').length,
      errorServices: services.filter(s => s.status === 'error').length,
      services: services.map(service => ({
        id: service.id,
        name: service.name,
        status: service.status,
        lastHeartbeat: service.lastHeartbeat,
        url: service.url,
      })),
    };

    return stats;
  }
}
