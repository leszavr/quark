import { Request, Response } from 'express';
import { ServiceRegistry } from '../services/ServiceRegistry';
import { HealthMonitor } from '../services/HealthMonitor';
import { EventBus } from '../services/EventBus';

export class PluginController {
  constructor(
    private serviceRegistry: ServiceRegistry,
    private healthMonitor: HealthMonitor,
    private eventBus: EventBus
  ) {}

  // Регистрация нового сервиса
  async registerService(req: Request, res: Response): Promise<void> {
    try {
      const { name, version, url, healthEndpoint, metadata } = req.body;

      if (!name || !version || !url || !healthEndpoint) {
        res.status(400).json({
          error: 'Missing required fields: name, version, url, healthEndpoint'
        });
        return;
      }

      const service = await this.serviceRegistry.registerService({
        name,
        version,
        url,
        healthEndpoint,
        status: 'online',
        metadata: metadata || {}
      });

      // Публикуем событие регистрации
      await this.eventBus.publishServiceEvent('register', service.id, {
        name: service.name,
        version: service.version,
        url: service.url
      });

      res.status(201).json({
        success: true,
        service
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Failed to register service',
        details: error.message
      });
    }
  }

  // Отправка heartbeat от сервиса
  async heartbeat(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;

      if (!serviceId) {
        res.status(400).json({ error: 'Service ID is required' });
        return;
      }

      await this.serviceRegistry.updateHeartbeat(serviceId);

      res.json({
        success: true,
        timestamp: new Date()
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to update heartbeat',
        details: error.message
      });
    }
  }

  // Получение списка всех сервисов
  async getServices(req: Request, res: Response): Promise<void> {
    try {
      const services = await this.serviceRegistry.getAllServices();
      res.json({
        success: true,
        services,
        total: services.length
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to get services',
        details: error.message
      });
    }
  }

  // Получение информации о конкретном сервисе
  async getService(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;
      const service = await this.serviceRegistry.getService(serviceId);

      if (!service) {
        res.status(404).json({ error: 'Service not found' });
        return;
      }

      const health = await this.serviceRegistry.getServiceHealth(serviceId);

      res.json({
        success: true,
        service,
        health
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to get service',
        details: error.message
      });
    }
  }

  // Удаление сервиса
  async unregisterService(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;
      
      const service = await this.serviceRegistry.getService(serviceId);
      if (!service) {
        res.status(404).json({ error: 'Service not found' });
        return;
      }

      await this.serviceRegistry.unregisterService(serviceId);

      // Публикуем событие отмены регистрации
      await this.eventBus.publishServiceEvent('unregister', serviceId, {
        name: service.name
      });

      res.json({
        success: true,
        message: 'Service unregistered successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to unregister service',
        details: error.message
      });
    }
  }

  // Проверка здоровья конкретного сервиса
  async checkHealth(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;
      const healthCheck = await this.healthMonitor.checkServiceHealth(serviceId);

      res.json({
        success: true,
        health: healthCheck
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to check service health',
        details: error.message
      });
    }
  }

  // Получение общего состояния системы
  async getSystemHealth(req: Request, res: Response): Promise<void> {
    try {
      const systemHealth = await this.healthMonitor.getSystemHealth();

      res.json({
        success: true,
        system: systemHealth
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to get system health',
        details: error.message
      });
    }
  }
}
