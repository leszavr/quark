import * as cron from 'node-cron';
import { ServiceRegistry } from './ServiceRegistry.js';
import { EventBus } from './EventBus.js';
import { ServiceInfo, HealthCheck } from '../types/index.js';

export class HealthMonitor {
  private registry: ServiceRegistry;
  private eventBus: EventBus;
  private monitoringInterval: string = '*/30 * * * * *'; // Every 30 seconds
  private cleanupInterval: string = '0 */5 * * * *'; // Every 5 minutes
  private task: cron.ScheduledTask | null = null;
  private cleanupTask: cron.ScheduledTask | null = null;

  constructor(registry: ServiceRegistry, eventBus: EventBus) {
    this.registry = registry;
    this.eventBus = eventBus;
  }

  start(): void {
    if (this.task) {
      console.warn('Health monitor is already running');
      return;
    }

    // Start health monitoring
    this.task = cron.schedule(this.monitoringInterval, async () => {
      await this.performHealthCheck();
    });

    // Start cleanup task
    this.cleanupTask = cron.schedule(this.cleanupInterval, async () => {
      await this.cleanupStaleServices();
    });

    console.log('Health monitor started');
  }

  stop(): void {
    if (this.task) {
      this.task.destroy();
      this.task = null;
    }

    if (this.cleanupTask) {
      this.cleanupTask.destroy();
      this.cleanupTask = null;
    }

    console.log('Health monitor stopped');
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const services = await this.registry.getAllServices();
      
      for (const service of services) {
        await this.checkServiceHealth(service);
      }
    } catch (error) {
      console.error('Error during health check:', error);
    }
  }

  private async checkServiceHealth(service: ServiceInfo): Promise<void> {
    const startTime = Date.now();
    let healthCheck: HealthCheck;

    try {
      // Check if service is responsive
      const isResponsive = await this.pingService(service);
      const responseTime = Date.now() - startTime;

      if (isResponsive) {
        healthCheck = {
          serviceId: service.id,
          status: 'healthy',
          timestamp: new Date(),
          details: {
            responseTime,
            uptime: this.calculateUptime(service),
            warnings: [`Last seen: ${service.lastHeartbeat}`]
          }
        };

        // Update service status if it was previously unhealthy
        if (service.health !== 'healthy') {
          await this.registry.updateServiceStatus(service.id, 'active');
          await this.eventBus.publishServiceHealthChanged(
            service.id, 
            'healthy', 
            { responseTime, recovered: true }
          );
        }
      } else {
        healthCheck = {
          serviceId: service.id,
          status: 'unhealthy',
          timestamp: new Date(),
          details: {
            responseTime,
            errors: ['Service not responding'],
            warnings: [`Last seen: ${service.lastHeartbeat}`]
          }
        };

        // Update service status to error if it's not responsive
        await this.registry.updateServiceStatus(service.id, 'error');
        await this.eventBus.publishServiceHealthChanged(
          service.id, 
          'unhealthy', 
          { error: 'Service not responding', responseTime }
        );
      }

      // Store health check result
      await this.registry.updateHealth(healthCheck);

    } catch (error) {
      console.error(`Health check failed for service ${service.id}:`, error);
      
      healthCheck = {
        serviceId: service.id,
        status: 'unhealthy',
        timestamp: new Date(),
        details: {
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          warnings: [`Last seen: ${service.lastHeartbeat}`]
        }
      };

      await this.registry.updateHealth(healthCheck);
      await this.registry.updateServiceStatus(service.id, 'error');
    }
  }

  private async pingService(service: ServiceInfo): Promise<boolean> {
    // Check heartbeat freshness (services should heartbeat within 60 seconds)
    const now = Date.now();
    const lastHeartbeat = service.lastHeartbeat.getTime();
    const timeSinceHeartbeat = now - lastHeartbeat;

    if (timeSinceHeartbeat > 60000) { // 60 seconds
      return false;
    }

    // If service has an endpoint, try to ping it
    if (service.endpoint) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${service.endpoint}/health`, {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response.ok;
      } catch {
        // If HTTP health check fails, rely on heartbeat
        return timeSinceHeartbeat < 30000; // 30 seconds for services with endpoints
      }
    }

    // For services without endpoints, rely on heartbeat
    return timeSinceHeartbeat < 30000; // 30 seconds
  }

  private calculateUptime(service: ServiceInfo): number {
    // This is a simplified uptime calculation
    // In a real implementation, you might want to track start time
    const now = Date.now();
    const lastHeartbeat = service.lastHeartbeat.getTime();
    return now - lastHeartbeat;
  }

  private async cleanupStaleServices(): Promise<void> {
    try {
      const staleServices = await this.registry.getStaleServices(300000); // 5 minutes
      
      for (const service of staleServices) {
        console.log(`Removing stale service: ${service.name} (${service.id})`);
        
        await this.eventBus.publishServiceHealthChanged(
          service.id, 
          'stale', 
          { reason: 'No heartbeat received', lastSeen: service.lastHeartbeat }
        );
        
        await this.registry.unregisterService(service.id);
      }

      if (staleServices.length > 0) {
        console.log(`Cleaned up ${staleServices.length} stale services`);
      }
    } catch (error) {
      console.error('Error during stale service cleanup:', error);
    }
  }

  // Manual health check for specific service
  async checkService(serviceId: string): Promise<HealthCheck | null> {
    const service = await this.registry.getService(serviceId);
    if (!service) {
      return null;
    }

    await this.checkServiceHealth(service);
    return await this.registry.getHealth(serviceId);
  }

  // Get health summary
  async getHealthSummary(): Promise<{
    totalServices: number;
    healthyServices: number;
    unhealthyServices: number;
    unknownServices: number;
    services: { [key: string]: HealthCheck };
  }> {
    const services = await this.registry.getAllServices();
    const healthChecks = await this.registry.getAllHealth();
    
    const healthMap = healthChecks.reduce((map, health) => {
      map[health.serviceId] = health;
      return map;
    }, {} as { [key: string]: HealthCheck });

    let healthy = 0;
    let unhealthy = 0;
    let unknown = 0;

    services.forEach(service => {
      const health = healthMap[service.id];
      if (!health) {
        unknown++;
      } else if (health.status === 'healthy') {
        healthy++;
      } else {
        unhealthy++;
      }
    });

    return {
      totalServices: services.length,
      healthyServices: healthy,
      unhealthyServices: unhealthy,
      unknownServices: unknown,
      services: healthMap
    };
  }

  // Set custom monitoring intervals
  setMonitoringInterval(intervalSeconds: number): void {
    this.monitoringInterval = `*/${intervalSeconds} * * * * *`;
    
    if (this.task) {
      this.stop();
      this.start();
    }
  }

  setCleanupInterval(intervalMinutes: number): void {
    this.cleanupInterval = `0 */${intervalMinutes} * * * *`;
    
    if (this.cleanupTask) {
      this.cleanupTask.destroy();
      this.cleanupTask = cron.schedule(this.cleanupInterval, async () => {
        await this.cleanupStaleServices();
      });
    }
  }

  // Get monitoring statistics
  getMonitoringStats(): {
    isRunning: boolean;
    monitoringInterval: string;
    cleanupInterval: string;
  } {
    return {
      isRunning: this.task !== null,
      monitoringInterval: this.monitoringInterval,
      cleanupInterval: this.cleanupInterval
    };
  }
}
