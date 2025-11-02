import { Request, Response } from "express";
import { ServiceRegistry } from "../core/ServiceRegistry";
import { HealthMonitor } from "../core/HealthMonitor";
import { EventBus } from "../core/EventBus";
import { ServiceInfo } from "../types/index.js";

export class PluginController {
  constructor(
    private serviceRegistry: ServiceRegistry,
    private healthMonitor: HealthMonitor,
    private eventBus: EventBus
  ) {}

  // Регистрация нового сервиса
  async registerService(req: Request, res: Response): Promise<void> {
    try {
      const { id, name, version, type, endpoint, port, metadata, dependencies, resources } = req.body;

      if (!id || !name || !version || !type) {
        res.status(400).json({
          error: "Missing required fields: id, name, version, type"
        });
        return;
      }

      const service: ServiceInfo = {
        id,
        name,
        version,
        type,
        endpoint,
        port,
        status: "active",
        health: "unknown",
        lastHeartbeat: new Date(),
        metadata,
        dependencies,
        resources
      };

      await this.serviceRegistry.registerService(service);

      // Публикуем событие регистрации
      await this.eventBus.publishServiceRegistered(id, name);

      res.status(201).json({
        success: true,
        message: "Service registered successfully"
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({
        error: "Failed to register service",
        details: error.message
      });
    }
  }

  // Отправка heartbeat от сервиса
  async heartbeat(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;

      if (!serviceId) {
        res.status(400).json({ error: "Service ID is required" });
        return;
      }

      await this.serviceRegistry.heartbeat(serviceId);

      res.json({
        success: true,
        timestamp: new Date()
      });
    } catch (error: any) {
      res.status(500).json({
        error: "Failed to update heartbeat",
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
        error: "Failed to get services",
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
        res.status(404).json({ error: "Service not found" });
        return;
      }

      const health = await this.serviceRegistry.getHealth(serviceId);

      res.json({
        success: true,
        service,
        health
      });
    } catch (error: any) {
      res.status(500).json({
        error: "Failed to get service",
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
        res.status(404).json({ error: "Service not found" });
        return;
      }

      await this.serviceRegistry.unregisterService(serviceId);

      // Публикуем событие отмены регистрации
      await this.eventBus.publishServiceUnregistered(serviceId, service.name);

      res.json({
        success: true,
        message: "Service unregistered successfully"
      });
    } catch (error: any) {
      res.status(500).json({
        error: "Failed to unregister service",
        details: error.message
      });
    }
  }

  // Проверка здоровья конкретного сервиса
  async checkHealth(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;
      const healthCheck = await this.healthMonitor.checkService(serviceId);

      res.json({
        success: true,
        health: healthCheck
      });
    } catch (error: any) {
      res.status(500).json({
        error: "Failed to check service health",
        details: error.message
      });
    }
  }

  // Получение общего состояния системы
  async getSystemHealth(req: Request, res: Response): Promise<void> {
    try {
      const healthSummary = await this.healthMonitor.getHealthSummary();

      res.json({
        success: true,
        system: healthSummary
      });
    } catch (error: any) {
      res.status(500).json({
        error: "Failed to get system health",
        details: error.message
      });
    }
  }
}
